import { useState, useEffect } from "react";
import "./HomePage.css";
import "./About.css";
import NavigationBar from "./NavigationBar";
import Footer from "./footer";
import HomeGrid from "./HomeGrid";
import HomeCarousel from "./HomeCarousel";

function HomePage({ setShowLogin, setShowSignUp, setShowEstablishmentSignUp, isLoggedIn, setIsLoggedIn, user, setUser }) { 

  const [isCarousel, setIsCarousel] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [sortOption, setSortOption] = useState(""); 


  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    console.log(storedUser);  // Check the stored user to see if it's changing unnecessarily
    if (storedUser && !user) {
      setUser(storedUser);
      setIsLoggedIn(true);
    }
  }, [setUser, setIsLoggedIn, user]);  // Ensure `user` is in the dependency array
  



  return (
    <div className="home-container">
      <NavigationBar
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        setShowLogin={setShowLogin}
        setShowSignUp={setShowSignUp}
        setShowEstablishmentSignUp={setShowEstablishmentSignUp}
        user={user} 
        setUser={setUser}
      />

      <div className="main-content center-content">

        <div className="about-header">
          <div><h2 className="about-label">About BiteRate</h2></div>
          <p className="home-subtitle">Libraries used:</p>
        </div>

      </div>
      
      <Footer />
    </div>
  );
}

export default HomePage;
