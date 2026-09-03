import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { MILESTONE_CATEGORIES } from "../data/milestones";
import PhotoLightbox from "./PhotoLightbox";

function AwardShowcaseFrame({ image, icon, title, onClick }) {
  return (
    <div className="milestone-showcase-frame" onClick={onClick} title={image ? "Click to view full picture" : undefined}>
      {/* Top Star */}
      <div className="showcase-star-top">★</div>

      <div className="showcase-wreath-wrapper">
        {/* Left Laurel Wreath SVG */}
        <svg className="wreath-svg wreath-left" viewBox="0 0 100 160">
          <defs>
            <linearGradient id="goldGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffe279" />
              <stop offset="40%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#996515" />
            </linearGradient>
          </defs>
          <path d="M70,148 C42,118 22,78 32,32 C34,22 40,12 45,6" stroke="url(#goldGradLeft)" strokeWidth="2.5" fill="none" />
          <ellipse cx="66" cy="138" rx="14" ry="6" transform="rotate(-30 66 138)" fill="url(#goldGradLeft)" />
          <ellipse cx="50" cy="114" rx="15" ry="6.5" transform="rotate(-45 50 114)" fill="url(#goldGradLeft)" />
          <ellipse cx="36" cy="86" rx="15" ry="6.5" transform="rotate(-60 36 86)" fill="url(#goldGradLeft)" />
          <ellipse cx="30" cy="56" rx="15" ry="6.5" transform="rotate(-75 30 56)" fill="url(#goldGradLeft)" />
          <ellipse cx="39" cy="26" rx="14" ry="6" transform="rotate(-90 39 26)" fill="url(#goldGradLeft)" />
        </svg>

        {/* Center Plaque / Photo / Emblem */}
        <div className={`showcase-emblem-disc ${image ? "has-image" : ""}`}>
          {image ? (
            <>
              <img src={image} alt={title} className="showcase-emblem-img" loading="lazy" />
              <div className="showcase-zoom-hint">🔍</div>
            </>
          ) : (
            <div className="showcase-emblem-fallback">
              <span className="showcase-emoji">{icon || "🏆"}</span>
            </div>
          )}
        </div>

        {/* Right Laurel Wreath SVG */}
        <svg className="wreath-svg wreath-right" viewBox="0 0 100 160">
          <defs>
            <linearGradient id="goldGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffe279" />
              <stop offset="40%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#996515" />
            </linearGradient>
          </defs>
          <path d="M30,148 C58,118 78,78 68,32 C66,22 60,12 55,6" stroke="url(#goldGradRight)" strokeWidth="2.5" fill="none" />
          <ellipse cx="34" cy="138" rx="14" ry="6" transform="rotate(30 34 138)" fill="url(#goldGradRight)" />
          <ellipse cx="50" cy="114" rx="15" ry="6.5" transform="rotate(45 50 114)" fill="url(#goldGradRight)" />
          <ellipse cx="64" cy="86" rx="15" ry="6.5" transform="rotate(60 64 86)" fill="url(#goldGradRight)" />
          <ellipse cx="70" cy="56" rx="15" ry="6.5" transform="rotate(75 70 56)" fill="url(#goldGradRight)" />
          <ellipse cx="61" cy="26" rx="14" ry="6" transform="rotate(90 61 26)" fill="url(#goldGradRight)" />
        </svg>
      </div>

      {/* Bottom Stars Arc */}
      <div className="showcase-stars-bottom">
        <span>★</span>
        <span>★</span>
        <span>★</span>
        <span>★</span>
        <span>★</span>
      </div>
    </div>
  );
}

