const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // To hash the password

// Define the User schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    // Ensure name is required
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensures no duplicate emails
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    default: 'default-profile-picture.png', // Default profile picture
  },
  themePreference: {
    type: String,
    enum: ['light', 'dark'], // Allow only 'light' or 'dark' as valid values
    default: 'light', // Default theme is 'light'
  },
  createdAt: {
    type: Date,
    default: Date.now, // Timestamp when the user was created
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Timestamp when the user was last updated
  },
});

// Hash password before saving the user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    this.updatedAt = Date.now(); // Update timestamp
    return next();
  }

  // Hash the password with 10 salt rounds
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.updatedAt = Date.now(); // Update timestamp
  next();
});

// Method to check if the entered password matches the stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create and export the User model
const User = mongoose.model('User', userSchema);
module.exports = User;
