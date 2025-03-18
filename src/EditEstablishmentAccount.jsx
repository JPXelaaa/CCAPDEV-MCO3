import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./EditEstablishmentAccount.css";
import NavigationBar from "./NavigationBar.jsx";

function EditEstablishmentAccount({ setShowLogin, isLoggedIn, setIsLoggedIn, establishment, setEstablishment }) {
    useEffect(() => {
        const storedEstablishment = JSON.parse(localStorage.getItem("loggedInEstablishment"));
        if (storedEstablishment) {
          setEstablishment(storedEstablishment);
          setIsLoggedIn(true);
          setUsername(storedEstablishment.username);
        }
      }, []);

  return (
    <>
      <NavigationBar  
        isLoggedIn={isLoggedIn} 
        setIsLoggedIn={setIsLoggedIn} 
        setShowLogin={setShowLogin} 
        user={establishment} 
        setUser={setEstablishment}
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
            <Link to="/establishmentprofile">
              <button type="button" id="cancel">Cancel</button>
            </Link>

            <Link to="/establishmentprofile">
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
