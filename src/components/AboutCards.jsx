import React from "react";

const features = [
  { icon: "📢", title: "Announcements", desc: "Stay updated with important BSHM announcements, activities, deadlines, and events." },
  { icon: "💬", title: "Student Concerns", desc: "Submit suggestions, concerns, and feedback directly to the BSHM officers." },
  { icon: "🤝", title: "Student Support", desc: "Connect with your representatives and student organization officers." },
  { icon: "🎓", title: "Student Leadership", desc: "Know your officers and understand how your student organization serves you." },
];

export default function AboutCards() {
  return (
    <section>
      <div className="section-title">
        <h2>One <span className="gradient-text">BSHM Community</span></h2>
        <p>A platform built for communication, transparency, and student involvement.</p>
      </div>
      <div className="grid">
        {features.map((f) => (
          <div className="card" key={f.title}>
            <div className="icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
