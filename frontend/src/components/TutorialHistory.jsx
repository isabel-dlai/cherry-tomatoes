import React, { useState, useEffect } from 'react';

const TUTORIALS_PER_PAGE = 20;

const TutorialHistory = ({ onSelectTutorial }) => {
  const [tutorials, setTutorials] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);

  useEffect(() => {
    loadTutorials();
  }, []);

  useEffect(() => {
    // Close menu when clicking outside
    const handleClickOutside = () => {
      if (openMenuIndex !== null) {
        setOpenMenuIndex(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuIndex]);

  const loadTutorials = () => {
    try {
      const storedTutorials = JSON.parse(localStorage.getItem('tutorials') || '[]');
      setTutorials(storedTutorials);
    } catch (err) {
      console.error('Error loading tutorials from localStorage:', err);
      setTutorials([]);
    }
  };

  const handleDelete = (index, e) => {
    e.stopPropagation(); // Prevent card click
    if (window.confirm('Are you sure you want to delete this tutorial?')) {
      try {
        const storedTutorials = JSON.parse(localStorage.getItem('tutorials') || '[]');
        storedTutorials.splice(index, 1);
        localStorage.setItem('tutorials', JSON.stringify(storedTutorials));
        setTutorials(storedTutorials);
        setOpenMenuIndex(null);

        // Adjust page if we deleted the last item on a page
        const newTotalPages = Math.ceil(storedTutorials.length / TUTORIALS_PER_PAGE);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
      } catch (err) {
        console.error('Error deleting tutorial:', err);
        alert('Failed to delete tutorial');
      }
    }
  };

  const toggleMenu = (index, e) => {
    e.stopPropagation(); // Prevent card click
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  // Calculate pagination
  const totalPages = Math.ceil(tutorials.length / TUTORIALS_PER_PAGE);
  const startIndex = (currentPage - 1) * TUTORIALS_PER_PAGE;
  const endIndex = startIndex + TUTORIALS_PER_PAGE;
  const currentTutorials = tutorials.slice(startIndex, endIndex);

  const handleTutorialClick = (tutorial) => {
    onSelectTutorial(tutorial);
  };

  if (tutorials.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-gray-500 text-lg mb-2">No tutorials yet</p>
        <p className="text-gray-400">Create your first tutorial to get started!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Tutorials</h2>

      {/* Tutorial Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentTutorials.map((tutorial, index) => {
          const absoluteIndex = startIndex + index;
          return (
            <div
              key={absoluteIndex}
              onClick={() => handleTutorialClick(tutorial)}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-transform hover:scale-105 relative"
            >
              {/* Kebab Menu */}
              <div className="absolute top-2 right-2 z-10">
                <button
                  onClick={(e) => toggleMenu(absoluteIndex, e)}
                  className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 16 16">
                    <circle cx="8" cy="2" r="1.5" />
                    <circle cx="8" cy="8" r="1.5" />
                    <circle cx="8" cy="14" r="1.5" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {openMenuIndex === absoluteIndex && (
                  <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px]">
                    <button
                      onClick={(e) => handleDelete(absoluteIndex, e)}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Preview showing final quadrant (bottom-right) of the tutorial */}
              <div className="relative overflow-hidden bg-gray-100" style={{ aspectRatio: '4 / 3' }}>
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url(${tutorial.tutorial_image_url})`,
                    backgroundSize: '200% 200%',
                    backgroundPosition: '100% 100%', // Bottom-right quadrant (final result)
                    backgroundRepeat: 'no-repeat',
                  }}
                />
              </div>

              {/* Tutorial Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-1 truncate">
                  {tutorial.subject}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(tutorial.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg ${
              currentPage === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            Previous
          </button>

          {/* Page numbers */}
          <div className="flex space-x-1">
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 rounded-lg ${
                    currentPage === pageNum
                      ? 'bg-primary-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg ${
              currentPage === totalPages
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* Tutorial count */}
      <div className="mt-4 text-center text-sm text-gray-500">
        Showing {startIndex + 1}-{Math.min(endIndex, tutorials.length)} of {tutorials.length} tutorials
      </div>
    </div>
  );
};

export default TutorialHistory;
