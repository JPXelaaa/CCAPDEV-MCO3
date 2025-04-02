import "./UserHeader.css";
import { useState, useEffect } from "react";

function ViewUserHeader({ profileUser }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // fetch reviews if we have a user
    if (profileUser && profileUser._id) {
      fetchUserReviews(profileUser._id);
    } else {
      setLoading(false);
    }
  }, [profileUser]);

  const getAvatarUrl = () => {
    if (!profileUser || !profileUser._id) {
      return "https://i.pinimg.com/originals/6d/8b/9b/6d8b9b45c14da6fbfd09a7ede56b4a83.jpg"; // Default profile picture
    }
    return `https://ccapdevmco3.vercel.app/api/images/user/${profileUser._id}/avatar`;
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
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user reviews:', err);
      setError('Failed to load reviews. Please try again later.');
      setLoading(false);
    }
  };
  
  return (
    <div className="profile-header">
      <div className="image-cover">
        <div className="profile-header-inner">
          <div className="profile-header-picture">
            <img
              src={getAvatarUrl()} 
              alt="Profile"
              onError={(e) => { e.target.src = "https://i.pinimg.com/originals/6d/8b/9b/6d8b9b45c14da6fbfd09a7ede56b4a83.jpg"; }}
            />
          </div>
          <div className="profile-header-details">
            <h2 style={{ fontSize: "35px", fontWeight: "750" }}>{profileUser?.username || "User"}</h2>
            <h2>@{profileUser?.username || "User"}</h2>
            <p id="num-review" style = {{fontSize: "17px"}}>{reviews.length || 0} total review(s)</p>
          </div>
          {/* No edit profile button - this is for viewing only */}
        </div>
      </div>
    </div>
  );
}

export default ViewUserHeader;