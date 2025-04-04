import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/config';
import { toast } from 'react-toastify';

const QuizInterface = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isQuizLive, setIsQuizLive] = useState(false);
  const [totalDuration, setTotalDuration] = useState(null);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userName = localStorage.getItem('userName');
    if (!userName) {
      navigate('/');
      return;
    }
    
    // Load saved answers if they exist
    const savedAnswers = localStorage.getItem('quizAnswers');
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
    
    // Load saved current question if it exists
    const savedCurrentQuestion = localStorage.getItem('currentQuestion');
    if (savedCurrentQuestion) {
      setCurrentQuestion(parseInt(savedCurrentQuestion, 10));
    }
    
    fetchQuestions();
    fetchQuizStatus();
  }, [navigate]);

  // Check if timer was already started in a previous session
  useEffect(() => {
    const timerStarted = localStorage.getItem('timerStarted') === 'true';
    const timerStartTime = localStorage.getItem('timerStartTime');
    const savedTotalDuration = localStorage.getItem('totalDuration');
    
    if (timerStarted && timerStartTime && savedTotalDuration && timeLeft !== null) {
      // Calculate elapsed time since timer started
      const startTime = parseInt(timerStartTime, 10);
      const totalDurationSeconds = parseInt(savedTotalDuration, 10);
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - startTime) / 1000);
      
      // Calculate remaining time
      const remainingTime = Math.max(0, totalDurationSeconds - elapsedSeconds);
      
      // Set timer state
      setTimeLeft(remainingTime);
      setIsTimerRunning(true);
      setTotalDuration(totalDurationSeconds);
    }
  }, [timeLeft]);

  const fetchQuizStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/quiz/status`);
      if (response.ok) {
        const data = await response.json();
        setIsQuizLive(data.isLive);
      }
    } catch (error) {
      console.error('Error fetching quiz status:', error);
    }
  };

  useEffect(() => {
    const fetchQuizDuration = async () => {
      try {
        const response = await fetch(`${API_URL}/quiz/duration`);
        if (response.ok) {
          const data = await response.json();
          const durationInSeconds = data.duration * 60;
          setTimeLeft(durationInSeconds);
          setTotalDuration(durationInSeconds);
          
          // Store total duration in localStorage
          localStorage.setItem('totalDuration', durationInSeconds.toString());
        } else {
          throw new Error('Failed to fetch quiz duration');
        }
      } catch (error) {
        console.error('Error fetching quiz duration:', error);
        // Default to 30 minutes if fetch fails
        const defaultDuration = 30 * 60;
        setTimeLeft(defaultDuration);
        setTotalDuration(defaultDuration);
        localStorage.setItem('totalDuration', defaultDuration.toString());
      }
    };

    fetchQuizDuration();
  }, []);

  // Timer effect - only start when timeLeft is set, questions are loaded, and timer is running
  useEffect(() => {
    if (timeLeft === null || questions.length === 0 || !isTimerRunning) return;

    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft, questions, isTimerRunning]);

  // Save current question to localStorage when it changes
  useEffect(() => {
    if (currentQuestion !== undefined) {
      localStorage.setItem('currentQuestion', currentQuestion.toString());
    }
  }, [currentQuestion]);

  // Save answers to localStorage when they change
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem('quizAnswers', JSON.stringify(answers));
    }
  }, [answers]);

  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${API_URL}/quiz/active`);

      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      const data = await response.json();
      if (data.length === 0) {
        throw new Error('No questions available');
      }
      setQuestions(data);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to fetch questions: ' + err.message);
    }
  };

  const handleAnswer = (answerIndex) => {
    // Start the timer when the user clicks on an option, but only if the quiz is live
    // and the timer hasn't already started
    if (!isTimerRunning && isQuizLive) {
      setIsTimerRunning(true);
      
      // Save timer state to localStorage
      localStorage.setItem('timerStarted', 'true');
      localStorage.setItem('timerStartTime', Date.now().toString());
      
      toast.info("Timer has started! Good luck!");
    }

    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: answerIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleLogout = () => {
    // Clear all quiz-related localStorage items
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('timerStarted');
    localStorage.removeItem('timerStartTime');
    localStorage.removeItem('totalDuration');
    localStorage.removeItem('quizAnswers');
    localStorage.removeItem('currentQuestion');
    
    navigate('/');
  };

  const handleSubmit = async () => {
    try {
      // Don't allow submission if the quiz is not live
      if (!isQuizLive) {
        toast.error("Cannot submit quiz - the quiz has not been activated by the administrator.");
        return;
      }

      // Convert answers object to array
      const answersArray = Array.from(
        { length: questions.length },
        (_, i) => answers[i] !== undefined ? answers[i] : null
      );

      const response = await fetch(`${API_URL}/quiz/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          answers: answersArray,
          userName: localStorage.getItem('userName'),
          userEmail: localStorage.getItem('userEmail')
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403 && data.quizActive === false) {
          toast.error("The quiz has not been activated by the administrator. Your answers cannot be submitted at this time.");
          return;
        }
        throw new Error(data.message || 'Failed to submit quiz');
      }

      // Clear quiz state from localStorage upon successful submission
      localStorage.removeItem('timerStarted');
      localStorage.removeItem('timerStartTime');
      localStorage.removeItem('totalDuration');
      localStorage.removeItem('quizAnswers');
      localStorage.removeItem('currentQuestion');

      navigate('/results', { state: { result: data } });
    } catch (err) {
      console.error('Submit error:', err);
      toast.error("There was a problem submitting your quiz: " + err.message);
    }
  };

  // Get time left color
  const getTimeLeftColor = () => {
    if (timeLeft === null) return 'text-gray-700';
    if (timeLeft > 300) return 'text-green-600'; // > 5 minutes
    if (timeLeft > 60) return 'text-yellow-600'; // > 1 minute
    return 'text-red-600'; // < 1 minute
  };

  // Add a timer status display
  const getTimerStatus = () => {
    if (!isQuizLive) {
      return <span className="text-red-600">Quiz not activated by admin</span>;
    }
    
    if (!isTimerRunning) {
      return <span className="text-amber-600">Click any option to start the timer</span>;
    }
    
    return <span className={getTimeLeftColor()}>{formatTime(timeLeft)}</span>;
  };

  if (error) {
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
  }

  if (questions.length === 0 || timeLeft === null) {
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="card p-6 mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-indigo-800">Quiz Master</h2>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm1 2h10v10H4V5zm7 3a1 1 0 10-2 0v4a1 1 0 102 0V8z" clipRule="evenodd" />
              </svg>
              Logout
            </button>
          </div>
          
          <div className="bg-indigo-100 rounded-lg p-4 flex justify-between items-center">
            <div className="flex items-center">
              <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm">
                {currentQuestion + 1}
              </span>
              <span className="ml-2 text-indigo-800 font-medium">Question {currentQuestion + 1} of {questions.length}</span>
            </div>
            <div className={`font-bold text-xl`}>
              {getTimerStatus()}
            </div>
          </div>
          
          {!isQuizLive && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
              The quiz has not been activated by the administrator yet. You can view questions, but the timer won't start.
            </div>
          )}
          
          {isQuizLive && !isTimerRunning && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-700">
              Click on any answer option to start the quiz timer.
            </div>
          )}
        </div>
        
        <div className="question-section mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="question-text mb-4">
              <h2 className="text-xl font-semibold text-gray-800 whitespace-pre-wrap break-words leading-relaxed">
                {questions[currentQuestion].question}
              </h2>
            </div>
            
            <div className="options-grid space-y-3">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={`w-full p-4 text-left rounded-lg border transition-colors duration-200 hover:shadow-sm ${
                    answers[currentQuestion] === index
                      ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500'
                      : 'bg-gray-50 border-gray-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${
                      answers[currentQuestion] === index
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
          </div>
        </div>
        
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
          
          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={!isQuizLive}
              className={`${
                isQuizLive 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gray-400 cursor-not-allowed'
              } text-white px-6 py-2 rounded-lg flex items-center`}
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg flex items-center"
            >
              Next Question
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="w-full bg-white rounded-full h-2 overflow-hidden">
          <div
            className="bg-indigo-600 h-2 transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default QuizInterface;