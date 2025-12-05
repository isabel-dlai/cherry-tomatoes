import google.generativeai as genai
from PIL import Image
import base64
import io
import os
from typing import Optional, Tuple
from config import settings
import logging

logger = logging.getLogger(__name__)

# Configure Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)

class GeminiService:
    def __init__(self):
        # Initialize Gemini models
        self.vision_model = genai.GenerativeModel('gemini-2.0-flash-exp')  # For image analysis
        self.image_generation_model = genai.GenerativeModel('gemini-2.5-flash-image')  # For image generation (Nano Banana)

    async def extract_subject_from_image(self, image_base64: str) -> str:
        """Extract the main subject from an uploaded image using Gemini Vision."""
        try:
            # Decode base64 image
            image_bytes = base64.b64decode(image_base64)
            image = Image.open(io.BytesIO(image_bytes))

            # Create prompt for subject extraction
            prompt = """
            Analyze this image and identify the main subject in 2-5 words.
            Focus on what would be the primary drawing subject.
            Examples: "a sleeping cat", "mountain landscape", "bowl of fruit", "vintage car"
            Just return the subject description, nothing else.
            """

            # Send to Gemini Vision
            response = self.vision_model.generate_content([prompt, image])
            subject = response.text.strip()

            logger.info(f"Extracted subject: {subject}")
            return subject

        except Exception as e:
            logger.error(f"Error extracting subject from image: {e}")
            raise

    async def generate_tutorial_prompt(self, subject: str, input_type: str) -> str:
        """Generate the prompt for the tutorial based on the subject."""
        if input_type == "image":
            prompt = f"""Analyze the main subject in this image: {subject}.
Show a 4-step drawing tutorial in the provided grid layout. Create 1 image,
but show each step of the tutorial separately. Use the provided grid.
1. Top left - Basic shapes (simple geometric forms)
2. Top right - Rough sketch (refined proportions)
3. Bottom left - Line work (clean outlines)
4. Bottom right - Shading (values and depth)"""
        else:
            prompt = f"""Show a 4-step drawing tutorial of {subject} in the provided grid layout.
Create 1 image, but show each step of the tutorial separately. Use the provided grid.
1. Top left - Basic shapes (simple geometric forms)
2. Top right - Rough sketch (refined proportions)
3. Bottom left - Line work (clean outlines)
4. Bottom right - Shading (values and depth)"""

        return prompt

    async def generate_tutorial_image(self, prompt: str, grid_path: str) -> Tuple[bytes, str]:
        """
        Generate the 4-panel tutorial image using Gemini 2.5 Flash Image (Nano Banana).
        Returns the image bytes and the filename.
        """
        try:
            # Load the grid template
            grid_image = Image.open(grid_path)

            logger.info(f"Generating tutorial with Gemini 2.5 Flash Image...")
            logger.info(f"Prompt: {prompt[:100]}...")

            # Generate the image using Gemini 2.5 Flash Image
            response = self.image_generation_model.generate_content([
                prompt,
                grid_image
            ])

            # Extract the generated image from the response
            if response.candidates:
                for part in response.candidates[0].content.parts:
                    if hasattr(part, 'inline_data') and part.inline_data:
                        # Get the image data (base64 encoded)
                        image_data = part.inline_data.data

                        import uuid
                        filename = f"tutorial_{uuid.uuid4().hex}.png"

                        logger.info("Successfully generated tutorial image from Gemini 2.5 Flash Image")
                        return image_data, filename

            # If no image was generated, fall back to grid template
            logger.warning("No image returned from Gemini, using grid template as fallback")
            grid_bytes = io.BytesIO()
            grid_image.save(grid_bytes, format='PNG')

            import uuid
            filename = f"tutorial_{uuid.uuid4().hex}.png"

            return grid_bytes.getvalue(), filename

        except Exception as e:
            logger.error(f"Error generating tutorial image: {e}")
            raise

    def get_step_descriptions(self) -> list:
        """Get standard step descriptions for the tutorial."""
        return [
            {
                "step_number": 1,
                "title": "Basic Shapes",
                "description": "Break down the subject into simple geometric shapes (circles, rectangles, triangles, ovals). Focus on establishing proportions and overall composition."
            },
            {
                "step_number": 2,
                "title": "Rough Sketch",
                "description": "Refine the basic shapes into recognizable forms. Add details while maintaining loose, exploratory lines. Don't worry about perfection yet."
            },
            {
                "step_number": 3,
                "title": "Line Work",
                "description": "Create clean, confident outlines. Define edges and important details with deliberate strokes. This is where your drawing gains clarity."
            },
            {
                "step_number": 4,
                "title": "Shading",
                "description": "Add values, shadows, and highlights to create depth and dimension. Consider the light source and how it affects the subject."
            }
        ]

gemini_service = GeminiService()