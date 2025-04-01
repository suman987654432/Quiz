// ...existing code...

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already in use' 
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
    });

    // ...existing code (token generation, etc.)...

    res.status(201).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    // ...existing error handling...
  }
};

// ...existing code...
