import { useState, useEffect } from "react";
import Review from "./Review";
import "./UserReview.css";

function ViewUserMedia({ profileUser, isReview, setIsReview }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [photos, setPhotos] = useState([]);
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
      const response = await fetch(`https://ccapdevmco3.vercel.app/api/users/${userId}`);
      
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

  const fetchUserReviews = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`https://ccapdevmco3.vercel.app/api/reviews/user/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      
      const data = await response.json();
      setReviews(data);
      
      // Extract all photos from all reviews
      const allPhotos = data.flatMap((review, reviewIndex) => 
        (review.photos || []).map((photo, photoIndex) => ({
          photoIndex: photoIndex, 
          reviewId: review._id,
          establishment: review.establishment.name,
          date: review.createdAt
        }))
      );
      
      setPhotos(allPhotos);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user reviews:', err);
      setError('Failed to load reviews. Please try again later.');
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
        <h3 style={{ fontSize: "22px", fontWeight: "600" }}>Media</h3>
        <div className="rec-review">
          <div className="media-section">
            {loading ? (
              <p>Loading photos...</p>
            ) : error ? (
              <p>{error}</p>
            ) : photos.length > 0 ? (
              photos.map((photoData, index) => (
                <div className="media-preview" key={index}>
                  <img 
                    src={`https://ccapdevmco3.vercel.app/api/images/review/${photoData.reviewId}/photo/${photoData.photoIndex}`}
                    className="actual-img"
                    alt={`Photo from ${photoData.establishment}`}
                    onError={(e) => {
                      console.error("Image failed to load");
                      e.target.onerror = null; 
                      e.target.style.backgroundColor = "#cccccc";
                      e.target.style.width = "100%";
                      e.target.style.height = "100%";
                      e.target.alt = "Image unavailable";
                    }}
                  />
                  <div className="photo-info">
                    <p>{photoData.establishment}</p>
                    <p>{formatDate(photoData.date)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No photos available.</p>
            )}
          </div>
        </div>
      </div>
      <div className="right-profile-body">
        <h3 
          style={{ fontSize: '22px', fontWeight: '600', color: 'black' }} 
          id='see-all-label' 
          onClick={() => setIsReview(true)}
        > 
          See Past Review(s) 
        </h3>

        <div>
          {loading ? (
            <p>Loading reviews...</p>
          ) : error ? (
            <p>{error}</p>
          ) : reviews.length > 0 ? (
            reviews.map((review) => (
              <Review
                key={review._id}
                id={review._id}
                isLoggedIn={false} // Set to false to prevent editing actions
                username={profileUser?.username || "Unknown User"}
                date={formatDate(review.createdAt)}
                establishment={review.establishment.name}
                review={review.body}
                title={review.title}
                rating={review.rating}
                photos={review.photos}
                preview={true}
                viewOnly={true} // New prop to indicate view-only mode
              />
            ))
          ) : (
            <p>No reviews available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewUserMedia;