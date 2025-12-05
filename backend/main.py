from fastapi import FastAPI, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import logging
import base64
from contextlib import asynccontextmanager

from models import TutorialRequest, TutorialResponse, TutorialListResponse
from database import connect_to_mongo, close_mongo_connection
from tutorial_service import tutorial_service
from config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events."""
    # Startup
    logger.info("Starting up...")
    await connect_to_mongo()
    await tutorial_service.initialize()
    yield
    # Shutdown
    logger.info("Shutting down...")
    await close_mongo_connection()

# Create FastAPI app
app = FastAPI(
    title="Drawing Tutor API",
    description="API for generating step-by-step drawing tutorials",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="../static"), name="static")

@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Drawing Tutor API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

@app.post("/api/tutorials/generate", response_model=TutorialResponse)
async def generate_tutorial(request: TutorialRequest):
    """
    Generate a new drawing tutorial based on user input.

    - **input_type**: Either "image" or "topic"
    - **topic**: Required if input_type is "topic"
    - **image**: Base64 encoded image, required if input_type is "image"
    """
    try:
        # Validate request
        if request.input_type == "topic" and not request.topic:
            raise HTTPException(status_code=400, detail="Topic is required for topic input type")

        if request.input_type == "image" and not request.image:
            raise HTTPException(status_code=400, detail="Image is required for image input type")

        # Check image size if provided
        if request.image:
            image_size = len(base64.b64decode(request.image))
            if image_size > settings.MAX_UPLOAD_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail=f"Image size exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE / (1024*1024)}MB"
                )

        # Generate tutorial
        tutorial = await tutorial_service.generate_tutorial(request)
        return tutorial

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating tutorial: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate tutorial")

@app.get("/api/tutorials", response_model=TutorialListResponse)
async def get_tutorials(
    page: int = Query(default=1, ge=1, description="Page number"),
    limit: int = Query(default=10, ge=1, le=50, description="Items per page")
):
    """
    Get paginated list of tutorials.

    - **page**: Page number (default: 1)
    - **limit**: Number of items per page (default: 10, max: 50)
    """
    try:
        tutorials = await tutorial_service.get_tutorials(page, limit)
        return tutorials

    except Exception as e:
        logger.error(f"Error getting tutorials: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve tutorials")

@app.get("/api/tutorials/{tutorial_id}", response_model=TutorialResponse)
async def get_tutorial(tutorial_id: str):
    """
    Get a specific tutorial by ID.

    - **tutorial_id**: The unique identifier of the tutorial
    """
    try:
        tutorial = await tutorial_service.get_tutorial(tutorial_id)

        if not tutorial:
            raise HTTPException(status_code=404, detail="Tutorial not found")

        return tutorial

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting tutorial {tutorial_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve tutorial")

@app.post("/api/tutorials/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """
    Alternative endpoint for uploading images as multipart form data.
    Returns base64 encoded image for use with the generate endpoint.
    """
    try:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")

        # Read file content
        content = await file.read()

        # Check file size
        if len(content) > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"Image size exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE / (1024*1024)}MB"
            )

        # Convert to base64
        image_base64 = base64.b64encode(content).decode('utf-8')

        return {"image": image_base64}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading image: {e}")
        raise HTTPException(status_code=500, detail="Failed to process image")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)