import React, { useState, useEffect } from 'react';

const MODELS = [
  {
    id: 'gemini-2.5-flash-image',
    name: 'Gemini 2.5 Flash Image',
    nickname: 'Nano Banana',
    description: 'Fast and efficient image generation'
  },
  {
    id: 'gemini-3-pro-image-preview',
    name: 'Gemini 3 Pro Image',
    nickname: 'Nano Banana Pro',
    description: 'Advanced image generation with improved quality and text rendering'
  }
];

const ACCENT_COLORS = [
  { id: 'blue', preview: 'bg-sky-500' },
  { id: 'purple', preview: 'bg-purple-500' },
  { id: 'pink', preview: 'bg-pink-500' },
  { id: 'red', preview: 'bg-red-500' },
  { id: 'orange', preview: 'bg-orange-500' },
  { id: 'amber', preview: 'bg-amber-500' },
  { id: 'green', preview: 'bg-green-500' },
  { id: 'teal', preview: 'bg-teal-500' },
  { id: 'cyan', preview: 'bg-cyan-500' },
  { id: 'indigo', preview: 'bg-indigo-500' }
];

function Settings({ onClose }) {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash-image');
  const [accentColor, setAccentColor] = useState('blue');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    const savedModel = localStorage.getItem('gemini_model');
    const savedColor = localStorage.getItem('accent_color');

    if (savedApiKey) setApiKey(savedApiKey);
    if (savedModel) setSelectedModel(savedModel);
    if (savedColor) setAccentColor(savedColor);
  }, []);

  const handleSave = () => {
    // Save to localStorage
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
    } else {
      localStorage.removeItem('gemini_api_key');
    }
    localStorage.setItem('gemini_model', selectedModel);
    localStorage.setItem('accent_color', accentColor);

    // Apply theme immediately
    applyTheme(accentColor);

    // Close immediately after saving
    if (onClose) onClose();
  };

  const applyTheme = (color) => {
    // Remove all theme attributes
    document.documentElement.removeAttribute('data-theme');

    // Apply new theme if not default (blue)
    if (color !== 'blue') {
      document.documentElement.setAttribute('data-theme', color);
    }
  };

  const handleClearApiKey = () => {
    setApiKey('');
    localStorage.removeItem('gemini_api_key');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* API Key Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gemini API Key
            </label>
            <div className="space-y-2">
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key"
                  className="w-full px-4 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
                >
                  {showApiKey ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="flex items-start space-x-2 text-sm text-gray-600">
                <svg
                  className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p>Get your free API key at{' '}
                    <a
                      href="https://ai.google.dev/gemini-api/docs/api-key"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline"
                    >
                      Google AI Studio
                    </a>
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Your API key is stored locally in your browser and never sent to our servers.
                  </p>
                </div>
              </div>
              {apiKey && (
                <button
                  onClick={handleClearApiKey}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Clear API Key
                </button>
              )}
            </div>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Image Generation Model
            </label>
            <div className="space-y-3">
              {MODELS.map((model) => (
                <div
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedModel === model.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedModel === model.id
                            ? 'border-primary-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedModel === model.id && (
                          <div className="w-3 h-3 bg-primary-500 rounded-full" />
                        )}
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {model.name}
                        </h3>
                        <span className="text-xs text-gray-500 font-mono">
                          ({model.nickname})
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {model.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-start space-x-2 text-sm text-gray-600">
              <svg
                className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p>
                Note: Different models have different rate limits and pricing.
                Check{' '}
                <a
                  href="https://ai.google.dev/pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  pricing details
                </a>
              </p>
            </div>
          </div>

          {/* Accent Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Accent Color
            </label>
            <div className="flex flex-wrap gap-3">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setAccentColor(color.id)}
                  className={`relative w-10 h-10 rounded-full border-2 transition-all ${color.preview} ${
                    accentColor === color.id
                      ? 'border-gray-800 ring-2 ring-primary-500 ring-offset-2'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  title={color.id}
                >
                  {accentColor === color.id && (
                    <svg
                      className="absolute inset-0 m-auto w-5 h-5 text-white drop-shadow-md"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            {saveSuccess ? (
              <span className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Saved!
              </span>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
