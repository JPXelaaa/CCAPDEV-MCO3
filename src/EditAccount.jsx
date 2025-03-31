import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import "./EditAccount.css";
import NavigationBar from "./NavigationBar.jsx";

function EditAccount({ setShowLogin, setShowSignUp, setShowEstablishmentSignUp, isLoggedIn, setIsLoggedIn, user, setUser }) {
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [description, setDescription] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (storedUser && !user) {
      setUser(storedUser);
      setIsLoggedIn(true);
    }
  }, [setUser, setIsLoggedIn, user]);

  const getAvatarUrl = (userId) => {
    if (!userId) {
      return "https://i.pinimg.com/originals/6d/8b/9b/6d8b9b45c14da6fbfd09a7ede56b4a83.jpg";
    }
    return `http://localhost:5000/api/images/user/${userId}/avatar`;
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatar(previewUrl);
    }
  };

  const updateData = async (e) => {
    e.preventDefault();
  
    // Validate passwords if changing password
    if (password) {
      if (password !== confirmPassword) {
        alert("New passwords do not match!");
        return;
      }
      
      if (!oldPassword) {
        alert("Please enter your current password to change to a new password.");
        return;
      }
    }
  
    const formData = new FormData();
    formData.append("id", user._id);
    
    if (username) {
      formData.append("username", username);
    }
    
    if (oldPassword) {
      formData.append("oldPassword", oldPassword);
    }
    
    if (password) {
      formData.append("password", password);
    }
    
    if (description !== undefined) {
      formData.append("description", description);
    }
    
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }
  
    try {
      const response = await fetch("http://localhost:5000/api/edit-account", {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();
      console.log("Server response:", data);
  
      if (data.status === "success") {
        // Update the user state with the returned user data
        setUser(data.user);
        
        // Update localStorage with the new user data
        localStorage.setItem("loggedInUser", JSON.stringify(data.user));
        
        alert("Account updated successfully!");
        window.location.href = "/userprofile";
      } else {
        // Handle error
        alert(data.message || "Error updating account. Please try again.");
      }
    } catch (error) {
      console.error("Error updating account:", error);
      alert("Failed to connect to the server. Please try again.");
    }
  };

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

      <div>
        <div className="content-row">
          <div className="left-section">
            <form>
              <h2 id="change-account-title"> Change Account Details</h2>

              <p>Username</p>
              <input
                className="form-input-ea"
                type="text"
                placeholder="Username"
                value={username || user?.username || ""}
                onChange={(e) => setUsername(e.target.value)}
              />

              <p>Old Password</p>
              <input
                className="form-input-ea"
                type="password"
                placeholder="Old Password"
                onChange={(e) => setOldPassword(e.target.value)}
              />

              <p>New Password</p>
              <input
                className="form-input-ea"
                type="password"
                placeholder="New Password"
                onChange={(e) => setPassword(e.target.value)}
              />

              <p>Confirm Password</p>
              <input
                className="form-input-ea"
                type="password"
                placeholder="Confirm Password"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </form>

            <div className="confirm-and-cancel">
              <button type="submit" className="confirm-btn" onClick={updateData}>Confirm Changes</button>
              <Link to="/userprofile">
                <button type="button" id="cancel">Cancel</button>
              </Link>
            </div>
            <div className="delete-prompt">
              <Link to="/">
                <button className="delete-btn">Delete Account</button>
              </Link>
            </div>
          </div>

          <div className="right-section">
            <div className="logo-container" onClick={handleAvatarClick}>
              <img
                id="avatar"
                src={avatar || (user?._id ? getAvatarUrl(user._id) : "https://i.pinimg.com/originals/6d/8b/9b/6d8b9b45c14da6fbfd09a7ede56b4a83.jpg")}
                alt="User Avatar"
                onError={(e) => {
                  e.target.src = "https://i.pinimg.com/originals/6d/8b/9b/6d8b9b45c14da6fbfd09a7ede56b4a83.jpg";
                }}
              />
              <label htmlFor="avatar-upload" id="wordlogo">
                Change Avatar
                <img
                  id="pen"
                  src="https://png.pngtree.com/png-vector/20220826/ourmid/pngtree-edit-subject-edit-pen-vector-png-image_33477488.png"
                  alt="Pen Icon"
                />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />
            </div>

            <div className="description-container">
              <p>Description</p>
              <textarea
                className="description-input"
                placeholder="Tell us about yourself..."
                value={description || user?.description || ""}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditAccount;