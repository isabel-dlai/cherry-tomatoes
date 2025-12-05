import React, { useState, useRef, useEffect } from 'react';

const TutorialDisplay = ({ tutorial, onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const imageRef = useRef(null);

  if (!tutorial) {
    return null;
  }

  // Grid layout positions for each step (as percentages)
  const stepPositions = [
    { x: 0, y: 0, label: 'Top Left' },      // Step 1: Basic shapes
    { x: 50, y: 0, label: 'Top Right' },    // Step 2: Rough sketch
    { x: 0, y: 50, label: 'Bottom Left' },  // Step 3: Line work
    { x: 50, y: 50, label: 'Bottom Right' } // Step 4: Shading (final)
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
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back
        </button>
        <h2 className="text-2xl font-bold text-gray-800">
          Drawing Tutorial: {tutorial.subject}
        </h2>
        <div className="w-20"></div>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep + 1} of {tutorial.steps.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(((currentStep + 1) / tutorial.steps.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / tutorial.steps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Current Step Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-xl mr-4">
            {currentStep + 1}
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-gray-800">
              {tutorial.steps[currentStep].title}
            </h3>
            <p className="text-gray-600 mt-1">
              {tutorial.steps[currentStep].description}
            </p>
          </div>
        </div>
      </div>

      {/* Image Display - Current Step and Final Result */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Current Step */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            Current Step: {tutorial.steps[currentStep].title}
          </h4>
          <div className="relative w-full overflow-hidden rounded-lg border-4 border-primary-500">
            <div
              className="w-full"
              style={{
                paddingBottom: '75%', // Adjust based on actual image aspect ratio (4:3 is common)
                backgroundImage: `url(${tutorial.tutorial_image_url})`,
                backgroundSize: '200% 200%',
                backgroundPosition: `${stepPositions[currentStep].x}% ${stepPositions[currentStep].y}%`,
                backgroundRepeat: 'no-repeat',
              }}
            />
          </div>
        </div>

        {/* Final Result */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            Final Result
          </h4>
          <div className="relative w-full overflow-hidden rounded-lg border-4 border-green-500">
            <div
              className="w-full"
              style={{
                paddingBottom: '75%', // Adjust based on actual image aspect ratio (4:3 is common)
                backgroundImage: `url(${tutorial.tutorial_image_url})`,
                backgroundSize: '200% 200%',
                backgroundPosition: '100% 100%',
                backgroundRepeat: 'no-repeat',
              }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
            currentStep === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Previous Step
        </button>

        <div className="flex space-x-2">
          {tutorial.steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentStep
                  ? 'bg-primary-500 w-8'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentStep === tutorial.steps.length - 1}
          className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
            currentStep === tutorial.steps.length - 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-primary-500 text-white hover:bg-primary-600'
          }`}
        >
          Next Step
          <svg
            className="w-5 h-5 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* All Steps Overview (collapsed) */}
      <details className="bg-white rounded-lg shadow-md p-6 mb-8">
        <summary className="cursor-pointer font-semibold text-gray-800 text-lg">
          View All Steps
        </summary>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {tutorial.steps.map((step, index) => (
            <div
              key={step.step_number}
              className={`bg-gray-50 rounded-lg p-4 cursor-pointer transition-all ${
                index === currentStep ? 'ring-2 ring-primary-500' : 'hover:bg-gray-100'
              }`}
              onClick={() => setCurrentStep(index)}
            >
              <div className="flex items-center mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mr-3 ${
                  index === currentStep ? 'bg-primary-500 text-white' : 'bg-gray-300 text-gray-700'
                }`}>
                  {step.step_number}
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {step.title}
                </h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </details>

      {/* Tutorial Info */}
      <div className="text-center text-sm text-gray-500 mb-6">
        Created on {new Date(tutorial.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Create New Tutorial
        </button>
        <button
          onClick={() => {
            const link = document.createElement('a');
            link.href = tutorial.tutorial_image_url;
            link.download = `tutorial_${tutorial.subject.replace(/\s+/g, '_')}.png`;
            link.click();
          }}
          className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
        >
          Download Full Image
        </button>
      </div>
    </div>
  );
};

export default TutorialDisplay;
