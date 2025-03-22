import "./ReviewForEstablishment.css";
import Rating from './Rating';
import ReviewReply from './ReviewReply';
import { useState, useEffect } from "react";

function ReviewForEstablishment({ 
  reviewId,
  username, 
  userAvatar,
  user,
  date, 
  title, 
  rating = 5, 
  reviewText, 
  photos = [], 
  currentUser,
  isLoggedIn,
  type = "interactive",
  establishmentId
}) { 
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [reply, setReply] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState({});
  const [replies, setReplies] = useState({});
  const [replyError, setReplyError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Function to get the correct avatar URL
  const getAvatarUrl = () => {
    if (!user) {
      return "https://i.pinimg.com/originals/6d/8b/9b/6d8b9b45c14da6fbfd09a7ede56b4a83.jpg"; // Default profile picture
    }
    return `http://localhost:5000/api/images/user/${user._id}/avatar`;
  };

  const getPhotoUrl = (index) => {
    return `http://localhost:5000/api/images/review/${reviewId}/photo/${index}`;
  };

  // Handle opening photo modal
  const openPhotoModal = (index) => {
    setSelectedPhoto(index);
  };

  // Handle closing photo modal
  const closePhotoModal = () => {
    setSelectedPhoto(null);
  };

  return (
    <div className="rec-review">
      {/* Review Header */}
      <div className="review-header">
        <div className="user-info">
          <div className="profile-picture">
            <img
              src={getAvatarUrl()} // ✅ Uses the function for avatar logic
              alt="User Profile"
              onError={(e) => { 
                e.target.src = "https://i.pinimg.com/originals/6d/8b/9b/6d8b9b45c14da6fbfd09a7ede56b4a83.jpg"; 
              }}
            />
          </div>
          <p className="username">{username}</p>
        </div>
        <p className="date-time">{date}</p>
      </div>

      {/* Review Title */}
      <div className="review-establishment">
        <p id="title">{title}</p>
      </div>

      {/* Star Rating */}
      <div className="overall-rev">
        <Rating rating={rating} />
      </div>

      {/* Review Text */}
      <div className="review-text">
        {type === "view" ? (reviewText.length > 100 ? reviewText.substring(0,100) + "..." : reviewText) : reviewText}
      </div>

      {/* Review Photos - Updated for binary data */}
      {photos && photos.length > 0 && (
        <div className="review-photo">
          {photos.slice(0, type === "view" ? 2 : photos.length).map((photo, index) => (
            <div className="photo-entry" key={index} onClick={() => openPhotoModal(index)}>
              <img 
                src={getPhotoUrl(index)} 
                className="actual-photo" 
                alt={`Review Photo ${index + 1}`} 
                onError={(e) => { 
                  e.target.src = "https://via.placeholder.com/150"; // Fallback image
                }}
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Photo Modal */}
      {selectedPhoto !== null && (
      <div className="photo-modal-overlay" onClick={closePhotoModal}>
        <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="close-modal" onClick={closePhotoModal}>×</button>
          <img 
            src={getPhotoUrl(selectedPhoto)} 
            alt={`Review Photo ${selectedPhoto + 1}`}
            className="modal-photo"
          />
          <div className="photo-navigation">
            {selectedPhoto > 0 && (
              <button 
                className="nav-button prev" 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPhoto(selectedPhoto - 1);
                }}
              >
                ‹
              </button>
            )}
            {selectedPhoto < photos.length - 1 && (
              <button 
                className="nav-button next" 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPhoto(selectedPhoto + 1);
                }}
              >
                ›
              </button>
            )}
          </div>
        </div>
      </div>
    )}
              
      {/* Review Footer (Reply only) */}
      <div className="review-footer">
        <div className="footer-content">
          {isLoggedIn && (
            <p className="rep-text" onClick={() => setShowReplyBox((prev) => !prev)}>
              Reply
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReviewForEstablishment;
