import { useState } from 'react';
import { API_URL } from '../../config/config';
import { toast } from 'react-toastify';

const QuestionManager = ({ questions, setQuestions, isLive, toggleLiveStatus }) => {
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    timer: 30
  });

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('No authentication token found');
        return;
      }

      const response = await fetch(`${API_URL}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          question: newQuestion.question,
          options: newQuestion.options,
          correctAnswer: parseInt(newQuestion.correctAnswer),
          timer: parseInt(newQuestion.timer)
        })
      });

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin';
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add question');
      }

      const data = await response.json();
      setQuestions([...questions, data]);
      setNewQuestion({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        timer: 30
      });
      toast.success('Question added successfully!');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setQuestions(questions.filter(q => q._id !== questionId));
        toast.success('Question deleted successfully');
      } else {
        throw new Error('Failed to delete question');
      }
    } catch (error) {
      toast.error('Failed to delete question');
      console.error('Error:', error);
    }
  };

  const handleEditQuestion = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/questions/${editingQuestion._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingQuestion)
      });

      if (response.ok) {
        const updatedQuestion = await response.json();
        setQuestions(questions.map(q =>
          q._id === editingQuestion._id ? updatedQuestion : q
        ));
        setEditingQuestion(null);
        toast.success('Question updated successfully');
      } else {
        throw new Error('Failed to update question');
      }
    } catch (error) {
      toast.error('Failed to update question');
      console.error('Error:', error);
    }
  };

  // const handleDeleteAllQuestions = async () => {
  //   if (!window.confirm('Are you sure you want to delete ALL questions? This action cannot be undone.')) {
  //     return;
  //   }

  //   try {
  //     const token = localStorage.getItem('adminToken');
  //     const response = await fetch(`${API_URL}/questions/all`, {
  //       method: 'DELETE',
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'application/json'
  //       }
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       setQuestions([]);
  //       toast.success(`All questions deleted successfully (${data.count || 0} questions removed)`);
  //     } else {
  //       throw new Error('Failed to delete all questions');
  //     }
  //   } catch (error) {
  //     toast.error('Failed to delete all questions');
  //     console.error('Error:', error);
  //   }
  // };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-indigo-800">Quiz Control</h2>
        <button
          onClick={toggleLiveStatus}
          className={`px-6 py-3 rounded-lg text-white font-medium transition-colors duration-200 shadow-sm flex items-center gap-2 ${isLive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
        >
          {isLive ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
              Stop Quiz
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Start Quiz
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleQuestionSubmit} className="mb-8 bg-white p-6 rounded-xl border border-gray-200 shadow-md">
        <h3 className="text-xl font-bold mb-4 text-indigo-800">Add New Question</h3>
        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700">Question</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            value={newQuestion.question}
            onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
            required
            placeholder="Enter your question here"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {newQuestion.options.map((option, index) => (
            <div key={index} className="mb-4">
              <label className="block mb-2 font-medium text-gray-700">Option {index + 1}</label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 whitespace-pre-wrap"
                value={option}
                onChange={(e) => {
                  const newOptions = [...newQuestion.options];
                  newOptions[index] = e.target.value;
                  setNewQuestion({ ...newQuestion, options: newOptions });
                }}
                required
                placeholder={`Option ${index + 1}`}
                rows={3}
              ></textarea>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700">Correct Answer (1-4)</label>
          <input
            type="number"
            min="1"
            max="4"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            value={newQuestion.correctAnswer}
            onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: parseInt(e.target.value) })}
            required
          />
        </div>

        <button
          type="submit"
          className="bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition-colors duration-200 font-medium shadow-sm flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Question
        </button>
      </form>

      {/* Questions List */}
      <div>
        <h3 className="text-xl font-bold mb-4 text-indigo-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
          </svg>
          Questions List
        </h3>
        
        {questions.length > 0 && (
          <div className="mb-4 flex justify-end">
            {/* <button
              onClick={handleDeleteAllQuestions}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium shadow-sm flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Delete All Questions
            </button> */}
          </div>
        )}
        
        <div className="space-y-4">
          {questions.map((q, index) => (
            <div key={q._id} className="bg-white p-5 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              {editingQuestion?._id === q._id ? (
                <form onSubmit={handleEditQuestion} className="space-y-4">
                  <input
                    type="text"
                    value={editingQuestion.question}
                    onChange={(e) => setEditingQuestion({
                      ...editingQuestion,
                      question: e.target.value
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {editingQuestion.options.map((option, i) => (
                    <textarea
                      key={i}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...editingQuestion.options];
                        newOptions[i] = e.target.value;
                        setEditingQuestion({
                          ...editingQuestion,
                          options: newOptions
                        });
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 whitespace-pre-wrap"
                      rows={3}
                    ></textarea>
                  ))}
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium shadow-sm flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 101.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingQuestion(null)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium shadow-sm flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-800 text-lg mb-2">
                        <span className="text-indigo-600 mr-2">Q{index + 1}.</span> 
                        {q.question}
                      </p>
                      <ul className="ml-4 mt-3 space-y-2">
                        {q.options.map((option, i) => (
                          <li
                            key={i}
                            className={`p-2 rounded-lg ${i === q.correctAnswer - 1 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-gray-50 text-gray-700 border border-gray-100'}`}
                          >
                            <span className="font-medium">{i + 1}.</span>{" "}
                            <pre className="whitespace-pre-wrap inline">{option}</pre>
                            {i === q.correctAnswer - 1 && (
                              <span className="ml-2 text-green-600 font-medium">✓ Correct</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingQuestion(q)}
                        className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 transition-colors"
                        title="Edit question"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q._id)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                        title="Delete question"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionManager;
