import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "./NavigationBar.css";
import SignUpModal from "./SignUpModal";

function NavigationBar({ isLoggedIn, setIsLoggedIn, setShowLogin, setShowEstablishmentSignUp, user, setUser }) {
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [avatarKey, setAvatarKey] = useState(Date.now()); // Used to force re-render of avatar
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Add click event listener to close profile options when clicking outside
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileOptions(false);
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on cleanup
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileRef]);

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('token');
    
    // Update state
    setIsLoggedIn(false);
    setUser(null);
    
    // Close profile options dropdown
    setShowProfileOptions(false);
    
    // Navigate to home page
    navigate('/');
  };

  const handleSignUpClick = () => {
    setShowSignUpModal(true);
  };

  const handleCloseSignUpModal = () => {
    setShowSignUpModal(false);
  };

  const toggleProfileOptions = () => {
    setShowProfileOptions(!showProfileOptions);
  };

  const getAvatarUrl = () => {
    if (!user || !user._id) {
      return "https://i.pinimg.com/originals/6d/8b/9b/6d8b9b45c14da6fbfd09a7ede56b4a83.jpg";
    }
    return `http://localhost:5000/api/images/user/${user._id}/avatar`;
  };

  const getLogoUrl = () => {
    if (!user || !user._id) {
      return "https://via.placeholder.com/150";
    }
    return `http://localhost:5000/api/images/establishment/${user._id}/logo`;
  };

  return (
    <>
      <nav>
        <div className="nav-left">
          <img src="/resources/BiteRate.png" id="page-logo" alt="BiteRate Logo" />
        </div>

        <div className="nav-right">
          {isLoggedIn && user ? (
            <>
              <h2 className="nav-link"><Link to="/">Home</Link></h2>
              
              {/* Conditional rendering based on user type */}
              {user.userType === 'establishment' ? (
                <h2 className="nav-link">
                  <Link to={`/establishment/manage/${user._id}`}>My Establishment</Link> 
                </h2>
              ) : (
                <h2 className="nav-link"><Link to="/userprofile">Profile</Link></h2>
              )}
              
              <div className="profile-container" ref={profileRef}>
                <div className="profile-option" onClick={toggleProfileOptions}>
                  {user.userType === 'establishment' ? (
                    <>
                      <img 
                        key={avatarKey}
                        src={getLogoUrl()} 
                        alt="Establishment Logo" 
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/150";
                        }}
                      />
                      <span>{user.username}</span>
                    </>
                  ) : (
                    <>
                      <img 
                        key={avatarKey}
                        src={getAvatarUrl()} 
                        alt="User Avatar" 
                        onError={(e) => {
                          e.target.src = "https://i.pinimg.com/originals/6d/8b/9b/6d8b9b45c14da6fbfd09a7ede56b4a83.jpg";
                        }}
                      />
                      <span>{user.username}</span>
                    </>
                  )}
                  {showProfileOptions && (
                    <div className="dropdown-menu">
                      <h2 className="nav-link" onClick={handleLogout}>Logout</h2>
                    </div>
                  )}
                </div>
              
              </div>
            </>
          ) : (
            <>
              <button id="log-in"><h2 className="nav-link" onClick={() => setShowLogin(true)}>LOG IN</h2></button>
              <button id="sign-up" onClick={toggleProfileOptions}><h2 className="nav-link">SIGN UP</h2>
              {showProfileOptions && (
                  <div className="dropdown-options">
                    <h2 className="nav-link" onClick={handleSignUpClick}>Register User</h2>
                    <h2 className="nav-link" onClick={() => setShowEstablishmentSignUp(true)}>Register Establishment</h2>
                  </div>
                )}
              </button>
            </>
          )}
        </div>
      </nav>

      {showSignUpModal && (
        <SignUpModal 
          onClose={handleCloseSignUpModal} 
          setIsLoggedIn={setIsLoggedIn} 
          setUser={setUser}
        />
      )}
    </>
  );
}

export default NavigationBar;
