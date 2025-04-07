import React from 'react';

const QuizControls = ({ currentQuestion, questionsLength, handlePreviousQuestion, handleNextQuestion, handleSubmit, isQuizLive, isSubmitting }) => {
  return (
    <div className="flex justify-between">
      <button
        onClick={handlePreviousQuestion}
        className={`px-4 py-2 rounded-lg flex items-center ${
          currentQuestion === 0
            ? 'text-gray-400 cursor-not-allowed'
            : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50'
        }`}
        disabled={currentQuestion === 0}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Previous
      </button>
      
      {currentQuestion === questionsLength - 1 ? (
        <button
          onClick={handleSubmit}
          disabled={!isQuizLive || isSubmitting}
          className={`${
            isQuizLive 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-gray-400 cursor-not-allowed'
          } text-white px-6 py-2 rounded-lg flex items-center ${isSubmitting ? 'cursor-not-allowed opacity-50' : ''}`}
          title={!isQuizLive ? "Quiz must be activated by the admin before submission" : ""}
        >
          Submit Quiz
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      ) : (
        <button
          onClick={handleNextQuestion}
          disabled={!isQuizLive}
          className={`${
            isQuizLive 
              ? 'bg-indigo-600 hover:bg-indigo-700' 
              : 'bg-gray-400 cursor-not-allowed'
          } text-white px-6 py-2 rounded-lg flex items-center`}
          title={!isQuizLive ? "Quiz must be activated by the admin before proceeding" : ""}
        >
          Next Question
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default QuizControls;
