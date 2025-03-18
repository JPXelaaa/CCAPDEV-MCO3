import { Link } from "react-router-dom";
import "./EstablishmentPreview.css";

function EstablishmentPreview({ establishment, className = ""}) {
  // Use default values if establishment data is not provided
  const {
    _id = "1",
    name = "The Rustic Fork",
    logo = null,
    photos = [],
    description = "A cozy bistro offering farm-to-table dishes.",
    rating = 4,
    reviewCount = 71
  } = establishment || {};

  // Default image to use if no photos are available
  const defaultImage = "https://thearchitectsdiary.com/wp-content/uploads/2020/01/Daler14.jpg";
  const defaultLogo = "https://cdn-icons-png.flaticon.com/512/4039/4039232.png";

  // Function to render stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStar = "http://pluspng.com/img-png/star-png-star-vector-png-transparent-image-2000.png";
    const emptyStar = "http://pluspng.com/img-png/star-png-star-empty-png-2000.png";
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <img 
          key={i} 
          src={i <= rating ? fullStar : emptyStar} 
          className="rating" 
          alt={`${i <= rating ? 'Full' : 'Empty'} Star`}
        />
      );
    }
    
    return stars;
  };

  // Get the logo URL
  const getLogoUrl = () => {
    if (_id === "1") return defaultImage; // For default establishment
    
    // Use a fallback image handler with onerror attribute
    return `http://localhost:5000/api/images/establishment/${_id}/logo`;
  };

  // Get the photo URL
  const getPhotoUrl = () => {
    // If photos array exists and has items
    if (photos && photos.length > 0) {
      return `http://localhost:5000/api/images/establishment/${_id}/photo0`;
    }
    
    // If no photos, use logo as fallback
    return getLogoUrl();
  };

  return (
    <Link to={`/establishment/${_id}`} className={`establishment-preview ${className}`}>
      <div className="establishment-img">
        <img src={getPhotoUrl()} alt={name} onError={(e) => {e.target.src = defaultImage}} />
      </div>
      <div className="preview-details">
        <div className="est-name">{name}</div>
        <div className="overall-review">
          {renderStars(rating)}
          <span><h2>({reviewCount || 0})</h2></span>
        </div>
        <div className="establishment-description">
          {description}
        </div>
      </div>
    </Link>
  );
}

export default EstablishmentPreview;
