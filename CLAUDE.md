# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Drawing Tutor is an AI-powered web app that generates 4-panel step-by-step drawing tutorials. Users provide either an image or topic, and the app generates a visual tutorial showing progression: Basic Shapes → Rough Sketch → Line Work → Shading.

**Stack**: React (Vite) + FastAPI + MongoDB + Google Gemini API

## Development Commands

### Backend (FastAPI)
```bash
cd backend
uv run python main.py              # Start server (auto-reload enabled)
```
- Backend runs on `http://localhost:8000`
- API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

**Important**: Always use `uv` as the package manager, not pip directly. The project uses `uv run` to manage dependencies.

### Frontend (React + Vite)
```bash
cd frontend
npm install                        # Install dependencies
npm run dev                        # Start dev server
npm run build                      # Production build
```
- Frontend runs on `http://localhost:5173`
- Vite provides hot module replacement

### MongoDB
- **Optional for development**: App runs without MongoDB but won't save tutorial history
- If MongoDB unavailable, backend gracefully degrades and logs warnings
- Local: `mongod` to start
- Connection configured in `backend/config.py`

## Architecture & Key Concepts

### Request Flow: Topic/Image → Tutorial

1. **Frontend** (`App.jsx`): User submits topic or base64 image
2. **API** (`main.py`): Receives request at `POST /api/tutorials/generate`
3. **Service Layer** (`tutorial_service.py`): Orchestrates generation
4. **Gemini Integration** (`gemini_service.py`):
   - **Image input**: Uses `gemini-2.0-flash-exp` to extract subject from uploaded image
   - **Image generation**: Uses `gemini-2.5-flash-image` (Nano Banana) to generate 4-panel tutorial
   - Takes grid template from `/static/grids/Grid.png` and prompt
5. **Storage**: Saves to `static/tutorials/` and optionally MongoDB
6. **Response**: Returns tutorial with pre-defined step descriptions

### Critical Configuration

**Grid Template Path** (`backend/config.py`):
```python
GRID_TEMPLATE_PATH: str = "../static/grids/Grid.png"
```
The grid template MUST exist at this path. It's used as input to Gemini for image generation.

**Gemini Models** (`backend/gemini_service.py`):
- `vision_model`: `gemini-2.0-flash-exp` - for analyzing uploaded images
- `image_generation_model`: `gemini-2.5-flash-image` - for generating tutorial images

### MongoDB Optional Design Pattern

The codebase implements graceful degradation when MongoDB is unavailable:

```python
# database.py - logs warning but continues
if not self.db:
    logger.warning("MongoDB not available")
    return empty_results

# tutorial_service.py - checks before saving
if self.db:
    await self.db.tutorials.insert_one(tutorial_doc)
else:
    logger.warning("Tutorial will not be saved to history")
```

This allows development and testing without requiring MongoDB setup.

### Frontend State Management

**App.jsx** manages all application state:
- `currentTutorial`: The active tutorial being viewed
- `activeTab`: Navigation state ('create', 'history', 'tutorial')
- Tab-based navigation without React Router for simplicity

**API Communication** (`frontend/src/services/api.js`):
- Axios instance with proxy configured in `vite.config.js`
- All API calls go through `tutorialAPI` object

### File Storage

**Current (Local)**:
- Original images: `static/uploads/original_{uuid}.png`
- Tutorial images: `static/tutorials/tutorial_{uuid}.png`
- Both served as static files by FastAPI

**Note**: Grid template is NOT generated - it's a static resource provided at `/static/grids/Grid.png`

## Common Gotchas

### 1. Gemini API Quota Errors
If you see `429 quota exceeded` errors:
- The free tier for `gemini-2.5-flash-image` has strict limits
- Error will include retry delay (e.g., "retry in 17s")
- Check quota at: https://ai.dev/usage?tab=rate-limit

### 2. Server Auto-Reload
The backend uses `uvicorn` with `reload=True`, but:
- Must pass `"main:app"` string (not `app` object) to enable reload
- Watch for `watchfiles` detecting changes in logs

### 3. Environment Variables
`.env` file must be in **project root**, not in `backend/`:
```
drawing-tutor/
├── .env                 # HERE
├── backend/
└── frontend/
```

### 4. CORS Configuration
Frontend proxy and backend CORS must align:
- Vite proxy: `/api` and `/static` → `http://localhost:8000`
- Backend CORS: `["http://localhost:5173", "http://localhost:3000"]`

## Data Model

### Tutorial Document (MongoDB)
```javascript
{
  _id: UUID,
  input_type: "image" | "topic",
  subject: string,              // Extracted by Gemini or user-provided
  original_image_url: string?,  // Only if image input
  tutorial_image_url: string,   // Generated 4-panel image
  prompt: string,               // Full prompt sent to Gemini
  steps: [                      // Fixed 4-step template
    {
      step_number: 1,
      title: "Basic Shapes",
      description: "Break down the subject into..."
    },
    // ... steps 2-4
  ],
  created_at: DateTime,
  updated_at: DateTime
}
```

**Important**: Step descriptions are **hard-coded templates** in `gemini_service.py`, not generated by AI. This ensures consistency and reduces API costs.

## API Rate Limits & Costs

**Gemini 2.5 Flash Image**:
- Free tier has very limited quota (may be 0 requests/day on free tier)
- Cost: $30/1M output tokens (~$0.039 per image)
- Each image = 1290 output tokens
- Includes SynthID watermarking

**Gemini 2.0 Flash** (vision):
- More generous free tier for image analysis
- Used only for extracting subject from uploaded images

## Key Files Reference

| File | Purpose |
|------|---------|
| `backend/gemini_service.py` | All Gemini API interaction - vision & image gen |
| `backend/tutorial_service.py` | Business logic for tutorial generation |
| `backend/config.py` | Environment config - check here for paths |
| `frontend/src/App.jsx` | Main app logic and state management |
| `frontend/src/components/InputInterface.jsx` | Dual-mode input (topic/image) |
| `static/grids/Grid.png` | 4-panel template (CRITICAL - must exist) |

## Development Workflow

1. Ensure `.env` has valid `GEMINI_API_KEY`
2. Verify grid template exists at `/static/grids/Grid.png`
3. Start backend: `cd backend && uv run python main.py`
4. Start frontend: `cd frontend && npm run dev`
5. MongoDB is optional - app will log warnings but function

## Known Limitations

- Tutorial history not saved without MongoDB
- Gemini 2.5 Flash Image has strict free-tier quotas
- No user authentication (all tutorials are public)
- Image generation uses full quota even if result isn't satisfactory
- No retry mechanism for failed generations