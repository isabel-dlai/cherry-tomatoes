# Drawing Tutor

An AI-powered web application that helps users learn to draw by generating step-by-step tutorials. Users can either upload an image or provide a topic, and the app generates a 4-panel visual tutorial showing the standard artistic progression from basic shapes to finished drawing.

## Features

- **Dual Input Modes**: Upload an image or enter a topic
- **4-Panel Tutorial Generation**: Basic shapes → Rough sketch → Line work → Shading
- **Tutorial History**: Save and revisit all your generated tutorials
- **Clean, Modern UI**: Built with React and TailwindCSS
- **Fast API Backend**: Powered by FastAPI and MongoDB

## Architecture

- **Frontend**: React with Vite, TailwindCSS
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **AI**: Google Gemini (Vision for image analysis, Nano Banana 3 for tutorial generation)

## Prerequisites

- Python 3.8+
- Node.js 16+
- MongoDB (local or MongoDB Atlas)
- Gemini API key

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/drawing-tutor.git
cd drawing-tutor
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Add Grid Template

Place your 4-panel grid template image in the `/grids` directory:
- File should be named: `grid_template.png`
- Recommended size: 800x800px
- Format: PNG with clear quadrant divisions

### 4. Set Up MongoDB

#### Option A: Local MongoDB
```bash
# Install MongoDB if not already installed
brew install mongodb-community  # macOS
# or
sudo apt-get install mongodb     # Ubuntu

# Start MongoDB
mongod
```

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get your connection string
4. Update `MONGODB_URL` in `backend/config.py`

### 5. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 6. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## Running the Application

### Start the Backend Server

```bash
cd backend
python main.py
```

The backend will run on `http://localhost:8000`

- API Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### Start the Frontend Development Server

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

1. **Create a Tutorial**:
   - Choose between "Enter Topic" or "Upload Image"
   - For topics: Enter what you want to draw (e.g., "a cat", "mountain landscape")
   - For images: Upload a JPG/PNG file (max 5MB)
   - Click "Generate Tutorial"

2. **View Tutorial**:
   - See your 4-panel tutorial with step-by-step instructions
   - Each panel shows a different stage of the drawing process
   - Download the tutorial image for offline practice

3. **Browse History**:
   - Click "My Tutorials" to see all previously generated tutorials
   - Click on any thumbnail to view the full tutorial
   - Tutorials are automatically saved to MongoDB

## API Endpoints

### Generate Tutorial
```
POST /api/tutorials/generate
{
  "input_type": "topic" | "image",
  "topic": "string",        // if input_type is "topic"
  "image": "base64_string"  // if input_type is "image"
}
```

### Get All Tutorials
```
GET /api/tutorials?page=1&limit=10
```

### Get Specific Tutorial
```
GET /api/tutorials/{tutorial_id}
```

## Project Structure

```
drawing-tutor/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models.py            # Pydantic models
│   ├── database.py          # MongoDB connection
│   ├── config.py            # Configuration settings
│   ├── gemini_service.py    # Gemini API integration
│   ├── tutorial_service.py  # Business logic
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── InputInterface.jsx
│   │   │   ├── TutorialDisplay.jsx
│   │   │   └── TutorialHistory.jsx
│   │   ├── services/        # API services
│   │   │   └── api.js
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── package.json         # Node dependencies
│   └── vite.config.js       # Vite configuration
├── static/
│   ├── uploads/             # User uploaded images
│   └── tutorials/           # Generated tutorial images
├── grids/
│   └── grid_template.png    # 4-panel grid template
├── .env                     # Environment variables
└── README.md                # This file
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running: `mongod`
   - Check connection string in `backend/config.py`

2. **Gemini API Error**
   - Verify your API key is correct in `.env`
   - Check API rate limits

3. **Image Upload Fails**
   - Ensure image is under 5MB
   - Supported formats: JPG, PNG

4. **CORS Issues**
   - Check CORS origins in `backend/config.py`
   - Ensure frontend is running on expected port

### Development Tips

- Backend auto-reloads on file changes (uvicorn reload)
- Frontend hot-reloads with Vite
- MongoDB Compass can be used to view database directly
- Check browser console and network tab for debugging

## Future Enhancements

- User authentication and personal galleries
- Custom step counts (3, 5, or 6 steps)
- Different drawing styles (realistic, cartoon, anime)
- Progress tracking and feedback
- Export tutorials as PDF
- Mobile app version

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Google Gemini for AI capabilities
- FastAPI for the excellent Python web framework
- React and Vite for the modern frontend tooling