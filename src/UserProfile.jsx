import { useState, useEffect } from "react";
import "./index.css";
import NavigationBar from "./NavigationBar";
import Footer from "./footer"; 
import UserHeader from "./UserHeader";
import UserMedia from "./UserMedia";
import UserReview from "./UserReview";

function UserProfile({ setShowLogin, setShowSignUp, setShowEstablishmentSignUp, isLoggedIn, setIsLoggedIn, user, setUser }) { 
  const [isReview, setIsReview] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (storedUser) {
      setUser(storedUser);
      setIsLoggedIn(true);
    }
  }, []);

  const [userType, setUserType] = useState("user");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      console.log("🔍 Sending login request with data:", { username, password, userType });

      const response = await fetch("http://localhost:5000/api/editaccount", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, description, userType }),
      });

      const data = await response.json();
      console.log("🔍 Server Response JSON:", data);

      if (response.ok) {
        if (data.token && data.user) {
          localStorage.removeItem("token");
          localStorage.removeItem("loggedInUser");
          
          localStorage.setItem("token", data.token);
          localStorage.setItem("loggedInUser", JSON.stringify(data.user));
          
          setIsLoggedIn(true);
          if (typeof setUser === 'function') {
            setUser(data.user);
          } else {
            console.log('setUser is not a function, using localStorage only');
          }
          
          onClose();
        } else {
          setError("Login successful but received invalid user data.");
        }
      } else {
        setError(data?.message || "Invalid login credentials.");
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError("Failed to connect to the server. Please try again.");
    }
  };

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

      <UserHeader isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} user={user} />
      
      {isReview ? (
        <UserReview 
          isLoggedIn={isLoggedIn} 
          setIsLoggedIn={setIsLoggedIn} 
          isReview={isReview} 
          setIsReview={setIsReview} 
          user={user}
          setUser={setUser}
          setShowLogin={setShowLogin}
        />
      ) : (
        <UserMedia 
          isLoggedIn={isLoggedIn} 
          setIsLoggedIn={setIsLoggedIn} 
          isReview={isReview} 
          setIsReview={setIsReview} 
          user={user}
          setUser={setUser}
          setShowLogin={setShowLogin}
        />
      )}
      
      <Footer />
    </>
  );
}

export default UserProfile;
