

import { toast } from 'react-toastify';


const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const response = await axios.post('/api/users/register', { name, email, password });
   
  } catch (error) {
   
    if (error.response && error.response.data) {
      setError(error.response.data.message || "Registration failed. Please try again.");
    } else {
      setError("Something went wrong. Please try again later.");
    }
  }
};


{error && <div className="error-message">{error}</div>}

