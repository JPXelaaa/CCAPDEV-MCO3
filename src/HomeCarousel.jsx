import { useState, useEffect, useCallback } from 'react';
import './HomeCarousel.css';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import EstablishmentPreview from "./EstablishmentPreview";
import debounce from "lodash.debounce";

function HomeCarousel({searchQuery, sortOption}) {
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  
  const fetchEstablishments = async (query, sortOption) => {
    try {
      setLoading(true);
  
      let url = "http://localhost:5000/api/establishments";
      if (query) {
        url = `http://localhost:5000/api/establishments/${query}`;
      }
  
      const response = await fetch(url);
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
  
      if (sortOption === "highToLow") {
        data.sort((a, b) => b.rating - a.rating);
      } else if (sortOption === "lowToHigh") {
        data.sort((a, b) => a.rating - b.rating);
      } else if (sortOption === "popular") {
        data.sort((a, b) => b.reviewCount - a.reviewCount);
      }
  
      setEstablishments(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching establishments:", error);
      setError("Failed to load establishments. Please try again later.");
      setLoading(false);
    }
  };
  
  const debouncedFetch = useCallback(
    debounce((query, sortOption) => fetchEstablishments(query, sortOption), 300),
    []
  );
  
  useEffect(() => {
    debouncedFetch(searchQuery, sortOption);
  }, [searchQuery, sortOption]);
  

  const settings = {
    dots: true,
    infinite: true,
    speed: 1200,
    slidesToShow: Math.min(establishments.length, 4),
    slidesToScroll: Math.min(establishments.length, 4),
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(establishments.length, 3),
          slidesToScroll: Math.min(establishments.length, 3)
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(establishments.length, 2),
          slidesToScroll: Math.min(establishments.length, 2)
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: Math.min(establishments.length, 1),
          slidesToScroll: 1
        }
      }
    ],
  };

  if (loading) {
    return <div className="carousel-container loading">Loading establishments...</div>;
  }

  if (error) {
    return <div className="carousel-container error">{error}</div>;
  }

  if (establishments.length === 0) {
    return <div className="carousel-container empty">No establishments found.</div>;
  }

  return (
    <div className="carousel-container">
      <Slider {...settings}>
        {establishments.map(establishment => (
          <EstablishmentPreview 
            key={establishment._id} 
            establishment={establishment} 
            className="carousel-preview"
          />
        ))}
      </Slider>
    </div>
  );
}

export default HomeCarousel;