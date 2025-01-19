const mongoose = require('mongoose');

// Define the note schema
const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // Title is required
  },
  content: {
    type: String,
    required: true, // Content is required
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model (so we can associate notes with specific users)
    required: true, // User is required for the note
  },
});

// Create and export the Note model
const Note = mongoose.model('Note', noteSchema);
module.exports = Note;
