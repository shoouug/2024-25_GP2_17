// FeedbackModal.jsx
import React, { useState } from 'react';
import './FeedbackModal.css';
import { FaStar } from 'react-icons/fa';

export default function FeedbackModal({ onComplete }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);

  const handleStarClick = (rate) => {
    setRating(rate);
    if (rate >= 5) {
      // high satisfaction—no comment needed
      onComplete({ rating: rate, comment: '' });
    } else {
      // ask for a comment
      setShowCommentBox(true);
    }
  };

  const handleSubmit = () => {
    onComplete({ rating, comment: feedback.trim() });
  };

  return (
    <div className="feedback-modal">
      <div className="feedback-box">
        <h4>How satisfied are you with this article?</h4>
        <div className="stars">
          {[1, 2, 3, 4, 5].map(star => (
            <FaStar
              key={star}
              size={32}
              style={{ cursor: 'pointer', marginRight: 8 }}
              color={(hover || rating) >= star ? "#ffc107" : "#e4e5e9"}
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
            />
          ))}
        </div>

        {showCommentBox && (
          <div className="comment-section">
            <p>We’re sorry to hear that. How can we improve?</p>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Your suggestions..."
              rows={3}
            />
            <button
              className="submit-feedback-btn"
              onClick={handleSubmit}
              disabled={!feedback.trim()}
            >
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
