import "./Review.css";
import Rating from './Rating'
import { Link } from "react-router-dom";
import { useState, useCallback } from "react";

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
  photos = [], 
  onDelete, 
  preview 
}) {
  const [helpful, setHelpful] = useState(false);
  const [unhelpful, setUnhelpful] = useState(false);

  const handleHelpfulClick = useCallback(() => {
    setHelpful((prev) => !prev);
    setUnhelpful(false); // Reset unhelpful when helpful is clicked
  }, []);

  const handleUnhelpfulClick = useCallback(() => {
    setUnhelpful((prev) => !prev);
    setHelpful(false); // Reset helpful when unhelpful is clicked
  }, []);

  return (
    <div className="past-review">
      {/* Header Section */}
      {!preview && (
        <div className="review-header">
          <div className="user-info">
            <div className="profile-picture">
              <img
                src={user?.avatar ? `http://localhost:5000/uploads/${user.avatar}` : "https://i.pinimg.com/originals/6d/8b/9b/6d8b9b45c14da6fbfd09a7ede56b4a83.jpg"}
                alt="User Profile"
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
      {photos && photos.length > 0 && (
        <div className="review-photo">
          {photos.map((photo, index) => (
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

      {/* Review Footer */}
      {!preview && (
        <div className="review-footer">
          {isLoggedIn && user ? (
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
