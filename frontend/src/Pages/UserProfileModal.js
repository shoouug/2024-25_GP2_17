import React from 'react';
import './UserProfileModal.css'; 

const UserProfileModal = ({ userData, onClose }) => {
  if (!userData) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>{formData.title ? `${formData.title} ` : ''}{formData.firstName} {formData.lastName}</h2>
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>Affiliation:</strong> {userData.affiliation}</p>
        <p><strong>Country:</strong> {userData.country}</p>
        <button className="edit-profile-btn" onClick={() => alert('Edit Profile clicked')}>Edit Profile</button>
      </div>
    </div>
  );
};

export default UserProfileModal;
