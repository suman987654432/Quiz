import React from 'react';

const QuestionDisplay = ({ question, options, currentIndex, answers, handleAnswer }) => {
  return (
    <>
      <div className="question-text mb-4">
        <h2 className="text-xl font-semibold text-gray-800 whitespace-pre-wrap break-words leading-relaxed">
          {question}
        </h2>
      </div>
      
      <div className="options-grid space-y-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            className={`w-full p-4 text-left rounded-lg border transition-colors duration-200 hover:shadow-sm ${
              answers[currentIndex] === index
                ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500'
                : 'bg-gray-50 border-gray-200 hover:bg-white'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${
                answers[currentIndex] === index
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {String.fromCharCode(65 + index)}
              </div>
              <span className="text-base text-gray-700 whitespace-pre-wrap break-words">
                {option}
              </span>
            </div>
          </button>
        ))}
      </div>
    </>
  );
};

export default QuestionDisplay;
