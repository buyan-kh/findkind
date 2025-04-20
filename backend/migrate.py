import os
import asyncio
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = "findkind_db"


async def run_migration():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    print("🔧 Creating indexes...")

    await db["missing_reports"].create_index([("missing_since", ASCENDING)])
    await db["missing_reports"].insert_one({"_migration": True})

    await db["image_uploads"].create_index([("filename", ASCENDING)])
    await db["image_uploads"].insert_one({"_migration": True})

    await db["sighting_reports"].create_index([("description", ASCENDING)])
    await db["sighting_reports"].insert_one({"_migration": True})

    await db["missing_reports"].delete_many({"_migration": True})
    await db["image_uploads"].delete_many({"_migration": True})
    await db["sighting_reports"].delete_many({"_migration": True})

    print("✅ Migration complete. Collections should now appear in Atlas.")


if __name__ == "__main__":
    asyncio.run(run_migration())
