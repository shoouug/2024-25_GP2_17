import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; 
import './login.css';
import Logo from '../images/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); 
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); 

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/homepage'); 
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        setError('Email does not exist.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Invalid password.');
      } else {
        setError('Failed to log in. Please try again.');
      }
    }
  };

  return (
    <div className="login-container">
      <img src={Logo} alt="Logo" className="logoIn" />
      <p className="welcoming">Back to your newsroom!</p>

      <form onSubmit={handleLogin}>
        <div className="input-container">
          <input
            type="email"
            value={email}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <i className="fas fa-envelope"></i>
        </div>
        <div className="input-container">
          <input
            type={isPasswordVisible ? 'text' : 'password'}
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <i className="fas fa-lock"></i>
          <FontAwesomeIcon
            icon={isPasswordVisible ? faEyeSlash : faEye}
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            className="toggle-password-icon"
          />
        </div>

        <div className="forgot-password">
          <p className="black_p">Forgot your password? <Link to="/reset-password1">Reset Password</Link></p>
        </div>
        {error && <p className="error-message1">{error}</p>}

        <button type="submit" className="login-button">Log In</button>

      </form>
    </div>
  );
};

export default Login;
