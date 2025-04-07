import React from 'react';

const LoadingDisplay = () => {
  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-indigo-50 to-blue-50">
      <div className="text-center">
        <div className="mb-4">
          <div className="w-16 h-16 border-t-4 border-b-4 border-indigo-500 rounded-full animate-spin mx-auto"></div>
        </div>
        <p className="text-indigo-800 font-medium">Loading quiz questions...</p>
      </div>
    </div>
  );
};

export default LoadingDisplay;
