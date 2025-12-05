import React from 'react';

const TutorialDisplay = ({ tutorial, onBack }) => {
  if (!tutorial) {
    return null;
  }

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
        <div className="w-20"></div> {/* Spacer for centering */}
      </div>

      {/* Main Tutorial Image */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <img
          src={tutorial.tutorial_image_url}
          alt="Drawing tutorial"
          className="w-full h-auto rounded-lg"
        />
      </div>

      {/* Step Descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tutorial.steps.map((step) => (
          <div
            key={step.step_number}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                {step.step_number}
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                {step.title}
              </h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>

      {/* Tutorial Info */}
      <div className="mt-8 text-center text-sm text-gray-500">
        Created on {new Date(tutorial.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-center space-x-4">
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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
          className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Download Image
        </button>
      </div>
    </div>
  );
};

export default TutorialDisplay;