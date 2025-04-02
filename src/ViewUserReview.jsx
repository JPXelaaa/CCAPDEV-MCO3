import { useState, useEffect } from "react";
import ReviewForEstablishment from "./ReviewForEstablishment";
import "./UserReview.css";

function ViewUserReview({ profileUser, isReview, setIsReview }) {
  const [reviews, setReviews] = useState([]);
  const [reviewVotes, setReviewVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [allPhotos, setAllPhotos] = useState([]);
  const [userDescription, setUserDescription] = useState("");
  const [loadingDescription, setLoadingDescription] = useState(true);

  useEffect(() => {
    if (profileUser && profileUser._id) {
      fetchUserReviews(profileUser._id);
      fetchUserDescription(profileUser._id);
    } else {
      setLoading(false);
      setLoadingDescription(false);
    }
  }, [profileUser]);

  const fetchUserDescription = async (userId) => {
    try {
      setLoadingDescription(true);
      const response = await fetch(`http://localhost:5000/api/users/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }
      
      const userData = await response.json();
      setUserDescription(userData.user?.description || "");
      setLoadingDescription(false);
    } catch (err) {
      console.error('Error fetching user description:', err);
      setLoadingDescription(false);
    }
  };

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
              photoIndex: photoIndex
            });
          });
        }
      });
      setAllPhotos(extractedPhotos);
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
      setReviews(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user reviews:', err);
      setError('Failed to load reviews. Please try again later.');
      setLoading(false);
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

  // Handle opening photo modal
  const openPhotoModal = (photoIndex) => {
    setSelectedPhoto(photoIndex);
  };

  // Handle closing photo modal
  const closePhotoModal = () => {
    setSelectedPhoto(null);
  };

  const getPhotoUrl = (photo, reviewId, index) => {
    if (reviewId) {
      return `http://localhost:5000/api/images/review/${reviewId}/photo/${index}`;
    }
    
    // Fallback to direct object ID if available
    if (photo && typeof photo === 'object' && photo._id) {
      return `http://localhost:5000/api/reviews/photo/${photo._id}`;
    }
    
    // Last resort: direct path
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
            src={getPhotoUrl(currentPhoto.photo, currentPhoto.reviewId, currentPhoto.photoIndex)} 
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

  return (
    <div className="review-body">
      <div className="left-profile-body">
        <h3 style={{ fontSize: "22px", fontWeight: "600" }}>About Me</h3>
        <div className="about-section">
          <div className="review-text">
            {loadingDescription ? (
              <p>Loading description...</p>
            ) : (
              userDescription || "No description available."
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
                  {/* No edit/delete buttons in view-only mode */}
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
                  currentUser={null}  // No current user in view-only context
                  isLoggedIn={false}  // Set to false to prevent voting/editing actions
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
              onClick={() => setIsReview(false)}
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
                return (
                  <div className="photo-preview" key={index} onClick={() => openPhotoModal(index)}>
                    <img
                      src={getPhotoUrl(photoObj.photo, photoObj.reviewId, photoObj.photoIndex)}
                      className="actual-photo"
                      alt={`Review photo ${index + 1}`}
                      onError={(e) => { 
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
    </div>
  );
}

export default ViewUserReview;