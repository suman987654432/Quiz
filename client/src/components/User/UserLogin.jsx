import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/config';

const UserLogin = () => {
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    subject: 'General'
  });
  const [nameError, setNameError] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking');
  const nameRegex = /^[A-Za-z\s]+$/;
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('offlineMode');
    localStorage.removeItem('timerStarted');
    localStorage.removeItem('timerStartTime');
    localStorage.removeItem('totalDuration');
    localStorage.removeItem('quizAnswers');
    localStorage.removeItem('currentQuestion');

    checkServerStatus();
  }, [navigate]);

  const checkServerStatus = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_URL}/quiz/duration`, {
        signal: controller.signal
      }).catch(err => {
        if (err.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw err;
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        try {
          const data = await response.json();
          setServerStatus('online');
          console.log('Server is online and functioning properly');
        } catch (error) {
          console.error('Server returned invalid data:', error);
          setServerStatus('degraded');
          console.log('Server is online but may have issues');
        }
      } else {
        setServerStatus('offline');
        console.log('Server returned error code:', response.status);
      }
    } catch (error) {
      console.error('Server connectivity check failed:', error);
      setServerStatus('offline');
    }
  };

  const handleNameChange = (e) => {
    const value = e.target.value;

    if (!value.trim()) {
      setNameError('');
    } else if (!nameRegex.test(value)) {
      setNameError('Only alphabetic characters (A-Z, a-z) are allowed');
    } else {
      setNameError('');
    }

    setUserDetails({ ...userDetails, name: value });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!userDetails.name.trim()) {
      setNameError('Name is required');
      setIsSubmitting(false);
      return;
    }

    if (!nameRegex.test(userDetails.name)) {
      setNameError('Only alphabetic characters (A-Z, a-z) are allowed');
      setIsSubmitting(false);
      return;
    }

    if (!userDetails.email.trim()) {
      setError('Email is required');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);

    if (!userDetails.name.trim() || !userDetails.email.trim()) {
      setError('Name and email are required');
      setIsSubmitting(false);
      return;
    }

    if (serverStatus === 'offline' || serverStatus === 'degraded') {
      console.log(`Server is ${serverStatus}. Proceeding with local-only mode`);
      localStorage.setItem('userName', userDetails.name.trim());
      localStorage.setItem('userEmail', userDetails.email.trim());
      localStorage.setItem('userSubject', userDetails.subject);
      localStorage.setItem('offlineMode', 'true');
      navigate('/start');
      return;
    }

    try {
      console.log('Attempting to login with:', userDetails);

      let response;
      let retryCount = 0;
      const maxRetries = 2;

      while (retryCount <= maxRetries) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          response = await fetch(`${API_URL}/user/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: userDetails.name.trim(),
              email: userDetails.email.trim(),
              subject: 'General'
            }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);
          break;
        } catch (fetchError) {
          retryCount++;
          if (retryCount > maxRetries || fetchError.name !== 'AbortError') {
            throw fetchError;
          }
          console.log(`Request timed out, retry attempt ${retryCount}/${maxRetries}`);
          await new Promise(r => setTimeout(r, 1000));
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));

        if (response.status === 403 && errorData.alreadyLoggedIn) {
          setError('This email is already logged in and taking the quiz. Please use a different email or try again later.');
          setIsSubmitting(false);
          return;
        }

        if (response.status === 500) {
          console.error('Server returned 500 Internal Server Error', {
            url: `${API_URL}/user/login`,
            status: response.status,
            statusText: response.statusText
          });

          const errorDetails = await response.text().catch(e => 'No response body');
          console.error('Error response body:', errorDetails);

          throw new Error('The server encountered an internal error. This might be temporary - please try again in a few minutes or continue in offline mode.');
        } else if (response.status === 503) {
          throw new Error('The database service is unavailable. You can continue in offline mode.');
        }

        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Login response:', data);

      localStorage.setItem('userName', userDetails.name.trim());
      localStorage.setItem('userEmail', userDetails.email.trim());
      localStorage.setItem('userSubject', userDetails.subject);
      localStorage.removeItem('offlineMode');
      navigate('/start');

    } catch (error) {
      console.error('Login error:', error);

      if (error.message.includes('timeout') ||
        error.message.includes('Network Error') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('Server error') ||
        error.message.includes('internal error') ||
        error.message.includes('unavailable') ||
        error.name === 'AbortError' ||
        error.status >= 500) {

        if (error.message.includes('internal error')) {
          setError(`Server error: ${error.message}. Would you like to retry or continue offline?`);
          setServerStatus('degraded');
        } else {
          setError(`${error.message}. Would you like to continue anyway?`);
          setServerStatus('offline');
        }
      } else {
        setError(`Login failed: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const continueOffline = () => {
    if (!nameRegex.test(userDetails.name)) {
      setNameError('Only alphabetic characters (A-Z, a-z) are allowed');
      return;
    }

    localStorage.setItem('userName', userDetails.name.trim());
    localStorage.setItem('userEmail', userDetails.email.trim());
    localStorage.setItem('userSubject', userDetails.subject);
    localStorage.setItem('offlineMode', 'true');
    navigate('/start');
  };

  return (
    <div className="page-container">
      <div className="max-w-md w-full animate-fadeIn">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-700 mb-2">Quiz Master</h1>
          <p className="text-gray-600">Test your knowledge with our interactive quiz</p>
        </div>

        <div className="card p-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Start Quiz</h2>

          {serverStatus === 'offline' && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm">
              <p className="font-medium text-amber-700 mb-1">Server appears to be offline</p>
              <p className="text-amber-600">You can still take the quiz, but your results may not be saved.</p>
            </div>
          )}

          {serverStatus === 'degraded' && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm">
              <p className="font-medium text-amber-700 mb-1">Server may be experiencing issues</p>
              <p className="text-amber-600">You can continue, but some features might not work properly.</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
              <div className="mt-3 flex space-x-3">
                {(error.includes('internal error') || error.includes('temporary')) && (
                  <button
                    onClick={handleSubmit}
                    className="btn-primary text-sm px-3 py-1.5"
                  >
                    Retry
                  </button>
                )}
                {(serverStatus === 'offline' || serverStatus === 'degraded' ||
                  error.includes('internal error') || error.includes('unavailable')) && (
                  <button
                    onClick={continueOffline}
                    className="btn-neutral text-sm px-3 py-1.5"
                  >
                    Continue Offline
                  </button>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className={`form-input ${nameError ? 'border-red-500' : ''}`}
                value={userDetails.name}
                onChange={handleNameChange}
                placeholder="Enter your name (letters only)"
                required
              />
              {nameError && (
                <p className="mt-1 text-sm text-red-600">{nameError}</p>
              )}
            </div>
            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={userDetails.email}
                onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
                placeholder="you@example.com"
                required
              />
            </div>
            <input type="hidden" name="subject" value="General" />
            <button
              type="submit"
              disabled={isSubmitting || nameError}
              className={`btn-primary w-full py-3 flex justify-center items-center ${
                (isSubmitting || nameError) ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : 'Start Quiz'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <p className="text-center text-sm text-indigo-700">
              You can use any name and email to start the quiz. No registration required!
            </p>
          </div>

          <div className="mt-6 flex justify-center">
            <Link
              to={'/admin'}
              className="flex items-center px-4 py-2 text-indigo-800 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v-1l1-1 1-1-.257-.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
              </svg>
              Admin Portal
            </Link>
          </div>

          {(serverStatus === 'offline' || serverStatus === 'degraded') && (
            <div className="mt-4 text-center">
              <span className="badge badge-warning">
                Offline Mode Available
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
