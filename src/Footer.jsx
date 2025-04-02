import React, { useState } from "react";
import "./footer.css";

function Footer() {
  return (
    <footer>
          <div className="site-details">
            <div className="site-name">
              <h3>BITERATE</h3>
            </div>
            <div className="site-description">
              <h6>
                A platform where users can rate and review restaurants, dishes,
                and dining experiences. We help food enthusiasts discover new
                places, compare options, and make informed dining decisions.
              </h6>
            </div>
          </div>

          <div className="site-details">
            <div className="site-name">
              <h3>TERMS OF SERVICE</h3>
            </div>
            <div className="site-description">
              <h6>
                By using our service, you agree to follow our terms. Use it
                lawfully, keep your account secure, and respect our policies. We
                may update these terms, and continued use means acceptance.
              </h6>
            </div>
          </div>

          <div className="developers">
            <div className="group-label">
              <h3>DEVELOPERS</h3>
            </div>
            <div className="group-names">
              <h6>Aguarin</h6>
              <h6>Cabato</h6>
              <h6>Pineda</h6>
              <h6>Quijano</h6>
            </div>
          </div>

          <div className="group-members">
            <div className="group-label">
              <h3>CONTACT US</h3>
            </div>
            <div className="group-email">
              <div className="contact-detail">
                <img src="https://www.svgrepo.com/show/511921/email-1573.svg" alt="Email Icon" />
                <h6>trish_ann_aguarin@dlsu.edu.ph</h6>
              </div>
              <div className="contact-detail">
                <img src="https://www.svgrepo.com/show/511921/email-1573.svg" alt="Email Icon" />
                <h6>marxandrea_cabato@dlsu.edu.ph</h6>
              </div>
              <div className="contact-detail">
                <img src="https://www.svgrepo.com/show/511921/email-1573.svg" alt="Email Icon" />
                <h6>dencel_pineda@dlsu.edu.ph</h6>
              </div>
              <div className="contact-detail">
                <img src="https://www.svgrepo.com/show/511921/email-1573.svg" alt="Email Icon" />
                <h6>jan_quijano@dlsu.edu.ph</h6>
              </div>
            </div>
          </div>
    </footer>
  );
}

export default Footer;
