import "./ReviewForEstablishment.css";
import Rating from './Rating';
import ReviewReply from './ReviewReply';
import { useState, useEffect } from "react";

function ReviewForEstablishment({ 
  reviewId,
  username, 
  userAvatar,
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

  // This function will help debug the current user's state
  const debugUserState = () => {
    console.log("Current user state:", {
      isLoggedIn,
      currentUser,
      token: localStorage.getItem('token') ? "Token exists" : "No token found",
    });
  };

  // Handle reply text changes
  const handleReplyChange = (e) => {
    setReply(e.target.value);
  };
  
  // Handle reply submission from ReviewReply component
  const handleReplySubmitted = (newReply) => {
    console.log("Reply submitted from ReviewReply component:", newReply);
    // Create a temporary reply object if the server response is incomplete
    const replyToAdd = newReply.content ? newReply : {
      content: typeof newReply === 'string' ? newReply : "Establishment response",
      createdAt: new Date().toISOString()
    };
    
    setReplies(prev => ({
      ...prev,
      [reviewId]: [...(prev[reviewId] || []), replyToAdd]
    }));
    setShowReplyForm(false);
  };

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}/replies`);
        if (response.ok) {
          const data = await response.json();
          setReplies(prev => ({
            ...prev,
            [reviewId]: data
          }));
        } else {
          // Handle the 404 gracefully
          console.log(`No replies found for review ${reviewId}`);
          // Initialize with empty array to prevent repeated fetch attempts
          setReplies(prev => ({
            ...prev,
            [reviewId]: []
          }));
        }
      } catch (error) {
        console.error('Error fetching replies:', error);
        // Initialize with empty array on error
        setReplies(prev => ({
          ...prev,
          [reviewId]: []
        }));
      }
    };
  
    fetchReplies();
  }, [reviewId]);

  // Local storage functionality (renamed from addLocalReply)
  const handleReplySubmit = () => {
    if (!reply.trim()) return;
    
    const localReply = {
      content: reply,
      createdAt: new Date().toISOString(),
      isLocalOnly: true // Mark as locally created
    };
    
    setReplies(prev => ({
      ...prev,
      [reviewId]: [...(prev[reviewId] || []), localReply]
    }));
    
    setReply("");
    setShowReplyBox(false);
    setShowReplies(prev => ({
      ...prev,
      [reviewId]: true
    }));
  };

  return (
    <div className="rec-review">
      {/* Review Header*/}
      <div className="review-header">
        <div className="user-info">
          <div className="profile-picture">
            <img
              src={userAvatar ? `http://localhost:5000/uploads/${userAvatar}` : "https://i.pinimg.com/originals/6d/8b/9b/6d8b9b45c14da6fbfd09a7ede56b4a83.jpg"}
              alt="User Profile"
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

      {/* Review Photos */}
      {photos && photos.length > 0 && (
        <div className="review-photo">
          {photos.slice(0, type === "view" ? 2 : photos.length).map((photo, index) => (
            <div className="photo-entry" key={index}>
              <img 
                src={`http://localhost:5000/uploads/${photo}`} 
                className="actual-photo" 
                alt={`Review Photo ${index + 1}`} 
              />
            </div>
          ))}
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

      {/* User Reply Form */}
      {showReplyBox && isLoggedIn && (
        <div className="review-reply-form">
          <textarea
            value={reply}
            onChange={handleReplyChange}
            placeholder="Write your reply..."
            required
          />
          {replyError && <p className="error-message">{replyError}</p>}
          <div className="reply-buttons">
            <button 
              onClick={handleReplySubmit}
              disabled={isSubmitting || !reply.trim()}
              className="primary-button"
            >
              Submit Reply
            </button>
          </div>
        </div>
      )}

      {/* Establishment Reply Section */}
      {currentUser?.userType === 'establishment' && currentUser?._id === establishmentId && (
        <button
          className="reply-button"
          onClick={() => setShowReplyForm(!showReplyForm)}
        >
          Reply to Review
        </button>
      )}
      {showReplyForm && (
        <ReviewReply
          reviewId={reviewId}
          establishmentId={establishmentId}
          onReplySubmitted={handleReplySubmitted}
        />
      )}

      {replies[reviewId]?.length > 0 && (
        <div className="replies-section">
          <button
            className="reply-toggle"
            onClick={() => setShowReplies(prev => ({
              ...prev,
              [reviewId]: !prev[reviewId]
            }))}
          >
            {showReplies[reviewId] ? 'Hide Replies' : `View Replies (${replies[reviewId].length})`}
            <span className={`arrow ${showReplies[reviewId] ? 'up' : 'down'}`}>▼</span>
          </button>
          
          {showReplies[reviewId] && (
            <div className="review-replies">
              {replies[reviewId].map((reply, index) => (
                <div key={index} className={`review-reply ${reply.isLocalOnly ? 'local-reply' : ''}`}>
                  <div className="reply-header">
                    <span className="reply-author">
                      {reply.isLocalOnly ? "Your Response" : "Establishment Response"}
                    </span>
                    <span className="reply-date">
                      {new Date(reply.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="reply-content">{reply.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ReviewForEstablishment;