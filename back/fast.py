from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from datetime import date
from uuid import uuid4
import os
import uvicorn
import io
import torch
from PIL import Image
import pickle
import time
from fastapi.middleware.cors import CORSMiddleware
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from app import (
    search_pets,
    load_image_from_url,
    SimplifiedEmbeddingModel,
    load_local_model,
    CACHE_DIR,
    MODEL_CACHE_DIR,
    USE_SMALLER_MODEL
)

app = FastAPI(title="FindFriend API", description="API for finding missing pets and people")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    print("Loading models for API server...")
    text_model = load_local_model('all-MiniLM-L6-v2')
    image_model = load_local_model('clip-ViT-B-16' if USE_SMALLER_MODEL else 'clip-ViT-B-32')
except Exception as e:
    print(f"Error loading models: {e}")
    print("Falling back to simplified models")
    text_model = SimplifiedEmbeddingModel()
    image_model = SimplifiedEmbeddingModel()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

missing_database = []

async def save_uploaded_file(file: UploadFile) -> dict:
    if not file or not file.filename:
        raise ValueError("Invalid file upload: filename is missing")

    contents = await file.read()

    file_id = str(uuid4())
    file_path = os.path.join(UPLOAD_FOLDER, f"{file_id}_{file.filename}")
    
    with open(file_path, "wb") as f:
        f.write(contents)

    return {"file_id": file_id, "file_path": file_path}


@app.post("/report-missing", summary="Report a missing pet or person")
async def report_missing(
    type: int = Form(...),  # 1 for human, 0 for pet
    image: UploadFile = File(...),
    description: str = Form(...),
    lat: float = Form(...),
    lon: float = Form(...),
    contact: str = Form(...)
):
    """
    Report a missing pet or person
    
    - **type**: 0 for pet, 1 for person
    - **image**: Image file of the missing pet/person
    - **description**: Detailed description
    - **lat**: Latitude where last seen
    - **lon**: Longitude where last seen
    - **contact**: Contact information for the reporter
    """
    saved_file = await save_uploaded_file(image)
    image_id = saved_file["file_id"]
    image_path = saved_file["file_path"]

    record = {
        "id": str(uuid4()),
        "type": type,  # 1 for human, 0 for pet
        "description": description,
        "location": {"lat": lat, "lon": lon},
        "contact": contact,
        "image_id": image_id,
        "image_path": image_path,
        "image_url": f"file://{image_path}",
        "date_added": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    missing_database.append(record)

    return JSONResponse(
        content={
            "message": f"Missing {'person' if type == 1 else 'pet'} reported successfully",
            "id": record["id"],
            "data": record
        }
    )


@app.post("/find", summary="Find a missing pet or person")
async def find(
    type: int = Form(...),  # 1 for human, 0 for pet
    image: UploadFile = File(...),
    details: str = Form(...),
    lat: float = Form(...),
    lon: float = Form(...)
):
    """
    Find a missing pet or person
    
    - **type**: 0 for pet, 1 for person
    - **image**: Image file of the found pet/person
    - **details**: Description of found pet/person
    - **lat**: Latitude where found
    - **lon**: Longitude where found
    """
    saved_file = await save_uploaded_file(image)
    image_path = saved_file["file_path"]
    
    # Filter database by type
    type_filtered_db = [record for record in missing_database if record["type"] == type]
    
    if not type_filtered_db:
        return JSONResponse(
            content={
                "message": f"No missing {'people' if type == 1 else 'pets'} found in database",
                "matches": []
            }
        )
    
    # Provide location data for scoring
    location = {"lat": lat, "lon": lon}
    
    # Call the search_pets function to find matches
    matches, processing_time = search_pets(
        description=details,
        image_url=f"file://{image_path}",
        custom_pets=type_filtered_db,  # Use our filtered database
        location=location  # Pass location for distance scoring
    )
    
    # Format the response
    formatted_matches = []
    for match in matches[:3]:  # Top 3 matches
        match_data = {
            "id": match["id"],
            "description": match["description"],
            "text_score": match["text_score"],
            "image_score": match.get("image_score"),
            "location_score": match.get("location_score"),
            "combined_score": match.get("combined_score"),
            "image_url": match["image_url"],
            "contact": match["contact"]
        }
        
        # Add location data if available
        if "location" in match:
            match_data["location"] = match["location"]
            
        formatted_matches.append(match_data)
    
    return JSONResponse(
        content={
            "message": f"Found {len(formatted_matches)} potential matches",
            "processing_time_ms": processing_time,
            "matches": formatted_matches
        }
    )


@app.get("/missing", summary="Get all missing entries")
async def get_missing(type: int = None):
    """
    Get all missing people or pets
    
    - **type**: Optional filter - 0 for pets, 1 for people. If not provided, returns all entries.
    """
    if type is not None:
        filtered = [record for record in missing_database if record["type"] == type]
        return JSONResponse(content=filtered)
    return JSONResponse(content=missing_database)


@app.get("/", summary="API Root")
async def root():
    """Root endpoint showing database content"""
    pet_count = len([r for r in missing_database if r["type"] == 0])
    person_count = len([r for r in missing_database if r["type"] == 1])
    
    recent_entries = sorted(
        missing_database, 
        key=lambda x: x.get("date_added", ""), 
        reverse=True
    )[:5]
    
    simplified_entries = []
    for entry in recent_entries:
        simplified_entries.append({
            "id": entry["id"],
            "type": "Person" if entry["type"] == 1 else "Pet",
            "description": entry["description"][:50] + "..." if len(entry["description"]) > 50 else entry["description"],
            "date_added": entry.get("date_added", "Unknown")
        })
    
    return {
        "database_status": {
            "total_entries": len(missing_database),
            "pets": pet_count,
            "people": person_count
        },
        "recent_entries": simplified_entries
    }


if __name__ == "__main__":
    uvicorn.run("fast:app", host="0.0.0.0", port=8000, reload=True)
