import { useState, useEffect } from "react";
import ReviewForEstablishment from "./ReviewForEstablishment";
import "./UserReview.css";

function UserReview({ isLoggedIn, setIsLoggedIn, setShowLogin, user, setUser, isReview, setIsReview }) {
  const [reviews, setReviews] = useState([]);
  const [reviewVotes, setReviewVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    body: "",
    rating: 0
  });

  useEffect(() => {
    // fetch reviews if we have a user
    if (user && user._id) {
      fetchUserReviews(user._id);
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // fetch user's votes for each review if user is logged in
    if (isLoggedIn && user && reviews.length > 0) {
      fetchUserVotes();
    }
  }, [isLoggedIn, user, reviews]);

  const fetchUserReviews = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/reviews/user/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      
      const data = await response.json();
      setReviews(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user reviews:', err);
      setError('Failed to load reviews. Please try again later.');
      setLoading(false);
    }
  };

  const fetchUserVotes = async () => {
    if (!isLoggedIn || !user) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const votes = {};

      // for each review, fetch the user's vote
      for (const review of reviews) {
        try {
          const response = await fetch(`http://localhost:5000/api/reviews/${review._id}/vote`, {
            headers: {
              'Authorization': token
            }
          });

          if (response.ok) {
            const data = await response.json();
            votes[review._id] = data.userVote;
          }
        } catch (err) {
          console.error(`Error fetching vote for review ${review._id}:`, err);
        }
      }

      setReviewVotes(votes);
    } catch (err) {
      console.error("Error fetching user votes:", err);
    }
  };

  const editReview = (review) => {
    setEditingReview(review);
    setEditFormData({
      title: review.title,
      body: review.body,
      rating: review.rating
    });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  // Handle star rating change
  const handleRatingChange = (newRating) => {
    setEditFormData({
      ...editFormData,
      rating: newRating
    });
  };

  // Save edited review
  const saveEditedReview = async (e) => {
    e.preventDefault();
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            setError("Authentication required");
            setShowLogin(true);
            return;
        }

        const { logo, ...updatedData } = editFormData; // exclude logo field in frontend

        const response = await fetch(`http://localhost:5000/api/reviews/${editingReview._id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: token
            },
            body: JSON.stringify(updatedData), // now 'logo' is not sent
        });

        console.log("Response status:", response.status);

        const responseText = await response.text();
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (error) {
            console.error("Invalid JSON response from server:", responseText);
            throw new Error("Invalid response format");
        }

        console.log("Server response:", responseData);

        if (!response.ok) {
            throw new Error(responseData?.message || "Failed to update review");
        }

        setReviews((prev) =>
            prev.map((review) =>
                review._id === editingReview._id ? { ...review, ...updatedData } : review
            )
        );

        cancelEdit();
    } catch (err) {
        console.error("Error updating review:", err);
        setError(`Failed to update review: ${err.message}`);
    }
};

  // function to cancel editing
  const cancelEdit = () => {
    setEditingReview(null);
    setEditFormData({ title: "", body: "", rating: 0 });
  };

  // function to delete a review
  const deleteReview = async (id) => {
    if (!user || !user._id) {
      setError('You must be logged in to delete a review');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        setShowLogin(true); // show login dialog if not authenticated
        return;
      }

      const response = await fetch(`http://localhost:5000/api/reviews/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      // remove deleted reviews from state
      setReviews(reviews.filter(review => review._id !== id));
    } catch (err) {
      console.error('Error deleting review:', err);
      setError('Failed to delete review. Please try again.');
    }
  };

  // format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // handle vote update
  const handleVoteUpdate = (reviewId, helpful, unhelpful, userVote) => {
    setReviews(prevReviews => 
      prevReviews.map(review => 
        review._id === reviewId 
          ? { ...review, helpful, unhelpful } 
          : review
      )
    );
    
    setReviewVotes(prev => ({
      ...prev,
      [reviewId]: userVote
    }));
  };

  // render the edit form
  const renderEditForm = () => {
    if (!editingReview) return null;

    return (
      <div className="edit-review-modal">
        <div className="edit-review-content">
          <h3>Edit Review for {editingReview.establishment.name}</h3>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={saveEditedReview}>
            <div className="form-group">
              <label>Title:</label>
              <input
                type="text"
                name="title"
                value={editFormData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div class="col-md-6">
            <label>Rating:</label>
              <div class="rating-card p-4">
                  <div class="star-rating animated-stars">
                      <input type="radio" id="star5" name="rating" value="5" onClick={() => handleRatingChange(5)}/>
                      <label for="star5" class="bi bi-star-fill"></label>
                      <input type="radio" id="star4" name="rating" value="4" onClick={() => handleRatingChange(4)}/>
                      <label for="star4" class="bi bi-star-fill"></label>
                      <input type="radio" id="star3" name="rating" value="3" onClick={() => handleRatingChange(3)}/>
                      <label for="star3" class="bi bi-star-fill"></label>
                      <input type="radio" id="star2" name="rating" value="2" onClick={() => handleRatingChange(2)}/>
                      <label for="star2" class="bi bi-star-fill"></label>
                      <input type="radio" id="star1" name="rating" value="1" onClick={() => handleRatingChange(1)}/>
                      <label for="star1" class="bi bi-star-fill"></label>
                  </div>
              </div>
          </div>
            
            <div className="form-group">
              <label>Review:</label>
              <textarea
                name="body"
                value={editFormData.body}
                onChange={handleInputChange}
                required
                rows="5"
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="save-btn">Save Changes</button>
              <button type="button" className="cancel-btn" onClick={cancelEdit}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="review-body">
      <div className="left-profile-body">
        <h3 style={{ fontSize: "22px", fontWeight: "600" }}>About Me</h3>
        <div className="about-section">
          <div className="review-text">
            {user?.description || "No description available."}
          </div>
        </div>
      </div>
      <div className="center-profile-body">
        <h3 style={{ fontSize: "22px", fontWeight: "600" }}>Past Review(s)</h3>
        <div>
          {loading ? (
            <p>Loading reviews...</p>
          ) : error ? (
            <p>{error}</p>
          ) : reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review._id} className="user-review-container">
                <div className="review-establishment-name">
                  <h4>Review for: {review.establishment.name}</h4>
                  <div>
                    <button 
                      className="edit-review-btn" 
                      onClick={() => editReview(review)}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-review-btn" 
                      onClick={() => deleteReview(review._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <ReviewForEstablishment 
                  reviewId={review._id}
                  username={user?.username || "Unknown User"}
                  userAvatar={user?.avatar}
                  date={formatDate(review.createdAt)}
                  title={review.title}
                  rating={review.rating}
                  reviewText={review.body}
                  photos={review.photos}
                  helpful={review.helpful}
                  unhelpful={review.unhelpful}
                  currentUser={user}
                  isLoggedIn={isLoggedIn}
                  userVote={reviewVotes[review._id] || null}
                  onVoteUpdate={handleVoteUpdate}
                />
              </div>
            ))
          ) : (
            <p>No reviews available.</p>
          )}
        </div>
      </div>
      <div className="right-profile-body">
        <h3 style={{ fontSize: "22px", fontWeight: "600" }}>Media</h3>
        <div className="about-section">
          <div className="right-header">
            <h4 style={{ fontSize: "18px", fontWeight: "600" }} id="photos-label">Photos</h4>
            <h4 
              style={{ fontSize: "18px", fontWeight: "600", color: "gray" }} 
              id="see-all-label" 
              onClick={() => {console.log('Switching to media view'); setIsReview(false);}}
            >
              See all
            </h4>
          </div>
          <div className="photos-section">
            {loading ? (
              <p>Loading photos...</p>
            ) : error ? (
              <p>{error}</p>
            ) : reviews.length > 0 ? (
      
              reviews
                .flatMap(review => review.photos || [])
                .slice(0, 5) // only first five will be shown
                .map((photo, index) => (
                  <div className="photo-preview" key={index}>
                    <img 
                      src={`http://localhost:5000/uploads/${photo}`} 
                      className="actual-photo"
                      alt={`Review photo ${index + 1}`}
                    />
                  </div>
                ))
            ) : (
              <p>No photos available.</p>
            )}
          </div>
        </div>
      </div>
      
      {renderEditForm()}
    </div>
  );
}

export default UserReview;