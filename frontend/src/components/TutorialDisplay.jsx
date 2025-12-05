import React, { useState, useRef, useEffect } from 'react';

const TutorialDisplay = ({ tutorial, onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const imageRef = useRef(null);

  if (!tutorial) {
    return null;
  }

  // Grid layout positions for each step (as percentages)
  // With backgroundSize: '200% 200%', use 0 and 100 for positioning
  const stepPositions = [
    { x: 0, y: 0, label: 'Top Left' },      // Step 1: Basic shapes
    { x: 100, y: 0, label: 'Top Right' },    // Step 2: Rough sketch
    { x: 0, y: 100, label: 'Bottom Left' },  // Step 3: Line work
    { x: 100, y: 100, label: 'Bottom Right' } // Step 4: Shading (final)
  ];

  // Final result is always step 4 (bottom right)
  const finalResultPosition = stepPositions[3];

  const handleNext = () => {
    if (currentStep < tutorial.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleImageLoad = () => {
    if (imageRef.current) {
      setImageDimensions({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight
      });
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Collapsible Sidebar - Full Height */}
      <div className={`bg-gray-50 border-r border-gray-200 transition-all duration-300 ${sidebarOpen ? 'w-72' : 'w-0'} flex-shrink-0 overflow-hidden h-full`}>
        <div className="h-full flex flex-col w-72">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 text-lg">{tutorial.subject}</h2>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
              title="Hide sidebar"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Steps List */}
          <div className="flex-1 overflow-y-auto">
            {tutorial.steps.map((step, index) => (
              <button
                key={step.step_number}
                onClick={() => setCurrentStep(index)}
                className={`w-full text-left px-4 py-3 border-l-4 transition-all ${
                  index === currentStep
                    ? 'bg-primary-50 border-primary-500'
                    : 'bg-transparent border-transparent hover:bg-gray-100'
                }`}
              >
                <div className="flex items-start">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0 ${
                    index === currentStep
                      ? 'bg-primary-500 text-white'
                      : index < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-700'
                  }`}>
                    {index < currentStep ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      step.step_number
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-900">{step.title}</div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Step {index + 1} of {tutorial.steps.length}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Bottom Section - Progress & Actions */}
          <div className="border-t border-gray-200 bg-white">
            {/* Progress Bar */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-medium text-gray-700">Progress</span>
                <span className="text-gray-500">
                  {Math.round((currentStep / tutorial.steps.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / tutorial.steps.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex gap-2">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className={`flex-1 flex items-center justify-center px-3 py-2 rounded text-sm font-medium transition-all ${
                    currentStep === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Prev
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentStep === tutorial.steps.length - 1}
                  className={`flex-1 flex items-center justify-center px-3 py-2 rounded text-sm font-medium transition-all ${
                    currentStep === tutorial.steps.length - 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-primary-500 text-white hover:bg-primary-600'
                  }`}
                >
                  Next
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-4 py-3 space-y-2">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = tutorial.tutorial_image_url;
                  link.download = `tutorial_${tutorial.subject.replace(/\s+/g, '_')}.png`;
                  link.click();
                }}
                className="w-full px-3 py-2 bg-primary-500 text-white rounded text-sm font-medium hover:bg-primary-600 transition-colors"
              >
                Download Image
              </button>
              <button
                onClick={onBack}
                className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                New Tutorial
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Show sidebar button when collapsed */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-4 left-4 z-10 p-2 bg-white hover:bg-gray-100 rounded-lg shadow-lg border border-gray-200 transition-colors"
            title="Show sidebar"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Main content area - calculate exact height: viewport - header(96px) */}
        <div className="overflow-hidden bg-white h-full">
          {/* Artist Workflow Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full p-6">
        {/* Left: Current Step (Large - 2 columns) */}
        <div className="lg:col-span-2 overflow-hidden flex flex-col min-h-0">
          <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col min-h-0 items-center justify-center">
            <div
              className="w-full rounded-lg border-4 border-primary-500"
              style={{
                aspectRatio: '4 / 3',
                maxHeight: '100%',
                backgroundImage: `url(${tutorial.tutorial_image_url})`,
                backgroundSize: '200% 200%',
                backgroundPosition: `${stepPositions[currentStep].x}% ${stepPositions[currentStep].y}%`,
                backgroundRepeat: 'no-repeat',
              }}
            />
          </div>
        </div>

        {/* Right Column: Final Result + Instructions - Split 40%/60% */}
        <div className="flex flex-col gap-4 h-full min-h-0">
          {/* Final Result Reference - Takes 2/5 of space */}
          <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col overflow-hidden min-h-0" style={{ flex: '2 1 0' }}>
            <h4 className="text-sm font-semibold text-gray-800 mb-3 text-center uppercase tracking-wide flex-shrink-0">
              Goal
            </h4>
            <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden">
              <div
                className="w-full rounded-lg border-3 border-green-500"
                style={{
                  aspectRatio: '1',
                  maxHeight: '100%',
                  backgroundImage: `url(${tutorial.tutorial_image_url})`,
                  backgroundSize: '200% 200%',
                  backgroundPosition: '100% 100%',
                  backgroundRepeat: 'no-repeat',
                }}
              />
            </div>
          </div>

          {/* Instructions - Takes 3/5 of space with scrollable content */}
          <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col overflow-hidden min-h-0" style={{ flex: '3 1 0' }}>
            <h4 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide flex-shrink-0">
              Instructions
            </h4>
            <div className="flex-1 overflow-y-auto text-gray-700 leading-relaxed whitespace-pre-line pr-2">
              {tutorial.steps[currentStep].description}
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialDisplay;
