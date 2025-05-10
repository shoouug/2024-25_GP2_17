import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import animationData from '../images/Animation - 1729347628307.json';
import './WelcomePage.css';

const WelcomePage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Apply dark mode state on component mount
  useEffect(() => {
    const isDarkModeEnabled = localStorage.getItem('dark-mode') === 'true';
    setIsDarkMode(isDarkModeEnabled);

    if (isDarkModeEnabled) {
      document.body.classList.add('dark-mode');
      console.log('Dark mode enabled'); // Debugging
    } else {
      document.body.classList.remove('dark-mode');
      console.log('Dark mode disabled'); // Debugging
    }
  }, []);

  return (
    <div className="welcome-containerW">
      {/* Lottie animation as background */}
      <div className="background-animationW">
        <Lottie animationData={animationData} loop={true} />
      </div>

      {/* Navigation Bar */}
      <nav className="navbarW">
        <img src={require('../images/logo.png')} alt="GenNews Logo" className="logoW" />
        <div className="navbar-linksW">
          <Link to="/signup" className="nav-linkW">
            Sign Up
          </Link>
          <Link to="/login" className="nav-linkW">
            Log In
          </Link>
          <Link to="/AboutUs" className="nav-linkW">
            About Us
          </Link>
        </div>
      </nav>

      {/* Main Welcome Section */}
      <div className="welcome-contentW">
        <h1
          className="welcome-titleW"
          style={{
            color: isDarkMode ? 'darkgray' : '#333', // Force dark gray for title
          }}
        >
          Welcome to GenNews
        </h1>
        <p className="welcome-descriptionW">
          Empowering journalists with AI-powered tools for efficient article creation and trend analysis.
        </p>
      </div>
    </div>
  );
};

export default WelcomePage;