import React, { useState, useEffect } from "react";

export default function EventModal({ event, onClose, onSave, onDelete }) {
  const editing = Boolean(event?.id);
  const [title, setTitle] = useState(event?.title || "");
  const [date, setDate] = useState(event?.date || "");
  const [description, setDescription] = useState(event?.description || "");

  useEffect(() => {
    document.body.classList.add("modal-open");
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => { document.body.classList.remove("modal-open"); window.removeEventListener("keydown", handleKey); };
  }, [onClose]);

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim() || !date.trim() || !description.trim()) return;
    onSave({ id: event?.id || `ev-${Date.now()}`, title: title.trim(), date: date.trim(), description: description.trim() });
  };

  return (
    <div className="modal active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content event-modal-content">
        <button className="close" onClick={onClose} aria-label="Close">&times;</button>
        <span className="panel-kicker">EVENTS</span>
        <h2>{editing ? "Edit Event" : "Add Event"}</h2>
        <form onSubmit={submit}>
          <div className="form-group"><label htmlFor="eventTitle">Event title</label><input id="eventTitle" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} required /></div>
          <div className="form-group"><label htmlFor="eventDate">Date or month</label><input id="eventDate" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} placeholder="e.g. October 2026" maxLength={80} required /></div>
          <div className="form-group"><label htmlFor="eventDescription">Details</label><textarea id="eventDescription" className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} maxLength={5000} required /></div>
          <div className="event-modal-actions">
            <button type="submit" className="btn btn-primary">{editing ? "Save Changes" : "Add Event"}</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            {editing && <button type="button" className="btn btn-danger" onClick={() => { if (window.confirm(`Delete "${event.title}"?`)) onDelete(event.id); }}>Delete</button>}
          </div>
        </form>
      </div>
    </div>
  );
}
