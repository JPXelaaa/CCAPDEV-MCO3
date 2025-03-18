import "./EstablishmentHeader.css";
import { Link } from "react-router-dom";
import Rating from "./Rating"; // ✅ Import the Rating component

function EstablishmentHeader({ isLoggedIn, setIsLoggedIn, establishment }) { 
  return (
    <div className="profile-header">
        <div className="image-cover">
            <div className="profile-header-inner">
                <div className="profile-header-picture">
                    {/* ✅ Show logged-in establishment's profile picture OR default */}
                    <img
                        src={establishment?.avatar || "https://i.pinimg.com/736x/5b/78/b1/5b78b1c7e4fc33a221fc53c80314ad13.jpg"}
                        alt="Establishment Profile"
                    />
                </div>
                <div className="profile-header-details">
                    {/* ✅ Show establishment's name */}
                    <p id="establishment-name"> {establishment?.name} </p>

                    {/* ✅ Show star rating based on establishment rating */}
                    <div className="overall-rating">
                        <Rating rating={establishment?.rating || 0} /> 
                    </div>

                    <p id="num-review">{establishment?.rating?.length || 0} stars </p> {/*Ask how to show the total number of reviews for that certain establishment based on the data in the db*/}
                </div>

                <div className="edit-profile">
                    {isLoggedIn ? (
                        <div className="dropdown">
                        <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                            Edit Profile
                        </button>
                        <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                            <li><Link className="dropdown-item" to="/edit-establishment-account">Change Account Details</Link></li>
                            <li><Link className="dropdown-item" to="/edit-establishment-deets">Edit Establishment Details</Link></li>
                            <li><Link className="dropdown-item" to="/establishment-view-view-as-user">View as User</Link></li>
                        </ul>
                        </div>
                    ) : (
                        <div></div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}

export default EstablishmentHeader;
