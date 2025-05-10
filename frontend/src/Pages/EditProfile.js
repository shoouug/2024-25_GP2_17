import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { auth, db } from '../firebase';
import './EditProfile.css';
import backArrowIcon from '../images/BackArrow.png'; 

const EditPro = ({ userData }) => {
  const [formData, setFormData] = useState({
    title: '',  
    firstName: '',
    lastName: '',
    email: '',
    affiliation: '',
    country: '',
  });

  const [isAffiliationEditable, setIsAffiliationEditable] = useState(false); // State for Affiliation editability
    const [isCountryEditable, setIsCountryEditable] = useState(false); // State for country editability

    const [selectedTopics, setSelectedTopics] = useState([]);
    const [allTopics, setAllTopics] = useState([]);
    const [article, setArticle] = useState('');

    const [affiliationError, setAffiliationError] = useState('');
    const [error, setError] = useState('');
     const navigate = useNavigate();

     const countries = [
      "Saudi Arabia", "United States", "Canada", "United Kingdom", "Australia", 
      "Germany", "France", "United Arab Emirates", "India", "China", 
      "Japan", "South Korea", "Brazil", "Mexico", "Italy", "Spain", 
      "Russia", "Turkey", "South Africa", "Argentina", "Nigeria", 
      "Egypt", "Netherlands", "Sweden", "Switzerland", "Belgium", 
      "Denmark", "Norway", "Finland", "Greece", "Portugal", 
      "Poland", "Indonesia", "Malaysia", "Thailand", "Vietnam", 
      "Philippines", "New Zealand", "Pakistan", "Bangladesh", "Chile", 
      "Colombia", "Venezuela", "Peru", "Austria", "Israel", 
      "Singapore", "Ireland", "Czech Republic", "Hungary", "Romania", 
      "Ukraine", "Kenya", "Ethiopia", "Iceland", "Norway", 
      "Cuba", "Ghana", "Qatar", "Kuwait", "Oman", 
      "Lebanon", "Jordan", "Morocco", "Algeria", "Tunisia", 
      "Luxembourg", "Malta", "Sri Lanka", "Nepal", "Cambodia", 
      "Laos", "Bolivia", "Paraguay", "Uruguay", "Trinidad and Tobago", 
      "Barbados"
    ];
    
  // Apply dark mode on component mount
  useEffect(() => {
    const isDarkModeEnabled = localStorage.getItem('dark-mode') === 'true';
    if (isDarkModeEnabled) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          // Fetching user data from Firestore
          const docRef = doc(db, 'Journalists', user.uid);
          const docSnap = await getDoc(docRef);
  
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData({
              title: data.title || '', 
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              email: data.email || '',
              affiliation: data.affiliation || '',
              country: data.country || '',
            });
            setSelectedTopics(data.selectedTopics || []);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        navigate('/homepage');
      }
    };

    const fetchAllTopics = () => {
      setAllTopics([
        'Technology', 'Finance', 'Health', 'Art', 'Science', 'Entertainment', 'Economy', 'Crime', 'Sport', 'Beauty',
        'Politics', 'Education', 'Environment','Law', 'Travel', 'Food', 'Lifestyle', 'History', 'Culture', 'Business', 'Fashion',
        'Automobile', 'Gaming', 'Movies', 'Music', 'Real Estate', 'Personal Finance', 'Pets', 'Parenting', 'Space', 'Weather'
      ]);
    };

    fetchUserData();
    fetchAllTopics();
  }, [navigate]);

  const handleInputChange = (e) => {
      const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

      if (name === "affiliation") {
        if (value.trim().length === 0) {
          setAffiliationError("Affiliation cannot be empty.");
        } else {
          setAffiliationError(""); 
        }
      } 
    };

  const handleTopicChange = (topic) => {
    setSelectedTopics((prevTopics) => {
      if (prevTopics.includes(topic)) {
        if (prevTopics.length === 1) {
          setError('You must select at least one topic.');
          return prevTopics;
        } else {
          setError('');
          return prevTopics.filter((t) => t !== topic);
        }
      } else {
        if (prevTopics.length >= 5) {
          setError('You can only select up to 5 topics.');
          return prevTopics;
        } else {
          setError('');
          return [...prevTopics, topic];
        }
      }
    });
  };

  const handleArticleChange = (e) => {
    setArticle(e.target.value);
  };
  const handleProfileUpdate = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, 'Journalists', user.uid);
        let profileUpdated = false;
        let articleAdded = false;
  
        // Check if profile data has changed
        const isProfileUpdated =
          formData.affiliation !== userData?.affiliation ||
          formData.country !== userData?.country ||
          JSON.stringify(selectedTopics) !== JSON.stringify(userData?.selectedTopics);
  
        if (isProfileUpdated) {
          await updateDoc(docRef, {
            ...formData,
            selectedTopics: selectedTopics,
          });
          profileUpdated = true;
        }
  
        if (article.trim()) {
          await updateDoc(docRef, {
            previousArticles: arrayUnion(article),
          });
          articleAdded = true;
          setArticle('');
        }
  
        // Show success messages
        if (profileUpdated && articleAdded) {
          alert('Profile and article updated successfully!');
        } else if (profileUpdated) {
          alert('Profile updated successfully!');
        } else if (articleAdded) {
          alert('Article added successfully!');
        }
  
        navigate('/homepage');
      } catch (error) {
        setError('Failed to update profile. Please try again.');
        console.error('Error updating profile:', error);
      }
    }
  };

 // Handle the back navigation
