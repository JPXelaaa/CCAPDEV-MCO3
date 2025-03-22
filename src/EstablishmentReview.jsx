import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import ReviewForEstablishment from "./ReviewForEstablishment";
import "./EstablishmentReview.css";

function EstablishmentReview({ establishmentId: propEstablishmentId, isLoggedIn, setIsLoggedIn, setShowLogin, user, setUser, preview = false }) {
  const { establishmentId: paramEstablishmentId } = useParams();
  const establishmentId = propEstablishmentId || paramEstablishmentId;
  
  const [reviews, setReviews] = useState([]);
  const [reviewVotes, setReviewVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedKeywords, setSelectedKeywords] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [selectedSort, setSelectedSort] = useState("Recent"); 

  useEffect(() => {
    if (establishmentId) {
      fetchReviews();
    }
  }, [establishmentId]);

  useEffect(() => {
    // Fetch user's votes for each review if user is logged in
    if (isLoggedIn && user && reviews.length > 0) {
      fetchUserVotes();
    }
  }, [isLoggedIn, user, reviews]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // If we have an establishmentId from the URL params, use it to fetch specific reviews
      const url = establishmentId 
        ? `http://localhost:5000/api/reviews/establishment/${establishmentId}`
        : `http://localhost:5000/api/reviews`;
      
      const response = await fetch(url);
      
      if (!response.ok) throw new Error("Failed to fetch reviews");

      const data = await response.json();
      setReviews(data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Failed to load reviews. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserVotes = async () => {
    if (!isLoggedIn || !user) return;
/*
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const votes = {};

      
      // For each review, fetch the user's vote
      for (const review of reviews) {
        try {
          const response = await fetch(`http://localhost:5000/api/reviews/${review._id}/vote`, {
            headers: {
              'Authorization': `Bearer ${token}`
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
      */
  };
 
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter and sort reviews based on selection
  const filteredReviews = reviews
    .filter(review => {
      if (selectedKeywords === "With photos") return review.photos?.length > 0;
      if (selectedKeywords === "Positive Rating") return review.rating >= 4;
      if (selectedKeywords === "Good Service") return review.body.toLowerCase().includes("service");
      return true;
    })
    .sort((a, b) => {
      if (selectedSort === "Recent") return new Date(b.createdAt) - new Date(a.createdAt);
      if (selectedSort === "Rating: High to Low") return b.rating - a.rating;
      if (selectedSort === "Rating: Low to High") return a.rating - b.rating;
      if (selectedSort === "Most Helpful") return b.helpful - a.helpful;
      return 0;
    })
    .filter(review => review.rating >= minRating);

  // If preview is true, only show the first 5 reviews
  const displayedReviews = preview ? filteredReviews.slice(0, 5) : filteredReviews;

  // Handle vote update
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

  return (
    <div className="profile-body">
      <div className="center-profile-body">
        {/* Review Section Title */}
        <div className="tags">
          <div className="review-header">
            <div className="title-section"> </div>
            
            {!preview && (
              <div className="filter-controls">
                <div className="filter-icons">
                  <img id="filter-picture" src="https://www.svgrepo.com/show/532165/filter-list.svg" alt="Filter" />
                  <select 
                    className="dropdown-select" 
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                  >
                    <option value="0">Filter by Stars</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars & Up</option>
                    <option value="3">3 Stars & Up</option>
                    <option value="2">2 Stars & Up</option>
                    <option value="1">1 Star & Up</option>
                  </select>
                </div>

                <div className="sort-icons">
                  <img id="sort-picture" src="https://www.svgrepo.com/show/532208/sort-amount-down.svg" alt="Sort" />
                  <select 
                    className="dropdown-select" 
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                  >
                    <option value="Recent">Recent</option>
                    <option value="Rating: High to Low">Rating: High to Low</option>
                    <option value="Rating: Low to High">Rating: Low to High</option>
                    <option value="Most Helpful">Most Helpful</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          {!preview && (
            <div className="tags-container">
              {["With photos", "Positive Rating", "Good Service"].map((keyword) => (
                <div 
                  className={`rectangle ${selectedKeywords === keyword ? 'active' : ''}`} 
                  key={keyword} 
                  onClick={() => setSelectedKeywords(prev => prev === keyword ? "" : keyword)}
                >
                  <p id="tag-text">{keyword}</p>
                  {selectedKeywords === keyword && (
                    <img 
                      id="x-btn" 
                      src="https://www.svgrepo.com/show/522388/close.svg" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedKeywords("");
                      }} 
                      alt="Clear filter"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          {!preview && (
            <div className="reviews-container">
              {loading ? (
                <p className="loading-message">Loading reviews...</p>
              ) : error ? (
                <p className="error-message">{error}</p>
              ) : displayedReviews.length > 0 ? (
                displayedReviews.map((review) => (
                  <ReviewForEstablishment
                    key={review._id}
                    reviewId={review._id}
                    username={review.user.username}
                    user={user}
                    userAvatar={review.user.avatar}
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
                ))
              ) : (
                <p className="no-reviews-message">
                  No reviews available. 
                  
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EstablishmentReview;
