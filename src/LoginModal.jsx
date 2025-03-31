import { useState } from "react";
import "./LoginModal.css";

function LoginModal({ onClose, setIsLoggedIn, setUser }) {
  const [userType, setUserType] = useState("user");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password, userType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Invalid login credentials.");
      }

      if (!data.token || !data.user) {
        throw new Error("Invalid response from server");
      }

      // Store token and user data
      localStorage.setItem("token", data.token);
      const minimalUser = { id: data.user.id, username: data.user.username };
      localStorage.setItem("loggedInUser", JSON.stringify(minimalUser));
      
      // Update application state
      setIsLoggedIn(true);
      setUser(data.user);
      
      // Close modal after successful login
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