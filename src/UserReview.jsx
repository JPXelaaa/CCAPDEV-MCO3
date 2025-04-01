import { useState, useEffect } from "react";
import ReviewForEstablishment from "./ReviewForEstablishment";
import "./UserReview.css";

function UserReview({ isLoggedIn, setIsLoggedIn, setShowLogin, user, setUser, isReview, setIsReview }) {
  const [reviews, setReviews] = useState([]);
  const [reviewVotes, setReviewVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [allPhotos, setAllPhotos] = useState([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState([]);
  const [editFormData, setEditFormData] = useState({
    title: "",
    body: "",
    rating: 0,
    photos: []
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

  // Extract and prepare all photos
  useEffect(() => {
    if (reviews && reviews.length > 0) {
      const extractedPhotos = [];
      reviews.forEach(review => {
        if (review.photos && review.photos.length > 0) {
          review.photos.forEach(photo => {
            extractedPhotos.push({
              photo: photo,
              reviewId: review._id
            });
          });
        }
      });
      setAllPhotos(extractedPhotos);
      console.log("Extracted photos:", extractedPhotos);
    }
  }, [reviews]);

  const fetchUserReviews = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/reviews/user/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      
      const data = await response.json();
      console.log("Fetched reviews:", data);
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
      rating: review.rating,
      photos: review.photos || []
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

        const { logo, ...updatedData } = editFormData;

        const response = await fetch(`http://localhost:5000/api/reviews/${editingReview._id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: token
            },
            body: JSON.stringify(updatedData),
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
  const confirmDelete = (id) => {
    setReviewToDelete(id);
    setShowDeleteConfirmation(true);
  };
  
  const deleteReview = async () => {
    if (!reviewToDelete) return;
    
    if (!user || !user._id) {
      setError('You must be logged in to delete a review');
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        setShowLogin(true);
        return;
      }
  
      const response = await fetch(`http://localhost:5000/api/reviews/${reviewToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete review');
      }
  
      // Remove deleted review from state
      setReviews(reviews.filter(review => review._id !== reviewToDelete));
      setShowDeleteConfirmation(false);
      setReviewToDelete(null);
    } catch (err) {
      console.error('Error deleting review:', err);
      setError('Failed to delete review. Please try again.');
    }
  };
  
  // function to cancel the delete operation
  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setReviewToDelete(null);
  };
  
  // render the confirmation dialog
  const renderDeleteConfirmation = () => {
    if (!showDeleteConfirmation) return null;
  
    return (
      <div className="delete-confirmation-modal">
        <div className="delete-confirmation-content">
          <p>Are you sure you want to delete this review?</p>
          <div className="confirmation-buttons">
            <button onClick={deleteReview} className="yes-btn">Yes</button>
            <button onClick={cancelDelete} className="no-btn">No</button>
          </div>
        </div>
      </div>
    );
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

  // Handle opening photo modal
  const openPhotoModal = (photoIndex) => {
    setSelectedPhoto(photoIndex);
  };

  // Handle closing photo modal
  const closePhotoModal = () => {
    setSelectedPhoto(null);
  };

  // Function to get photo URL - directly copying approach from ReviewForEstablishment
  const getPhotoUrl = (photo) => {
    return `http://localhost:5000/uploads/${photo}`;
  };

  // Render photo modal
  const renderPhotoModal = () => {
    if (selectedPhoto === null || allPhotos.length === 0) return null;
    
    const currentPhoto = allPhotos[selectedPhoto];
    
    return (
      <div className="photo-modal-overlay" onClick={closePhotoModal}>
        <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="close-modal" onClick={closePhotoModal}>×</button>
          <img 
            src={getPhotoUrl(currentPhoto.photo)} 
            alt={`Review Photo ${selectedPhoto + 1}`}
            className="modal-photo"
            onError={(e) => { 
              e.target.src = "https://via.placeholder.com/150"; // Fallback image
            }}
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
            {selectedPhoto < allPhotos.length - 1 && (
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
    );
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Limit to 5 photos
    const newFiles = files.slice(0, 5 - photoFiles.length);
    if (newFiles.length === 0) {
      alert("You can only upload a maximum of 5 photos.");
      return;
    }
    
    // Create preview URLs for the selected photos
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    
    setPhotoFiles(prev => [...prev, ...newFiles]);
    setPhotoPreviewUrls(prev => [...prev, ...newPreviewUrls]);
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
            
            <div className="col-md-6">
            <label>Rating:</label>
              <div className="rating-card p-4">
                  <div className="star-rating animated-stars">
                      <input type="radio" id="star5" name="rating" value="5" onClick={() => handleRatingChange(5)}/>
                      <label htmlFor="star5" className="bi bi-star-fill"></label>
                      <input type="radio" id="star4" name="rating" value="4" onClick={() => handleRatingChange(4)}/>
                      <label htmlFor="star4" className="bi bi-star-fill"></label>
                      <input type="radio" id="star3" name="rating" value="3" onClick={() => handleRatingChange(3)}/>
                      <label htmlFor="star3" className="bi bi-star-fill"></label>
                      <input type="radio" id="star2" name="rating" value="2" onClick={() => handleRatingChange(2)}/>
                      <label htmlFor="star2" className="bi bi-star-fill"></label>
                      <input type="radio" id="star1" name="rating" value="1" onClick={() => handleRatingChange(1)}/>
                      <label htmlFor="star1" className="bi bi-star-fill"></label>
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

            <div className="form-group">
              <label>Photos (optional):</label>
              <div className="photo-upload">
                <input 
                  type="file" 
                  id="photos" 
                  onChange={handlePhotoUpload} 
                  multiple 
                  accept="image/*" 
                  style={{ display: 'none' }}
                />
                <label htmlFor="photos" className="upload-button" id="upload-btn">
                  Add Photos
                </label>
                <span className="photo-limit">
                  {editFormData.photos.length}/5 photos
                </span>
              </div>

              {editFormData.photos.length > 0 && (
              <div className="photo-previews">
                {editFormData.photos.map((url, index) => (
                  <div key={index} className="photo-preview">
                    <img src={url} alt={`Preview ${index + 1}`} />
                    <button 
                      type="button" 
                      className="remove-photo" 
                      onClick={() => removeElement(editFormData.photos, index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
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

  // Console logs for debugging
  console.log("All photos array:", allPhotos);
  console.log("Reviews with photos:", reviews.filter(r => r.photos && r.photos.length > 0));

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
                      onClick={() => confirmDelete(review._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {/* Force photos array to be an array even if null/undefined */}
                <ReviewForEstablishment 
                      reviewId={review._id}
                      user={review.user}  
                      username={review.user?.username || "Unknown User"}  
                      userAvatar={review.user?.avatar}  
                      date={formatDate(review.createdAt)}
                      title={review.title}
                      rating={review.rating}
                      reviewText={review.body}
                      photos={review.photos || []}
                      photoUrls={review.photoUrls || []}
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
            ) : allPhotos.length > 0 ? (
              allPhotos.slice(0, 6).map((photoObj, index) => (
                <div className="photo-preview" key={index} onClick={() => openPhotoModal(index)}>
                  <img 
                    src={getPhotoUrl(photoObj.photo)} 
                    className="actual-photo"
                    alt={`Review photo ${index + 1}`}
                    onError={(e) => { 
                      console.log("Image failed to load:", photoObj.photo);
                      e.target.src = "https://static.vecteezy.com/system/resources/previews/022/014/063/original/missing-picture-page-for-website-design-or-mobile-app-design-no-image-available-icon-vector.jpg"; // Fallback image
                    }}
                  />
                </div>
              ))
            ) : (
              <p>No photos available.</p>
            )}
          </div>
        </div>
      </div>
      
      {renderPhotoModal()}
      {renderDeleteConfirmation()}
      {renderEditForm()}
    </div>
  );
}

export default UserReview;