export default function Milestones() {
  const { milestones } = useApp();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [activeLightboxImg, setActiveLightboxImg] = useState(null);

  const availableYears = [
    "All",
    ...Array.from(
      new Set(
        (milestones || [])
          .map((m) => m.year || (m.date && m.date.match(/\b(20\d\d)\b/)?.[1]) || "2026")
          .filter(Boolean)
      )
    ).sort((a, b) => (b === "All" ? 1 : b.localeCompare(a))),
  ];

  const filtered = (milestones || []).filter((m) => {
    const matchCat = selectedCategory === "All" || m.category === selectedCategory;
    const itemYear = m.year || (m.date && m.date.match(/\b(20\d\d)\b/)?.[1]) || "2026";
    const matchYr = selectedYear === "All" || itemYear === selectedYear;
    return matchCat && matchYr;
  });

  return (
    <section id="milestones" className="milestones-section">
      <div className="section-title">
        <span className="org-badge">Department Pride & Excellence</span>
        <h2>BSHM <span className="gradient-text">Milestones</span></h2>
        <p>Celebrating achievements, competition victories, recognitions, and major events.</p>
      </div>

      <div className="milestone-controls">
        {/* CATEGORY FILTER PILLS */}
        <div className="milestone-filters">
          {MILESTONE_CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat}
              className={`filter-pill ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* YEAR SELECTOR */}
        {availableYears.length > 2 && (
          <div className="milestone-year-select-wrapper">
            <label htmlFor="milestoneYearFilter">Year:</label>
            <select
              id="milestoneYearFilter"
              className="form-control milestone-year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr === "All" ? "All Years" : yr}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="milestone-showcase-grid">
        {filtered.length === 0 ? (
          <div className="empty-state">
            No milestones or achievements found for the selected filter.
          </div>
        ) : (
          filtered.map((m) => {
            const hasImages = Array.isArray(m.images) && m.images.length > 0;
            const primaryImage = hasImages ? m.images[0] : null;

            return (
              <div className="milestone-showcase-card" key={m.id}>
                {/* 1. TOP LAUREL WREATH & EMBLEM SHOWCASE FRAME */}
                <AwardShowcaseFrame
                  image={primaryImage}
                  icon={m.badgeIcon}
                  title={m.title}
                  onClick={() => {
                    if (primaryImage) {
                      setActiveLightboxImg({
                        src: primaryImage,
                        title: `${m.title} (Photo 1 of ${m.images.length})`,
                      });
                    }
                  }}
                />

                {/* 2. CARD CONTENT: TITLE & CITATION SUBTITLE (Matching Reference Image) */}
                <div className="showcase-content">
                  <h3 className="showcase-title">{m.title}</h3>
                  <div className="showcase-subtitle-citation">
                    {m.category} {m.date ? `• ${m.date.toUpperCase()}` : ""}
                  </div>

                  <p className="showcase-description">{m.description}</p>

                  {m.participants && (
                    <div className="showcase-participants">
                      <strong>Delegates / Team:</strong> {m.participants}
                    </div>
                  )}

                  {/* 3. MULTI-PHOTO GALLERY THUMBNAILS (IF > 1 PHOTO) */}
                  {hasImages && m.images.length > 1 && (
                    <div className="showcase-multi-gallery">
                      <div className="showcase-gallery-label">
                        Gallery Attachments ({m.images.length})
                      </div>
                      <div className="showcase-gallery-strip">
                        {m.images.map((imgUrl, i) => (
                          <div
                            className={`showcase-thumb-chip ${i === 0 ? "is-featured" : ""}`}
                            key={i}
                            onClick={() =>
                              setActiveLightboxImg({
                                src: imgUrl,
                                title: `${m.title} (Photo ${i + 1} of ${m.images.length})`,
                              })
                            }
                            title={`View Photo ${i + 1}`}
                          >
                            <img src={imgUrl} alt={`Photo ${i + 1}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="showcase-footer">
                    <span className="showcase-publisher">
                      📌 {m.authorRole || "BSHM Council"}
                    </span>
                    {hasImages && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-small showcase-view-btn"
                        onClick={() =>
                          setActiveLightboxImg({
                            src: primaryImage,
                            title: `${m.title} (1 of ${m.images.length})`,
                          })
                        }
                      >
                        View Photo ({m.images.length})
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FULL RESOLUTION PHOTO LIGHTBOX */}
      {activeLightboxImg && (
        <PhotoLightbox
          image={activeLightboxImg.src}
          title={activeLightboxImg.title}
          onClose={() => setActiveLightboxImg(null)}
        />
      )}
    </section>
  );
}
