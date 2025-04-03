import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { nord } from 'react-syntax-highlighter/dist/esm/styles/prism';

const formatText = (text) => {
  if (!text) return text;
  
  const codeBlockRegex = /```([a-zA-Z]*)\n([\s\S]*?)```/g;
  
  if (codeBlockRegex.test(text)) {
    codeBlockRegex.lastIndex = 0;
    
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>{text.substring(lastIndex, match.index)}</span>
        );
      }
      
      const language = match[1] || 'javascript';
      const code = match[2];
      
      parts.push(
        <SyntaxHighlighter 
          key={`code-${match.index}`}
          language={language}
          style={nord}
          className="rounded my-2"
        >
          {code}
        </SyntaxHighlighter>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>
      );
    }
    
    return <div className="formatted-text">{parts}</div>;
  }
  
  const inlineCodeRegex = /`([^`]+)`/g;
  if (inlineCodeRegex.test(text)) {
    inlineCodeRegex.lastIndex = 0;
    
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = inlineCodeRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>{text.substring(lastIndex, match.index)}</span>
        );
      }
      
      parts.push(
        <code 
          key={`inline-${match.index}`}
          className="bg-gray-100 px-1 py-0.5 rounded text-red-600 font-mono text-sm"
        >
          {match[1]}
        </code>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>
      );
    }
    
    return <div className="formatted-text">{parts}</div>;
  }
  
  return text;
};

const ResultDetailsModal = ({ result, onClose }) => {
  if (!result) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Quiz Result Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-lg mb-2">User Information</h3>
            <p><span className="font-medium">Name:</span> {result.user.name}</p>
            <p><span className="font-medium">Email:</span> {result.user.email}</p>
            <p><span className="font-medium">Date:</span> {new Date(result.createdAt).toLocaleString()}</p>
            <p className="mt-2">
              <span className="font-medium">Final Score:</span>{' '}
              <span className="text-lg font-semibold">
                {result.score} / {result.total} ({((result.score / result.total) * 100).toFixed(1)}%)
              </span>
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg mb-2">Question Details</h3>
            {result.answers.map((answer, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border ${
                  answer.correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <p className="font-medium mb-2">
                  Question {index + 1}: {formatText(answer.question)}
                </p>
                <p className={`${answer.correct ? 'text-green-600' : 'text-red-600'}`}>
                  User's Answer: {formatText(answer.userAnswer)}
                </p>
                <p className="text-gray-600">
                  Correct Answer: {formatText(answer.correctAnswer)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t px-6 py-4">
          <button
            onClick={onClose}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultDetailsModal;