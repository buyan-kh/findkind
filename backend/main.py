# main.py
from fastapi import FastAPI, UploadFile, File, Form, Request, HTTPException, Path
from fastapi.responses import StreamingResponse, Response
from bson.json_util import dumps
from bson import ObjectId
from datetime import date
import io, uvicorn
from contextlib import asynccontextmanager
from utils import db, helper
from utils.helper_ml import search_pets
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    yield

app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware, allow_origins=["*"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

def get_base_url(request: Request) -> str:
    return str(request.base_url).rstrip('/')

async def save_uploaded_file(file: UploadFile) -> str:
    contents = await file.read()
    stream = io.BytesIO(contents)
    file_id = await db.fs_bucket.upload_from_stream(file.filename, stream)
    return str(file_id)

@app.post("/report-missing")
async def report_missing(
    request: Request,
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
    file_id = await save_uploaded_file(photo)
    base = get_base_url(request)
    photo_url = f"{base}/files/{file_id}"

    payload = {
        "type": type,
        "full_name": full_name,
        "last_seen_location": {"lat": lat, "lon": lon},
        "missing_since": str(missing_since),
        "description": description,
        "reward": reward,
        "phone_number": phone_number,
        "photo_url": photo_url,
        "image_id": file_id,
    }
    result = await db.missing_collection.insert_one(payload)
    body = {"message": "Missing report submitted", "id": result.inserted_id, "data": payload}
    return Response(dumps(body), media_type="application/json")

@app.get("/my-reports")
async def my_reports(request: Request, phone_number: str):
    docs = await db.missing_collection.find({"phone_number": phone_number}).to_list(None)
    return Response(dumps({"reports": docs}), media_type="application/json")

@app.get("/potential-matches")
async def potential_matches(phone_number: str, limit_per_report: int = 3):
    """
    For each missing‑report you filed (in `missing_collection`),
    find the best matches among OTHER USERS' sightings
    (`sightings_collection`).  Returns top N per report.
    """
    # 1️⃣ your missing reports
    mine = await db.missing_collection.find(
        {"phone_number": phone_number}
    ).to_list(None)
    if not mine:
        return Response(dumps({"matches": []}), media_type="application/json")

    # 2️⃣ sighting pool from other users
    sightings = await db.sightings_collection.find(
        {"phone_number": {"$ne": phone_number}}
    ).to_list(None)

    # 3️⃣ run ML search per report
    all_matches = []
    for rep in mine:
        img_bytes = b""
        if "image_id" in rep:
            try:
                grid_out = await db.fs_bucket.open_download_stream(
                    ObjectId(rep["image_id"])
                )
                img_bytes = await grid_out.read()
            except Exception:
                pass

        matches, _ = await search_pets(
            description=rep["description"],
            image_data=img_bytes,
            custom_pets=sightings,                # ← compare to SIGHTINGS
            location=rep.get("last_seen_location"),
        )

        for m in matches[:limit_per_report]:
            m["source_report_id"] = str(rep["_id"])
            all_matches.append(m)

    return Response(dumps({"matches": all_matches}), media_type="application/json")

@app.get("/files/{file_id}")
async def get_file(file_id: str):
    try:
        grid_out = await db.fs_bucket.open_download_stream(ObjectId(file_id))
        async def streamer():
            while chunk := await grid_out.readchunk():
                yield chunk
        return StreamingResponse(streamer(), media_type="application/octet-stream")
    except:
        return Response(status_code=404, content={"error": "File not found"})

@app.patch("/my-reports/{report_id}/found")
async def mark_report_found(
    report_id: str = Path(..., description="Mongo _id of the missing report")
):
    """
    Mark a missing‑report document as found.
    Sets {"found": True, "found_date": ISO‑date‑string}
    """
    result = await db.missing_collection.update_one(
        {"_id": ObjectId(report_id)},
        {
            "$set": {
                "found": True,
                "found_date": datetime.utcnow().isoformat(),
            }
        },
    )
    if result.matched_count == 0:
        raise HTTPException(404, "Report not found")
    return {"ok": True, "id": report_id}

@app.post("/report-sighting")
async def report_sighting(
    request: Request,
    type: int = Form(...),                     # 0 = pet, 1 = person
    lat: float = Form(...),
    lon: float = Form(...),
    description: str = Form(...),
    phone_number: str = Form(...),
    photo: UploadFile | None = File(None),     # optional image
):
    """
    Save a new sighting report to the `sighting_reports` collection.
    """
    photo_url, image_id = None, None
    if photo:
        image_id = await save_uploaded_file(photo)
        photo_url = f"{get_base_url(request)}/files/{image_id}"

    payload = {
        "type": type,
        "last_seen_location": {"lat": lat, "lon": lon},
        "description": description,
        "phone_number": phone_number,
        "photo_url": photo_url,
        "image_id": image_id,
        "created": datetime.utcnow().isoformat(),
        "resolved": False,          # later you can PATCH this field
    }
    res = await db.sightings_collection.insert_one(payload)
    return Response(
        dumps({"message": "Sighting stored", "id": res.inserted_id, "data": payload}),
        media_type="application/json",
    )

@app.get("/my-searches")
async def my_searches(request: Request, phone_number: str):
    """
    Return every document in `sighting_reports` that belongs to this user
    and attach a public `photo_url` for the app to display.
    """
    docs = await db.sightings_collection.find(
        {"phone_number": phone_number}
    ).to_list(None)

    # build the public base like  https://xxxx.ngrok-free.app
    base = str(request.base_url).rstrip("/")

    for d in docs:
        # If you already stored photo_url when the doc was created, skip
        if "photo_url" not in d and "image_id" in d:
            d["photo_url"] = f"{base}/files/{d['image_id']}"

    # bson.json_util.dumps serialises ObjectIds safely
    return Response(dumps({"searches": docs}), media_type="application/json")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, proxy_headers=True)
