import { useState } from "react";
import "./LoginModal.css";

function LoginModal({ onClose, setIsLoggedIn, setUser }) {
  const [userType, setUserType] = useState("user");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  //const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const response = await fetch("https://ccapdevmco3.vercel.app/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          username, 
          password, 
          userType,
         // rememberMe 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data?.message || "Invalid login credentials.");
      }
      
      if (!data.token || !data.user) {
        throw new Error("Invalid response from server");
      }
      
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
        console.error("Failed to store user data in storage", storageError);
        setError("Warning: Unable to remember login between sessions due to storage limitations");
        setTimeout(() => {
          setIsLoggedIn(true);
          onClose();
        }, 3000);
        return;
      }
      
      setIsLoggedIn(true);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-modal-overlay">
      <div className="login-modal-content">
        <h2>{`Log In as ${userType === "user" ? "User" : "Establishment"}`}</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-input-group">
            <label>Username</label>
            <div className="login-input-box">
              <input
                className="login-form-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="login-input-group">
            <label>Password</label>
            <div className="login-input-box">
              <input
                className="login-form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="login-remember-me">
            <input
              type="checkbox"
              //id="rememberMe"
              //checked={rememberMe}
              //onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe">Remember me for 3 weeks</label>
          </div>
          
          {error && <p className="login-error-message">{error}</p>}
          
          <div className="login-button-container">
            <button
              type="button"
              className={`login-role-button ${userType === 'user' ? 'selected' : ''}`}
              onClick={() => setUserType('user')}
            >
              User
            </button>
            <button
              type="button"
              className={`login-role-button ${userType === 'establishment' ? 'selected' : ''}`}
              onClick={() => setUserType('establishment')}
            >
              Establishment
            </button>
          </div>
          
          <button type="submit" className="login-form-button" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </form>
        <button className="login-close-button" onClick={onClose}>X</button>
      </div>
    </div>
  );
}

export default LoginModal;