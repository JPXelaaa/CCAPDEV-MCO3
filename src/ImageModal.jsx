import { useState } from "react";
import "./ImageModal.css";

function ImageModal({ photoUrl, onClose }) {
  if (!photoUrl) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>&times;</button>
        <img src={photoUrl} alt="Enlarged Review" className="modal-image" />
      </div>
    </div>
  );
}

export default ImageModal;