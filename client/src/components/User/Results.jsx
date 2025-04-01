import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { API_URL } from '../../config/config';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  useEffect(() => {
    // Log out user when results page is shown
    const logoutUser = async () => {
      const email = localStorage.getItem('userEmail');
      const offlineMode = localStorage.getItem('offlineMode');
      
      // Skip server logout if in offline mode
      if (email && !offlineMode) {
        try {
          await fetch(`${API_URL}/user/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email
            })
          });
          console.log('User logged out from server');
        } catch (error) {
          console.error('Failed to logout from server:', error);
        }
      }
    };
    
    logoutUser();
  }, []);

  const handleLogout = () => {
    // Clear user data
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('offlineMode');
    // Navigate to home/login page
    navigate('/');
  };

  return (
    <div className="page-container">
      <div className="max-w-md w-full animate-fadeIn">
        <div className="card p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Quiz Completed!</h1>
          <p className="text-gray-600 mb-8">Thank you for completing the quiz! Your responses have been submitted successfully.</p>
          
          <button
            onClick={handleLogout}
            className="btn-primary w-full py-3"
          >
            Back to Home
          </button>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>Your session has been ended for security reasons.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;