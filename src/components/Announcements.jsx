import React from "react";
import { useApp } from "../context/AppContext";

export default function Announcements() {
  const { announcements } = useApp();

  return (
    <section id="announcements">
      <div className="section-title">
        <h2>Latest <span className="gradient-text">Announcements</span></h2>
        <p>Important updates from the BSHM organization.</p>
      </div>
      <div className="grid">
        {announcements.length === 0 ? (
          <div className="empty-state">No announcements available yet.</div>
        ) : (
          announcements.map((item, i) => (
            <div className="card announcement-card" key={item.id || i}>
              <div className="date">{item.date}</div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
