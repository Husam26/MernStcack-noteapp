import React from "react";
import { Link } from "react-router-dom";
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero-content text-center">
        <h1 className="hero-title">
          Welcome to <span className="brand">MyNotes</span>
        </h1>
        <p className="hero-subtitle">
          A secure, easy-to-use platform to manage your personal notes.
        </p>
        <div className="button-group">
          <Link to="/login" className="btn btn-primary">Login</Link>
          <Link to="/signup" className="btn btn-outline-light">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
