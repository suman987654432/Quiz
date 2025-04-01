// ...existing code...

import { toast } from 'react-toastify';

// ...existing code...

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const response = await axios.post('/api/users/register', { name, email, password });
    // Handle successful registration
    // ...existing code...
  } catch (error) {
    // Check for email already exists error
    if (error.response && error.response.data) {
      setError(error.response.data.message || "Registration failed. Please try again.");
    } else {
      setError("Something went wrong. Please try again later.");
    }
  }
};

// In the component's return statement, display the error message
// ...existing code...
{error && <div className="error-message">{error}</div>}
// ...existing code...
