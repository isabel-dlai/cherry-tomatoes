# Drawing Tutor - Product Specification

## Product Overview

Drawing Tutor is a web application that helps users learn to draw by breaking down any subject into a step-by-step tutorial. Users can either upload an image or provide a topic, and the app generates a 4-panel visual tutorial showing the standard artistic progression from basic shapes to finished drawing.

## Product Goals

1. **Democratize drawing education**: Make professional drawing instruction accessible to anyone
2. **Simplify the learning process**: Break down complex subjects into manageable steps
3. **Provide visual reference**: Give learners clear visual targets for each stage
4. **Build a tutorial library**: Allow users to revisit and learn from past tutorials

## Target Users

- Beginner artists learning fundamental drawing techniques
- Art students seeking structured practice
- Hobbyists wanting to improve their drawing skills
- Anyone curious about the drawing process

## User Stories

1. As a user, I want to upload a photo and receive a step-by-step drawing tutorial so I can learn to draw that subject
2. As a user, I want to enter a topic and receive a drawing tutorial so I can learn without having a reference image
3. As a user, I want to see my past tutorials so I can revisit previous lessons
4. As a user, I want clear descriptions for each step so I understand what to focus on

## Core Features (MVP)

### 1. Input Interface
- **Image Upload**: Users can upload JPG/PNG images
- **Topic Input**: Users can enter text describing what they want to draw
- Single unified input form with toggle or tabs

### 2. Tutorial Generation
- Generates a single 4-panel grid image showing:
  - **Panel 1 (Top Left)**: Basic shapes
  - **Panel 2 (Top Right)**: Rough sketch
  - **Panel 3 (Bottom Left)**: Line work
  - **Panel 4 (Bottom Right)**: Shading
- Each panel includes step-specific explanations

### 3. Tutorial Display
- Large, clear display of the 4-panel tutorial image
- Step descriptions displayed alongside or below each panel
- Clean, distraction-free viewing experience

### 4. Tutorial History
- List of previously generated tutorials
- Thumbnail previews
- Click to view full tutorial
- Shows creation date and subject/topic

## Technical Architecture

### Frontend
- **Framework**: React (with Vite or Create React App)
- **Routing**: React Router
- **State Management**: React Context or Redux (if needed)
- **UI Components**: TailwindCSS or Material-UI
- **HTTP Client**: Axios or Fetch API

### Backend
- **Framework**: FastAPI (Python)
- **API Documentation**: Auto-generated with FastAPI (OpenAPI/Swagger)
- **Image Processing**: Pillow (PIL)
- **Async Support**: For handling API calls to Gemini

### Database
- **Database**: MongoDB
- **ODM**: Motor (async MongoDB driver) or PyMongo
- **Cloud/Local**: MongoDB Atlas (cloud) or local instance

### External Services
- **AI Model**: Gemini Nano Banana 3
- **Image Generation**: Single 4-panel grid generation per request

## Data Models

### Tutorial Document
```javascript
{
  "_id": ObjectId,
  "user_id": String,           // Future: for multi-user support
  "input_type": String,        // "image" or "topic"
  "subject": String,           // Extracted subject or user-provided topic
  "original_image_url": String, // S3/storage URL (if image input)
  "tutorial_image_url": String, // URL to generated 4-panel image
  "prompt": String,            // Full prompt sent to Gemini
  "steps": [
    {
      "step_number": Integer,  // 1-4
      "title": String,         // "Basic Shapes", "Rough Sketch", etc.
      "description": String    // What to focus on in this step
    }
  ],
  "created_at": DateTime,
  "updated_at": DateTime
}
```

## API Endpoints

### POST /api/tutorials/generate
Generate a new drawing tutorial

**Request Body:**
```json
{
  "input_type": "image" | "topic",
  "topic": "string",           // Required if input_type is "topic"
  "image": "base64_string"     // Required if input_type is "image"
}
```

**Response:**
```json
{
  "tutorial_id": "string",
  "subject": "string",
  "tutorial_image_url": "string",
  "steps": [
    {
      "step_number": 1,
      "title": "Basic Shapes",
      "description": "Break down the bowl and fruit into simple geometric shapes..."
    },
    // ... 3 more steps
  ],
  "created_at": "ISO8601 datetime"
}
```

### GET /api/tutorials
Get all tutorials (paginated)

**Query Parameters:**
- `page`: Integer (default: 1)
- `limit`: Integer (default: 10)

**Response:**
```json
{
  "tutorials": [
    {
      "tutorial_id": "string",
      "subject": "string",
      "thumbnail_url": "string",
      "created_at": "ISO8601 datetime"
    }
  ],
  "total": 100,
  "page": 1,
  "pages": 10
}
```

