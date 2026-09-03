import React from "react";
import { groupOfficersByTier } from "../data/officers";
import { useApp } from "../context/AppContext";

function getInitials(name) {
  return name
    .split(" ")
    .filter((w) => w.length > 0)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function Officers() {
  const { officers, officerPhotos } = useApp();
  const dynamicTiers = groupOfficersByTier(officers || []);

  return (
    <section id="officers" className="officers-section">
      <div className="section-title">
        <span className="org-badge">Leadership Hierarchy</span>
        <h2>Organizational <span className="gradient-text">Chart</span></h2>
        <p>BSHM Student Council & Executive Board Structure (A.Y. 2026&ndash;2027)</p>
      </div>

      <div className="org-chart-wrapper">
        {dynamicTiers.length === 0 ? (
          <div className="empty-state">No officers registered in the organizational chart.</div>
        ) : (
          <div className="org-chart">
            {dynamicTiers.map((tier, idx) => (
              <div className={`org-tier tier-${tier.tierLevel.replace(" ", "-").toLowerCase()}`} key={tier.tierName + idx}>
                {/* Tier Header Label */}
                <div className="org-tier-header">
                  <span className="org-tier-pill">{tier.tierLevel}</span>
                  <span className="org-tier-title">{tier.tierName}</span>
                </div>

                {/* Cards Container */}
                <div className={`org-tier-cards count-${tier.officers.length}`}>
                  {tier.officers.map((officer) => {
                    const photoUrl = officer.photo || officerPhotos?.[officer.name];
                    return (
                      <div
                        className={`org-card ${officer.isGovernor ? "governor-card" : ""}`}
                        key={officer.id || officer.name}
                      >
                        <div className="org-card-top">
                          <div className={`org-avatar ${photoUrl ? "has-photo" : ""}`}>
                            {photoUrl ? (
                              <img
                                src={photoUrl}
                                alt={officer.name}
                                className="org-avatar-img"
                                loading="lazy"
                              />
                            ) : (
                              getInitials(officer.name)
                            )}
                            {officer.icon && <span className="org-avatar-badge">{officer.icon}</span>}
                          </div>
                        </div>
                        <div className="org-card-body">
                          <div className="org-position">{officer.position}</div>
                          <h3 className="org-name">{officer.name}</h3>
                          <div className="org-tag">{officer.roleTag}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Connector line between tiers */}
                {idx < dynamicTiers.length - 1 && <div className="org-connector-line"></div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
