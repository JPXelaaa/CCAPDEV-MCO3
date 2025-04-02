import { useState, useEffect } from "react";
import "./index.css";
import NavigationBar from "./NavigationBar";
import Footer from "./Footer"; 
import ViewUserHeader from "./ViewUserHeader";
import ViewUserMedia from "./ViewUserMedia";
import ViewUserReview from "./ViewUserReview";
import { useParams, useNavigate } from "react-router-dom";

function ViewUserProfile({ setShowLogin, setShowSignUp, setShowEstablishmentSignUp, isLoggedIn, setIsLoggedIn, user, setUser }) { 
  const [isReview, setIsReview] = useState(true);
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        console.log('We enterin here: ', userId);
        const response = await fetch(`http://localhost:5000/api/users/${userId}/profile`, { 
            headers: { 'Accept': 'application/json' } 
          });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Error ${response.status}: Failed to fetch user profile`);
        }
        
        const data = await response.json();
        console.log('Dataaaaaaaaaa: ', data)
        if (data.status === "success" && data.user) {
          setProfileUser(data.user);
        } else {
          throw new Error('Invalid response format');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(`${err.message || 'Failed to load user profile. Please try again later.'}`);
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    } else {
      setError("No user ID provided");
      setLoading(false);
    }
  }, [userId]);

  // If this is the current user's own profile, redirect to the regular profile page
  useEffect(() => {
    if (isLoggedIn && user && profileUser && user._id === profileUser._id) {
      navigate('/profile');
    }
  }, [isLoggedIn, user, profileUser, navigate]);

  if (loading) {
    return (
      <>
        <NavigationBar
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          setShowLogin={setShowLogin}
          setShowSignUp={setShowSignUp}
          setShowEstablishmentSignUp={setShowEstablishmentSignUp}
          user={user} 
          setUser={setUser}
        />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading user profile...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !profileUser) {
    return (
      <>
        <NavigationBar
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          setShowLogin={setShowLogin}
          setShowSignUp={setShowSignUp}
          setShowEstablishmentSignUp={setShowEstablishmentSignUp}
          user={user} 
          setUser={setUser}
        />
        <div className="error-container">
          <h3>Error Loading Profile</h3>
          <p>{error || "User not found"}</p>
          <button onClick={() => navigate('/')} className="back-button">
            Back to Home
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavigationBar
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        setShowLogin={setShowLogin}
        setShowSignUp={setShowSignUp}
        setShowEstablishmentSignUp={setShowEstablishmentSignUp}
        user={user} 
        setUser={setUser}
      />

      <ViewUserHeader profileUser={profileUser} />
      
      {isReview ? (
        <ViewUserReview 
          profileUser={profileUser}
          isReview={isReview} 
          setIsReview={setIsReview} 
        />
      ) : (
        <ViewUserMedia 
          profileUser={profileUser}
          isReview={isReview} 
          setIsReview={setIsReview} 
        />
      )}
      
      <Footer />
    </>
  );
}

export default ViewUserProfile;