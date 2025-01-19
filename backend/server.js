const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User'); // Import the User model
const jwt = require('jsonwebtoken'); // For creating JWT tokens
const dotenv = require('dotenv');
const Note = require('./models/Note'); // Import the Note model
const authenticateToken = require('./middleware/authMiddleware'); // Import the middleware
const cors = require('cors'); // Import the cors package
const upload = require('./middleware/multerConfig');
const path = require('path');

dotenv.config();

const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log('Error connecting to MongoDB:', err);
  });

// Add this middleware before defining any routes
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from the frontend's origin
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'], // Allow necessary HTTP methods
  credentials: true, // Allow sending cookies if needed
}));

// Sign-up route
app.post('/api/users/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create and save the new user
    const user = new User({ email, password });
    await user.save();

    // Send success response
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the password is correct
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Send the token as response
    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Profile Page Routes
// Get user information
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password'); // Exclude password
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch user information' });
  }
});

// Update account settings
app.patch('/api/profile', authenticateToken, async (req, res) => {
  const { email, password, theme } = req.body;

  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update email if provided
    if (email) user.email = email;

    // Update password if provided
    if (password) {
      user.password = password;  // Password hashing handled in the user model
    }

    // Update theme if provided
    if (theme) user.themePreference = theme;

    // Save updated user data
    await user.save();

    res.status(200).json({ message: 'Account updated successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update account settings' });
  }
});

// Update theme preferences
app.patch('/api/theme', authenticateToken, async (req, res) => {
  const { theme } = req.body;

  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.themePreference = theme;
    await user.save();

    res.status(200).json({ message: 'Theme updated successfully', theme: user.themePreference });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update theme preferences' });
  }
});

// Route to create a note (Protected route)
app.post('/api/notes', authenticateToken, async (req, res) => {
  const { title, content } = req.body;

  try {
    // Create a new note
    const note = new Note({
      title,
      content,
      userId: req.user, // Associate note with the logged-in user
    });

    await note.save(); // Save the note to the database
    res.status(201).json({ message: 'Note created successfully', note });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch notes route (Protected route)
app.get('/api/notes', authenticateToken, async (req, res) => {
  try {
    // Fetch all notes for the logged-in user
    const notes = await Note.find({ userId: req.user });

    // Send the notes as a response
    res.status(200).json({ notes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch notes' });
  }
});

// Update note route (Protected route)
app.put('/api/notes/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    // Find the note by ID and ensure it belongs to the logged-in user
    const note = await Note.findOne({ _id: id, userId: req.user });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Update the note with the new data
    if (title) note.title = title;
    if (content) note.content = content;

    // Save the updated note
    const updatedNote = await note.save();

    // Send success response
    res.status(200).json({ message: 'Note updated successfully', note: updatedNote });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update note' });
  }
});

// Delete note route (Protected route)
app.delete('/api/notes/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Find the note by ID and ensure it belongs to the logged-in user
    const note = await Note.findOneAndDelete({ _id: id, userId: req.user });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Send success response
    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete note' });
  }
});

// Profile picture upload route
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/api/profile/picture', authenticateToken, upload.single('profilePicture'), async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Save the uploaded file path
    user.profilePicture = `uploads/${req.file.filename}`;
    await user.save();

    // Generate full URL for the uploaded file
    const fullUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.status(200).json({
      message: 'Profile picture uploaded successfully',
      profilePicture: fullUrl, // Return the full URL
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Failed to upload profile picture' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
