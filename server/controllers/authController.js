exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already in use' 
      });
    }
    const user = await User.create({
      name,
      email,
      password,
    });


    res.status(201).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
  
  }
};

