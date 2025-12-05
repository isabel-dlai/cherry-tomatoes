from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class InputType(str, Enum):
    IMAGE = "image"
    TOPIC = "topic"

class StepModel(BaseModel):
    step_number: int
    title: str
    description: str

class TutorialRequest(BaseModel):
    input_type: InputType
    topic: Optional[str] = None
    image: Optional[str] = None  # Base64 encoded image
    api_key: Optional[str] = None  # User's Gemini API key
    model: Optional[str] = "gemini-2.5-flash-image"  # Image generation model

class TutorialCreate(BaseModel):
    user_id: Optional[str] = None
    input_type: InputType
    subject: str
    original_image_url: Optional[str] = None
    tutorial_image_url: str
    prompt: str
    steps: List[StepModel]

class Tutorial(BaseModel):
    id: str = Field(alias="_id")
    user_id: Optional[str] = None
    input_type: InputType
    subject: str
    original_image_url: Optional[str] = None
    tutorial_image_url: str
    prompt: str
    steps: List[StepModel]
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True

class TutorialResponse(BaseModel):
    tutorial_id: str
    subject: str
    tutorial_image_url: str
    steps: List[StepModel]
    created_at: datetime

class TutorialListItem(BaseModel):
    tutorial_id: str
    subject: str
    thumbnail_url: str
    created_at: datetime

class TutorialListResponse(BaseModel):
    tutorials: List[TutorialListItem]
    total: int
    page: int
    pages: int