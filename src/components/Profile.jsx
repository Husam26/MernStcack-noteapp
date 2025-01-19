import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState({});
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [theme, setTheme] = useState("light");
  const [profilePicture, setProfilePicture] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        const { user } = response.data;

        const fullProfilePictureUrl = user.profilePicture
          ? `http://localhost:5000/${user.profilePicture}`
          : null;

        setUser({
          ...user,
          profilePicture: fullProfilePictureUrl,
        });
        setEmail(user.email);
        setTheme(user.themePreference);
      } catch (err) {
        setError("Failed to load user data.");
        if (err.response?.status === 401) {
          navigate("/login");
        }
      }
    };

    fetchUserData();
  }, [navigate]);

  const handlePictureChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handlePictureUpload = async () => {
    if (!profilePicture) {
      setError("Please select a profile picture first.");
      return;
    }

    const formData = new FormData();
    formData.append("profilePicture", profilePicture);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/profile/picture",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setSuccessMessage("Profile picture updated successfully!");

      const uploadedPicturePath = response.data.profilePicture;

      setUser((prevUser) => ({
        ...prevUser,
        profilePicture: `http://localhost:5000/${uploadedPicturePath}`,
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload profile picture.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedDetails = {
      email,
      ...(newPassword && { password: newPassword }),
      theme,
    };

    try {
      const response = await axios.patch(
        "http://localhost:5000/api/profile",
        updatedDetails,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      setSuccessMessage("Profile updated successfully!");
      setUser(response.data.user);
      setIsEditing(false);

      localStorage.setItem("theme", theme);
      document.body.classList.toggle("dark-mode", theme === "dark");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="profile-container">
      <h2 className="profile-header">My Profile</h2>
      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      {/* Profile Picture Section */}
      <div className="profile-picture-section">
        {user.profilePicture ? (
          <img
            src={user.profilePicture}
            alt="Profile"
            className="profile-picture"
          />
        ) : (
          <p>No profile picture uploaded.</p>
        )}

        {/* Custom File Input */}
        <div className="file-input-wrapper">
          <input
            type="file"
            accept="image/*"
            onChange={handlePictureChange}
            className="file-input"
            id="profilePictureInput"
          />
          <label htmlFor="profilePictureInput" className="file-input-label">
            Choose a File
            <span>PNG, JPG, JPEG, or GIF</span>
          </label>
        </div>

        {profilePicture && (
          <p className="selected-file">Selected File: {profilePicture.name}</p>
        )}

        <button
          onClick={handlePictureUpload}
          disabled={!profilePicture}
          className="upload-btn"
        >
          {profilePicture ? "Upload Picture" : "No file selected"}
        </button>
      </div>

      {/* Profile Editing Form */}
      {isEditing ? (
        <form onSubmit={handleSubmit} className="profile-edit-form">
          <div className="input-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label>New Password:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label>Theme Preference:</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="input-field"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="buttons-container">
            <button type="submit" className="submit-btn">
              Save Changes
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-details">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Theme Preference:</strong> {user.themePreference}</p>
          <p><strong>Account Created At:</strong> {formatDate(user.createdAt)}</p>
          <p><strong>Last Updated At:</strong> {formatDate(user.updatedAt)}</p>
          <button
            className="edit-btn"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
