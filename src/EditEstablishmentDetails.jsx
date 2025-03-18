import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./EditEstablishmentDetails.css";
import NavigationBar from "./NavigationBar.jsx";

function EditEstablishmentAccount({ setShowLogin, isLoggedIn, setIsLoggedIn, establishment, setEstablishment }) {
    useEffect(() => {
        const storedEstablishment = JSON.parse(localStorage.getItem("loggedInEstablishment"));
        if (storedEstablishment) {
          setEstablishment(storedEstablishment);
          setIsLoggedIn(true);
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

<div className="content-row">
        {/* ✅ Left Section: Business Details */}
        <div className="left-section">
          <h2 id="sign-up-title">Edit Business Details</h2>

          <p>Business Name</p>
          <input className="form-input" type="text" name="businessName" placeholder="Business Name" required />

          <p>Address 1</p>
          <input className="form-input" type="text" name="Address1" placeholder="Address 1" required />

          <p>Address 2</p>
          <input className="form-input" type="text" name="Address2" placeholder="Address 2" />

          <p>City</p>
          <input className="form-input" type="text" name="city" placeholder="City" required />

          <p>Postal Code</p>
          <input className="form-input" type="text" name="postalCode" placeholder="4-digit code" pattern="^[0-9]{4}$" maxLength="4" required />

          <p>Province</p>
          <select className="form-select" name="Province" required>
            <option value="" disabled>None</option>
            <option value="Manila">Manila</option>
            <option value="Makati">Makati</option>
            <option value="Quezon City">Quezon City</option>
            <option value="Caloocan">Caloocan</option>
          </select>

          <p>Phone Number</p>
          <input className="form-input" type="tel" name="phoneNumber" placeholder="09XX-XXX-XXXX" pattern="[0-9]{4}-[0-9]{3}-[0-9]{4}" required />

          <p>Website (optional)</p>
          <input className="form-input" type="text" name="website" placeholder="http://www.companyaddress.com.ph" />

          <p>Categories</p>
          <input className="form-input" type="text" name="categories" placeholder="Add up to three inputs only (comma separated)" required />

          <p>Hours</p>
          <div className="hours-row">
          <select className="form-select" name="Day" requirede>
            <option value="" disabled>Day</option>
            <option value="Monday">Mon</option>
            <option value="Tuesday">Tues</option>
            <option value="Wednesday">Wed</option>
            <option value="Thursday">Thurs</option>
          </select>
  
          <select className="form-select" name="Start Time" required>
            <option value="" disabled>Start</option>
            <option value="10:00AM">10:00AM</option>
            <option value="10:30AM">10:30AM</option>
            <option value="11:00AM">11:00AM</option>
            <option value="11:30AM">11:30AM</option>
          </select>
  
          <select className="form-select" name="End Time" required>
            <option value="" disabled>End</option>
            <option value="9:00PM">9:00PM</option>
            <option value="9:30PM">9:30PM</option>
            <option value="10:00PM">10:00PM</option>
            <option value="10:30PM">10:30PM</option>
          </select>
          <button type="submit" id="schedule-btn">Add Schedule</button>
        </div>

        <p>Facilities & Services</p>
        <div className="hours-row">
          <select className="form-select" name="Facilities" required>
            <option value="" disabled>Select Facility</option>
            <option value="Pet-Friendly">Pet-Friendly</option>
            <option value="WiFi Included">WiFi Included</option>
            <option value="Offers Delivery">Offers Delivery</option>
          </select>
        </div>

          {/* ✅ Buttons Section */}
          <p>By continuing, you agree to [COMPANY]'s <u>Terms of Service</u> and acknowledge our <u>Privacy Policy.</u></p>
          <div className="button-container">
            <Link to="/establishmentprofile">
              <button type="submit" className="submit-btn">Confirm Changes</button>
            </Link>
            
            <Link to="/establishmentprofile">
              <button type="button" id="cancel">Cancel</button>
            </Link>
          </div>
        </div>

       
        {/* ✅ Right Section: Change Logo & Add Photos */}
        <div className="right-section">
          <div className="logo-container">
            <div className="logo">
                <img src={establishment?.avatar || "https://i.pinimg.com/736x/5b/78/b1/5b78b1c7e4fc33a221fc53c80314ad13.jpg"} alt="Business Logo" style={{ borderRadius: "50px" }} />
            </div>
            <p id="wordlogo">Change Logo 
              <img id="pen" src="https://png.pngtree.com/png-vector/20220826/ourmid/pngtree-edit-subject-edit-pen-vector-png-image_33477488.png" alt="Pen Icon" />
            </p>
          </div>

            <p id="overview">Overview of Business</p>
            <textarea
              className="form-description"
              name="Overview"
              placeholder="Short description of your business"
              required
              defaultValue={establishment?.description || "Short description of your business"}
            />
          </div>

          <div className="add-buttons">
            <button type="button" className="add-btn">Add Photos</button>
          </div>
        </div>
      
    </>
  );
}

export default EditEstablishmentDetails;
