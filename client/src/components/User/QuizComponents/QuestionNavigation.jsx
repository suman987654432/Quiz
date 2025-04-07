import React from 'react';

const QuestionNavigation = ({ questions, currentQuestion, setCurrentQuestion, answers }) => {
  return (
    <div className="question-nav mb-6 flex flex-wrap gap-2">
      {questions.map((_, index) => (
        <button
          key={index}
          onClick={() => setCurrentQuestion(index)}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200 
            ${currentQuestion === index 
              ? 'bg-indigo-600 text-white' 
              : answers[index] !== undefined 
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' 
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'}`}
        >
          {index + 1}
        </button>
      ))}
    </div>
  );
};

export default QuestionNavigation;
