from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # MongoDB settings
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "drawing_tutor"

    # Gemini API settings
    GEMINI_API_KEY: str

    # File storage settings
    UPLOAD_DIR: str = "../static/uploads"
    TUTORIAL_DIR: str = "../static/tutorials"
    GRID_TEMPLATE_PATH: str = "../static/grids/Grid.png"

    # API settings
    API_VERSION: str = "v1"
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5MB

    # CORS settings
    CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000"]

    class Config:
        env_file = "../.env"
        env_file_encoding = 'utf-8'

settings = Settings()