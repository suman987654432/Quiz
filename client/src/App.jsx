import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminLogin from './components/Admin/AdminLogin';
import AdminDashboard from './components/Admin/AdminDashboard';
import UserLogin from './components/User/UserLogin';
import QuizInterface from './components/User/QuizInterface';
import Results from './components/User/Results';
import StartPage from './components/User/StartPage';

const AdminRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  if (!adminToken) {
    return <Navigate to="/admin" />;
  }
  return children;
};

AdminRoute.propTypes = {
  children: PropTypes.node.isRequired
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>

          {/* Public Routes */}
          <Route  path="/" element={<UserLogin />} />
          <Route path="/start" element={<StartPage />} />
          <Route path="/quiz" element={<QuizInterface />} />
          <Route path="/results" element={<Results />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          <Route path="*" element={
            <div className="page-container">
              <div className="card p-8 max-w-md w-full">
                <h1 className="text-2xl font-bold text-center mb-6">Page Not Found</h1>
                <p className="text-gray-600 text-center mb-6">The page you are looking for does not exist.</p>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="btn-primary w-full"
                >
                  Go Home
                </button>
              </div>
            </div>
          } />
        </Routes>
      </div>
      <ToastContainer 
        position="top-right" 
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="shadow-md rounded-lg"
      />
    </Router>
  );
}

export default App;
