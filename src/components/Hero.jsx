import React from "react";
import { Link } from "react-router-dom";

export default function Hero() {
  const scrollTo = (hash) => {
    document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="hero" id="home">
      <div className="hero-content hero-entrance">
        <div className="badge">BS Hospitality Management</div>
        <h1>
          Your Voice.<br />
          <span className="gradient-text">Our Action.</span>
        </h1>
        <p>
          Welcome to BSHM Connect &mdash; the student communication and concern platform of the
          Bachelor of Science in Hospitality Management.
        </p>
        <div className="hero-buttons">
          <a href="#concerns" className="btn btn-primary" onClick={(e) => { e.preventDefault(); scrollTo("#concerns"); }}>
            Submit a Concern
          </a>
          <a href="#announcements" className="btn btn-secondary" onClick={(e) => { e.preventDefault(); scrollTo("#announcements"); }}>
            View Announcements
          </a>
        </div>
      </div>
    </section>
  );
}
