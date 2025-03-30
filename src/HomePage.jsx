import { useState, useEffect } from "react";
import "./HomePage.css";
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
  

  const handleSearch = () => {
    console.log("Searching for:", searchQuery);
  };

  const toggleFilterDropdown = () => {
    setShowFilterDropdown(!showFilterDropdown);
    if (!showFilterDropdown) setShowSearchDropdown(false);
  };

  const toggleSearchDropdown = () => {
    setShowSearchDropdown(!showSearchDropdown);
    if (!showSearchDropdown) setShowFilterDropdown(false);
  };

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

      <div className="main-content">
        <div className="change-display">
          <h2>View Establishments</h2>
          <ul className="pagination">
            <li className="page-item">
              <a className="btn btn-secondary" onClick={() => setIsCarousel(true)}>
                <img src="https://www.svgrepo.com/show/334512/carousel.svg" alt="Carousel View" />
              </a>
            </li>
            <li className="page-item">
              <a className="btn btn-secondary" onClick={() => setIsCarousel(false)}>
                <img src="https://www.svgrepo.com/show/532952/grid.svg" alt="Grid View" />
              </a>
            </li>
            <li className="page-item">
              <a className="btn btn-secondary" onClick={toggleFilterDropdown}>
                <img src="https://www.svgrepo.com/show/532169/filter.svg" alt="Filter View" />
              </a>
              {showFilterDropdown && (
                <ul className="dropdown-menu">
                  <li>
                    <a
                      className="dropdown-item"
                      onClick={() => setSortOption("popular")}
                    >
                      Most Popular
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item"
                      onClick={() => setSortOption("highToLow")}
                    >
                      High to Low Ratings
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item"
                      onClick={() => setSortOption("lowToHigh")}
                    >
                      Low to High Ratings
                    </a>
                  </li>
                </ul>
              )}
            </li>

            <li className="page-item">
              <a className="btn btn-secondary" onClick={toggleSearchDropdown}>
                <img src="https://www.svgrepo.com/show/532555/search.svg" alt="Search View" />
              </a>

              {showSearchDropdown && (
                <div className="search-dropdown">
                  <input
                    id="search-input"
                    type="search"
                    className="search-input"
                    placeholder="Search"
                    aria-label="Search"
                    //value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
            </li>
          </ul>
        </div>

        <div className="spacer"></div>

        {isCarousel ? <HomeCarousel searchQuery={searchQuery} sortOption={sortOption} /> : <HomeGrid searchQuery={searchQuery} sortOption={sortOption} />}
      </div>
      
      <Footer />
    </div>
  );
}

export default HomePage;
