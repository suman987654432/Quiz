import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ResultDetailsModal from './ResultDetailsModal';
import QuestionManager from './QuestionManager';
import ResultsManager from './ResultsManager';
import QuizSettings from './QuizSettings';
import { API_URL } from '../../config/config';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminDashboard = () => {
  const [questions, setQuestions] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [activeTab, setActiveTab] = useState('questions'); // 'questions' or 'results'
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState('');
  const [selectedResult, setSelectedResult] = useState(null);
  const [quizDuration, setQuizDuration] = useState(30);
  const [settings, setSettings] = useState({});
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
      toast.success(data.isLive ? 'Quiz activated!' : 'Quiz deactivated!');
    } catch (error) {
      console.error('Failed to toggle quiz status:', error);
      toast.error('Failed to toggle quiz status. Please try again.');
    }
  };

  // Refresh all data
  const refreshData = () => {
    fetchQuestions();
    fetchUserResults();
    fetchQuizSettings();
    toast.info('Data refreshed!');
  };

  const handleViewResultDetails = (result) => {
    setSelectedResult(result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-indigo-800 mb-4 md:mb-0">Admin Dashboard</h1>
            <div className="flex gap-4">
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

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Quiz Settings */}
          <QuizSettings 
            settings={settings} 
            quizDuration={quizDuration} 
            setQuizDuration={setQuizDuration}
          />

          {/* Tab Navigation */}
          <div className="flex flex-wrap mb-8 border-b">
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
            <QuestionManager 
              questions={questions} 
              setQuestions={setQuestions}
              isLive={isLive}
              toggleLiveStatus={toggleLiveStatus}
            />
          )}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <ResultsManager
              userResults={userResults}
              setUserResults={setUserResults}
              onViewDetails={handleViewResultDetails}
            />
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