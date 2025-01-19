import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaSignOutAlt, FaStickyNote, FaSignInAlt, FaRegUser } from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();
  const authToken = localStorage.getItem("authToken");

  // State for modal visibility
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setShowModal(false); // Close the modal
    navigate("/login"); // Redirect to login page
  };

  const handleShowModal = () => {
    setShowModal(true); // Show the modal when logout is clicked
  };

  const handleCloseModal = () => {
    setShowModal(false); // Close the modal when Cancel is clicked
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
      <div className="container">
        <Link className="navbar-brand" to="/">
          MyNotes
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {authToken ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/notes">
                    <FaStickyNote /> Notes
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">
                    <FaUserCircle /> Profile
                  </Link>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-outline-light nav-link"
                    onClick={handleShowModal}
                    style={{ border: "none", background: "none" }}
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    <FaSignInAlt /> Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/signup">
                    <FaRegUser /> Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: "block" }} // Force the modal to display when showModal is true
          aria-labelledby="logoutModal"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="logoutModal">
                  Confirm Logout
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={handleCloseModal} // Close modal when "X" is clicked
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to log out?</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal} // Close modal when Cancel is clicked
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleLogout} // Log out when Yes is clicked
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
