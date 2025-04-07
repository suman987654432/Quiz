import React from 'react';

const ProgressBar = ({ currentQuestion, totalQuestions }) => {
  return (
    <div className="w-full bg-white rounded-full h-2 overflow-hidden">
      <div
        className="bg-indigo-600 h-2 transition-all duration-300"
        style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
