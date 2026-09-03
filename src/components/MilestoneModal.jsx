import React, { useState, useEffect } from "react";
import { MILESTONE_CATEGORIES } from "../data/milestones";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

function resizeImage(file, maxSize = 1200) {
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

const MILESTONE_ICONS = ["🏆", "🥇", "🥈", "🥉", "🌟", "🎖️", "🎪", "🎓", "🤝", "💡", "🛡️", "📜", "🥂", "🏅"];

export default function MilestoneModal({ milestone, authorRole, onClose, onSave, onDelete }) {
  const isEditing = Boolean(milestone?.id);

  const [title, setTitle] = useState(milestone?.title || "");
  const [category, setCategory] = useState(milestone?.category || "Competition");
  const [date, setDate] = useState(
    milestone?.date || new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long" })
  );
  const [year, setYear] = useState(milestone?.year || new Date().getFullYear().toString());
  const [badgeIcon, setBadgeIcon] = useState(milestone?.badgeIcon || "🏆");
  const [description, setDescription] = useState(milestone?.description || "");
  const [participants, setParticipants] = useState(milestone?.participants || "");
  const [images, setImages] = useState(Array.isArray(milestone?.images) ? milestone.images : []);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);

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

  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsProcessingFiles(true);
    const validProcessed = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        alert(`"${file.name}" is not a valid image file.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        alert(`"${file.name}" exceeds the 10MB maximum file size limit (${(file.size / (1024 * 1024)).toFixed(2)} MB).`);
        continue;
      }

      try {
        const optimized = await resizeImage(file, 1200);
        validProcessed.push(optimized);
      } catch (err) {
        console.error("Error optimizing image", err);
      }
    }

    if (validProcessed.length > 0) {
      setImages((prev) => [...prev, ...validProcessed]);
    }
    setIsProcessingFiles(false);
    e.target.value = "";
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("Please enter the Milestone Title and Details.");
      return;
    }

    const data = {
      id: milestone?.id || "ms-" + Date.now(),
      title: title.trim(),
      category,
      date: date.trim(),
      year: year.trim() || "2026",
      badgeIcon,
      description: description.trim(),
      participants: participants.trim(),
      images,
      authorRole: milestone?.authorRole || authorRole || "BSHM Council",
      updatedAt: new Date().toISOString(),
    };

    onSave(data);
  };

  return (
    <div className="modal active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content milestone-modal-content">
        <button className="close" onClick={onClose} aria-label="Close">&times;</button>
        <h2>{isEditing ? "✏️ Edit Milestone" : "🏆 Add Milestone & Achievement"}</h2>
        <p style={{ color: "#888", fontSize: "14px", marginBottom: "20px" }}>
          Feature department achievements, competition wins, recognitions, or major events.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="msTitle">Milestone / Achievement Title</label>
            <input
              id="msTitle"
              type="text"
              className="form-control"
              placeholder="e.g. 1st Place - Regional Hospitality Olympics 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="modal-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div className="form-group">
              <label htmlFor="msCat">Category</label>
              <select
                id="msCat"
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {MILESTONE_CATEGORIES.filter((c) => c !== "All").map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="msYear">Year</label>
              <input
                id="msYear"
                type="number"
                min="2000"
                max="2035"
                className="form-control"
                placeholder="2026"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div className="form-group">
              <label htmlFor="msDate">Month / Date Display</label>
              <input
                id="msDate"
                type="text"
                className="form-control"
                placeholder="e.g. August 2026 or Aug 15, 2026"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="msPart">Participants / Team</label>
              <input
                id="msPart"
                type="text"
                className="form-control"
                placeholder="e.g. Skills Delegation Team"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
              />
            </div>
          </div>

          {/* ICON SELECTOR */}
          <div className="form-group">
            <label>Badge Icon</label>
            <div className="icon-selector">
              {MILESTONE_ICONS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  className={`icon-choice ${badgeIcon === emoji ? "selected" : ""}`}
                  onClick={() => setBadgeIcon(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="msDesc">Achievement Details / Narrative</label>
            <textarea
              id="msDesc"
              className="form-control"
              placeholder="Describe what was achieved, awards earned, or event highlights..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* PICTURE ATTACHMENTS (Up to 10MB per file) */}
          <div className="form-group">
            <label>Attached Pictures (Up to 10MB each)</label>
            <div className="milestone-attachment-box">
              <label htmlFor="milestonePhotoUpload" className="btn btn-secondary btn-small">
                📷 Select Pictures to Attach
              </label>
              <input
                id="milestonePhotoUpload"
                type="file"
                multiple
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFilesSelected}
              />
              <span style={{ fontSize: "12px", color: "#888", marginLeft: "10px" }}>
                Accepts JPG, PNG, WEBP up to 10MB per image.
              </span>
            </div>

            {isProcessingFiles && (
              <div style={{ color: "var(--pink)", fontSize: "13px", marginTop: "8px" }}>
                ⏳ Processing and optimizing attached photos...
              </div>
            )}

            {images.length > 0 && (
              <div className="milestone-modal-thumbnails">
                {images.map((imgUrl, i) => (
                  <div className="modal-thumb-item" key={i}>
                    <img src={imgUrl} alt={`Thumbnail ${i + 1}`} />
                    <button
                      type="button"
                      className="modal-thumb-remove"
                      onClick={() => handleRemoveImage(i)}
                      title="Remove attachment"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div style={{ display: "flex", gap: "12px", marginTop: "24px", flexWrap: "wrap" }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              {isEditing ? "Save Milestone Changes" : "Publish Milestone"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            {isEditing && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  if (window.confirm(`Delete "${milestone.title}" from Milestones?`)) {
                    onDelete(milestone.id);
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
