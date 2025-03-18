import "./UserHeader.css";
import { Link } from "react-router-dom";

function UserHeader({ isLoggedIn, setIsLoggedIn, user }) {
  const getAvatarUrl = () => {
    if (!user || !user._id) {
      return "https://i.pinimg.com/originals/6d/8b/9b/6d8b9b45c14da6fbfd09a7ede56b4a83.jpg"; // Default profile picture
    }
    return `http://localhost:5000/api/images/user/${user._id}/avatar`;
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
            <p id="num-review" style = {{fontSize: "17px"}}>{user?.reviews?.length || 0} total review(s)</p> {/* ✅ Show real review count */}
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
