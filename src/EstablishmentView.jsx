import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import './EstablishmentView.css';
import Footer from './footer';
import NavigationBar from "./NavigationBar.jsx";
import EstablishmentReview from './EstablishmentReview';

const EstablishmentView = ({ isLoggedIn, setIsLoggedIn, setShowLogin, setShowSignUp, setShowEstablishmentSignUp, user, setUser }) => {
  const { id: establishmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [establishment, setEstablishment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (location.state?.isLoggedIn && location.state?.user) {
      if (typeof setIsLoggedIn === 'function') {
        setIsLoggedIn(true);
      }
      if (typeof setUser === 'function') {
        setUser(location.state.user);
      }
    } else {
      const storedUser = localStorage.getItem("loggedInUser");
      const token = localStorage.getItem("token");

      if (storedUser && token) {
        try {
          const userData = JSON.parse(storedUser);
          if (typeof setIsLoggedIn === 'function') {
            setIsLoggedIn(true);
          }
          if (typeof setUser === 'function') {
            setUser(userData);
          }
        } catch (error) {
          console.error("Error parsing stored user data:", error);
        }
      }
    }
  }, [location.state]);

  useEffect(() => {
    const fetchEstablishment = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/establishments/${establishmentId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }  
        const data = await response.json();
        setEstablishment(data);
        
        // Handle logo and photos properly
        const logoSrc = data.logo && data.logo.data ? 
          `data:${data.logo.contentType};base64,${data.logo.data}` : 
          `http://localhost:5000/api/images/establishment/${establishmentId}/logo`;
          
        // Set logo source to establishment object
        setEstablishment(prev => ({
          ...prev,
          logoUrl: logoSrc
        }));
          
        // Handle photos array - use it if not empty
        if (data.photos && Array.isArray(data.photos) && data.photos.length > 0) {
          // Transform photo data to usable URLs
          const photoUrls = data.photos.map(photo => 
            photo.data ? `data:${photo.contentType || 'image/jpeg'};base64,${photo.data}` : null
          ).filter(url => url !== null);
          
          setPhotos(photoUrls.length > 0 ? photoUrls : [logoSrc]);
        } else {
          // If no photos, use the logo as the only photo
          setPhotos([logoSrc]);
        }
        
        // Check if the logged-in user is the owner
        if (user && user._id && data.owner && data.owner._id) {
          const isOwnerMatch = String(user._id) === String(data.owner._id);
          setIsOwner(isOwnerMatch);
        } else {
          setIsOwner(false);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching establishment:", err);
        setError("Failed to load establishment details. Please try again later.");
        setLoading(false);
      }
    };
  
    if (establishmentId) {
      fetchEstablishment();
    }
  }, [establishmentId, user]);

  // Default images as fallback if no photos are available
  const defaultImages = [
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2a/24/b1/8f/view-from-sky-deck.jpg?w=600&h=-1&s=1",
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/16/c7/47/4a/seven-corners-restaurant.jpg?w=600&h=-1&s=1",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Restaurant_N%C3%A4sinneula.jpg/1200px-Restaurant_N%C3%A4sinneula.jpg",
    "https://tastesbetterfromscratch.com/wp-content/uploads/2023/06/Pepperoni-Pizza-1-500x500.jpg",
    "https://www.grandecheese.com/wp-content/uploads/2021/01/Margherita-Pizza-deck-oven.jpg",
    "https://www.girlgonegourmet.com/wp-content/uploads/2020/08/French-Onion-Hot-Dogs-9.jpg",
    "https://www.thewickednoodle.com/wp-content/uploads/2016/07/Mexican-Gourmet-Hot-Dogs-1.jpg",
    "https://www.kitchensanctuary.com/wp-content/uploads/2024/07/Smash-Burgers-square-FS.jpg",
    "https://www.wellplated.com/wp-content/uploads/2016/03/Black-Bean-Vegan-Burger-Recipe.jpg"
  ];

  // Use establishment photos if available, otherwise use default images
  const displayImages = photos.length > 0 ? photos : defaultImages;

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + displayImages.length) % displayImages.length);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % displayImages.length);
  };

  // Function to render stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    // Fix: Use actual rating or 0 if not available, ensure it's a number
    const numericRating = establishment?.rating ? Number(establishment.rating) : 0;
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= Math.round(numericRating) ? "filled-star" : "empty-star"}>
          {i <= Math.round(numericRating) ? "★" : "☆"}
        </span>
      );
    }
    return stars;
  };

  // Format operating hours display
  const formatHours = () => {
    // If establishment has hours, use them, otherwise display default hours
    if (establishment?.hours && Array.isArray(establishment.hours) && establishment.hours.length > 0) {
      return establishment.hours.map((hourSet, index) => (
        <div key={index} className="day-time">
          <div className="day">{hourSet.day}</div>
          <div className="time">{hourSet.open} - {hourSet.close}</div>
        </div>
      ));
    } else {
      // Default hours display
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      return days.map(day => (
        <div key={day} className="day-time">
          <div className="day">{day}</div>
          <div className="time">11:00AM - 9:00PM</div>
        </div>
      ));
    }
  };

  if (loading) {
    return (
      <div className="establishment-view">
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
          <p>Loading establishment details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="establishment-view">
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
          <p className="error-message">{error}</p>
          <Link to="/" className="back-link">Back to Home</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="establishment-view">
      <NavigationBar 
        isLoggedIn={isLoggedIn} 
        setIsLoggedIn={setIsLoggedIn} 
        setShowLogin={setShowLogin}
        setShowSignUp={setShowSignUp}
        setShowEstablishmentSignUp={setShowEstablishmentSignUp}
        user={user} 
        setUser={setUser}
      />

      <div className="establishment-container">
        <div className="establishment-top-section">
          {/* Left column - Logo and basic info */}
          <div className="establishment-logo-section">
          <div className="establishment-logo">
            <img 
              src={establishment?.logoUrl} 
              alt={`${establishment?.name || "Establishment"} Logo`}
              onError={(e) => {
                e.target.src = "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2a/24/b1/8f/view-from-sky-deck.jpg?w=600&h=-1&s=1";
              }}
            />
          </div>
            <h3 className="establishment-name">
              {establishment?.name || "Establishment Name Not Available"}
            </h3>
            <div className="establishment-rating">
              <div className="star-rating">
                {renderStars(establishment?.rating)}
              </div>
            </div>
            <div className="review-count">
              {/* Fix: Use actual review count from establishment data */}
              {establishment?.reviewCount || 0} reviews
            </div>
            <Link to={`/review/create/${establishmentId}`} className="write-review-button">
              Write a Review
            </Link>
          </div>

          {/* Center column - Image carousel */}
          <div className="center-top-half"> 
          <div className="establishment-image-container">
            <button className="arrow-button left" onClick={handlePrevImage}>
              &lt;
            </button>
            <img 
              src={displayImages[currentImageIndex]} 
              alt={establishment?.name || "Establishment"} 
              className="establishment-image"
              onError={(e) => {
                e.target.src = "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2a/24/b1/8f/view-from-sky-deck.jpg?w=600&h=-1&s=1";
              }}
            />
            <button className="arrow-button right" onClick={handleNextImage}>
              &gt;
            </button>
          </div>
              
              <div className="tags">
                <div className="tag-container">
                  {/* Show categories if available or default ones */}
                  {establishment?.categories && establishment.categories.length > 0 ? (
                    establishment.categories.map((category, index) => (
                      <div key={index} className="rectangle">
                        <p className="tag-text">{category}</p>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="rectangle">
                        <p className="tag-text">Pizza</p>
                      </div>
                      <div className="rectangle">
                        <p className="tag-text">Hotdog</p>
                      </div>
                      <div className="rectangle">
                        <p className="tag-text">Burger</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

          {/* Right column - Contact info */}
          <div className="establishment-contact-section">
            <div className="info-block location-block">
              <h4>Location</h4>
              <div className="location-info">
                {/* Fix: Display establishment address if available */}
                {establishment?.address || "Address not available"}
                {isOwner && (
                  <button className="edit-info-btn">
                    <img src="https://www.svgrepo.com/show/513324/edit.svg" alt="Edit" width="16" height="16" />
                  </button>
                )}
              </div>
            </div>

            <div className="info-block contact-block">
              <h4>Contact</h4>
              <div className="contact-info">
                {/* Fix: Display establishment phone if available */}
                <p>{establishment?.phoneNumber || "Phone number not available"}</p>
                {/* Fix: Only show website if available */}
                {establishment?.website && (
                  <p>{establishment.website}</p>
                )}
                {isOwner && (
                  <button className="edit-info-btn">
                    <img src="https://www.svgrepo.com/show/513324/edit.svg" alt="Edit" width="16" height="16" />
                  </button>
                )}
              </div>
            </div>

            <div className="info-block hours-block">
              <h4>Hours</h4>
              <div className="hours-info">
                <div className="hours-list">
                  {/* Fix: Display formatted hours */}
                  {formatHours()}
                </div>
                {isOwner && (
                  <button className="edit-info-btn">
                    <img src="https://www.svgrepo.com/show/513324/edit.svg" alt="Edit" width="16" height="16" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="establishment-divider"></div>

        <div className="establishment-lower-section">
          <div className="left-lower-section">
            <div className="overview">
              <h4>Overview</h4>
              <p>
                {/* Fix: Display establishment description if available */}
                {establishment?.description || "No description available"}
              </p>
              {isOwner && (
                <button className="edit-info-btn">
                  <img src="https://www.svgrepo.com/show/513324/edit.svg" alt="Edit" width="16" height="16" />
                </button>
              )}
            </div>
            <div className="facilities-services">
              <h4>Facilities & Services</h4>
              <div className="facility-icons">
                {/* Display facilities if available, or defaults */}
                {establishment?.facilities && establishment.facilities.length > 0 ? (
                  establishment.facilities.map((facility, index) => (
                    <div key={index} className="facility-icon">
                      <img src={facility.icon || "https://www.svgrepo.com/show/532893/wifi.svg"} alt={facility.name} />
                      <p>{facility.name}</p>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="facility-icon">
                      <img src="https://www.svgrepo.com/show/532893/wifi.svg" alt="Wi-Fi" />
                      <p>Free Wi-Fi</p>
                    </div>
                    <div className="facility-icon">
                      <img src="https://www.svgrepo.com/show/480999/delivery.svg" alt="Delivery" />
                      <p>Offers Delivery</p>
                    </div>
                    <div className="facility-icon">
                      <img src="https://www.svgrepo.com/show/133518/pet-friendly.svg" alt="Pet-friendly" />
                      <p>Pet-friendly</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="center-lower-section">
            <div className="reviews-section">
              <div className="reviews-header">
                <h4>Reviews</h4>
              </div>
              
              <EstablishmentReview 
                establishmentId={establishmentId} 
                isLoggedIn={isLoggedIn} 
                setShowLogin={setShowLogin}
                user={user}
              />
            </div>
          </div>

          <div className="right-lower-section">
            
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EstablishmentView;