import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './Notes.css';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [editNote, setEditNote] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [theme, setTheme] = useState("light");
  const [searchTerm, setSearchTerm] = useState("");
  const [modalNote, setModalNote] = useState(null); // State for the note to view in modal
  const navigate = useNavigate();

  useEffect(() => {
    // Apply theme from localStorage if available
    const storedTheme = localStorage.getItem("theme") || "light";
    setTheme(storedTheme);
    document.body.classList.toggle("dark-mode", storedTheme === "dark");

    const authToken = localStorage.getItem("authToken");

    if (authToken) {
      axios
        .get("http://localhost:5000/api/notes", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })
        .then((response) => {
          setNotes(response.data.notes);
        })
        .catch((err) => {
          setMessage({ text: "Failed to fetch notes.", type: "error" });
        });
    } else {
      setMessage({ text: "You are not logged in.", type: "error" });
      navigate("/"); // Redirect to login if not logged in
    }
  }, [navigate]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    document.body.classList.toggle("dark-mode", newTheme === "dark");
    localStorage.setItem("theme", newTheme); // Save the theme in localStorage
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      setMessage({ text: "You are not logged in.", type: "error" });
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/notes",
        { title: newNote.title, content: newNote.content },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      setNotes((prevNotes) => [...prevNotes, response.data.note]);
      setNewNote({ title: "", content: "" });
      setMessage({ text: "Note added successfully!", type: "success" });
    } catch (err) {
      setMessage({ text: "Failed to create note.", type: "error" });
    }
  };

  const handleEditNote = (note) => {
    setEditNote(note);
  };

  const handleUpdateNote = async (e) => {
    e.preventDefault();
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      setMessage({ text: "You are not logged in.", type: "error" });
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/notes/${editNote._id}`,
        { title: editNote.title, content: editNote.content },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note._id === response.data.note._id ? response.data.note : note
        )
      );

      setEditNote(null);
      setMessage({ text: "Note updated successfully!", type: "success" });
    } catch (err) {
      setMessage({ text: "Failed to update note.", type: "error" });
    }
  };

  const handleDeleteNote = async (noteId) => {
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      setMessage({ text: "You are not logged in.", type: "error" });
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/notes/${noteId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setNotes((prevNotes) => prevNotes.filter((note) => note._id !== noteId));
      setMessage({ text: "Note deleted successfully!", type: "success" });
    } catch (err) {
      setMessage({ text: "Failed to delete note.", type: "error" });
    }
  };

  // Filter notes based on the search term
  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle search term change
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Automatically remove the message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Open the modal with the complete note details
  const handleViewNote = (note) => {
    setModalNote(note); // Set the note to display in the modal
  };

  // Close the modal
  const handleCloseModal = () => {
    setModalNote(null);
  };

  return (
    <div className="notes-container">
      <h1>Your Notes</h1>

      {/* Display success or error messages */}
      {message.text && (
        <p className={`message ${message.type}`}>{message.text}</p>
      )}

      {/* Theme toggle */}
      <div className="theme-toggle">
        <label>Theme:</label>
        <select value={theme} onChange={(e) => handleThemeChange(e.target.value)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search Notes..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {/* Create New Note Form */}
      <form onSubmit={handleCreateNote} className="note-form">
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            required
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label>Content</label>
          <textarea
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            required
            className="input-field"
          ></textarea>
        </div>
        <button type="submit" className="submit-btn">
          Save Note
        </button>
      </form>

      {/* Edit Note Form */}
      {editNote && (
        <form onSubmit={handleUpdateNote} className="note-form">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={editNote.title}
              onChange={(e) => setEditNote({ ...editNote, title: e.target.value })}
              required
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label>Content</label>
            <textarea
              value={editNote.content}
              onChange={(e) => setEditNote({ ...editNote, content: e.target.value })}
              required
              className="input-field"
            ></textarea>
          </div>
          <button type="submit" className="submit-btn">
            Update Note
          </button>
          <button
            type="button"
            onClick={() => setEditNote(null)} // Cancel editing
            className="cancel-btn"
          >
            Cancel
          </button>
        </form>
      )}

      <ul className="notes-list">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <li key={note._id} className="note-item">
              <h3>{note.title}</h3>
              <p>{note.content}</p>
              <button
                onClick={() => handleViewNote(note)}
                className="view-btn"
              >
                <i className="fa-solid fa-note-sticky"></i> View
              </button>
              <button
                onClick={() => handleEditNote(note)}
                className="edit-btn"
              >
                <i className="fa-solid fa-pen-to-square"></i> Edit
              </button>
              <button
                className="delete-btn"
                onClick={() => handleDeleteNote(note._id)}
              >
                <i className="fa-solid fa-trash"></i> Delete
              </button>
            </li>
          ))
        ) : (
          <li>No notes found</li>
        )}
      </ul>

      {/* Modal for viewing a note */}
      {modalNote && (
        <div className="modal">
          <div className="modal-content">
            <button onClick={handleCloseModal} className="close-btn">
              X
            </button>
            <h2 id="modal-title">{modalNote.title}</h2>
            <p>{modalNote.content}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
