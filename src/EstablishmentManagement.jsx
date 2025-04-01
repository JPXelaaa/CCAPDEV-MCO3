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

  const [showProfileOptions, setShowProfileOptions] = useState(false);


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

  const toggleProfileOptions = () => {
    setShowProfileOptions(!showProfileOptions);
  };

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

        // First update the establishment profile information
        const profileData = {
            name,
            description,
            address,
            phoneNumber,
            website,
        };
                    
        const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

        const profileResponse = await fetch(`http://localhost:5000/api/establishments/${establishmentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
            },
            body: JSON.stringify(profileData),
        });

        if (!profileResponse.ok) {
            const errorData = await profileResponse.json();
            throw new Error(errorData?.message || `Failed to update profile: ${profileResponse.status}`);
        }
        
        // Handle logo upload if there's a new logo
        if (logoFile) {
            const logoFormData = new FormData();
            logoFormData.append('logo', logoFile);
            
            const logoResponse = await fetch(`http://localhost:5000/api/establishments/${establishmentId}/logo`, {
                method: 'POST',
                headers: {
                    'Authorization': authHeader
                },
                body: logoFormData
            });
            
            if (!logoResponse.ok) {
                console.warn("Error uploading logo:", logoResponse.status);
                // Continue with other updates even if logo update fails
            }
        }
        
        // Handle photo uploads if there are new photos
        if (photoFiles.length > 0) {
            const photoFormData = new FormData();
            photoFiles.forEach(file => {
                photoFormData.append('photos', file);
            });

            const photoResponse = await fetch(`http://localhost:5000/api/establishments/${establishmentId}/photos`, {
                method: 'POST',
                headers: {
                    'Authorization': authHeader
                },
                body: photoFormData
            });
            
            if (!photoResponse.ok) {
                console.warn("Error uploading photos:", photoResponse.status);
                // Continue even if photo upload fails
            }
        }
        
        // Refresh establishment data to get the updated information
        const refreshResponse = await fetch(`http://localhost:5000/api/establishments/${establishmentId}`, {
            headers: {
                'Authorization': authHeader
            }
        });
        
        if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            setEstablishment(refreshData);
            setPhotos(refreshData.photos || []);
        }

        setLogoFile(null);
        setLogoPreview('');
        setPhotoFiles([]);
        setPhotoPreviewUrls([]);
        
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

  const toggleEditForm = () => {
    setShowEditForm(!showEditForm);
    setActiveTab('profile');
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
                          className="btn dropdown-toggle" 
                          type="button" 
                          onClick={toggleProfileOptions}
                        >
                          Edit Profile
                        </button>
                        {showProfileOptions && (
                        <div className="dropdown-edit">
                          <h2>
                            <button 
                              className="dropdown-item" 
                              onClick={() => {
                                toggleEditForm();
                                setActiveTab('profile');
                              }}
                            >
                              Edit Establishment Details
                            </button>
                          </h2>
                          <h2>
                            <button 
                              className="dropdown-item" 
                              onClick={() => navigate(`/establishments/editaccount/${establishmentId}`)}
                            >
                              Change Account Details
                            </button>
                          </h2>
                        </div>
                        )}
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
                    
                    {/* Photos Management Section (Integrated) */}
                    <div className="photos-management-section">
                      <h3>Establishment Photos</h3>
                      
                      {/* Current Photos Display */}
                      <div className="current-photos">
                        <h4>Current Photos ({photos.length} of 10)</h4>
                        {photos.length > 0 ? (
                          <div className="photos-grid">
                            {photos.map((photo, index) => (
                              <div key={index} className="photo-item">
                                <img 
                                  src={`http://localhost:5000/api/images/establishment/${establishmentId}/photo${index}`}
                                  alt={`Establishment photo ${index + 1}`}
                                  onError={(e) => {
                                    e.target.src = "https://via.placeholder.com/150?text=Error";
                                  }}
                                />
                                <button 
                                  type="button"
                                  className="delete-photo-btn"
                                  onClick={() => handleDeletePhoto(index)}
                                  disabled={isSubmitting}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="no-photos-message">No photos uploaded yet.</span>
                        )}
                      </div>
                      
                      {/* Upload New Photos Section (Integrated) */}
                      <div className="upload-photos-section">
                        <h4>Add New Photos ({photos.length}/10)</h4>
                        <div className="photos-upload-form">
                          <input 
                            type="file" 
                            id="photos" 
                            accept="image/*" 
                            onChange={handlePhotoUpload} 
                            className="file-input"
                            multiple
                            disabled={photos.length >= 10}
                          />
                          <label htmlFor="photos" className="file-label">
                            Choose Photos
                          </label>
                          <span className="help-text">
                            You can add up to {10 - photos.length} more photos
                          </span>
                          
                          {/* Photo Previews */}
                          {photoPreviewUrls.length > 0 && (
                            <div className="preview-photos-grid">
                              {photoPreviewUrls.map((url, index) => (
                                <div key={index} className="photo-preview-item">
                                  <img src={url} alt={`Preview ${index + 1}`} />
                                  <button 
                                    type="button"
                                    className="remove-preview-btn"
                                    onClick={() => removePhotoPreview(index)}
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      type="submit" 
                      className="submit-btn" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Updating...' : 'Update Profile & Photos'}
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