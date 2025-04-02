import { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import "./EditEstablishmentAccount.css";
import NavigationBar from "./NavigationBar.jsx";

function EditEstablishmentAccount({ setShowLogin, setShowSignUp, setShowEstablishmentSignUp, isLoggedIn, setIsLoggedIn, user, setUser }) {

  const location = useLocation();
  const { establishmentId } = useParams(); 
  const [username, setUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      // Set other fields as needed
      return;
    }
    
    // First try to get from localStorage consistently
    const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (storedUser) {
      setUser(storedUser);
      setIsLoggedIn(true);
      setUsername(storedUser.username || "");
    }
  }, [setUser, setIsLoggedIn, user]);

  const updateData = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
  
    // Validate form
    if (password && password !== confirmPassword) {
      setError("New passwords do not match!");
      setIsLoading(false);
      return;
    }
    
    if (!oldPassword && (password || confirmPassword)) {
      setError("Please enter your current password to change to a new password.");
      setIsLoading(false);
      return;
    }
  
    const userData = {
      id: user?._id,
      username: username || undefined,
      oldPassword: oldPassword || undefined,
      newPassword: password || undefined
    };
    
    try {
      const API_URL = "http://localhost:5000/api/establishment/editaccount";
      console.log("Sending request to:", API_URL);
      
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
  
      // Check if the response is OK before trying to parse JSON
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Server response:", data);
  
      if (data.status === "success") {
        // Update the user state with the returned user data
        setUser(data.user);
        
        // IMPORTANT: Store in loggedInUser instead of loggedInEstablishment
        // This is what NavigationBar looks for
        localStorage.setItem("loggedInUser", JSON.stringify(data.user));

        alert("Account updated successfully!");
        setTimeout(() => {
          window.location.href = `/establishment/manage/${establishmentId}`;
        }, 100);
      } else {
        // Handle error from server
        setError(data.message || "Error updating account. Please try again.");
      }
    } catch (error) {
      console.error("Error updating account:", error);
      setError(`Failed to update account: ${error.message}. Please check your API endpoint and server.`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEstablishmentAccount = async () => {
    if (!window.confirm("Are you sure you want to delete this establishment account? This action cannot be undone.")) {
      return;
    }
  
    try {
      const API_URL = "http://localhost:5000/api/delete-establishment-account";
      
      const response = await fetch(API_URL, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: user?._id }),
      });
  
      const data = await response.json();
      if (data.status === "success") {
        alert("Establishment account deleted successfully!");
        localStorage.removeItem("loggedInUser");
        setUser(null);
        setIsLoggedIn(false);
        window.location.href = "/";
      } else {
        alert(data.message || "Failed to delete account.");
      }
    } catch (error) {
      console.error("Error deleting establishment account:", error);
      alert("An error occurred while deleting the account. Please try again.");
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
            <form onSubmit={updateData}>
              <h2 id="change-account-title">Change Account Details</h2>
              
              {error && <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}

              <p>Username</p>
              <input
                className="form-input-ea"
                type="text"
                name="username"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <p>Old Password</p>
              <input
                className="form-input-ea"
                type="password"
                name="oldPassword"
                placeholder="Old Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />

              <p>New Password</p>
              <input
                className="form-input-ea"
                type="password"
                name="newPassword"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <p>Confirm Password</p>
              <input
                className="form-input-ea"
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              
              <div className="confirm-and-cancel">
                
                <button 
                  type="submit" 
                  className="confirm-btn" 
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Confirm Changes"}
                </button>

                <Link to={user?._id ? `/establishment/${user._id}` : "/establishment"}>
                  <button type="button" id="cancel">Cancel</button>
                </Link>
              </div>
              
              <div className="delete-prompt">  
              <button type="button" className="delete-btn" onClick={deleteEstablishmentAccount}>
                Delete Account
              </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditEstablishmentAccount;