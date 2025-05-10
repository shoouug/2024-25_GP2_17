import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../images/logo.png';  // Assuming you have a logo image in the images folder
import step1 from '../images/step1.png';
import step2 from '../images/step2.png';
import step3 from '../images/step3.png';
import step4 from '../images/step4.png';
import step5 from '../images/step5.png';
import './TutorialPage.css';

const TutorialPage = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const isDarkModeEnabled = localStorage.getItem('dark-mode') === 'true'; // Get saved state
    if (isDarkModeEnabled) {
      document.body.classList.add('dark-mode'); // Apply dark mode
    } else {
      document.body.classList.remove('dark-mode'); // Ensure dark mode is off
    }
  }, []);

  const nextStep = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      // Redirect to the PreferenceTopics page when the tutorial is complete
      navigate('/preference-topics');
    }
  };

  const previousStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const steps = [
    { 
      image: logo, 
      title: "Welocome Back", 
      description: " Let’s take a quick tour of the website and get you started on generating amazing content." },
    { 
      image: step1, 
      title: "  Choose Your Topics", 
      description: "As a new user, you can select your topics, and your article will be generated based on those. You can change them anytime in your profile settings."
    },
    { 
      image: step2, 
      title: "  Write or Paste Your Article", 
      description: "You can paste or write your article to help GenNews generate your article based on your writing style."
    },
    { 
      image: step3, 
      title: " Add Any News Topics", 
      description: "If you want to add a topic you are interested in, you can easily write it, and the news related to that topic will appear."
    },
    { 
      image: step4, 
      title: "  Add Keywords for Specificity", 
      description: "To make your topic more specific, you can add keywords that will help GenNews tailor the content."
    },
    { 
      image: step5, 
      title: "Edit · Export · Add Images · Browse Articles", 
      description: "Here you can edit your article, export it as a Word document, add images, start a new article that's related to your topic, or go back."
    },
  ];

  return (
    <div className={`tutorial-page ${document.body.classList.contains('dark-mode') ? 'dark-mode' : ''}`}>
      <div className="background-effect"></div>
      <div className="step-container">
        <img src={steps[step].image} alt={`Step ${step + 1}`} className="step-image" />
        <h2>{steps[step].title}</h2>
        <p className="step-description">{steps[step].description}</p>
      </div>

      {/* Progress indicator */}
      <div className="progress-indicator">
        {steps.map((_, index) => (
          <span key={index} className={`dot ${index <= step ? 'active' : ''}`}></span>
        ))}
      </div>

      <div className="buttons-container">
        <button className="previous-button" onClick={previousStep} disabled={step === 0}>Previous</button>
        <button className="next-button" onClick={nextStep}>
          {step === 5 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default TutorialPage;