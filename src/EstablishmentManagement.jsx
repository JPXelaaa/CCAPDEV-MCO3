import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import Footer from './footer';
import EstablishmentReview from './EstablishmentReview';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import './EstablishmentManagement.css';

const EstablishmentManagement = ({ isLoggedIn, setIsLoggedIn, setShowLogin, setShowSignUp, setShowEstablishmentSignUp, user, setUser }) => {
  const { id: establishmentId } = useParams();
  const navigate = useNavigate();
  const [establishment, setEstablishment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [showEditForm, setShowEditForm] = useState(false);
  const [activeFilters, setActiveFilters] = useState(['With photos', 'Positive Rating', 'Good Service']);
  const [sortBy, setSortBy] = useState('Recent');
  const [filterRating, setFilterRating] = useState('All');
  
  // Reply modal state
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyError, setReplyError] = useState(null);
  const [replySuccess, setReplySuccess] = useState(null);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  
  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [website, setWebsite] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [photos, setPhotos] = useState([]);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Check if user is logged in and is the owner of this establishment
    if (!isLoggedIn || !user) {
      setError('You must be logged in to manage an establishment');
      navigate('/');
      return;
    }

    if (user.userType !== 'establishment') {
      setError('Only establishment owners can access this page');
      navigate('/');
      return;
    }

    if (user._id !== establishmentId) {
      setError('You can only manage your own establishment');
      navigate('/');
      return;
    }

    const fetchEstablishment = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Authentication required');
          setIsLoggedIn(false);
          navigate('/');
          return;
        }

        const response = await fetch(`http://localhost:5000/api/establishments/${establishmentId}`, {
          headers: {
            'Authorization': token
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch establishment details');
        }

        const data = await response.json();
        setEstablishment(data);
        setName(data.name || '');
        setDescription(data.description || '');
        setAddress(data.address || '');
        setPhoneNumber(data.phoneNumber || '');
        setWebsite(data.website || '');
        setPhotos(data.photos || []);
      } catch (err) {
        console.error('Error fetching establishment:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEstablishment();
  }, [isLoggedIn, user, establishmentId, navigate, setIsLoggedIn]);
  
  const token = localStorage.getItem('token');
  if (token) {
    setIsLoggedIn(true); // Restore login state
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Limit to 10 photos total
      const remainingSlots = 10 - photos.length;
      const filesToAdd = files.slice(0, remainingSlots);
      
      setPhotoFiles(prev => [...prev, ...filesToAdd]);
      
      // Create preview URLs
      const newPreviewUrls = filesToAdd.map(file => URL.createObjectURL(file));
      setPhotoPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removePhotoPreview = (index) => {
    setPhotoPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeletePhoto = async (index) => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required');
        setIsLoggedIn(false);
        navigate('/');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/establishments/${establishmentId}/photos/${index}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update the photos array
      setPhotos(prev => prev.filter((_, i) => i !== index));
      
      setSuccessMessage('Photo deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error("Error deleting photo:", err);
      setError("Failed to delete photo. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    
    const updatedData = {
        name,
        description,
        address,
        phoneNumber,
        website,
    };

    try {
        setIsSubmitting(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
            setError('Authentication required');
            setIsLoggedIn(false);
            navigate('/');
            return;
        }

        const response = await fetch(`http://localhost:5000/api/establishments/${establishmentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(updatedData),
        });

        // Debug response
        console.log("Response status:", response.status);
        const responseText = await response.text();
        console.log("Raw response:", responseText);
        
        let data;
        if (responseText) {
            try {
                data = JSON.parse(responseText);
                console.log("Parsed response data:", data);
            } catch (parseError) {
                console.error("Error parsing response as JSON:", parseError);
                throw new Error(`Response is not valid JSON: ${responseText}`);
            }
        } else {
            console.warn("Empty response received");
            data = {};
        }

        if (!response.ok) {
            throw new Error(data?.message || `HTTP error! Status: ${response.status}`);
        }

        setEstablishment(prevState => ({
            ...prevState,
            ...updatedData
        }));
        
        setName(updatedData.name || '');
        setDescription(updatedData.description || '');
        setAddress(updatedData.address || '');
        setPhoneNumber(updatedData.phoneNumber || '');
        setWebsite(updatedData.website || '');
        setLogoFile(null);
        setLogoPreview('');

        toggleEditForm();
        setSuccessMessage('Establishment profile updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
        console.error("Error updating establishment:", err);
        setError(err.message || "Failed to update establishment. Please try again later.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handlePhotosSubmit = async (e) => {
    e.preventDefault();
    
    if (photoFiles.length === 0) {
      setError('Please select at least one photo to upload');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        setIsLoggedIn(false);
        navigate('/');
        return;
      }

      const formData = new FormData();
      photoFiles.forEach(file => {
        formData.append('photos', file);
      });

      const response = await fetch(`http://localhost:5000/api/establishments/${establishmentId}/photos`, {
        method: 'POST',
        headers: {
          'Authorization': token
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload photos');
      }

      const data = await response.json();
      
      // Refresh the establishment data to get updated photos
      const refreshResponse = await fetch(`http://localhost:5000/api/establishments/${establishmentId}`, {
        headers: {
          'Authorization': token
        }
      });
      
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        setEstablishment(refreshData);
        
        // Update photos array
        if (refreshData && refreshData.photos && Array.isArray(refreshData.photos)) {
          const photoUrls = Array.from({ length: refreshData.photos.length }, (_, i) => 
            `http://localhost:5000/api/images/establishment/${establishmentId}/photo${i}`
          );
          setPhotos(photoUrls);
        }
      }

      setPhotoFiles([]);
      setPhotoPreviewUrls([]);
      
      setSuccessMessage('Photos uploaded successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error("Error uploading photos:", err);
      setError(err.message || "Failed to upload photos. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleEditForm = () => {
    setShowEditForm(!showEditForm);
    setActiveTab('profile');
  };

  const toggleFilter = (filter) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter(f => f !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  // Handle opening the reply modal
  const handleOpenReplyModal = (reviewId) => {
    setSelectedReviewId(reviewId);
    setReplyContent('');
    setReplyError(null);
    setShowReplyModal(true);
  };

  // Handle closing the reply modal
  const handleCloseReplyModal = () => {
    setShowReplyModal(false);
    setSelectedReviewId(null);
    setReplyContent('');
    setReplyError(null);
  };

  // Handle submitting a reply
  const handleReplySubmit = async () => {
    if (!replyContent.trim()) {
      setReplyError('Reply cannot be empty');
      return;
    }

    try {
      setIsSubmittingReply(true);
      setReplyError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setReplyError('Authentication required');
        setIsLoggedIn(false);
        navigate('/');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/reviews/${selectedReviewId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ content: replyContent })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit reply');
      }

      // Successfully submitted reply
      setReplySuccess('Reply submitted successfully');
      setTimeout(() => {
        handleCloseReplyModal();
        setReplySuccess(null);
         
        navigate(0);  // This will reload the page
      }, 2000);
      
    } catch (err) {
      console.error("Error submitting reply:", err);
      setReplyError(err.message || "Failed to submit reply. Please try again later.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <div className="establishment-management">
      <NavigationBar 
        isLoggedIn={isLoggedIn} 
        setIsLoggedIn={setIsLoggedIn} 
        setShowLogin={setShowLogin}
        setShowSignUp={setShowSignUp}
        setShowEstablishmentSignUp={setShowEstablishmentSignUp}
        user={user} 
        setUser={setUser}
      />
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading establishment details...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button className="back-button" onClick={() => navigate('/')}>Back to Home</button>
        </div>
      ) : (
        <div className="management-container">
          {activeTab === 'profile' ? (
            <div className="profile-section">
              <div className="profile-header-container">
                <div className="profile-header">
                  <div className="profile-content">
                    <div className="profile-header-picture">
                      <img 
                        src={`http://localhost:5000/api/images/establishment/${establishmentId}/logo`} 
                        alt={establishment?.name || "Establishment"}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/150?text=No+Logo";
                        }}
                      />
                    </div>
                    <div className="profile-header-details">
                      <h1 id="establishment-name">{establishment?.name || "Establishment"}</h1>
                      <div className="overall-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <img 
                            key={star} 
                            id="star-rating" 
                            src={establishment?.rating >= star 
                              ? "http://pluspng.com/img-png/star-png-star-vector-png-transparent-image-2000.png" 
                              : "http://pluspng.com/img-png/star-png-star-empty-png-2000.png"} 
                            alt="star rating" 
                          />
                        ))}
                      </div>
                      <p id="num-review">{establishment?.rating || 0} stars ({establishment?.reviewCount || 0} reviews)</p>
                    </div>
                    <div className="edit-profile">
                      <div className="dropdown">
                            <button 
                              className="dropdown-item" 
                              onClick={() => {
                                toggleEditForm();
                                setActiveTab('profile');
                              }}
                            >
                              Edit Establishment Profile
                            </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {successMessage && (
                <div className="success-message">
                  {successMessage}
                </div>
              )}
              
              {activeTab === 'profile' && showEditForm ? (
                <div className="profile-tab">
                  <form className="profile-form" onSubmit={handleProfileSubmit}>
                    <div className="form-group">
                      <label htmlFor="logo">Establishment Logo:</label>
                      <div className="logo-upload">
                        <div className="logo-preview">
                          <img 
                            src={logoPreview || `http://localhost:5000/api/images/establishment/${establishmentId}/logo`} 
                            alt="Logo Preview"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/150?text=No+Logo";
                            }}
                          />
                        </div>
                        <input 
                          type="file" 
                          id="logo" 
                          accept="image/*" 
                          onChange={handleLogoChange} 
                          className="file-input"
                        />
                        <label htmlFor="logo" className="file-label">Choose New Logo</label>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="name">Establishment Name:</label>
                      <input 
                        type="text" 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="form-control"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="description">Description:</label>
                      <textarea 
                        id="description" 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        className="form-control"
                        rows="4"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="address">Address:</label>
                      <input 
                        type="text" 
                        id="address" 
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)} 
                        className="form-control"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="phoneNumber">Phone Number:</label>
                      <input 
                        type="text" 
                        id="phoneNumber" 
                        value={phoneNumber} 
                        onChange={(e) => setPhoneNumber(e.target.value)} 
                        className="form-control"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="website">Website:</label>
                      <input 
                        type="url" 
                        id="website" 
                        value={website} 
                        onChange={(e) => setWebsite(e.target.value)} 
                        className="form-control"
                      />
                    </div>
                    
                    <button 
                      type="submit" 
                      className="submit-btn" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Updating...' : 'Update Profile'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="reviews-section">
                  <EstablishmentReview 
                    establishmentId={establishmentId}
                    isLoggedIn={isLoggedIn}
                    setIsLoggedIn={setIsLoggedIn}
                    setShowLogin={setShowLogin}
                    user={user}
                    setUser={setUser}
                    onReplyClick={handleOpenReplyModal}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="reviews-section">
              <EstablishmentReview 
                establishmentId={establishmentId}
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
                setShowLogin={setShowLogin}
                user={user}
                setUser={setUser}
                onReplyClick={handleOpenReplyModal}
              />
            </div>
          )}
        </div>
      )}

      {/* Reply Modal */}
      <Modal show={showReplyModal} onHide={handleCloseReplyModal}>
        <Modal.Header closeButton>
          <Modal.Title>Reply to Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {replyError && <div className="error-message">{replyError}</div>}
          {replySuccess && <div className="success-message">{replySuccess}</div>}
          <div className="form-group">
            <label htmlFor="replyContent">Your Reply:</label>
            <textarea
              id="replyContent"
              className="form-control"
              rows="5"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your response to this review..."
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseReplyModal}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleReplySubmit}
            disabled={isSubmittingReply}
          >
            {isSubmittingReply ? 'Submitting...' : 'Submit Reply'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      <Footer />
    </div>
  );
};

export default EstablishmentManagement;