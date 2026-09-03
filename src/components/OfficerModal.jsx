import React, { useState, useEffect } from "react";
import { DEFAULT_TIERS } from "../data/officers";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function resizeImage(file, maxSize = 350) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const AVAILABLE_ICONS = ["👑", "⭐", "📝", "💳", "📊", "📢", "🌐", "✨", "🎓", "🏆", "💡", "🛡️", "📋", "🎖️"];

export default function OfficerModal({ officer, onClose, onSave, onDelete }) {
  const isEditing = Boolean(officer?.id);

  const [name, setName] = useState(officer?.name || "");
  const [position, setPosition] = useState(officer?.position || "");
  const [tierLevel, setTierLevel] = useState(officer?.tierLevel || "Level 1");
  const [tierName, setTierName] = useState(
    officer?.tierName || DEFAULT_TIERS.find((t) => t.tierLevel === "Level 1")?.tierName || "Executive Leadership"
  );
  const [roleTag, setRoleTag] = useState(officer?.roleTag || "");
  const [icon, setIcon] = useState(officer?.icon || "👑");
  const [isGovernor, setIsGovernor] = useState(Boolean(officer?.isGovernor));
  const [photo, setPhoto] = useState(officer?.photo || "");

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

  const handleTierChange = (level) => {
    setTierLevel(level);
    const matched = DEFAULT_TIERS.find((t) => t.tierLevel === level);
    if (matched) {
      setTierName(matched.tierName);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      alert("The profile image must be 10MB or smaller.");
      e.target.value = "";
      return;
    }
    try {
      const resized = await resizeImage(file, 350);
      setPhoto(resized);
    } catch (err) {
      alert("Failed to process image.");
    }
    e.target.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !position.trim()) {
      alert("Please fill in the Officer Name and Position.");
      return;
    }

    const officerData = {
      id: officer?.id || "off-" + Date.now(),
      name: name.trim(),
      position: position.trim(),
      tierLevel,
      tierName: tierName.trim() || tierLevel,
      roleTag: roleTag.trim() || position.trim(),
      icon,
      isGovernor,
      photo,
    };

    onSave(officerData);
  };

  return (
    <div className="modal active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content officer-modal-content">
        <button className="close" onClick={onClose} aria-label="Close">&times;</button>
        <h2>{isEditing ? "✏️ Edit Officer" : "➕ Add New Officer"}</h2>
        <p style={{ color: "#888", fontSize: "14px", marginBottom: "20px" }}>
          {isEditing
            ? "Update details or picture for this student officer."
            : "Add a new member to the BSHM organizational chart."}
        </p>

        <form onSubmit={handleSubmit}>
          {/* PHOTO UPLOAD PREVIEW */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px", background: "#0b0b0b", padding: "14px", borderRadius: "14px", border: "1px solid #292929" }}>
            <div className="officer-modal-avatar">
              {photo ? (
                <img src={photo} alt="Preview" className="officer-modal-img" />
              ) : (
                <div style={{ fontSize: "24px" }}>{icon}</div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="officerPhotoInput" className="btn btn-secondary btn-small" style={{ marginRight: "8px" }}>
                {photo ? "Change Photo" : "Upload Photo"}
              </label>
              <input
                id="officerPhotoInput"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              {photo && (
                <button
                  type="button"
                  className="btn btn-danger btn-small"
                  onClick={() => setPhoto("")}
                >
                  Remove Photo
                </button>
              )}
              <div style={{ fontSize: "12px", color: "#777", marginTop: "6px" }}>
                JPG, PNG, or WEBP. Auto-cropped to profile format.
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="offName">Officer Full Name</label>
            <input
              id="offName"
              type="text"
              className="form-control"
              placeholder="e.g. JUAN D. DELA CRUZ"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="offPos">Position Title</label>
            <input
              id="offPos"
              type="text"
              className="form-control"
              placeholder="e.g. Governor, Vice Governor, Secretary"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              required
            />
          </div>

          <div className="modal-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div className="form-group">
              <label htmlFor="offTier">Hierarchy Level</label>
              <select
                id="offTier"
                className="form-control"
                value={tierLevel}
                onChange={(e) => handleTierChange(e.target.value)}
              >
                {DEFAULT_TIERS.map((t) => (
                  <option key={t.tierLevel} value={t.tierLevel}>
                    {t.tierLevel} ({t.tierName})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="offTag">Role Tag / Subtitle</label>
              <input
                id="offTag"
                type="text"
                className="form-control"
                placeholder="e.g. Head of Organization"
                value={roleTag}
                onChange={(e) => setRoleTag(e.target.value)}
              />
            </div>
          </div>

          {/* ICON SELECTOR */}
          <div className="form-group">
            <label>Badge Icon</label>
            <div className="icon-selector">
              {AVAILABLE_ICONS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  className={`icon-choice ${icon === emoji ? "selected" : ""}`}
                  onClick={() => setIcon(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* IS GOVERNOR HIGHLIGHT TOGGLE */}
          <div className="checkbox" style={{ marginTop: "10px" }}>
            <input
              type="checkbox"
              id="isGovCheck"
              checked={isGovernor}
              onChange={(e) => setIsGovernor(e.target.checked)}
            />
            <label htmlFor="isGovCheck">
              Highlight as Governor (Crown Glow & Prominent Card)
            </label>
          </div>

          {/* ACTIONS */}
          <div style={{ display: "flex", gap: "12px", marginTop: "24px", flexWrap: "wrap" }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              {isEditing ? "Save Changes" : "Add Officer"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            {isEditing && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete ${officer.name} from the organizational chart?`)) {
                    onDelete(officer.id);
                  }
                }}
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
