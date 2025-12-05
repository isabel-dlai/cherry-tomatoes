from typing import List, Optional
from datetime import datetime
import uuid
import os
import base64
from PIL import Image
import io
import logging

from models import (
    TutorialRequest,
    TutorialCreate,
    Tutorial,
    TutorialResponse,
    TutorialListItem,
    TutorialListResponse,
    StepModel
)
from database import get_database
from gemini_service import gemini_service
from config import settings

logger = logging.getLogger(__name__)

class TutorialService:
    def __init__(self):
        self.db = None

    async def initialize(self):
        """Initialize the service with database connection."""
        self.db = get_database()

    async def generate_tutorial(self, request: TutorialRequest) -> TutorialResponse:
        """Generate a new drawing tutorial based on user input."""
        try:
            # Ensure directories exist
            os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
            os.makedirs(settings.TUTORIAL_DIR, exist_ok=True)

            # Extract or use the subject
            subject = ""
            original_image_url = None

            if request.input_type == "image":
                # Save the original image
                if request.image:
                    original_image_url = await self._save_original_image(request.image)

                # Extract subject from image using Gemini Vision
                subject = await gemini_service.extract_subject_from_image(request.image)
            else:
                # Use the provided topic as the subject
                subject = request.topic

            # Generate the prompt for the tutorial
            prompt = await gemini_service.generate_tutorial_prompt(subject, request.input_type)

            # Generate the 4-panel tutorial image
            tutorial_image_bytes, filename = await gemini_service.generate_tutorial_image(
                prompt, settings.GRID_TEMPLATE_PATH
            )

            # Save the tutorial image
            tutorial_image_url = await self._save_tutorial_image(tutorial_image_bytes, filename)

            # Get step descriptions
            steps = gemini_service.get_step_descriptions()

            # Create tutorial document
            tutorial_id = str(uuid.uuid4())
            tutorial_doc = {
                "_id": tutorial_id,
                "user_id": None,  # For future user support
                "input_type": request.input_type,
                "subject": subject,
                "original_image_url": original_image_url,
                "tutorial_image_url": tutorial_image_url,
                "prompt": prompt,
                "steps": steps,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }

            # Save to MongoDB if available
            if self.db:
                await self.db.tutorials.insert_one(tutorial_doc)
            else:
                logger.warning("MongoDB not available - tutorial will not be saved to history")

            # Return response
            return TutorialResponse(
                tutorial_id=tutorial_id,
                subject=subject,
                tutorial_image_url=tutorial_image_url,
                steps=[StepModel(**step) for step in steps],
                created_at=tutorial_doc["created_at"]
            )

        except Exception as e:
            logger.error(f"Error generating tutorial: {e}")
            raise

    async def get_tutorial(self, tutorial_id: str) -> Optional[TutorialResponse]:
        """Get a specific tutorial by ID."""
        try:
            if not self.db:
                logger.warning("MongoDB not available - cannot retrieve tutorial")
                return None

            tutorial = await self.db.tutorials.find_one({"_id": tutorial_id})

            if not tutorial:
                return None

            return TutorialResponse(
                tutorial_id=tutorial["_id"],
                subject=tutorial["subject"],
                tutorial_image_url=tutorial["tutorial_image_url"],
                steps=[StepModel(**step) for step in tutorial["steps"]],
                created_at=tutorial["created_at"]
            )

        except Exception as e:
            logger.error(f"Error retrieving tutorial {tutorial_id}: {e}")
            raise

    async def get_tutorials(
        self, page: int = 1, limit: int = 10
    ) -> TutorialListResponse:
        """Get paginated list of tutorials."""
        try:
            if not self.db:
                logger.warning("MongoDB not available - returning empty tutorial list")
                return TutorialListResponse(
                    tutorials=[],
                    total=0,
                    page=page,
                    pages=0
                )

            # Calculate skip value for pagination
            skip = (page - 1) * limit

            # Get total count
            total = await self.db.tutorials.count_documents({})

            # Get tutorials sorted by creation date (newest first)
            cursor = self.db.tutorials.find({}).sort("created_at", -1).skip(skip).limit(limit)
            tutorials_docs = await cursor.to_list(length=limit)

            # Convert to response models
            tutorials = []
            for doc in tutorials_docs:
                tutorials.append(
                    TutorialListItem(
                        tutorial_id=doc["_id"],
                        subject=doc["subject"],
                        thumbnail_url=doc["tutorial_image_url"],  # Using full image as thumbnail for now
                        created_at=doc["created_at"]
                    )
                )

            # Calculate total pages
            pages = (total + limit - 1) // limit

            return TutorialListResponse(
                tutorials=tutorials,
                total=total,
                page=page,
                pages=pages
            )

        except Exception as e:
            logger.error(f"Error retrieving tutorials list: {e}")
            raise

    async def _save_original_image(self, image_base64: str) -> str:
        """Save the original uploaded image."""
        try:
            # Decode base64 image
            image_bytes = base64.b64decode(image_base64)
            image = Image.open(io.BytesIO(image_bytes))

            # Generate filename
            filename = f"original_{uuid.uuid4().hex}.png"
            filepath = os.path.join(settings.UPLOAD_DIR, filename)

            # Save image
            image.save(filepath, "PNG")

            # Return relative URL
            return f"/static/uploads/{filename}"

        except Exception as e:
            logger.error(f"Error saving original image: {e}")
            raise

    async def _save_tutorial_image(self, image_bytes: bytes, filename: str) -> str:
        """Save the generated tutorial image."""
        try:
            filepath = os.path.join(settings.TUTORIAL_DIR, filename)

            # Save image bytes
            with open(filepath, "wb") as f:
                f.write(image_bytes)

            # Return relative URL
            return f"/static/tutorials/{filename}"

        except Exception as e:
            logger.error(f"Error saving tutorial image: {e}")
            raise

tutorial_service = TutorialService()