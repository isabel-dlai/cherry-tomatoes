import React, { useState, useEffect } from 'react';
import { tutorialAPI } from '../services/api';

const TutorialHistory = ({ onSelectTutorial }) => {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTutorials();
  }, [page]);

  const fetchTutorials = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tutorialAPI.getTutorials(page, 12);
      setTutorials(response.tutorials);
      setTotalPages(response.pages);
    } catch (err) {
      setError('Failed to load tutorials');
      console.error('Error fetching tutorials:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTutorialClick = async (tutorialId) => {
    try {
      const tutorial = await tutorialAPI.getTutorial(tutorialId);
      onSelectTutorial(tutorial);
    } catch (err) {
      console.error('Error fetching tutorial:', err);
      alert('Failed to load tutorial');
    }
  };

  if (loading && tutorials.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchTutorials}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
        >
          Retry
        </button>
      </div>
    );
  }

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
        {tutorials.map((tutorial) => (
          <div
            key={tutorial.tutorial_id}
            onClick={() => handleTutorialClick(tutorial.tutorial_id)}
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-transform hover:scale-105"
          >
            <div className="aspect-square bg-gray-100 relative">
              <img
                src={tutorial.thumbnail_url}
                alt={tutorial.subject}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder.png'; // Fallback image
                }}
              />
            </div>
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
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center space-x-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className={`px-4 py-2 rounded-lg ${
              page === 1
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
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-2 rounded-lg ${
                    page === pageNum
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
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-lg ${
              page === totalPages
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default TutorialHistory;