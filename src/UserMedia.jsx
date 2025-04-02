import { useState, useEffect } from "react";
import Review from "./Review";
import "./UserReview.css";

function UserMedia({ isLoggedIn, setIsLoggedIn, setShowLogin, user, setUser, isReview, setIsReview }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    // only fetch reviews if we have a user
    if (user && user._id) {
      fetchUserReviews(user._id);
    } else {
      setLoading(false);
    }
  }, [user]);

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
          photoIndex: photoIndex, // Use the index in the photos array
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

  // Function to delete a review
  const deleteReview = async (id) => {
    if (!user || !user._id) {
      setError('You must be logged in to delete a review');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch(`https://ccapdevmco3.vercel.app/api/reviews/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      // Remove the deleted review from state
      setReviews(reviews.filter(review => review._id !== id));
      
      // Remove photos from the deleted review
      setPhotos(photos.filter(photo => photo.reviewId !== id));
    } catch (err) {
      console.error('Error deleting review:', err);
      setError('Failed to delete review. Please try again.');
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
            {user?.description || "No description available."}
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
          onClick={() => {console.log('Switching to review view'); setIsReview(true);}}
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
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
                setShowLogin={setShowLogin}
                setUser={setUser}
                user={user}
                username={user?.username || "Unknown User"}
                date={formatDate(review.createdAt)}
                establishment={review.establishment.name}
                review={review.body}
                title={review.title}
                rating={review.rating}
                photos={review.photos}
                onDelete={deleteReview}
                preview={true}
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

export default UserMedia;
