import React, { useEffect } from "react";

export default function PhotoLightbox({ image, title, onClose }) {
  useEffect(() => {
    document.body.classList.add("modal-open");
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  if (!image) return null;

  return (
    <div className="modal active photo-lightbox-modal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="photo-lightbox-content">
        <button className="close lightbox-close" onClick={onClose} aria-label="Close">&times;</button>
        <div className="lightbox-img-wrapper">
          <img src={image} alt={title || "Milestone Attachment"} className="lightbox-img" />
        </div>
        {title && <div className="lightbox-caption">{title}</div>}
      </div>
    </div>
  );
}
