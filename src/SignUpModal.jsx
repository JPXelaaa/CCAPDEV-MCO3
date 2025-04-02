import { useState, useRef, useEffect } from "react";
import "./SignUpModal.css";
import bcrypt from "bcryptjs";
import defaultImg from "./assets/default.png"; // Import the default image

function SignUpModal({ onClose, setIsLoggedIn, setUser }) {
  const [userType, setUserType] = useState("user");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [description, setDescription] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [defaultImageBase64, setDefaultImageBase64] = useState(null);
  const [error, setError] = useState("");
  
  // Establishment-specific fields
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);

  // Load and convert default image to base64 on component mount
  useEffect(() => {
    const loadDefaultImage = async () => {
      try {
        // Create a FileReader to convert the image to base64
        const reader = new FileReader();
        
        // Fetch the default image as a blob
        const response = await fetch(defaultImg);
        const blob = await response.blob();
        
        reader.onloadend = () => {
          setDefaultImageBase64(reader.result);
        };
        
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error("Error loading default image:", err);
      }
    };
    
    loadDefaultImage();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleLogoClick = () => {
    logoInputRef.current.click();
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
    // Reset form fields when switching between user types
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    // Form validation
    if (userType === "user") {
      if (!username.trim()) {
        setError("Username is required");
        return;
      }
    } else {
      if (!name.trim()) {
        setError("Establishment name is required");
        return;
      }
      
      if (!username.trim()) {
        setError("Owner username is required");
        return;
      }
      
      if (!address.trim()) {
        setError("Address is required");
        return;
      }
    }

    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);
      formData.append("userType", userType);
      
      if (userType === "user") {
        formData.append("description", description || "");
        
        if (avatarFile) {
          formData.append("avatar", avatarFile);
        } else if (defaultImageBase64) {
          // Create a blob from base64 and append it as a file
          const fetchResponse = await fetch(defaultImageBase64);
          const blob = await fetchResponse.blob();
          const defaultFile = new File([blob], "default.jpg", { type: "image/jpeg" });
          formData.append("avatar", defaultFile);
        }
      } else {
        formData.append("name", name);
        formData.append("address", address);
        formData.append("description", description || "");
        
        if (logoFile) {
          formData.append("logo", logoFile);
        } else if (defaultImageBase64) {
          // Create a blob from base64 and append it as a file
          const fetchResponse = await fetch(defaultImageBase64);
          const blob = await fetchResponse.blob();
          const defaultFile = new File([blob], "default.jpg", { type: "image/jpeg" });
          formData.append("logo", defaultFile);
        }
      }

      console.log("🔍 Sending sign-up request with data:", { 
        username, 
        password, 
        hashedPassword,
        userType,
        description: description || "",
        hasAvatar: userType === "user" ? (!!avatarFile || !!defaultImageBase64) : false,
        ...(userType === "establishment" && {
          name,
          address,
          hasLogo: !!logoFile || !!defaultImageBase64
        })
      });

      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("🔍 Server Response JSON:", data);

      if (response.ok) {
        if (data.token && data.user) {
          // Store the full user object in memory for the current session
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
      } else {
        setError(data?.message || "Sign-up failed. Please try again.");
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError("Failed to connect to the server. Please try again.");
    }
  };

  return (
    <div className="modal-overlay-su">
      <div className="modal-content-su">
        <h2>{`Sign Up as ${userType === "user" ? "User" : "Establishment"}`}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-layout">
            <div className="form-left-column">
              {userType === "establishment" && (
                <>
                  <div className="input-group">
                    <input
                      className="form-input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Establishment Name"
                      required
                    />
                  </div>
                  
                  <div className="input-group">
                    <input
                      className="form-input"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Address"
                      required
                    />
                  </div>
                </>
              )}
              
              <div className="input-group">
                <label> Username </label>
                <input
                  className="form-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={userType === "user" ? "Username" : "Owner Username"}
                  required
                />
              </div>

              <div className="input-group">
              <label> Password </label>
                <input
                  className="form-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
              </div>

              <div className="input-group">
              <label> Confirm Password </label>
                <input
                  className="form-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  required
                />
              </div>
            </div>

            <div className="form-right-column">
              {userType === "establishment" ? (
                <>
                  <div className="avatar-upload">
                    <div 
                      className="avatar-preview" 
                      onClick={handleLogoClick}
                      style={logoPreview ? { backgroundImage: `url(${logoPreview})` } : defaultImageBase64 ? { backgroundImage: `url(${defaultImageBase64})` } : {}}
                    >
                      {!logoPreview && !defaultImageBase64 && <span>+</span>}
                    </div>
                    <small>Click to add establishment logo</small>
                  </div>
                  
                  <div className="input-group">
                    <textarea
                      className="form-input description-input"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tell us about your establishment..."
                      rows="3"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="avatar-upload">
                    <div 
                      className="avatar-preview" 
                      onClick={handleAvatarClick}
                      style={avatarPreview ? { backgroundImage: `url(${avatarPreview})` } : defaultImageBase64 ? { backgroundImage: `url(${defaultImageBase64})` } : {}}
                    >
                      {!avatarPreview && !defaultImageBase64 && <span>+</span>}
                    </div>
                    <small>Click to add profile picture</small>
                  </div>
                  
                  <div className="input-group">
                    <textarea
                      className="form-input description-input"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows="3"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="form-button">Sign Up</button>
        </form>

        <button 
          className="close-button" 
          onClick={onClose}
        >
          X
        </button>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarChange}
          accept="image/*"
          style={{ display: "none" }}
        />
        
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

export default SignUpModal;