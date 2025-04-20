from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from datetime import date
from uuid import uuid4
import os
import uvicorn
from bson import ObjectId
from utils import db
import io
from fastapi.responses import StreamingResponse
from contextlib import asynccontextmanager
from tests.helper import search_pets
from utils import helper
from typing import Optional


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the ML model
    db.init_db()
    yield


app = FastAPI(lifespan=lifespan)


async def save_uploaded_file(file: UploadFile) -> str:
    if not file or not file.filename:
        raise ValueError("Invalid file upload: filename is missing")

    contents = await file.read()
    stream = io.BytesIO(contents)

    # Upload file into GridFS and return the ID
    file_id = await db.fs_bucket.upload_from_stream(file.filename, stream)
    return str(file_id)  # store as string to make it JSON-safe


# Report missing: Someone you know
@app.post("/report-missing")
async def report_missing(
    photo: UploadFile = File(...),
    type: int = Form(...),
    full_name: str = Form(...),
    lat: float = Form(...),
    lon: float = Form(...),
    missing_since: date = Form(...),
    description: str = Form(...),
    reward: float = Form(None),
    phone_number: str = Form(...),
):
    contents = await photo.read()
    file_id = await db.fs_bucket.upload_from_stream(
        photo.filename, io.BytesIO(contents)
    )

    # photo_filename = await save_uploaded_file(photo)

    data = {
        "type": type,
        "full_name": full_name,
        "last_seen_location": {"lat": lat, "lon": lon},
        "missing_since": str(missing_since),
        "description": description,
        "reward": reward,
        "phone_number": phone_number,
        "photo_filename": f"/files/{file_id}",
        "image_id": str(file_id),
    }

    result = await db.missing_collection.insert_one(data)
    return JSONResponse(
        content={
            "message": "Missing report submitted",
            "id": str(result.inserted_id),
            "data": {
                k: str(v) if isinstance(v, ObjectId) else v for k, v in data.items()
            },
        }
    )


# Upload Poster for someone
@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    # Save file to GridFS
    filename = await save_uploaded_file(file)
    result = await db.image_uploads_collection.insert_one({"filename": filename})

    # Rewind and read image into a temp file
    contents = await file.read()
    temp_path = f"/tmp/{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(contents)

    # 🔍 Extract data using Claude + location geocoding
    extracted_data = helper.extract_with_claude(temp_path)

    return JSONResponse(
        content={
            "message": "Image uploaded and processed",
            "filename": filename,
            "id": str(result.inserted_id),
            "extracted_data": extracted_data,
        }
    )


# Identify loved one
@app.post("/find")
async def find(
    type: int = Form(...),
    photo: UploadFile = File(...),
    lat: float = Form(...),
    lon: float = Form(...),
    description: str = Form(...),  # Required field
):
    file_id = await save_uploaded_file(photo)

    grid_out = await db.fs_bucket.open_download_stream(ObjectId(file_id))
    image_data = await grid_out.read()

    """
    data = {
        "first_name": first_name,
        "last_name": last_name,
        "description": description,
        "photo_filename": photo_filename,
    }

    result = await db.sightings_collection.insert_one(data)
    return JSONResponse(
        content={
            "message": "Sighting report submitted",
            "id": str(result.inserted_id),
            "data": {
                k: str(v) if isinstance(v, ObjectId) else v for k, v in data.items()
            },
        }
    )
    """
    type_filtered_db = await db.missing_collection.find({"type": type}).to_list(None)

    if not type_filtered_db:
        return JSONResponse(
            content={
                "message": f"No missing {'people' if type == 0 else 'pets'} found in database",
                "matches": [],
            }
        )

    # Perform matching
    location = {"lat": lat, "lon": lon}

    matches, processing_time = await search_pets(
        description=description,
        image_data=image_data,
        custom_pets=type_filtered_db,
        location=location,
    )

    formatted_matches = []
    for match in matches[:3]:
        formatted_matches.append(
            {
                "id": str(match["_id"]),
                "description": match.get("description"),
                "text_score": match.get("text_score"),
                "image_score": match.get("image_score"),
                "location_score": match.get("location_score"),
                "combined_score": match.get("combined_score"),
                "image_url": match.get("image_url"),
                "contact": match.get("contact"),
                "location": match.get("location"),
            }
        )

    return JSONResponse(
        content={
            "message": f"Found {len(formatted_matches)} potential matches",
            "processing_time_ms": processing_time,
            "matches": formatted_matches,
        }
    )


@app.get("/files/{file_id}")
async def get_file(file_id: str):
    try:
        grid_out = await db.fs_bucket.open_download_stream(ObjectId(file_id))

        async def file_iterator():
            while True:
                chunk = await grid_out.readchunk()
                if not chunk:
                    break
                yield chunk

        return StreamingResponse(file_iterator(), media_type="application/octet-stream")
    except Exception as e:
        return JSONResponse(status_code=404, content={"error": "File not found"})


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
