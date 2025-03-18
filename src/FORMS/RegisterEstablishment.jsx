import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./RegisterEstablishment.css";

function RegisterEstablishment({ onClose, setIsLoggedIn, setUser }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  
  // Step 1: Account Information
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Step 2: Business Information
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  
  // Step 3: Location Information
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [province, setProvince] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [website, setWebsite] = useState("");
  const [categories, setCategories] = useState("");
  const [hours, setHours] = useState([]);
  const [facilities, setFacilities] = useState([]);
  
  // Step 4: Photos and Menu
  const [photos, setPhotos] = useState([]);
  const [menu, setMenu] = useState([]);
  
  // Refs for file inputs
  const logoInputRef = useRef(null);
  const photosInputRef = useRef(null);
  const menuInputRef = useRef(null);
  
  // New state variables and handlers for hours and facilities
  const [newHour, setNewHour] = useState({ day: "", start: "", end: "" });
  const [newFacility, setNewFacility] = useState("");

  const handleAddHours = () => {
    if (newHour.day && newHour.start && newHour.end) {
      setHours([...hours, { ...newHour }]);
      setNewHour({ day: "", start: "", end: "" });
    }
  };

  const handleRemoveHours = (index) => {
    setHours(hours.filter((_, i) => i !== index));
  };

  const handleAddFacility = () => {
    if (newFacility.trim()) {
      setFacilities([...facilities, newFacility.trim()]);
      setNewFacility("");
    }
  };

  const handleRemoveFacility = (index) => {
    setFacilities(facilities.filter((_, i) => i !== index));
  };
  
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };
  
  const handleLogoClick = () => {
    logoInputRef.current.click();
  };
  
  const handlePhotosChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setPhotos(prevPhotos => [...prevPhotos, ...files]);
    }
  };
  
  const handleMenuChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setMenu(prevMenu => [...prevMenu, ...files]);
    }
  };
  
  const handleNext = () => {
    setError("");
    
    // Validate current step
    if (step === 1) {
      if (!username.trim()) {
        setError("Username is required");
        return;
      }
      if (!email.trim()) {
        setError("Email is required");
        return;
      }
      if (!password.trim()) {
        setError("Password is required");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    } else if (step === 2) {
      if (!name.trim()) {
        setError("Establishment name is required");
        return;
      }
    } else if (step === 3) {
      if (!address1.trim()) {
        setError("Address is required");
        return;
      }
      if (!city.trim()) {
        setError("City is required");
        return;
      }
      if (!postalCode.trim()) {
        setError("Postal code is required");
        return;
      }
      if (!province) {
        setError("Province is required");
        return;
      }
      if (!phoneNumber.trim()) {
        setError("Phone number is required");
        return;
      }
    }
    
    // Move to next step
    if (step < 4) {
      setStep(step + 1);
    }
  };
  
  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    
    try {
      const formData = new FormData();
      
      // Account information
      formData.append("username", username);
      formData.append("password", password);
      formData.append("email", email);
      
      // Business information
      formData.append("name", name);
      formData.append("description", description || "");
      
      // Location information
      const fullAddress = `${address1}${address2 ? ', ' + address2 : ''}, ${city}, ${province} ${postalCode}`;
      formData.append("address", fullAddress);
      formData.append("phoneNumber", phoneNumber);
      formData.append("website", website || "");
      formData.append("categories", categories || "");
      
      // Add hours and facilities as JSON strings
      formData.append("hours", JSON.stringify(hours));
      formData.append("facilities", JSON.stringify(facilities));
      
      // Add files
      if (logoFile) {
        formData.append("logo", logoFile);
      }
      
      // Add photos
      photos.forEach((photo) => {
        formData.append("photos", photo);
      });
      
      // Add menu items
      menu.forEach((menuItem) => {
        formData.append("menu", menuItem);
      });
      
      console.log("🔍 Sending establishment registration request");
      
      const response = await fetch("http://localhost:5000/api/register-establishment", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Server error:", response.status, errorText);
        try {
          const errorJson = JSON.parse(errorText);
          setError(errorJson.message || "Failed to register establishment");
        } catch (e) {
          setError(`Server error: ${response.status}`);
        }
        return;
      }

      const data = await response.json();
      console.log("✅ Server Response:", data);
      
      if (data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("loggedInUser", JSON.stringify(data.user));
        setIsLoggedIn(true);
        setUser(data.user);
        onClose();
        navigate(`/establishment/${data.user._id}`);
      }
    } catch (error) {
      console.error("❌ Error submitting form:", error);
      setError("Failed to register establishment. Please try again.");
    }
  };
  
  const addHour = (day, start, end) => {
    if (day && start && end) {
      setHours([...hours, { day, start, end }]);
    }
  };
  
  const addFacility = (facility) => {
    if (facility && !facilities.includes(facility)) {
      setFacilities([...facilities, facility]);
    }
  };
  
  // Render different steps
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="step-content">
            <h2 className="step-title">Account Information</h2>
            <div className="form-group">
              <label>Email Address</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Input email address"
                required
              />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input
                className="form-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Input username"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Input password"
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                className="form-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
              />
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="step-content">
            <h2 className="step-title">Business Name and Logo</h2>
            <div className="content-row">
              <div className="logo-container">
                <div 
                  className="logo-preview" 
                  onClick={handleLogoClick}
                  style={logoPreview ? { backgroundImage: `url(${logoPreview})` } : {}}
                >
                  {!logoPreview && <span>+</span>}
                </div>
                <p className="logo-text">Add Logo</p>
              </div>
              
              <div className="input-container">
                <div className="form-group">
                  <label>Establishment Name</label>
                  <input
                    className="form-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Establishment name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Overview of Business</label>
                  <textarea
                    className="form-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description of your business"
                    rows="4"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="step-content">
            <h2 className="step-title">Location Information</h2>
            <div className="form-group">
              <label>Address 1</label>
              <input
                className="form-input"
                type="text"
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                placeholder="Address 1"
                required
              />
            </div>
            <div className="form-group">
              <label>Address 2 (Optional)</label>
              <input
                className="form-input"
                type="text"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                placeholder="Address 2"
              />
            </div>
            <div className="form-group">
              <label>City</label>
              <input
                className="form-input"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                required
              />
            </div>
            <div className="form-group">
              <label>Postal Code</label>
              <input
                className="form-input"
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                pattern="^[0-9]{4}$"
                maxLength="4"
                placeholder="4-digit code"
                required
              />
            </div>
            <div className="form-group">
              <label>Province</label>
              <select
                className="form-select"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                required
              >
                <option value="">None</option>
                <option value="Manila">Manila</option>
                <option value="Makati">Makati</option>
                <option value="Quezon City">Quezon City</option>
                <option value="Caloocan">Caloocan</option>
              </select>
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                className="form-input"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="09XX-XXX-XXXX"
                required
              />
            </div>
            <div className="form-group">
              <label>Website (Optional)</label>
              <input
                className="form-input"
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="http://www.companyaddress.com.ph"
              />
            </div>
            <div className="form-group">
              <label>Categories</label>
              <input
                className="form-input"
                type="text"
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
                placeholder="Add up to three inputs only (comma separated)"
                required
              />
            </div>
            
            {/* Hours section */}
            <div className="form-group">
              <label>Hours</label>
              <div className="hours-input">
                <select
                  className="form-select"
                  value={newHour.day}
                  onChange={(e) => setNewHour({ ...newHour, day: e.target.value })}
                >
                  <option value="">Select Day</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
                <input
                  type="time"
                  className="form-input"
                  value={newHour.start}
                  onChange={(e) => setNewHour({ ...newHour, start: e.target.value })}
                />
                <input
                  type="time"
                  className="form-input"
                  value={newHour.end}
                  onChange={(e) => setNewHour({ ...newHour, end: e.target.value })}
                />
                <button type="button" onClick={handleAddHours} className="add-btn">Add</button>
              </div>
              <div className="hours-display">
                {hours.map((hour, index) => (
                  <div key={index} className="hour-item">
                    {hour.day}: {hour.start} - {hour.end}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveHours(index)}
                      className="remove-btn"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Facilities section */}
            <div className="form-group">
              <label>Facilities & Services</label>
              <div className="facilities-input">
                <input
                  type="text"
                  className="form-input"
                  value={newFacility}
                  onChange={(e) => setNewFacility(e.target.value)}
                  placeholder="Enter a facility or service"
                />
                <button type="button" onClick={handleAddFacility} className="add-btn">Add</button>
              </div>
              <div className="facilities-display">
                {facilities.map((facility, index) => (
                  <div key={index} className="facility-item">
                    {facility}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveFacility(index)}
                      className="remove-btn"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="step-content">
            <h2 className="step-title">Final Steps</h2>
            <p className="final-step-text">Final Steps..</p>
            
            <div className="content-row">
              <div className="box-container">
                <div 
                  className="add-box"
                  onClick={() => photosInputRef.current.click()}
                >
                  <span className="plus">+</span>
                  <p>Add Photos</p>
                </div>
                {photos.length > 0 && (
                  <p className="file-count">{photos.length} photos selected</p>
                )}
              </div>
              
              <div className="box-container">
                <div 
                  className="add-box"
                  onClick={() => menuInputRef.current.click()}
                >
                  <span className="plus">+</span>
                  <p>Add Menu</p>
                </div>
                {menu.length > 0 && (
                  <p className="file-count">{menu.length} menu items selected</p>
                )}
              </div>
            </div>
            
            <p className="optional-text">
              <i>This is optional. You may add them later on under "Edit business details."</i>
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {renderStep()}
        
        {error && <p className="error-message">{error}</p>}
        
        <div className="steps-container">
          {step > 1 && (
            <div className="arrow left" onClick={handlePrevious}></div>
          )}
          
          {[1, 2, 3, 4].map((s) => (
            <div 
              key={s} 
              className={s === step ? "current-step" : "step"}
              onClick={() => {
                // Only allow going back to previous steps
                if (s < step) setStep(s);
              }}
            ></div>
          ))}
          
          {step < 4 && (
            <div className="arrow right" onClick={handleNext}></div>
          )}
        </div>
        
        {step === 4 && (
          <div className="submit-container">
            <button 
              type="button" 
              className="submit-btn"
              onClick={handleSubmit}
            >
              Finish
            </button>
          </div>
        )}
        
        <button 
          className="close-button" 
          onClick={onClose}
        >
          X
        </button>
        
        <input
          type="file"
          ref={logoInputRef}
          onChange={handleLogoChange}
          accept="image/*"
          style={{ display: "none" }}
        />
        
        <input
          type="file"
          ref={photosInputRef}
          onChange={handlePhotosChange}
          accept="image/*"
          multiple
          style={{ display: "none" }}
        />
        
        <input
          type="file"
          ref={menuInputRef}
          onChange={handleMenuChange}
          accept="image/*"
          multiple
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
}

export default RegisterEstablishment;
