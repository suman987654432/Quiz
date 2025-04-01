import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ResultDetailsModal from './ResultDetailsModal';
import { API_URL } from '../../config/config';

const AdminDashboard = () => {
  const [questions, setQuestions] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [activeTab, setActiveTab] = useState('questions'); // 'questions' or 'results'
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    timer: 30
  });
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState('');
  const [selectedResult, setSelectedResult] = useState(null);
  const [quizDuration, setQuizDuration] = useState(30);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [newDuration, setNewDuration] = useState(30);
  const [settings, setSettings] = useState({});
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [sortOrder, setSortOrder] = useState('score_asc'); // Changed to sort by score ascending by default
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
      return;
    }
    fetchQuestions();
    fetchUserResults();
    fetchQuizSettings();
  }, [navigate]);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/questions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/admin');
          return;
        }
        throw new Error('Failed to fetch questions');
      }

      const data = await response.json();
      setQuestions(data);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to fetch questions');
    }
  };



  const fetchUserResults = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('No authentication token found');
        navigate('/admin');
        return;
      }

      const response = await fetch(`${API_URL}/quiz/results`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user results');
      }

      const data = await response.json();
      setUserResults(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to fetch user results');
    }
  };

  const fetchQuizSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/admin');
          return;
        }
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      setSettings(data);
      setQuizDuration(data.duration);
      setIsLive(data.isLive || false); // Set isLive status from server
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to fetch quiz settings');
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('No authentication token found');
        navigate('/admin');
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
        navigate('/admin');
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
      setError('');
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  };

  const toggleLiveStatus = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/quiz/toggle-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isLive: !isLive })
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle quiz status');
      }
      
      const data = await response.json();
      setIsLive(data.isLive);
    } catch (error) {
      console.error('Failed to toggle quiz status:', error);
      setError('Failed to toggle quiz status. Please try again.');
    }
  };

  const handleViewDetails = (result) => {
    setSelectedResult(result);
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
      } else {
        throw new Error('Failed to delete question');
      }
    } catch (error) {
      setError('Failed to delete question');
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
      } else {
        throw new Error('Failed to update question');
      }
    } catch (error) {
      setError('Failed to update question');
      console.error('Error:', error);
    }
  };

  const handleUpdateDuration = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/quiz/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ duration: newDuration })
      });

      if (!response.ok) {
        throw new Error('Failed to update quiz duration');
      }

      setQuizDuration(newDuration);
      setShowDurationModal(false);
      setError('');
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to update quiz duration');
    }
  };

  const handleDeleteResult = async (resultId) => {
    if (!window.confirm('Are you sure you want to delete this result?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/quiz/results/${resultId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete result');
      }

      // Remove the deleted result from the state
      setUserResults(userResults.filter(result => result._id !== resultId));
      setError('');
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to delete result');
    }
  };

  // Add a refresh function
  const refreshData = () => {
    fetchQuestions();
    fetchUserResults();
    fetchQuizSettings();
  };

  // Add delete all results function
  const handleDeleteAllResults = async () => {
    if (!window.confirm('Are you sure you want to delete ALL user results? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/quiz/results/all`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete all results');
      }

      // Clear user results from state
      setUserResults([]);
      setError('');
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to delete all results');
    }
  };

  // Replace the downloadUserResults function with this updated version
  const downloadUserResults = () => {
    if (userResults.length === 0) return;
    
    // Apply the same filtering and sorting as in the UI
    const dataToDownload = filteredResults;
    
    // Create HTML string for the Word document
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Quiz Results</title>
        <style>
          body { font-family: Arial, sans-serif; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background-color: #4f46e5; color: white; font-weight: bold; text-align: left; }
          th, td { padding: 10px; border: 1px solid #e5e7eb; }
          tr:nth-child(even) { background-color: #f3f4f6; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { color: #4f46e5; }
          .percentage { color: #1d4ed8; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Quiz Results Report</h1>
          <p>Generated on ${new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Score</th>
              <th>Percentage</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    // Add table rows for each filtered and sorted result
    dataToDownload.forEach(result => {
      const percentage = ((result.score / result.total) * 100).toFixed(1);
      const formattedDate = new Date(result.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      htmlContent += `
        <tr>
          <td>${result.user.name}</td>
          <td>${result.user.email}</td>
          <td>${result.score}/${result.total}</td>
          <td class="percentage">${percentage}%</td>
          <td>${formattedDate}</td>
        </tr>
      `;
    });
    
    // Close the HTML document
    htmlContent += `
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    // Convert HTML to a Blob
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    
    // Create download link with .doc extension
    const link = document.createElement('a');
    link.href = url;
    link.download = `quiz-results-${new Date().toISOString().slice(0,10)}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Create a filtered and sorted version of userResults
  const filteredResults = userResults.filter(result => {
    // Filter by name
    const nameMatch = searchName === '' || 
      result.user.name.toLowerCase().includes(searchName.toLowerCase());
    
    // Filter by email
    const emailMatch = searchEmail === '' || 
      result.user.email.toLowerCase().includes(searchEmail.toLowerCase());
    
    // Filter by date
    const resultDate = new Date(result.createdAt).toISOString().split('T')[0];
    const dateMatch = searchDate === '' || resultDate === searchDate;
    
    return nameMatch && emailMatch && dateMatch;
  }).sort((a, b) => {
    // Sort by score or date based on sortOrder
    if (sortOrder === 'score_asc') {
      return a.score - b.score; // Ascending score
    } else if (sortOrder === 'score_desc') {
      return b.score - a.score; // Descending score
    } else if (sortOrder === 'asc') {
      return new Date(a.createdAt) - new Date(b.createdAt); // Oldest first
    } else {
      return new Date(b.createdAt) - new Date(a.createdAt); // Newest first
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-indigo-800 mb-4 md:mb-0">Admin Dashboard</h1>
            <div className="flex gap-4">
              {/* Add refresh button */}
              <button
                onClick={refreshData}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Refresh Data
              </button>
              <button
                onClick={() => setShowDurationModal(true)}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors duration-200 flex items-center gap-2 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Set Quiz Duration
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('adminToken');
                  navigate('/admin');
                }}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center gap-2 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4a1 1 0 10-2 0v4.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L14 11.586V7z" clipRule="evenodd" />
                </svg>
                Logout
              </button>
            </div>
          </div>

          {/* Quiz Duration Modal */}
          {showDurationModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-white p-6 rounded-xl w-96 shadow-2xl border border-gray-200">
                <h2 className="text-xl font-bold mb-4 text-indigo-800">Set Quiz Duration</h2>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 font-medium">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDurationModal(false)}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateDuration}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium shadow-sm"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Display current quiz duration */}
          <div className="mb-8 p-5 bg-indigo-50 rounded-xl border border-indigo-100 shadow-sm">
            <h2 className="text-lg font-semibold mb-2 text-indigo-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Quiz Settings
            </h2>
            <p className="text-indigo-700 font-medium">Current Duration: {quizDuration} minutes</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-5 rounded-xl shadow-sm border border-indigo-100">
              <h2 className="text-xl font-semibold mb-4 text-indigo-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                Quiz Settings
              </h2>
              <p className="text-indigo-700 font-medium">Duration: {settings.duration} minutes</p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl shadow-sm border border-indigo-100">
              <h2 className="text-xl font-semibold mb-4 text-indigo-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                Questions
              </h2>
              <p className="text-indigo-700 font-medium">Total Questions: {questions.length}</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex mb-8 border-b">
            <button
              className={`px-6 py-3 mr-4 font-medium transition-colors duration-200 ${activeTab === 'questions' 
                ? 'border-b-2 border-indigo-500 text-indigo-700' 
                : 'text-gray-500 hover:text-indigo-500'}`}
              onClick={() => setActiveTab('questions')}
            >
              Manage Questions
            </button>
            <button
              className={`px-6 py-3 font-medium transition-colors duration-200 ${activeTab === 'results' 
                ? 'border-b-2 border-indigo-500 text-indigo-700' 
                : 'text-gray-500 hover:text-indigo-500'}`}
              onClick={() => setActiveTab('results')}
            >
              User Results
            </button>
          </div>

          {/* Questions Tab */}
          {activeTab === 'questions' && (
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
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...newQuestion.options];
                          newOptions[index] = e.target.value;
                          setNewQuestion({ ...newQuestion, options: newOptions });
                        }}
                        required
                        placeholder={`Option ${index + 1}`}
                      />
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
                            <input
                              key={i}
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...editingQuestion.options];
                                newOptions[i] = e.target.value;
                                setEditingQuestion({
                                  ...editingQuestion,
                                  options: newOptions
                                });
                              }}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
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
                                    {i + 1}. {option}
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
          )}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-indigo-800 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Quiz Results
                </h2>
                <div className="flex space-x-3">
                  {/* Add download button */}
                  {userResults.length > 0 && (
                    <button
                      onClick={downloadUserResults}
                      className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors duration-200 flex items-center gap-2 shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Download as Word
                    </button>
                  )}
                  {userResults.length > 0 && (
                    <button
                      onClick={handleDeleteAllResults}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center gap-2 shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete All Results
                    </button>
                  )}
                </div>
              </div>

              {/* Search and Filter Section */}
              <div className="bg-white p-5 rounded-xl shadow-md mb-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-indigo-700">Search and Filter</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      placeholder="Search by name"
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="text"
                      placeholder="Search by email"
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={searchDate}
                      onChange={(e) => setSearchDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="score_asc">Score (Low to High)</option>
                      <option value="score_desc">Score (High to Low)</option>
                      <option value="desc">Date (Newest First)</option>
                      <option value="asc">Date (Oldest First)</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setSearchName('');
                      setSearchEmail('');
                      setSearchDate('');
                      setSortOrder('score_asc'); // Changed to sort by score ascending
                    }}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    Reset Filters
                  </button>
                </div>
              </div>

              {/* Add no results message */}
              {filteredResults.length === 0 ? (
                <div className="bg-white p-8 rounded-xl text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No Results Found</h3>
                  <p className="text-gray-600">
                    {userResults.length > 0 
                      ? "No matches found for your search criteria." 
                      : "There are no quiz results to display yet."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
                  <table className="min-w-full bg-white">
                    <thead className="bg-indigo-50 text-indigo-800">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider border-b">
                          User
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider border-b">
                          Score
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider border-b">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider border-b">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredResults.map((result, index) => (
                        <tr key={index} className="hover:bg-indigo-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{result.user.name}</div>
                            <div className="text-sm text-gray-500">{result.user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              {result.score} / {result.total}
                              <span className="ml-2 px-2 py-1 rounded-full bg-blue-200 text-xs">
                                {((result.score / result.total) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(result.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleViewDetails(result)}
                                className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 p-2 rounded-full transition-colors flex items-center"
                                title="View details"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteResult(result._id)}
                                className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-full transition-colors flex items-center"
                                title="Delete result"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Result Details Modal */}
      {selectedResult && (
        <ResultDetailsModal
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;