### GET /api/tutorials/{tutorial_id}
Get a specific tutorial

**Response:**
```json
{
  "tutorial_id": "string",
  "subject": "string",
  "tutorial_image_url": "string",
  "steps": [...],
  "created_at": "ISO8601 datetime"
}
```

## User Flow

### Image Upload Flow
1. User lands on home page
2. User selects "Upload Image" option
3. User uploads JPG/PNG file
4. Loading indicator shows while processing
5. Backend sends image to Gemini for subject extraction
6. Backend generates prompt with 4-panel grid template
7. Backend calls Gemini Nano Banana 3 with grid + prompt
8. Tutorial is saved to MongoDB
9. User sees generated 4-panel tutorial with step descriptions

### Topic Input Flow
1. User lands on home page
2. User selects "Enter Topic" option
3. User types topic (e.g., "a cat", "mountain landscape")
4. Loading indicator shows while processing
5. Backend generates prompt directly from topic
6. Backend calls Gemini Nano Banana 3 with grid + prompt
7. Tutorial is saved to MongoDB
8. User sees generated 4-panel tutorial with step descriptions

### View History Flow
1. User clicks "My Tutorials" or "History"
2. Grid of tutorial thumbnails loads
3. User clicks on a tutorial
4. Full tutorial displays with all steps

## Prompt Engineering Strategy

### For Image Input
```
Template:
"Analyze the main subject in this image: [SUBJECT_FROM_VISION_MODEL].
Show a 4-step drawing tutorial in the provided grid layout. Create 1 image,
but show each step of the tutorial separately. Use the provided grid.
1. Top left - Basic shapes
2. Top right - Rough sketch
3. Bottom left - Line work
4. Bottom right - Shading"
```

### For Topic Input
```
Template:
"Show a 4-step drawing tutorial of [USER_TOPIC] in the provided grid layout.
Create 1 image, but show each step of the tutorial separately. Use the provided grid.
1. Top left - Basic shapes
2. Top right - Rough sketch
3. Bottom left - Line work
4. Bottom right - Shading"
```

## Step Descriptions (Standard Template)

These will be generated or templated for each tutorial:

**Step 1 - Basic Shapes**
- Focus: Break down the subject into simple geometric shapes (circles, rectangles, triangles, ovals)
- Goal: Establish proportions and composition

**Step 2 - Rough Sketch**
- Focus: Refine the basic shapes into recognizable forms
- Goal: Add details while maintaining loose, exploratory lines

**Step 3 - Line Work**
- Focus: Create clean, confident outlines
- Goal: Define edges and important details with deliberate strokes

**Step 4 - Shading**
- Focus: Add values, shadows, and highlights
- Goal: Create depth and dimension

## File Storage Strategy

### Options:
1. **Local Storage** (MVP): Store images in `/static/uploads` and `/static/tutorials`
2. **Cloud Storage** (Production): AWS S3, Google Cloud Storage, or Cloudinary

### File Naming Convention:
- Original images: `original_{tutorial_id}_{timestamp}.{ext}`
- Tutorial images: `tutorial_{tutorial_id}_{timestamp}.png`

## Success Metrics

### MVP Success Criteria
1. Successfully generate tutorials for 95%+ of valid inputs
2. Tutorial generation completes within 30 seconds
3. Images are clearly visible and properly formatted
4. Users can access their tutorial history

### Future Metrics
- Daily active users
- Tutorials generated per user
- Tutorial completion rate (if we add progress tracking)
- User retention rate

## Future Enhancements (Post-MVP)

1. **User Authentication**: Individual accounts and private tutorial libraries
2. **Drawing Feedback**: Upload progress photos for AI feedback
3. **Custom Step Numbers**: Allow 3, 5, or 6-step tutorials
4. **Drawing Techniques**: Select different styles (realistic, cartoon, anime)
5. **Video Generation**: Animate the progression between steps
6. **Community Features**: Share tutorials, browse popular subjects
7. **Practice Mode**: Timed drawing challenges for each step
8. **Export Options**: Download as PDF with instructions
9. **Difficulty Levels**: Beginner, intermediate, advanced variations
10. **Mobile App**: Native iOS/Android applications

## Open Questions

1. Should we impose limits on image upload size? (Suggest: 5MB max)
2. Do we need user authentication for MVP, or can tutorials be public/anonymous?
3. Should we store the 4-panel grid template locally or generate it each time?
4. What's the expected API rate limit for Gemini Nano Banana 3?
5. Should we add a "regenerate" feature if users don't like the result?
