import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const StartPage = () => {
  const navigate = useNavigate();

 
  useEffect(() => {
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    if (!userName || !userEmail) {
      navigate('/');
    }
  }, [navigate]);

  const handleStartQuiz = () => {
 
    localStorage.setItem('timerStarted', 'true');
    localStorage.setItem('timerStartTime', Date.now().toString());
    
    navigate('/quiz');
  };

  const userName = localStorage.getItem('userName') || 'User';

  return (
    <div className="page-container">
      <div className="max-w-md w-full animate-fadeIn">
        <div className="card p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-indigo-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold mb-2 text-gray-800">Welcome, {userName}!</h2>
          <p className="mb-8 text-gray-600">You're about to start the quiz. Make sure you're ready before proceeding.</p>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-left">
              <h3 className="font-semibold text-blue-800 mb-2">Quiz Instructions:</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Read each question carefully before answering</li>
                <li>• Don't change tabs or the test will be automatically submitted</li>
                <li className="text-red-600 font-medium">• Changing tabs once will trigger a warning, changing tabs twice will automatically submit your quiz</li>
                <li>• The quiz will begin when the admin starts it, then you can answer questions</li>
                <li>• Make sure you have a stable internet connection</li>
              </ul>
            </div>

            <button
              onClick={handleStartQuiz}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-lg"
            >
              Start Quiz
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartPage;
