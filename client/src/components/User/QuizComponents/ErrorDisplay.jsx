import React from 'react';

const ErrorDisplay = ({ error, handleSubmit, handleLogout }) => {
  return (
    <div className="page-container">
      <div className="card p-8 max-w-md w-full animate-fadeIn">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-4">Error Loading Quiz</h2>
        <p className="text-gray-700 mb-6 text-center">{error}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSubmit}
            className="btn-primary flex-1"
          >
            Submit Anyway
          </button>
          <button
            onClick={handleLogout}
            className="btn-neutral flex-1"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
