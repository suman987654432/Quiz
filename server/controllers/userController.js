// ...existing code...

// In the register function or equivalent
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "This email is already registered. Please use a different email." 
      });
    }
    
    // Create new user if email is not already in use
    const user = await User.create({
      name,
      email,
      password
    });
    
    // ...existing code for sending response with token...
  } catch (error) {
    // Check for MongoDB duplicate key error (code 11000)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already in use. Please use a different email address."
      });
    }
    
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred during registration"
    });
  }
};

// ...existing code...
