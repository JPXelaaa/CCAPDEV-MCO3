import "./ReviewForEstablishment.css";
import Rating from './Rating';
import { useState, useEffect } from "react";

function ReviewForEstablishment({ 
  reviewId,
  username, 
  userAvatar,
  user,
  date, 
  title, 
  rating = 5, 
  reviewText, 
  photos = [], 
  photoUrls = [],
  currentUser,
  isLoggedIn,
  type = "interactive",
  helpful, 
  unhelpful, 
  userVote = null,
  onVoteUpdate,
  footer = true,
  viewOnly = false // Added the viewOnly prop with default value
}) { 
  // Initialize with the values from props
  const [voteData, setVoteData] = useState({
    helpfulCount: helpful !== undefined ? helpful : 0,
    unhelpfulCount: unhelpful !== undefined ? unhelpful : 0,
    userVoteStatus: userVote
  });

  useEffect(() => {
    console.log('ReviewForEstablishment photos prop:', photos);
    console.log('Photos type:', Object.prototype.toString.call(photos));
    console.log('Photos length:', photos ? photos.length : 'undefined');
  }, [photos]);

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the current vote counts on component mount
  useEffect(() => {
    console.log("user: ", currentUser);
    const fetchVoteCounts = async () => {
      try {
        // Only fetch if we have a valid reviewId
        if (!reviewId) {
          setIsLoading(false);
          return;
        }
        
        // Get token if user is logged in
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': token } : {};
        
        const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}/votes`, {
          headers
        });
        
        if (response.ok) {
          const data = await response.json();

          setVoteData({
            helpfulCount: data.helpfulCount,
            unhelpfulCount: data.unhelpfulCount,
            userVoteStatus: data.userVote
          });
        } else {
          console.error('Error fetching votes:', await response.text());
          // Fall back to props if API call fails
          setVoteData({
            helpfulCount: helpful !== undefined ? helpful : 0,
            unhelpfulCount: unhelpful !== undefined ? unhelpful : 0,
            userVoteStatus: userVote
          });
        }
      } catch (error) {
        console.error('Error fetching vote counts:', error);
        // Fall back to props if API call fails
        setVoteData({
          helpfulCount: helpful !== undefined ? helpful : 0,
          unhelpfulCount: unhelpful !== undefined ? unhelpful : 0,
          userVoteStatus: userVote
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVoteCounts();
  }, [reviewId, userVote, helpful, unhelpful]);

  // Function to handle voting
  const handleVote = async (voteType) => {
    if (!isLoggedIn) return;
  
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
  
      console.log('Sending request to:', `http://localhost:5000/api/reviews/${reviewId}/vote`);
  
      const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token  
        },
        body: JSON.stringify({ vote: voteType })
      });
      console.log('Response Status:', response.status);
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Vote Submission Error:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(errorText || 'Failed to submit vote');
      }
  
      const data = await response.json();
      console.log('Vote Response Data:', data);
      
      // Update the vote state
      setVoteData({
        helpfulCount: data.helpfulCount,
        unhelpfulCount: data.unhelpfulCount,
        userVoteStatus: data.userVote
      });
      
      // Also update the parent component
      if (typeof onVoteUpdate === 'function') {
        onVoteUpdate(reviewId, data.helpfulCount, data.unhelpfulCount, data.userVote);
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  // Function to get the correct avatar URL
  const getAvatarUrl = () => {
    if (!user || !user._id) {
      return "https://i.pinimg.com/originals/6d/8b/9b/6d8b9b45c14da6fbfd09a7ede56b4a83.jpg"; // Default profile picture
    }
    return `http://localhost:5000/api/images/user/${user._id}/avatar`;
  };

  const getPhotoUrl = (index) => {
    if (photoUrls && photoUrls[index]) {
      return `http://localhost:5000${photoUrls[index]}`;
    }
    return `http://localhost:5000/api/images/review/${reviewId}/photo/${index}`;
  };

  const showSelectedPhoto = (index) => {
    setSelectedPhoto(index);
  };  

  // Handle closing photo modal
  const closePhotoModal = () => {
    setSelectedPhoto(null);
  };

  // Use the values from our state
  const { helpfulCount, unhelpfulCount, userVoteStatus } = voteData;

  return (
    <div className="rec-review">
      {/* Review Header */}
      <div className="review-header">
        <div className="user-info">
          <div className="profile-picture">
            <img
              src={getAvatarUrl()}
              alt="User Profile"
              onError={(e) => { 
                e.target.src = "https://i.pinimg.com/originals/6d/8b/9b/6d8b9b45c14da6fbfd09a7ede56b4a83.jpg"; 
              }}
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
      <div className="review-section">
        {type === "view" ? (reviewText.length > 100 ? reviewText.substring(0,100) + "..." : reviewText) : reviewText}
      </div>

      {/* Review Photos - Updated for binary data */}
      {photos && photos.length > 0 && (
        <div className="review-section-photo">
          {photos.slice(0, type === "view" ? 2 : photos.length).map((photoData, index) => (
            <div className="photo-entry" key={index} onClick={() => showSelectedPhoto(index)}>
              <img 
                src={getPhotoUrl(index)} 
                className="actual-photo" 
                alt={`Review Photo ${index + 1}`} 
                onError={(e) => { 
                  e.target.src = "https://static.vecteezy.com/system/resources/previews/022/014/063/original/missing-picture-page-for-website-design-or-mobile-app-design-no-image-available-icon-vector.jpg"; // Fallback image
                }}
              />
            </div>
          ))}
        </div>
      )}

      {selectedPhoto !== null && (
        <div className="delete-confirmation-modal pop-up-image" onClick={closePhotoModal}>
            <img
              src={getPhotoUrl(selectedPhoto)}
              alt={`Review Photo ${selectedPhoto + 1}`}
              className="modal-photo"
            />
        </div>
      )}

      {/* Review Footer (Reply only) */}
      {footer && (
        <div className="review-footer">
          <div className="footer-content">
            {isLoggedIn && !viewOnly && currentUser && currentUser.userType === 'user' && (
              <>
                <button
                  id="helpful"
                  className={userVoteStatus === 'helpful' ? "selected" : ""}
                  onClick={() => handleVote('helpful')}
                  disabled={!isLoggedIn}
                >
                  <img src="https://www.svgrepo.com/show/522577/like.svg" alt="Helpful Icon" />
                  Helpful ({helpfulCount})  
                </button>
                <button
                  id="unhelpful"
                  className={userVoteStatus === 'unhelpful' ? "selected" : ""}
                  onClick={() => handleVote('unhelpful')}
                  disabled={!isLoggedIn}
                >
                  <img src="https://www.svgrepo.com/show/522518/dislike.svg" alt="Unhelpful Icon" />
                  Unhelpful ({unhelpfulCount}) 
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReviewForEstablishment;