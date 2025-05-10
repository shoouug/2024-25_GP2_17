// SignUp.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import Logo from '../images/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './Signup.css';

const SignUp = () => {
  const [form, setForm] = useState({
    title: '',
    firstName: '',
    lastName: '',
    email: '',
    affiliation: '',
    country: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({
    pwd: {
      length: false,
      lower: false,
      upper: false,
      number: false,
      special: false
    },
    mismatch: '',
    country: '',
    submit: ''
  });
  const [showRules, setShowRules] = useState(false);
  const [passVisible, setPassVisible] = useState(false);
  const [confVisible, setConfVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.toggle(
      'dark-mode',
      localStorage.getItem('dark-mode') === 'true'
    );
  }, []);

  const titles = [
    'Mr.','Ms.','Miss.','Eng.','Dr.','Prof.','Editor.','Reporter.','Columnist.'
  ];
  const countries = [
    'Saudi Arabia','United States','Canada','UK','Australia',
    'Germany','France','UAE','India','China',
  ];

  const ruleTexts = {
    length: 'At least 8 characters',
    lower: 'At least one lowercase letter',
    upper: 'At least one uppercase letter',
    number: 'At least one number',
    special: 'At least one special character (!@#$%^&*)'
  };

  const handleChange = e => {
    const { name, value: raw } = e.target;
    let value = raw;
  
    // Auto-capitalize first letter of names
    if ((name === 'firstName' || name === 'lastName') && value) {
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }
  
    setForm(f => ({ ...f, [name]: value }));
  
    if (name === 'password') {
      validatePassword(value);
    }
  };
  
  const validatePassword = pwd => {
    const rules = {
      length: pwd.length >= 8,
      lower: /[a-z]/.test(pwd),
      upper: /[A-Z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[!@#$%^&*]/.test(pwd)
    };
    setErrors(err => ({ ...err, pwd: rules }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setErrors(err => ({ ...err, mismatch: '', country: '', submit: '' }));
 // 1) Require first letter uppercase (just in case)
   if (!/^[A-Z][A-Za-z]*$/.test(form.firstName)) {
       return setErrors(err => ({ ...err, submit: 'First name must start with a capital letter.' }));
     }
    if (!/^[A-Z][A-Za-z]*$/.test(form.lastName)) {
      return setErrors(err => ({ ...err, submit: 'Last name must start with a capital letter.' }));
     }
  
     // 2) Stricter email rule: local@domain.tld
     const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
     if (!emailRegex.test(form.email)) {
       return setErrors(err => ({ ...err, submit: 'Please enter a valid email address.' }));
     }
  
    // mismatch?
    if (form.password !== form.confirmPassword) {
      return setErrors(err => ({
        ...err,
        mismatch: 'Passwords must match.'
      }));
    }

    // all pwd rules pass?
    if (Object.values(errors.pwd).includes(false)) {
      return; // showRules will show which fail
    }

    // country?
    if (!form.country) {
      return setErrors(err => ({
        ...err,
        country: 'Select your city.'
      }));
    }

    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      await sendEmailVerification(res.user, {
        url: window.location.origin + '/verify-email',
        handleCodeInApp: true
      });
      await setDoc(doc(db, 'Journalists', res.user.uid), {
        ...form,
        selectedTopics: [],
        previousArticles: []
      });
      alert('Verification sent!');
      navigate('/');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setErrors(errs => ({ ...errs, submit: 'Account is already logged in.' }));
      } else {
        setErrors(errs => ({ ...errs, submit: err.message }));
      }
    }
  };

  return (
    <div className="signup-page">
      <div className="shape" />
      <div className="signup-card">
        <img src={Logo} alt="Logo" className="logo" />
        <h1>Create Account</h1>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <select
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            >
              <option value="">Title</option>
              {titles.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              name="firstName"
              placeholder="First Name"
              value={form.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="row">
            <input
              name="lastName"
              placeholder="Last Name"
              value={form.lastName}
              onChange={handleChange}
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              onInvalid={e => {
                
                e.target.setCustomValidity('Enter a valid email');
              }}
              onInput={e => {
                // clear the custom message as soon as they start typing again
                e.target.setCustomValidity('');
              }}
              required
            />
          </div>

          <div className="row">
            <input
              name="affiliation"
              placeholder="Affiliation"
              value={form.affiliation}
              onChange={handleChange}
              required
            />
            <select
              name="country"
              value={form.country}
              onChange={handleChange}
              required
            >
              <option value="">Country</option>
              {countries.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="row password-field">
            <input
              type={passVisible ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              onFocus={() => setShowRules(true)}
              onBlur={() => setShowRules(false)}
              onChange={handleChange}
              required
            />
            <FontAwesomeIcon
              icon={passVisible ? faEyeSlash : faEye}
              onClick={() => setPassVisible(v => !v)}
            />
          </div>
          {showRules && (
            <ul className="rules">
              {Object.entries(errors.pwd).map(([key, ok]) => (
                <li key={key} className={ok ? 'valid' : 'invalid'}>
                  {ruleTexts[key]}
                </li>
              ))}
            </ul>
          )}

          <div className="row password-field">
            <input
              type={confVisible ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            <FontAwesomeIcon
              icon={confVisible ? faEyeSlash : faEye}
              onClick={() => setConfVisible(v => !v)}
            />
          </div>

          {errors.mismatch && <p className="error">{errors.mismatch}</p>}
          {errors.country && <p className="error">{errors.country}</p>}
          {errors.submit && <p className="error">{errors.submit}</p>}

          <button type="submit" className="btn">
            Sign Up
          </button>
        </form>

        <p className="switch">
          Already have an account?{' '}
          <span onClick={() => navigate('/login')}>Log In</span>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
