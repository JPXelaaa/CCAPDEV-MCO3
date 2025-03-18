import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import UserProfile from "./UserProfile";
import MakeReview from "./MakeReview";
import EditAccount from "./EditAccount";
import SignUpModal from "./SignUpModal";
import LoginModal from "./LoginModal";
import RegisterEstablishment from "./FORMS/RegisterEstablishment";
import EstablishmentView from "./EstablishmentView";
import EstablishmentManagement from "./EstablishmentManagement";

function App() {
  const [showSignUp, setShowSignUp] = useState(false); 
  const [showEstablishmentSignUp, setShowEstablishmentSignUp] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  // Update user state globally
  const updateUserState = (userData, isLoggingIn = true) => {
    if (isLoggingIn && userData) {
      setUser(userData);
      setIsLoggedIn(true);
    } else {
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  // Check for existing login session
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("loggedInUser");
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        updateUserState(userData);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("loggedInUser");
      }
    }
  }, []);

  // Listen for login state changes
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("loggedInUser");
      
      if (token && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          updateUserState(userData);
        } catch (error) {
          console.error("Error parsing stored user data:", error);
        }
      } else {
        updateUserState(null, false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <Router>
      <Routes>
        <Route 
          path="/editaccount" 
          element={<EditAccount 
            isLoggedIn={isLoggedIn} 
            setIsLoggedIn={setIsLoggedIn} 
            setShowLogin={setShowLogin} 
            setShowSignUp={setShowSignUp}
            setShowEstablishmentSignUp={setShowEstablishmentSignUp}
            user={user} 
            setUser={updateUserState}
          />} 
        />
        <Route 
          path="/establishment/manage/:id" 
          element={<EstablishmentManagement 
            isLoggedIn={isLoggedIn} 
            setIsLoggedIn={setIsLoggedIn} 
            setShowLogin={setShowLogin}
            setShowSignUp={setShowSignUp}
            setShowEstablishmentSignUp={setShowEstablishmentSignUp}
            user={user} 
            setUser={updateUserState}
          />} 
        />
        <Route 
          path="/establishment/:id" 
          element={<EstablishmentView 
            isLoggedIn={isLoggedIn} 
            setIsLoggedIn={setIsLoggedIn} 
            setShowLogin={setShowLogin}
            setShowSignUp={setShowSignUp}
            setShowEstablishmentSignUp={setShowEstablishmentSignUp}
            user={user} 
            setUser={updateUserState}
          />} 
        />
        <Route 
          path="/review/create/:establishmentId" 
          element={<MakeReview 
            isLoggedIn={isLoggedIn} 
            setIsLoggedIn={setIsLoggedIn} 
            setShowLogin={setShowLogin} 
            setShowSignUp={setShowSignUp}
            setShowEstablishmentSignUp={setShowEstablishmentSignUp}
            user={user} 
            setUser={updateUserState}
          />} 
        />
        <Route 
          path="/review/establishment/:establishmentId" 
          element={<MakeReview 
            isLoggedIn={isLoggedIn} 
            setIsLoggedIn={setIsLoggedIn} 
            setShowLogin={setShowLogin} 
            setShowSignUp={setShowSignUp}
            setShowEstablishmentSignUp={setShowEstablishmentSignUp}
            user={user} 
            setUser={updateUserState}
          />} 
        />
        <Route 
          path="/userprofile" 
          element={<UserProfile 
            isLoggedIn={isLoggedIn} 
            setIsLoggedIn={setIsLoggedIn} 
            setShowLogin={setShowLogin}
            setShowSignUp={setShowSignUp}
            setShowEstablishmentSignUp={setShowEstablishmentSignUp}
            user={user} 
            setUser={updateUserState}
          />} 
        />
        <Route 
          path="/" 
          element={<HomePage 
            isLoggedIn={isLoggedIn} 
            setIsLoggedIn={setIsLoggedIn} 
            setShowSignUp={setShowSignUp}
            setShowEstablishmentSignUp={setShowEstablishmentSignUp}
            setShowLogin={setShowLogin} 
            user={user} 
            setUser={updateUserState}
          />} 
        />
      </Routes>

      {/* Login Modal */}
      {showLogin && (
        <LoginModal 
          onClose={() => setShowLogin(false)} 
          setIsLoggedIn={setIsLoggedIn} 
          setUser={updateUserState} 
        />
      )}
      
      {/* Sign-Up Modal */}
      {showSignUp && (
        <SignUpModal 
          onClose={() => setShowSignUp(false)}
          setIsLoggedIn={setIsLoggedIn}
          setUser={updateUserState}
        />
      )}

      {/* Establishment Sign-Up Modal */}
      {showEstablishmentSignUp && (
        <RegisterEstablishment
          onClose={() => setShowEstablishmentSignUp(false)}
          setIsLoggedIn={setIsLoggedIn}
          setUser={updateUserState}
        />
      )}
    </Router>
  );
}

export default App;
