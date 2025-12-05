import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const tutorialAPI = {
  // Generate a new tutorial
  generateTutorial: async (inputType, data) => {
    const payload = {
      input_type: inputType,
    };

    if (inputType === 'topic') {
      payload.topic = data;
    } else if (inputType === 'image') {
      payload.image = data;
    }

    // Get API key and model from localStorage
    const apiKey = localStorage.getItem('gemini_api_key');
    const model = localStorage.getItem('gemini_model') || 'gemini-2.5-flash-image';

    // Add API key and model to payload if available
    if (apiKey) {
      payload.api_key = apiKey;
    }
    payload.model = model;

    const response = await api.post('/api/tutorials/generate', payload);
    return response.data;
  },

  // Get list of tutorials
  getTutorials: async (page = 1, limit = 10) => {
    const response = await api.get('/api/tutorials', {
      params: { page, limit },
    });
    return response.data;
  },

  // Get a specific tutorial
  getTutorial: async (tutorialId) => {
    const response = await api.get(`/api/tutorials/${tutorialId}`);
    return response.data;
  },

  // Upload image and get base64
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/tutorials/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.image;
  },
};

export default api;