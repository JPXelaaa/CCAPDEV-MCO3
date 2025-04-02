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
  const [photoFiles, setPhotoFiles] = useState([]); 
  const [editFormData, setEditFormData] = useState({
    title: "",
    body: "",
    rating: 0,
    photos: []
  });
  const [userDescription, setUserDescription] = useState("");
  const [loadingDescription, setLoadingDescription] = useState(true);

  useEffect(() => {
    if (user && user._id) {
      fetchUserReviews(user._id);
      fetchUserDescription(user._id);
    } else {
      setLoading(false);
      setLoadingDescription(false);
    }
  }, [user]);

  const fetchUserDescription = async (userId) => {
    try {
      setLoadingDescription(true);
      console.log("entering here:")
      const response = await fetch(`http://localhost:5000/api/users/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }
      
      const userData = await response.json();
      console.log('printing:', userData);
      setUserDescription(userData.description || "");
      console.log('new user description: ',userDescription)
      setLoadingDescription(false);
    } catch (err) {
      console.error('Error fetching user description:', err);
      setLoadingDescription(false);
    }
  };

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
          review.photos.forEach((photo, photoIndex) => {
            extractedPhotos.push({
              photo: photo,
              reviewId: review._id,
              photoIndex: photoIndex // Store the original index
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
    console.log("Starting edit for review:", review);
    console.log("Review photos:", review.photos);
    
    // Make sure we have a valid photos array
    const photoArray = Array.isArray(review.photos) ? review.photos : [];
    console.log("Initialized photo array:", photoArray);
    
    setEditFormData({
      title: review.title,
      body: review.body,
      rating: review.rating,
      photos: photoArray
    });
    
    setPhotoFiles([]);
    setPhotoPreviewUrls([]);
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
      console.log("Starting to save edited review with photos:", editFormData.photos);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Authentication required");
        setShowLogin(true);
        return;
      }
  
      // Create FormData object to handle file uploads
      const formData = new FormData();
      formData.append("title", editFormData.title);
      formData.append("body", editFormData.body);
      formData.append("rating", editFormData.rating);

        // In saveEditedReview function
        if (editFormData.photos && editFormData.photos.length > 0) {
          // Create a string representation of each photo ID/path
          const photoValues = editFormData.photos.map(photo => {
            if (typeof photo === 'string') return photo;
            if (photo && photo._id) return photo._id;
            return JSON.stringify(photo);
          }).filter(val => val && val !== '{}' && val !== 'null');
          
          // Add each photo value as a separate item
          photoValues.forEach(photoValue => {
            formData.append("existingPhotos", photoValue);
          });
          
          console.log("Photo values being sent:", photoValues);
        }
            
      // Add new photo files
      if (photoFiles && photoFiles.length > 0) {
        console.log("Adding new photo files to form data:", photoFiles.length, "files");
        photoFiles.forEach((file, idx) => {
          console.log(`Adding new photo file ${idx}:`, file.name);
          formData.append("photos", file);
        });
      }
  
      console.log("Sending request to update review ID:", editingReview._id);
      
      const response = await fetch(`http://localhost:5000/api/reviews/${editingReview._id}`, {
        method: "PUT",
        headers: {
          Authorization: token
        },
        body: formData,
      });
  
      // Log response status
      console.log("Update response status:", response.status);
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from server:", errorData);
        throw new Error(errorData?.message || "Failed to update review");
      }
  
      const updatedReview = await response.json();
      console.log("Review updated successfully:", updatedReview);
      
      // Update the reviews state with the updated review
      setReviews((prev) =>
        prev.map((review) =>
          review._id === editingReview._id ? updatedReview : review
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
    setEditFormData({ title: "", body: "", rating: 0, photos: [] });
    setPhotoFiles([]);
    setPhotoPreviewUrls([]);
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

  const getPhotoUrl = (photo, index) => {
    if (editingReview && editingReview._id) {
      return `http://localhost:5000/api/images/review/${editingReview._id}/photo/${index}`;
    }
    
    // Fallback to direct object ID if available
    if (photo && typeof photo === 'object' && photo._id) {
      return `http://localhost:5000/api/reviews/photo/${photo._id}`;
    }
    
    // Last resort: direct path
    return `http://localhost:5000/uploads/${photo}`;
  };
  // Photo management functions

  // Handle photo upload for editing a review
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Calculate how many more photos we can add (max 5 total)
    const currentPhotoCount = editFormData.photos.length;
    const maxNewPhotos = 5 - currentPhotoCount;
    
    if (maxNewPhotos <= 0) {
      alert("You can only upload a maximum of 5 photos total.");
      return;
    }
    
    // Limit to max allowed new photos
    const newFiles = files.slice(0, maxNewPhotos);
    
    // Create preview URLs for the selected photos
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    
    setPhotoFiles(prev => [...prev, ...newFiles]);
    setPhotoPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  // Remove a photo preview
  const removePhotoPreview = (index) => {
    // Release the object URL to avoid memory leaks
    URL.revokeObjectURL(photoPreviewUrls[index]);
    
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

// First, make sure you're properly debugging what's in the photos array
useEffect(() => {
  console.log("EditFormData photos changed:", editFormData.photos);
}, [editFormData.photos]);

// Replace your handleDeletePhoto function with this:
const handleDeletePhoto = async (photoIndex) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Authentication required");
      setShowLogin(true);
      return;
    }
    
    console.log("Deleting photo at index:", photoIndex);
    
    // Call the dedicated API endpoint for photo deletion
    const response = await fetch(
      `http://localhost:5000/api/reviews/${editingReview._id}/photos/${photoIndex}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': token
        }
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete photo');
    }
    
    const result = await response.json();
    
    // Update the form data with the new photos array from the server
    setEditFormData(prevState => ({
      ...prevState,
      photos: result.photos
    }));
    
    console.log("Photo deleted successfully");
  } catch (err) {
    console.error("Error deleting photo:", err);
    setError(`Failed to delete photo: ${err.message}`);
  }
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
                  <input 
                    type="radio" 
                    id="star5" 
                    name="rating" 
                    value="5" 
                    checked={editFormData.rating === 5}
                    onChange={() => handleRatingChange(5)}
                  />
                  <label htmlFor="star5" className="bi bi-star-fill"></label>
                  <input 
                    type="radio" 
                    id="star4" 
                    name="rating" 
                    value="4" 
                    checked={editFormData.rating === 4}
                    onChange={() => handleRatingChange(4)}
                  />
                  <label htmlFor="star4" className="bi bi-star-fill"></label>
                  <input 
                    type="radio" 
                    id="star3" 
                    name="rating" 
                    value="3" 
                    checked={editFormData.rating === 3}
                    onChange={() => handleRatingChange(3)}
                  />
                  <label htmlFor="star3" className="bi bi-star-fill"></label>
                  <input 
                    type="radio" 
                    id="star2" 
                    name="rating" 
                    value="2" 
                    checked={editFormData.rating === 2}
                    onChange={() => handleRatingChange(2)}
                  />
                  <label htmlFor="star2" className="bi bi-star-fill"></label>
                  <input 
                    type="radio" 
                    id="star1" 
                    name="rating" 
                    value="1" 
                    checked={editFormData.rating === 1}
                    onChange={() => handleRatingChange(1)}
                  />
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

          {/* Photos Management Section - FIXED IMAGE DISPLAY */}
            <div className="photos-management-section">
            <h3>Review Photos</h3>
            {/* Current Photos Display */}
            <div className="current-photos">
              <h4>Current Photos ({editFormData.photos.length} of 5)</h4>
              {editFormData.photos.length > 0 ? (
                <div className="photos-grid">
                  {editFormData.photos.map((photo, index) => (
                    <div key={`photo-${index}`} className="photo-item">
                      <img 
                        src={getPhotoUrl(photo, index)}
                        alt={`Review photo ${index + 1}`}
                        onError={(e) => {
                          console.log("Image failed to load:", photo);
                          e.target.src = "https://static.vecteezy.com/system/resources/previews/022/014/063/original/missing-picture-page-for-website-design-or-mobile-app-design-no-image-available-icon-vector.jpg";
                        }}
                      />
                      <button 
                        type="button" 
                        className="delete-photo-btn" 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("Delete button clicked for photo at DOM index:", index);
                          console.log("Photo object at this index:", photo);
                          handleDeletePhoto(index);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="no-photos-message">No photos uploaded yet.</span>
              )}
            </div>

            {/* Upload New Photos Section */}
            <div className="upload-photos-section">
              <h4>Add New Photos ({editFormData.photos.length + photoFiles.length}/5)</h4>
              <div className="photos-upload-form">
                <input 
                  type="file" 
                  id="photos" 
                  accept="image/*" 
                  onChange={handlePhotoUpload} 
                  className="file-input" 
                  multiple 
                  disabled={editFormData.photos.length + photoFiles.length >= 5}
                />
                <label htmlFor="photos" className="file-label">
                  Choose Photos
                </label>
                <span className="help-text">
                  You can add up to {5 - editFormData.photos.length - photoFiles.length} more photos
                </span>

                {/* New Photo Previews */}
                {photoPreviewUrls.length > 0 && (
                  <div className="preview-photos-grid">
                    {photoPreviewUrls.map((url, index) => (
                      <div key={`preview-${index}`} className="photo-preview-item">
                        <img src={url} alt={`Preview ${index + 1}`} />
                        <button 
                          type="button" 
                          className="remove-preview-btn" 
                          onClick={(e) => {
                            e.preventDefault(); // Prevent form submission
                            removePhotoPreview(index);
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
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
            {loadingDescription ? (
              <p>Loading description...</p>
            ) : (
              user?.description || "No description available."
            )}
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
              allPhotos.slice(0, 6).map((photoObj, index) => {
                // Get the correct photo URL using the same logic as in getPhotoUrl function
                let photoUrl;
                if (typeof photoObj.photo === 'object' && photoObj.photo._id) {
                  photoUrl = `http://localhost:5000/api/reviews/photo/${photoObj.photo._id}`;
                } else if (photoObj.reviewId) {
                  photoUrl = `http://localhost:5000/api/images/review/${photoObj.reviewId}/photo/${photoObj.photoIndex}`;
                } else {
                  photoUrl = `http://localhost:5000/uploads/${photoObj.photo}`;
                }
                
                return (
                  <div className="photo-preview" key={index} onClick={() => openPhotoModal(index)}>
                    <img
                      src={photoUrl}
                      className="actual-photo"
                      alt={`Review photo ${index + 1}`}
                      onError={(e) => { 
                        console.log("Image failed to load:", photoObj);
                        e.target.src = "https://static.vecteezy.com/system/resources/previews/022/014/063/original/missing-picture-page-for-website-design-or-mobile-app-design-no-image-available-icon-vector.jpg"; 
                      }}
                    />
                  </div>
                );
              })
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