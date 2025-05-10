import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import './reset-password1.css';
import Logo from '../images/logo.png';


const ResetPassword1 = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

 // dark mode 
 useEffect(() => {
  const isDarkModeEnabled = localStorage.getItem('dark-mode') === 'true'; 
  if (isDarkModeEnabled) {
    document.body.classList.add('dark-mode'); 
  } else {
    document.body.classList.remove('dark-mode'); 
  }
}, []);


  const handleContinue = async (e) => {
    e.preventDefault();

    if (email) {
      try {
        await sendPasswordResetEmail(auth, email, {
          url: 'http://localhost:3000/login', 
          handleCodeInApp: true,
        });
        setSuccessMessage("Sent successfully");
        setError(''); 
      } catch (error) {

          setError("Failed to send reset link. Please try again.");
          setSuccessMessage('');    
      }
    } else {
      setError("Please enter your email address.");
    }
  };

  return (
    <div className="reset-password-container">
      <img src={Logo} alt="Logo" className="logoIn1" />
      <p className="title">Reset your password</p>

      <form className="form2" onSubmit={handleContinue}>
        <div className="input-container">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <i className="fas fa-envelope"></i>
        </div>

        <p className="hint">A password reset link will be sent to your email.<br />If the email exists in our records.</p>

       {error && <p className="error-message-reset">{error}</p>}
        {successMessage && <p className="success-message1">{successMessage}</p>}

        <button type="submit" className="sendLink-button">Send Reset Link</button>
      </form>
    </div>
  );
};

export default ResetPassword1;
