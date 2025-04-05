
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "This email is already registered. Please use a different email." 
      });
    }
    

    const user = await User.create({
      name,
      email,
      password
    });
    
   
  } catch (error) {
   
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

