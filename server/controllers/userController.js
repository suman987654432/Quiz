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
    
    // Continue with registration logic
    // ...existing code...
  } catch (error) {
    // ...existing code...
  }
};

// ...existing code...
