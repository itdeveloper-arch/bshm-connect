import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export default function ConcernForm() {
  const { addConcern, showToast } = useApp();
  const [anonymous, setAnonymous] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Academic");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      showToast("Please complete all required fields.");
      return;
    }
    const concern = {
      id: "BSHM-" + Date.now().toString().slice(-6),
      name: anonymous ? "Anonymous Student" : name.trim() || "Unnamed Student",
      category,
      subject: subject.trim(),
      message: message.trim(),
      status: "Received",
      date: new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }),
    };
    addConcern(concern);
    setName(""); setSubject(""); setMessage(""); setAnonymous(false);
    showToast("Concern submitted successfully!");
    setTimeout(() => alert(`Your concern has been submitted successfully.\n\nReference Number: ${concern.id}\n\nPlease save this reference number.`), 100);
  };

  return (
    <section id="concerns">
      <div className="section-title">
        <h2>Submit a <span className="gradient-text">Concern</span></h2>
        <p>Your concern matters. Let us know how we can improve.</p>
      </div>
      <div className="concern-box">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="studentName">Name</label>
            <input
              type="text"
              id="studentName"
              className="form-control"
              placeholder={anonymous ? "Your name will remain anonymous" : "Enter your name"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={anonymous}
            />
          </div>

          <div className="checkbox">
            <input
              type="checkbox"
              id="anonymous"
              checked={anonymous}
              onChange={(e) => { setAnonymous(e.target.checked); if (e.target.checked) setName(""); }}
            />
            <label htmlFor="anonymous">Submit anonymously</label>
          </div>

          <div className="form-group">
            <label htmlFor="category">Concern Category</label>
            <select id="category" className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
              {["Academic","Student Activities","Facilities","Organization","Events","Suggestion","Other"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input type="text" id="subject" className="form-control" placeholder="What is your concern about?" value={subject} onChange={(e) => setSubject(e.target.value)} required />
          </div>

          <div className="form-group">
            <label htmlFor="message">Concern / Message</label>
            <textarea id="message" className="form-control" placeholder="Explain your concern..." value={message} onChange={(e) => setMessage(e.target.value)} required />
          </div>

          <button type="submit" className="btn btn-primary">Submit Concern</button>
        </form>
      </div>
    </section>
  );
}
