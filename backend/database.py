import motor.motor_asyncio
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional
from config import settings
import logging

logger = logging.getLogger(__name__)

class Database:
    client: Optional[AsyncIOMotorClient] = None
    database: Optional[AsyncIOMotorDatabase] = None

db = Database()

async def connect_to_mongo():
    """Create database connection."""
    try:
        db.client = AsyncIOMotorClient(settings.MONGODB_URL)
        db.database = db.client[settings.DATABASE_NAME]

        # Verify connection
        await db.client.admin.command('ping')
        logger.info("Connected to MongoDB successfully!")

        # Create indexes
        await create_indexes()

    except Exception as e:
        logger.warning(f"Could not connect to MongoDB: {e}")
        logger.warning("Running without MongoDB - tutorial history will not be saved")
        db.client = None
        db.database = None

async def close_mongo_connection():
    """Close database connection."""
    if db.client:
        db.client.close()
        logger.info("Disconnected from MongoDB.")

async def create_indexes():
    """Create database indexes for better performance."""
    try:
        # Index on created_at for sorting
        await db.database.tutorials.create_index([("created_at", -1)])

        # Index on user_id for future user-specific queries
        await db.database.tutorials.create_index([("user_id", 1)])

        logger.info("Database indexes created successfully!")
    except Exception as e:
        logger.error(f"Error creating indexes: {e}")

def get_database() -> AsyncIOMotorDatabase:
    """Get database instance."""
    return db.database