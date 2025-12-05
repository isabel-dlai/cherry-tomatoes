import React, { useState } from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import InputInterface from './components/InputInterface';
import TutorialDisplay from './components/TutorialDisplay';
import TutorialHistory from './components/TutorialHistory';
import Settings from './components/Settings';
import { tutorialAPI } from './services/api';

function App() {
  const [currentTutorial, setCurrentTutorial] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('create');
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  const handleGenerateTutorial = async (inputType, data) => {
    try {
      setIsLoading(true);
      setError(null);
      const tutorial = await tutorialAPI.generateTutorial(inputType, data);
      setCurrentTutorial(tutorial);
      setActiveTab('tutorial');
    } catch (err) {
      console.error('Error generating tutorial:', err);
      setError('Failed to generate tutorial. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTutorial = (tutorial) => {
    setCurrentTutorial(tutorial);
    setActiveTab('tutorial');
  };

  const handleBack = () => {
    setCurrentTutorial(null);
    setActiveTab('create');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center space-x-4">
              <img
                src="/static/logo/tomatoes2.png"
                alt="Drawing Tutor Logo"
                className="h-16 w-auto"
              />
              <h1 className="text-3xl font-bold text-gray-800">
                Drawing Tutor
              </h1>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center space-x-8">
              <button
                onClick={() => {
                  setActiveTab('create');
                  setCurrentTutorial(null);
                }}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'create'
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Create New
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'history'
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                My Tutorials
              </button>
              {currentTutorial && (
                <button
                  onClick={() => setActiveTab('tutorial')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'tutorial'
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Current Tutorial
                </button>
              )}
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Settings"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-500 hover:text-red-600"
                >
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Tab Content */}
          <div className="transition-all duration-300">
            {activeTab === 'create' && !currentTutorial && (
              <div className="flex justify-center">
                <InputInterface
                  onSubmit={handleGenerateTutorial}
                  isLoading={isLoading}
                />
              </div>
            )}

            {activeTab === 'tutorial' && currentTutorial && (
              <TutorialDisplay
                tutorial={currentTutorial}
                onBack={handleBack}
              />
            )}

            {activeTab === 'history' && (
              <TutorialHistory onSelectTutorial={handleSelectTutorial} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2024 Drawing Tutor. Learn to draw with AI-powered tutorials.
          </p>
        </div>
      </footer>

      {/* Settings Modal */}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default App;