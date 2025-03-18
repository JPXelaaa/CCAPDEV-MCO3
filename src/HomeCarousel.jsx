import { useState, useEffect } from 'react';
import './HomeCarousel.css';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import EstablishmentPreview from "./EstablishmentPreview";

function HomeCarousel() {
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEstablishments = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/establishments');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Fetched establishments:", data);
        setEstablishments(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching establishments:", error);
        setError("Failed to load establishments. Please try again later.");
        setLoading(false);
      }
    };

    fetchEstablishments();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
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