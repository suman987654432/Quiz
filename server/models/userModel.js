
const userSchema = new mongoose.Schema({
  
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"]
  },

});

