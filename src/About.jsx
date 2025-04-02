import { useState, useEffect } from "react";
import "./HomePage.css";
import "./About.css";
import NavigationBar from "./NavigationBar";
import Footer from "./footer";
import HomeGrid from "./HomeGrid";
import HomeCarousel from "./HomeCarousel";

function HomePage({ setShowLogin, setShowSignUp, setShowEstablishmentSignUp, isLoggedIn, setIsLoggedIn, user, setUser }) { 

  const [isCarousel, setIsCarousel] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [sortOption, setSortOption] = useState(""); 

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    console.log(storedUser);
    if (storedUser && !user) {
      setUser(storedUser);
      setIsLoggedIn(true);
    }
  }, [setUser, setIsLoggedIn, user]);  
  
  return (
    <div className="home-container">
      <NavigationBar
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        setShowLogin={setShowLogin}
        setShowSignUp={setShowSignUp}
        setShowEstablishmentSignUp={setShowEstablishmentSignUp}
        user={user} 
        setUser={setUser}
      />

<div className="main-content center-content">
        <div className="developers-section">
          <h3 className="section-title">DEVELOPERS</h3>
          <div className="dev-team-info">
            <div className="team-identifier">S15 - Group 11</div>
            
            <div className="dev-team-members">
              <div className="developer">
                <div className="dev-name">Aguarin</div>
                <div className="dev-email">trish_ann_aguarin@dlsu.edu.ph</div>
              </div>
              
              <div className="developer">
                <div className="dev-name">Cabato</div>
                <div className="dev-email">marxandrea_cabato@dlsu.edu.ph</div>
              </div>
              
              <div className="developer">
                <div className="dev-name">Pineda</div>
                <div className="dev-email">dencel_pineda@dlsu.edu.ph</div>
              </div>
              
              <div className="developer">
                <div className="dev-name">Quijano</div>
                <div className="dev-email">jan_quijano@dlsu.edu.ph</div>
              </div>
            </div>
          </div>
        </div>
        <div className="libraries-section">
          <div className="dependency-category">
            <h4>Main Dependencies</h4>
            <ul className="dependency-list">
              <li><span className="package-name">react</span> (v19.0.0) - Core UI library for building the user interface</li>
              <li><span className="package-name">react-dom</span> (v19.0.0) - React renderer for web applications</li>
              <li><span className="package-name">react-router-dom</span> (v7.1.5) - Routing library for navigation</li>
              <li><span className="package-name">bootstrap</span> (v5.3.3) - CSS framework for responsive design</li>
              <li><span className="package-name">react-bootstrap</span> (v2.10.9) - React components built on Bootstrap</li>
              <li><span className="package-name">mongodb</span> (v6.13.1) - MongoDB driver for database connectivity</li>
              <li><span className="package-name">bcryptjs</span> (v3.0.2) - Password hashing library for security</li>
            </ul>
          </div>

          <div className="dependency-category">
            <h4>UI & Visual Components</h4>
            <ul className="dependency-list">
              <li><span className="package-name">@jjunyjjuny/react-carousel</span> (v1.1.2) - Carousel component for image slideshows</li>
              <li><span className="package-name">react-slick</span> (v0.30.3) - Carousel and slider component</li>
              <li><span className="package-name">slick-carousel</span> (v1.8.1) - Dependency for react-slick with additional styling</li>
            </ul>
          </div>

          <div className="dependency-category">
            <h4>Styling & CSS Processing</h4>
            <ul className="dependency-list">
              <li><span className="package-name">tailwindcss</span> (v3.4.17) - Utility-first CSS framework</li>
              <li><span className="package-name">autoprefixer</span> (v10.4.20) - PostCSS plugin to parse CSS and add vendor prefixes</li>
              <li><span className="package-name">postcss</span> (v8.5.1) - Tool for transforming CSS with JavaScript plugins</li>
            </ul>
          </div>

          <div className="dependency-category">
            <h4>Development Dependencies</h4>
            <ul className="dependency-list">
              <li><span className="package-name">vite</span> (v6.1.0) - Fast build tool and development server</li>
              <li><span className="package-name">@vitejs/plugin-react</span> (v4.3.4) - Vite plugin for React support</li>
              <li><span className="package-name">eslint</span> (v9.19.0) - JavaScript linting utility</li>
              <li><span className="package-name">@eslint/js</span> (v9.19.0) - JavaScript configurations for ESLint</li>
              <li><span className="package-name">eslint-plugin-react</span> (v7.37.4) - React specific linting rules</li>
              <li><span className="package-name">eslint-plugin-react-hooks</span> (v5.0.0) - ESLint rules for React hooks</li>
              <li><span className="package-name">eslint-plugin-react-refresh</span> (v0.4.18) - ESLint plugin for React Refresh</li>
              <li><span className="package-name">globals</span> (v15.14.0) - Global identifier validation for ESLint</li>
              <li><span className="package-name">@types/react</span> (v19.0.8) - TypeScript definitions for React</li>
              <li><span className="package-name">@types/react-dom</span> (v19.0.3) - TypeScript definitions for React DOM</li>
            </ul>
          </div>
        </div>

        <div className="additional-info">
          <h3 className="section-title">Where to Find Additional Dependencies Information</h3>
          <div className="info-content">
            <p>You can check for additional external libraries and npm dependencies in the following locations:</p>
            <ul>
              <li><strong>package.json file</strong> - The main file that lists all direct dependencies and devDependencies</li>
              <li><strong>node_modules directory</strong> - Contains all installed packages, including transitive dependencies</li>
              <li><strong>package-lock.json</strong> - Contains the exact version dependency tree that was generated for your project</li>
              <li><strong>import statements</strong> - Check individual component files for import statements that may reveal usage of specific libraries</li>
              <li><strong>CDN links</strong> - Check index.html for any CDN-loaded libraries that might not be included in package.json</li>
            </ul>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default HomePage;