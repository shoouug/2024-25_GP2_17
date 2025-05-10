import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';

import HomePage from './Pages/HomePage'; // Import HomePage component
import VerifyEmail from './Pages/VerifyEmail';
import PreferenceTopics from './Pages/PreferenceTopics'; // Import PreferenceTopics component
import SignUp from './Pages/Signup';
import WelcomePage from './Pages/WelcomePage';
import Login from './Pages/login';
import ResetPassword1 from './Pages/reset-password1';

import AboutUs from './Pages/AboutUs';
import EditProfile from './Pages/EditProfile';
import TutorialPage from './Pages/TutorialPage.js'; // Import HomePage component


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<WelcomePage />} /> {/* This is the Welcome Page */}

          <Route path="/signup" element={<SignUp />} /> {/* Sign-Up Page */}
          <Route path="/login" element={<Login />} /> {/* Login Page */}
          <Route path="/reset-password1" element={<ResetPassword1 />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/preference-topics" element={<PreferenceTopics />} />
          
          
          <Route path="/editProfile" element={<EditProfile />} />
          <Route path="/aboutus" element={<AboutUs />} /> {/* About Us Page after signing in*/}
          
          
          {/* Route for Home Page after successful sign up */}
          <Route path="/homepage" element={<HomePage />} /> {/* Home Page after preferences */}
          <Route path="/TutorialPage" element={<TutorialPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;