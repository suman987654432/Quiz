import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/config';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: credentials.email.trim(),
          password: credentials.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('adminToken', data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid admin credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="max-w-md w-full animate-fadeIn">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-700 mb-2">Quiz Master</h1>
          <p className="text-gray-600">Admin Dashboard</p>
        </div>
        
        <div className="card p-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin Login</h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-100">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                placeholder="admin@example.com"
                required
              />
            </div>
            
            <div>
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`btn-primary w-full py-3 flex justify-center items-center ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </>
              ) : 'Login'}
            </button>
          </form>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="font-medium text-blue-800 mb-2">Demo Credentials:</h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <span className="text-blue-700 font-medium">Email:</span>
              <span className="text-blue-600 col-span-2">admin@example.com</span>
              <span className="text-blue-700 font-medium">Password:</span>
              <span className="text-blue-600 col-span-2">admin123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;