const handleBack = () => {
  navigate('/homepage'); // Navigate back to HomePage
};
// Edit actions
const handleEditAffiliation = () => {
  setIsAffiliationEditable(true); // Enable the affiliation field for editin
  
};
const handleEditCountry = () => {
  setIsCountryEditable(true); // Enable the country field for editing
};


const handleDeleteArticles = async () => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete all your previous articles? This action cannot be undone."
  );

  if (confirmDelete) {
    try {
      // Get current user
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to delete articles.");
        return;
      }

      // Make DELETE request with user_id as a query parameter
      const response = await fetch(`http://localhost:8000/delete-articles?user_id=${user.uid}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();

      if (response.ok) {
        alert("All previous articles have been deleted successfully.");
      } else {
        alert(`Error: ${result.detail}`);
      }
    } catch (error) {
      console.error("Failed to delete articles:", error);
      alert("Something went wrong. Please try again later.");
    }
  }
};


  return (
    <div className="edit-profile-containerW">
      <div className="back-arrow-container" onClick={handleBack}>
        <img src={backArrowIcon} alt="Back" className="back-arrow-icon" />
      </div>
      <div className="form-contentW">

      <div className="navbarW">
  <div className="navbar-left-group">
    <div className="back-arrow-container" onClick={handleBack}>
      <img src={backArrowIcon} alt="Back" className="back-arrow-icon" />
    </div>
    <div className="navbar-leftW">
    <span>
  Welcome, {formData.title ? `${formData.title} ` : ''}{formData.firstName} {formData.lastName}
</span>
      <span>
        {new Date().toLocaleDateString('en-GB', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })}
      </span>
    </div>
  </div>
</div>
           <form className="formW">

  {/* LEFT */}
  <div className="input-labelWijdan">
    Title:
    <input
      type="text"
      className="inputWijdan"
      value={formData.title}
      name="title"
      disabled
    />
  </div>

  {/* RIGHT */}
  <div className="input-labelWijdan">
    First Name:
    <input
      type="text"
      className="inputWijdan"
      value={formData.firstName}
      onChange={handleInputChange}
      name="firstName"
      disabled
    />
  </div>

  <div className="input-labelWijdan">
    Last Name:
    <input
      type="text"
      className="inputWijdan"
      value={formData.lastName}
      onChange={handleInputChange}
      name="lastName"
      disabled
    />
  </div>

  <div className="input-labelWijdan">
    Email:
    <input
      type="email"
      className="inputWijdan"
      value={formData.email}
      onChange={handleInputChange}
      name="email"
      disabled
    />
  </div>

  <div className="input-labelWijdan">
    Affiliation:
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <input
        type="text"
        className="inputWijdan"
        value={formData.affiliation}
        onChange={handleInputChange}
        name="affiliation"
        disabled={!isAffiliationEditable}
      />
      {!isAffiliationEditable && (
        <span className="edit-textWijdan" onClick={handleEditAffiliation}>
          Edit
        </span>
      )}
    </div>
    {affiliationError && <p className="error-messageW">{affiliationError}</p>}
  </div>

  <div className="input-labelWijdan">
    Country:
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <select
        className="input-countryWijdan"
        name="country"
        value={formData.country}
        onChange={handleInputChange}
        disabled={!isCountryEditable}
        required
      >
        <option value="" disabled>Select your country</option>
        {countries.map((country) => (
          <option key={country} value={country}>{country}</option>
        ))}
      </select>
      {!isCountryEditable && (
        <span className="edit-textWijdan" onClick={handleEditCountry}>
          Edit
        </span>
      )}
    </div>
  </div>

  {/* Preference Topics */}
  <div className="preference-topicsW" style={{ gridColumn: 'span 2' }}>
    <h2 className="edtW">Choose Your Preference Topics</h2>
    {error && <p className="error-messageW">{error}</p>}
    <div className="topics-gridW">
      {allTopics.map((topic) => (
        <div
          key={topic}
          className={`topic-itemW ${selectedTopics.includes(topic) ? 'selectedW' : ''}`}
          onClick={() => handleTopicChange(topic)}
        >
          {topic}
        </div>
      ))}
    </div>
  </div>

  {/* Write Article */}
  <div className="article-sectionW" style={{ gridColumn: 'span 2' }}>
    <h2 className="edtW">Write Your Article</h2>
    <textarea
      className="textW"
      placeholder="Paste or write your article here..."
      value={article}
      onChange={handleArticleChange}
      rows="4"
    />
  </div>

  {/* Buttons */}
  <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
    <button className="submit-btnW" type="button" onClick={handleProfileUpdate}>
      Update Profile
    </button>

    <button className="delete-articles-btn" type="button" onClick={handleDeleteArticles}>
      Delete My Previous Articles
    </button>
  </div>

</form>
      </div>
    </div>
  );
};

export default EditPro;