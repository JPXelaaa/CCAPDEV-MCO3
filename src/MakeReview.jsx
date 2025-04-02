import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from "react-router-dom";
import "./MakeReview.css";
import NavigationBar from "./NavigationBar.jsx";
import Footer from "./footer.jsx";

function MakeReview({ isEdit, reviewContent, setShowLogin, setShowSignUp, setShowEstablishmentSignUp, isLoggedIn, setIsLoggedIn, user, setUser }) {
  const { establishmentId } = useParams();
  const navigate = useNavigate();
  
  const [establishment, setEstablishment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Review form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState(reviewContent || '');
  const [rating, setRating] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Handle authentication check
  useEffect(() => {
    // Check if user is logged in from localStorage
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
        navigate('/');
        if (typeof setShowLogin === 'function') {
          setShowLogin(true);
        }
      }
    } else {
      // If not logged in, redirect to home page
      navigate('/');
      if (typeof setShowLogin === 'function') {
        setShowLogin(true);
      }
    }
  }, []); // Empty dependency array - only run once on mount
  
  // Fetch establishment data
  useEffect(() => {
    if (establishmentId) {
      fetchEstablishment();
    }
  }, [establishmentId]);
  
  const fetchEstablishment = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://ccapdevmco3.vercel.app/api/establishments/${establishmentId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setEstablishment(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching establishment:", error);
      setError("Failed to load establishment details. Please try again later.");
      setLoading(false);
    }
  };
  
  const handleRatingClick = (selectedRating) => {
    setRating(selectedRating);
  };
  
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Limit to 5 photos
    const newFiles = files.slice(0, 5 - photoFiles.length);
    if (newFiles.length === 0) {
      alert("You can only upload a maximum of 5 photos.");
      return;
    }
    
    // Create preview URLs for the selected photos
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    
    setPhotoFiles(prev => [...prev, ...newFiles]);
    setPhotoPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };
  
  const removePhoto = (index) => {
    // Release the object URL to avoid memory leaks
    URL.revokeObjectURL(photoPreviewUrls[index]);
    
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      if (typeof setShowLogin === 'function') {
        setShowLogin(true);
      }
      return;
    }
    
    if (!title.trim()) {
      alert("Please enter a title for your review.");
      return;
    }
    
    if (!body.trim()) {
      alert("Please write your review.");
      return;
    }
    
    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }
    
    try {
      setSubmitting(true);
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('body', body);
      formData.append('rating', rating);
      formData.append('establishmentId', establishmentId);
      
      // Append photos if any
      photoFiles.forEach(file => {
        formData.append('photos', file);
      });
      
      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        alert("You need to be logged in to post a review.");
        if (typeof setShowLogin === 'function') {
          setShowLogin(true);
        }
        return;
      }
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      const response = await fetch('https://ccapdevmco3.vercel.app/api/reviews', {
        method: 'POST',
        headers: {
          'Authorization': authHeader
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to post review');
      }
      
      const data = await response.json();
      console.log('Review posted successfully:', data);
      
      // Navigate to the establishment page without passing state
      navigate(`/establishment/${establishmentId}`);
    } catch (error) {
      console.error('Error posting review:', error);
      alert(error.message || 'Failed to post review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading establishment details...</div>;
  }
  
  if (error) {
    return <div className="error">{error}</div>;
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

<div className="establishment-info">
            <div className="establishment-logo">
              <img 
                src={`https://ccapdevmco3.vercel.app/api/images/establishment/${establishmentId}/logo`} 
                alt={establishment?.name || "Establishment"} 
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/150?text=No+Logo";
                }}
              />
            </div>
            <div className="establishment-name">
              <h2>{establishment?.name || "Establishment"}</h2>
            </div>
          </div>
      
      <div className="make-review-container">
        
        <form className="review-form" onSubmit={handleSubmit}>
          <div className="review-header">
          <h1>{isEdit ? 'Edit Review' : 'Review Establishment'}</h1>
        </div>
          <div class="col-md-6">
          <label htmlFor="body">Rating: {rating}/5</label>
            <div class="rating-card p-4">
                <div class="star-rating animated-stars">
                    <input type="radio" id="star5" name="rating" value="5" onClick={() => handleRatingClick(5)}/>
                    <label for="star5" class="bi bi-star-fill"></label>
                    <input type="radio" id="star4" name="rating" value="4" onClick={() => handleRatingClick(4)}/>
                    <label for="star4" class="bi bi-star-fill"></label>
                    <input type="radio" id="star3" name="rating" value="3" onClick={() => handleRatingClick(3)}/>
                    <label for="star3" class="bi bi-star-fill"></label>
                    <input type="radio" id="star2" name="rating" value="2" onClick={() => handleRatingClick(2)}/>
                    <label for="star2" class="bi bi-star-fill"></label>
                    <input type="radio" id="star1" name="rating" value="1" onClick={() => handleRatingClick(1)}/>
                    <label for="star1" class="bi bi-star-fill"></label>
                </div>
            </div>
        </div>
          
          <div className="form-group">
            <label htmlFor="title">Title:</label>
            <input 
              type="text" 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Summarize your experience" 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="body">Review:</label>
            <textarea 
              id="body" 
              value={body} 
              onChange={(e) => setBody(e.target.value)} 
              placeholder="Tell others about your experience" 
              required 
              rows={6}
            />
          </div>
          
          <div className="form-group">
            <label>Photos (optional):</label>
            <div className="photo-upload">
              <input 
                type="file" 
                id="photos" 
                onChange={handlePhotoUpload} 
                multiple 
                accept="image/*" 
                style={{ display: 'none' }}
              />
              <label htmlFor="photos" className="upload-button" id="upload-btn">
                Add Photos
              </label>
              <span className="photo-limit">
                {photoPreviewUrls.length}/5 photos
              </span>
            </div>
            
            {photoPreviewUrls.length > 0 && (
              <div className="photo-previews">
                {photoPreviewUrls.map((url, index) => (
                  <div key={index} className="photo-preview">
                    <img src={url} alt={`Preview ${index + 1}`} />
                    <button 
                      type="button" 
                      className="remove-photo" 
                      onClick={() => removePhoto(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="form-actions">
            <Link to={`/establishment/${establishmentId}`} className="cancel-button">
              Cancel
            </Link>
            <button 
              type="submit" 
              className="submit-button" 
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : (isEdit ? 'Update Review' : 'Post Review')}
            </button>
          </div>
        </form>
      </div>
      
      <Footer />
    </>
  );
}

export default MakeReview;
