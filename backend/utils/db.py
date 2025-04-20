import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")

client = None
db = None
fs_bucket = None
missing_collection = None
image_uploads_collection = None
sightings_collection = None


def init_db():
    global \
        client, \
        db, \
        fs_bucket, \
        missing_collection, \
        image_uploads_collection, \
        sightings_collection
    client = AsyncIOMotorClient(MONGO_URL)
    db = client["findkind_db"]
    fs_bucket = AsyncIOMotorGridFSBucket(db)
    missing_collection = db["missing_reports"]
    image_uploads_collection = db["image_uploads"]
    sightings_collection = db["sighting_reports"]
