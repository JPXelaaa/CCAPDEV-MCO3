import "./Review.css";
import Rating from './Rating';
import { Link } from "react-router-dom";
import { useState, useCallback } from "react";
import ImageModal from './ImageModal'; //import for click image modal

function Review({ 
  id, 
  isLoggedIn, 
  setIsLoggedIn,
  setShowLogin,
  setUser,
  user,
  username, 
  date, 
  establishment, 
  title, 
  review, 
  rating = 5, 
  photoUrls = [], // Use only photoUrls from the server
  onDelete, 
  preview,
  viewOnly = false // New prop with default value
}) {
  const [helpful, setHelpful] = useState(false);
  const [unhelpful, setUnhelpful] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [currentPhoto, setCurrentPhoto] = useState(""); 

  const handleHelpfulClick = useCallback(() => {
    setHelpful((prev) => !prev);
    setUnhelpful(false); // Reset unhelpful when helpful is clicked
  }, []);

  const handleUnhelpfulClick = useCallback(() => {
    setUnhelpful((prev) => !prev);
    setHelpful(false); // Reset helpful when unhelpful is clicked
  }, []);

  const getAvatarUrl = () => {
    if (!user || !user._id) {
      return "https://i.pinimg.com/originals/6d/8b/9b/6d8b9b45c14da6fbfd09a7ede56b4a83.jpg"; // Default profile picture
    }
    return `https://ccapdevmco3.vercel.app/api/images/user/${user._id}/avatar`;
  };

  const openModal = (photoUrl) => {
    setCurrentPhoto(photoUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentPhoto(""); // Clear the current photo
  };

  return (
    <div className="past-review">
      {/* Header Section */}
      {!preview && (
        <div className="review-header">
          <div className="user-info">
            <div className="profile-picture">
              <img
                src={getAvatarUrl()} // Use the function to get the correct image
                alt="aa"
                onError={(e) => { 
                  e.target.src = "https://i.pinimg.com/originals/6d/8b/9b/6d8b9b45c14da6fbfd09a7ede56b4a83.jpg"; 
                }} // ✅ Ensure fallback works
              />
            </div>
            <h2 className="username">{username}</h2>
          </div>
          <h2 className="date-time">{date}</h2>
        </div>
      )}

      {/* Review Content */}
      <div className="rev-establishment">
        <h2 className="review-title">{title}</h2>
        <h2 className="review-establishment-name">{establishment}</h2>
        <Rating rating={rating} />
      </div>

      <div className="review-text">{review}</div>

      {/* Review Photos */}
      {photoUrls && photoUrls.length > 0 && (
        <div className="review-photo">
          {photoUrls.map((photoUrl, index) => (
            <div className="photo-entry" key={index}>
              <img 
                src={photoUrl}
                className="actual-photo" 
                alt={`Review Photo ${index + 1}`} 
                onClick={() => openModal(photoUrl)} // Open modal on click
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal for Bigger Image */}
      {isModalOpen && <ImageModal photoUrl={currentPhoto} onClose={closeModal} />}

      {/* Review Footer */}
      {!preview && (
        <div className="review-footer">
          {isLoggedIn && user && !viewOnly ? (
            <>
              <Link to="/review" state={{ isEdit: true, reviewId: id, reviewContent: { title, review, rating, establishment } }}>
                <div className="edit-post">
                  <img src="https://www.svgrepo.com/show/511909/edit-cover-1481.svg" alt="Edit" />
                  Edit Post
                </div>
              </Link>
              <button className="delete-box" onClick={() => onDelete(id)}>
                <div className="delete-post">
                  <img src="https://www.svgrepo.com/show/511788/delete-1487.svg" alt="Delete" />
                  Delete Post
                </div>
              </button>
            </>
          ) : (
            <>
              <button
                id="helpful"
                className={helpful ? "selected" : ""}
                onClick={handleHelpfulClick}
              >
                <img src="https://www.svgrepo.com/show/522577/like.svg" alt="Helpful Icon" />
                Helpful ({helpful ? 1 : 0})
              </button>
              <button
                id="unhelpful"
                className={unhelpful ? "selected" : ""}
                onClick={handleUnhelpfulClick}
              >
                <img src="https://www.svgrepo.com/show/522518/dislike.svg" alt="Unhelpful Icon" />
                Unhelpful ({unhelpful ? 1 : 0})
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Review;