import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./EditEstablishmentAccount.css";
import NavigationBar from "./NavigationBar.jsx";

function EditEstablishmentAccount({ setShowLogin, setShowSignUp, setShowEstablishmentSignUp, isLoggedIn, setIsLoggedIn, user, setUser }) {

  const location = useLocation();
  const { establishmentId } = useParams(); 
  const [username, setUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const storedEstablishment = JSON.parse(localStorage.getItem("loggedInEstablishment"));
    if (storedEstablishment && !user) {
      setUser(storedEstablishment);
      setIsLoggedIn(true);
    }
  }, [setUser, setIsLoggedIn, user]);

  const updateData = async (e) => {
    e.preventDefault();
  
    console.log("Updating data with the following values:");
    console.log("Username:", username); 
    console.log("Old Password:", oldPassword);
    
    // Validate passwords if changing password
    if (password) {
      if (password !== confirmPassword) {
        alert("New passwords do not match!");
        return;
      }
      
      if (!(await bcrypt.compare(password, user.password))) {
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
    
    try {
      const response = await fetch("http://localhost:5000/api/establishment/editaccount", { //NOT SURE KUNG TAMA TOH
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
        window.location.href = "/establishment";
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
            <form action="/login" method="post">
              <h2 id="sign-up-title"> Change Account Details</h2>

              <p>Username</p>
              <input
                className="form-input-ea"
                type="text"
                name="username"
                placeholder="Username"
                required
                defaultValue={establishment?.username || ""}
              />

              <p>Old Password</p>
              <input
                className="form-input-ea"
                type="password"
                name="oldPassword"
                placeholder="Old Password"
                required
              />

              <p>New Password</p>
              <input
                className="form-input-ea"
                type="password"
                name="newPassword"
                placeholder="New Password"
                required
              />

              <p>Confirm Password</p>
              <input
                className="form-input-ea"
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                required
              />
            </form>
          </div>
        </div>
      </div>

      <div className = "button-section">
            <Link to="/establishment">
              <button type="button" id="cancel">Cancel</button>
            </Link>

            <Link to="/establishment">
              <button type="submit" className="submit-btn">Confirm Changes</button>
            </Link>

            <Link to="/">
              <button className="delete-prompt">Delete</button>
            </Link>
        </div>
    </>
  );
}

export default EditEstablishmentAccount;
