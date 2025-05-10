import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, applyActionCode } from 'firebase/auth';
import './VerifyEmail.css';


const VerifyEmail = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [isVerified, setIsVerified] = useState(false);

// Apply dark mode state on component mount
 useEffect(() => {
  const isDarkModeEnabled = localStorage.getItem('dark-mode') === 'true'; // Get saved state
  if (isDarkModeEnabled) {
    document.body.classList.add('dark-mode'); // Apply dark mode
  } else {
    document.body.classList.remove('dark-mode'); // Ensure dark mode is off
  }
}, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const oobCode = queryParams.get('oobCode');
  
    console.log('Verification Code:', oobCode); // For debugging
  
    if (oobCode) {
      applyActionCode(auth, oobCode)
        .then(() => {
          console.log('Email verified successfully!');
          setIsVerified(true); // Update state to show the "Next" button
          console.log('isVerified is now true'); // For debugging
        })
        .catch((error) => {
          console.error('Error verifying email:', error);
        });
    }
  }, [auth]);

  const handleNextClick = () => {
    navigate('/tutorialpage');
  };

  return (
    <div className="verify-email-container">
     
        
     
      <div className="message-box">
        <h3>Your email has been verified!</h3>
        <p>Please click "Next" to complete your profile.</p>
        {true && (
  <button className="next-button" onClick={handleNextClick}>
    Next
  </button>
)}

      </div>
    </div>
  );
};

export default VerifyEmail;