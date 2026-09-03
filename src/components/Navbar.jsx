import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const close = () => setOpen(false);

  const handleNavClick = (hash) => {
    close();
    if (window.location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="navbar">
      <div className="logo" onClick={() => handleNavClick("#home")} style={{ cursor: "pointer" }}>
        <div className="logo-icon">B</div>
        BSHM <span>Connect</span>
      </div>

      <button className="menu-btn" aria-label="Open menu" onClick={() => setOpen(!open)}>
        &#9776;
      </button>

      <ul className={`nav-links${open ? " show" : ""}`}>
        <li><a href="#home" onClick={(e) => { e.preventDefault(); handleNavClick("#home"); }}>Home</a></li>
        <li><a href="#announcements" onClick={(e) => { e.preventDefault(); handleNavClick("#announcements"); }}>Announcements</a></li>
        <li><a href="#milestones" onClick={(e) => { e.preventDefault(); handleNavClick("#milestones"); }}>Milestones</a></li>
        <li><a href="#concerns" onClick={(e) => { e.preventDefault(); handleNavClick("#concerns"); }}>Concerns</a></li>
        <li><a href="#events" onClick={(e) => { e.preventDefault(); handleNavClick("#events"); }}>Events</a></li>
        <li><a href="#officers" onClick={(e) => { e.preventDefault(); handleNavClick("#officers"); }}>Officers</a></li>
        <li><Link to="/login" onClick={close}>Staff Login</Link></li>
      </ul>
    </nav>
  );
}
