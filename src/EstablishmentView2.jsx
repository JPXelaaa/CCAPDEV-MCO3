import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "./EstablishmentView.css";
import NavigationBar from "./NavigationBar.jsx";
import Footer from "./Footer.jsx";
import ReviewForEstablishment from "./ReviewForEstablishment.jsx";
import Rating from "./Rating.jsx";

function EstablishmentView2({ isLoggedIn, setIsLoggedIn, setShowLogin, user, setUser }) {
  const { id } = useParams();
  
  const [establishment, setEstablishment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEstablishment();
  }, [id]);

  const fetchEstablishment = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/establishments/${id}`);
      if (!response.ok) throw new Error("Failed to fetch establishment");

      const data = await response.json();
      setEstablishment(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading establishment details...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!establishment) return <p>No establishment found.</p>;
  
  return (
    <>
      <NavigationBar
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        setShowLogin={setShowLogin}
        user={user}
        setUser={setUser}
      />

      <div className="establishment-view">
        {/* 🔹 Top Section */}
        <div className="top-half">
          {/* ✅ Left Section: Establishment Info */}
          <div className="left-top-half">
            <img id="logo" src={`http://localhost:5000/uploads/${establishment.logo}`} alt="Establishment Logo" />
            <p id="resto-name">{establishment.name}</p>
            <div className="stars">
              <Rating rating={establishment.rating} />
            </div>
            <p id="num-review">{establishment.rating} stars ({establishment.reviewCount} reviews)</p>
            <Link to={`/make-a-review/${establishment._id}`}>
              <button type="button" id="write-review-btn">Write a Review</button>
            </Link>
          </div>

          {/* ✅ Center Section: Carousel & Tags */}
          <div className="center-top-half">
            <div className="carousel">
              <button className="arrow left-arrow">&lt;</button>
              <img id="carousel-img" src={`http://localhost:5000/uploads/${establishment.photos?.[0] || "default-image.jpg"}`} alt="Carousel Image" />
              <button className="arrow right-arrow">&gt;</button>

              <div className="photo-container">
                <div className="rectangle">
                  <img id="camera" src="https://www.svgrepo.com/show/533059/camera.svg" alt="Camera Icon" />
                  <p id="text">See all photos</p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="tags">
              <div className="tag-container">
                {establishment.categories.map((category, index) => (
                  <div className="rectangle" key={index}>
                    <p id="text">{category}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ✅ Right Section: Location, Contact, Hours */}
          <div className="right-top-half">
            <div className="location">
              <h4>Location</h4>
              <p>{establishment.address}</p>
            </div>

            <div className="contact">
              <h4>Contact</h4>
              <div className="contacts">
                <p>{establishment.phoneNumber}</p>
                <p>{establishment.website || "No website available"}</p>
              </div>
            </div>

            <div className="hours">
              <h4>Hours</h4>
              <div className="day-time-format">
                {establishment.hours.map((schedule, index) => (
                  <div className="day-time" key={index}>
                    <h6>{schedule.day}</h6>
                    <p>{schedule.open} - {schedule.close}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 🔹 Lower Section */}
        <div className="lower-half">
          {/* ✅ Left Section: Overview & Facilities */}
          <div className="left-lower-half">
            <div className="overview">
              <h4>Overview</h4>
              <p>{establishment.description || "No description available."}</p>
            </div>

            <h4 id="label">Facilities & Services</h4>
            <div className="faci-servi">
              {establishment.facilities.map((facility, index) => (
                <div className="icons" key={index}>
                  <img id="icon-pic" src={`https://www.svgrepo.com/show/${index + 1}/icon.svg`} alt="Facility Icon" />
                  <p>{facility}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ✅ Center Section: Reviews */}
          <div className="center-lower-half">
            <div className="center-lower-half-header">
              <p id="label">Reviews</p>
              <Link to={`/reviews/${establishment._id}`}>
                <img src="https://www.svgrepo.com/show/510970/external-link.svg" alt="Review Extended" style={{ cursor: "pointer" }} />
              </Link>
            </div>

            {/* Reviews List */}
            <div className="reviews-container">
              {establishment.reviews.length > 0 ? (
                establishment.reviews.map((review) => (
                  <ReviewForEstablishment
                    key={review._id}
                    username={review.user.username}
                    date={new Date(review.createdAt).toLocaleDateString()}
                    title={review.title}
                    rating={review.rating}
                    reviewText={review.body}
                    photos={review.photos}
                    type="establishment"
                  />
                ))
              ) : (
                <p>No reviews available.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default EstablishmentView2;
