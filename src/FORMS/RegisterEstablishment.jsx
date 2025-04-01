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
  
  // Default hours for Monday to Sunday (including open and close times)
  const defaultHours = [
    { day: "Monday", open: "09:00", close: "17:00" },
    { day: "Tuesday", open: "09:00", close: "17:00" },
    { day: "Wednesday", open: "09:00", close: "17:00" },
    { day: "Thursday", open: "09:00", close: "17:00" },
    { day: "Friday", open: "09:00", close: "17:00" },
    { day: "Saturday", open: "09:00", close: "17:00" },
    { day: "Sunday", open: "09:00", close: "17:00" }
  ];
  
  const [hours, setHours] = useState(defaultHours);
  
  // Refs for file inputs
  const logoInputRef = useRef(null);
  
  // New state variable for adding new business hours
  const [newHour, setNewHour] = useState({ day: "", open: "09:00", close: "17:00" });
  const [showHoursEditor, setShowHoursEditor] = useState(false);

  // Days of the week for dropdown
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const handleAddHours = () => {
    if (newHour.day) {
      // Check if day already exists
      const existingIndex = hours.findIndex(h => h.day === newHour.day);
      
      if (existingIndex >= 0) {
        // Update existing day
        const updatedHours = [...hours];
        updatedHours[existingIndex] = { ...newHour };
        setHours(updatedHours);
      } else {
        // Add new day
        setHours([...hours, { ...newHour }]);
      }
      
      setNewHour({ day: "", open: "09:00", close: "17:00" });
    }
  };

  const handleUpdateHours = (index, field, value) => {
    const updatedHours = [...hours];
    updatedHours[index] = { 
      ...updatedHours[index], 
      [field]: value 
    };
    setHours(updatedHours);
  };

  const handleRemoveHours = (index) => {
    setHours(hours.filter((_, i) => i !== index));
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
    
    // Move to next step if not at the last step
    if (step < 3) {
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
      
      // Add hours as JSON string (including day, open, and close properties)
      formData.append("hours", JSON.stringify(hours));
      
      // Add files
      if (logoFile) {
        formData.append("logo", logoFile);
      }
      
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
        setUser(data.user);
              
        const minimalUser = {
          _id: data.user._id,
          username: data.user.username,
          userType: data.user.userType,
        };

        try {
          localStorage.setItem("token", data.token);
          localStorage.setItem("loggedInUser", JSON.stringify(minimalUser));
        } catch (storageError) {
          console.error("Failed to store user data in localStorage", storageError);
          // If localStorage fails, at least keep the user logged in for this session
          setError("Warning: Unable to remember login between sessions due to storage limitations");
          // Wait 3 seconds before closing so the user can see the warning
          setTimeout(() => {
            setIsLoggedIn(true);
            onClose();
          }, 3000);
          return;
        }

        setIsLoggedIn(true);
        onClose();
      }
    } catch (error) {
      console.error("❌ Error submitting form:", error);
      setError("Failed to register establishment. Please try again.");
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
              <p>Email Address</p>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
              />
            </div>
            <div className="form-group">
              <p>Username</p>
              <input
                className="form-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
              />
            </div>
            <div className="form-group">
              <p>Password</p>
              <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
            </div>
            <div className="form-group">
              <p>Confirm Password</p>
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
                  <p>Establishment Name</p>
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
                  <p>Overview of Business</p>
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
              <p>Address 1</p>
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
              <p>Address 2 (Optional)</p>
              <input
                className="form-input"
                type="text"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                placeholder="Address 2"
              />
            </div>
            <div className="form-group">
              <p>City</p>
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
              <p>Postal Code</p>
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
              <p>Province</p>
              <input
                className="form-input"
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                placeholder="Province"
                required
              />
            </div>
            <div className="form-group">
              <p>Phone Number</p>
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
              <p>Website (Optional)</p>
              <input
                className="form-input"
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="http://www.companyaddress.com.ph"
              />
            </div>
            <div className="form-group">
              <p>Categories</p>
              <input
                className="form-input"
                type="text"
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
                placeholder="Add up to three inputs only (comma separated)"
                required
              />
            </div>
            
            {/* Business Hours Section */}
            <div className="form-group">
              <p>Business Hours</p>
              <button 
                type="button"
                className="toggle-hours-btn"
                onClick={() => setShowHoursEditor(!showHoursEditor)}
              >
                {showHoursEditor ? "Hide Hours Editor" : "Edit Business Hours"}
              </button>
              
              {showHoursEditor && (
                <div className="hours-editor">
                  <div className="hours-table">
                    <div className="hours-header">
                      <span>Day</span>
                      <span>Opening Time</span>
                      <span>Closing Time</span>
                      <span>Actions</span>
                    </div>
                    
                    {hours.map((hour, index) => (
                      <div key={index} className="hours-row">
                        <span>{hour.day}</span>
                        <input
                          type="time"
                          value={hour.open}
                          onChange={(e) => handleUpdateHours(index, 'open', e.target.value)}
                        />
                        <input
                          type="time"
                          value={hour.close}
                          onChange={(e) => handleUpdateHours(index, 'close', e.target.value)}
                        />
                        <button 
                          type="button" 
                          className="remove-hours-btn"
                          onClick={() => handleRemoveHours(index)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="add-hours">
                    <select
                      value={newHour.day}
                      onChange={(e) => setNewHour({...newHour, day: e.target.value})}
                    >
                      <option value="">Select Day</option>
                      {daysOfWeek.filter(day => !hours.some(h => h.day === day)).map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                    <input
                      type="time"
                      value={newHour.open}
                      onChange={(e) => setNewHour({...newHour, open: e.target.value})}
                    />
                    <input
                      type="time"
                      value={newHour.close}
                      onChange={(e) => setNewHour({...newHour, close: e.target.value})}
                    />
                    <button 
                      type="button" 
                      className="add-hours-btn"
                      onClick={handleAddHours}
                      disabled={!newHour.day}
                    >
                      Add Hours
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="submit-container">
              <button 
                type="button" 
                className="submit-btn"
                onClick={handleSubmit}
              >
                Finish
              </button>
            </div>
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
          
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={s === step ? "current-step" : "step"}
              onClick={() => {
                // Only allow going back to previous steps
                if (s < step) setStep(s);
              }}
            ></div>
          ))}
          
          {step < 3 && (
            <div className="arrow right" onClick={handleNext}></div>
          )}
        </div>
        
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
      </div>
    </div>
  );
}

export default RegisterEstablishment;