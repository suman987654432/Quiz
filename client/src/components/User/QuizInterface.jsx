import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/config';
import { toast } from 'react-toastify';

// Import components
import QuestionNavigation from './QuizComponents/QuestionNavigation';
import QuestionDisplay from './QuizComponents/QuestionDisplay';
import TimerDisplay from './QuizComponents/TimerDisplay';
import QuizControls from './QuizComponents/QuizControls';
import ProgressBar from './QuizComponents/ProgressBar';
import ErrorDisplay from './QuizComponents/ErrorDisplay';
import LoadingDisplay from './QuizComponents/LoadingDisplay';

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
  const [tabChangeCount, setTabChangeCount] = useState(0);
  const tabChangeCountRef = useRef(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const userName = localStorage.getItem('userName');
    if (!userName) {
      navigate('/');
      return;
    }
    
    const savedAnswers = localStorage.getItem('quizAnswers');
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }

    const savedCurrentQuestion = localStorage.getItem('currentQuestion');
    if (savedCurrentQuestion) {
      setCurrentQuestion(parseInt(savedCurrentQuestion, 10));
    }
    
    fetchQuestions();
    fetchQuizStatus();
  }, [navigate]);


  useEffect(() => {
    const timerStarted = localStorage.getItem('timerStarted') === 'true';
    const timerStartTime = localStorage.getItem('timerStartTime');
    const savedTotalDuration = localStorage.getItem('totalDuration');
    
    if (timerStarted && timerStartTime && savedTotalDuration && timeLeft !== null) {

      const startTime = parseInt(timerStartTime, 10);
      const totalDurationSeconds = parseInt(savedTotalDuration, 10);
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - startTime) / 1000);

      const remainingTime = Math.max(0, totalDurationSeconds - elapsedSeconds);
      
      
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
      
          localStorage.setItem('totalDuration', durationInSeconds.toString());
        } else {
          throw new Error('Failed to fetch quiz duration');
        }
      } catch (error) {
        console.error('Error fetching quiz duration:', error);
     
        const defaultDuration = 30 * 60;
        setTimeLeft(defaultDuration);
        setTotalDuration(defaultDuration);
        localStorage.setItem('totalDuration', defaultDuration.toString());
      }
    };

    fetchQuizDuration();
  }, []);

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


  useEffect(() => {
    if (currentQuestion !== undefined) {
      localStorage.setItem('currentQuestion', currentQuestion.toString());
    }
  }, [currentQuestion]);

 
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem('quizAnswers', JSON.stringify(answers));
    }
  }, [answers]);

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
    if (!isTimerRunning && isQuizLive) {
      setIsTimerRunning(true);
      localStorage.setItem('timerStarted', 'true');
      localStorage.setItem('timerStartTime', Date.now().toString());
    }
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: answerIndex
    }));
  };

  const handleNextQuestion = () => {
    if (isQuizLive && currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else if (!isQuizLive) {
      toast.warn("Please wait for the admin to activate the quiz before proceeding.");
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleLogout = () => {
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
    if (isSubmitting) return; // Prevent multiple submissions
    setIsSubmitting(true);

    try {
      if (!isQuizLive) {
        toast.error("Cannot submit quiz - the quiz has not been activated by the administrator.");
        return;
      }

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
          userEmail: localStorage.getItem('userEmail'),
          tabChanges: tabChangeCount 
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

      localStorage.removeItem('timerStarted');
      localStorage.removeItem('timerStartTime');
      localStorage.removeItem('totalDuration');
      localStorage.removeItem('quizAnswers');
      localStorage.removeItem('currentQuestion');

      navigate('/results', { state: { result: data } });
    } catch (err) {
      console.error('Submit error:', err);
      toast.error("There was a problem submitting your quiz: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isTimerRunning) { 
        tabChangeCountRef.current += 1;
        setTabChangeCount(prev => prev + 1);
        
        if (tabChangeCountRef.current === 1) {
          toast.error("Warning: Changing tabs is not allowed! Your quiz will be automatically submitted if you change tabs again.", {
            autoClose: 5000
          });
        } else {
          toast.error("Quiz submitted automatically - tab was changed multiple times!");
          handleSubmit();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isTimerRunning]);

  if (error) {
    return <ErrorDisplay error={error} handleSubmit={handleSubmit} handleLogout={handleLogout} />;
  }

  if (questions.length === 0 || timeLeft === null) {
    return <LoadingDisplay />;
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
            <TimerDisplay 
              timeLeft={timeLeft} 
              isQuizLive={isQuizLive} 
              isTimerRunning={isTimerRunning}
            />
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
            <QuestionNavigation 
              questions={questions} 
              currentQuestion={currentQuestion} 
              setCurrentQuestion={setCurrentQuestion}
              answers={answers}
            />
            
            <QuestionDisplay 
              question={questions[currentQuestion].question}
              options={questions[currentQuestion].options}
              currentIndex={currentQuestion}
              answers={answers}
              handleAnswer={handleAnswer}
            />
          </div>
        </div>
        
        <QuizControls 
          currentQuestion={currentQuestion}
          questionsLength={questions.length}
          handlePreviousQuestion={handlePreviousQuestion}
          handleNextQuestion={handleNextQuestion}
          handleSubmit={handleSubmit}
          isQuizLive={isQuizLive}
          isSubmitting={isSubmitting}
        />
        
        <ProgressBar 
          currentQuestion={currentQuestion} 
          totalQuestions={questions.length} 
        />
      </div>
    </div>
  );
};

export default QuizInterface;