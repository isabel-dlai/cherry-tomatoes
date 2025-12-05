import google.generativeai as genai
from PIL import Image
import base64
import io
import os
from typing import Optional, Tuple
from config import settings
import logging

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        # Models will be initialized per request with user's API key
        pass

    def _get_configured_model(self, model_name: str, api_key: Optional[str] = None):
        """Get a configured Gemini model with the appropriate API key."""
        key_to_use = api_key if api_key else settings.GEMINI_API_KEY
        if not key_to_use:
            raise ValueError("No API key provided. Please add your Gemini API key.")

        # Configure with the appropriate key
        genai.configure(api_key=key_to_use)
        return genai.GenerativeModel(model_name)

    async def extract_subject_from_image(self, image_base64: str, api_key: Optional[str] = None) -> str:
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

            # Get vision model with appropriate API key
            vision_model = self._get_configured_model('gemini-2.0-flash-exp', api_key)

            # Send to Gemini Vision
            response = vision_model.generate_content([prompt, image])
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
2. Top right - Rough sketch (refined proportions and structure)
3. Bottom left - Shading (add values, shadows, and dimension)
4. Bottom right - Final details (textures, highlights, and finishing touches)

IMPORTANT: Do NOT include any text, labels, titles, or words in the generated image.
Only show the drawings themselves without any text annotations."""
        else:
            prompt = f"""Show a 4-step drawing tutorial of {subject} in the provided grid layout.
Create 1 image, but show each step of the tutorial separately. Use the provided grid.
1. Top left - Basic shapes (simple geometric forms)
2. Top right - Rough sketch (refined proportions and structure)
3. Bottom left - Shading (add values, shadows, and dimension)
4. Bottom right - Final details (textures, highlights, and finishing touches)

IMPORTANT: Do NOT include any text, labels, titles, or words in the generated image.
Only show the drawings themselves without any text annotations."""

        return prompt

    async def generate_tutorial_image(
        self,
        prompt: str,
        grid_path: str,
        model: str = "gemini-2.5-flash-image",
        api_key: Optional[str] = None
    ) -> Tuple[bytes, str]:
        """
        Generate the 4-panel tutorial image using specified Gemini image generation model.
        Returns the image bytes and the filename.
        """
        try:
            # Load the grid template
            grid_image = Image.open(grid_path)

            logger.info(f"Generating tutorial with {model}...")
            logger.info(f"Prompt: {prompt[:100]}...")

            # Get image generation model with appropriate API key
            image_generation_model = self._get_configured_model(model, api_key)

            # Generate the image using Gemini
            response = image_generation_model.generate_content([
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
                "description": "Break down the subject into simple geometric shapes (circles, rectangles, triangles, ovals). Focus on establishing proportions and overall composition.\n\nTips:\n• Draw lightly so you can erase easily\n• Look for the biggest shapes first, ignore details\n• Use negative space to check proportions"
            },
            {
                "step_number": 2,
                "title": "Rough Sketch",
                "description": "Refine the basic shapes into recognizable forms. Add details while maintaining loose, exploratory lines. Don't worry about perfection yet.\n\nTips:\n• Keep your lines loose and exploratory\n• Focus on relationships between parts\n• Draw through forms to understand structure"
            },
            {
                "step_number": 3,
                "title": "Shading",
                "description": "Add values, shadows, and dimension to create form and depth. Consider the light source and how it affects the subject. This brings your drawing to life.\n\nTips:\n• Squint to see value relationships more clearly\n• Build up gradually from light to dark\n• Use the side of your pencil for smooth shading"
            },
            {
                "step_number": 4,
                "title": "Final Details",
                "description": "Add finishing touches including textures, highlights, and refined details. This is where you polish your work and add character.\n\nTips:\n• Add surface textures and patterns\n• Enhance highlights with an eraser for extra pop\n• Step back frequently to evaluate overall effect"
            }
        ]

gemini_service = GeminiService()