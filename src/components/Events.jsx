import React from "react";
import { useApp } from "../context/AppContext";

export default function Events() {
  const { events } = useApp();

  return (
    <section id="events">
      <div className="section-title">
        <h2>Upcoming <span className="gradient-text">Events</span></h2>
        <p>Activities and programs for BSHM students.</p>
      </div>
      <div className="grid">
        {events.length === 0 ? (
          <div className="empty-state">No events available yet.</div>
        ) : (
          events.map((ev, i) => (
            <div className="card event-card" key={ev.id || i}>
              <div className="event-date">{ev.date}</div>
              <h3>{ev.title}</h3>
              <p>{ev.description}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
