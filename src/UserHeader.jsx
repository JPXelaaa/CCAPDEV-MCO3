import "./UserHeader.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";


function UserHeader({ isLoggedIn, setIsLoggedIn, user }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
    useEffect(() => {
      // fetch reviews if we have a user
      if (user && user._id) {
        fetchUserReviews(user._id);
      } else {
        setLoading(false);
      }
    }, [user]);

  const getAvatarUrl = () => {
    if (!user || !user._id) {
      return "https://i.pinimg.com/originals/6d/8b/9b/6d8b9b45c14da6fbfd09a7ede56b4a83.jpg"; // Default profile picture
    }
    return `https://ccapdevmco3.vercel.app/api/images/user/${user._id}/avatar`;
  };
  
  const fetchUserReviews = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`https://ccapdevmco3.vercel.app/api/reviews/user/${userId}`);
      
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
  
  return (
    <div className="profile-header">
      <div className="image-cover">
        <div className="profile-header-inner">
          <div className="profile-header-picture">
            {/* Show logged-in user's profile picture OR default */}
            <img
              src={getAvatarUrl()} // Use the function
              alt="Profile"
              onError={(e) => { e.target.src = "https://i.pinimg.com/originals/6d/8b/9b/6d8b9b45c14da6fbfd09a7ede56b4a83.jpg"; }} // ✅ Ensure fallback works
            />
          </div>
          <div className="profile-header-details">
            {/* Show logged-in user's name OR default */}
            <h2 style={{ fontSize: "35px", fontWeight: "750" }}>{user?.username || "Guest User"}</h2>
            <h2>@{user?.username || "Guest"}</h2>
            <p id="num-review" style = {{fontSize: "17px"}}>{reviews.length || 0} total review(s)</p> {/* ✅ Show real review count */}
          </div>

          <div className="edit-profile">
            {isLoggedIn ? (
              <Link to="/editaccount">
                <button id="editProfileBtn">Edit Profile</button>
              </Link>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserHeader;
