import React, { useEffect } from "react";
import { useApp } from "../context/AppContext";

export default function ConcernModal({ concern, onClose }) {
  const { currentRole, updateConcernStatus, showToast } = useApp();
  const [status, setStatus] = React.useState(concern?.status || "Received");

  useEffect(() => {
    if (concern) {
      setStatus(concern.status);
      document.body.classList.add("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [concern]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!concern) return null;

  const canUpdate = currentRole === "Operator" || currentRole === "BSHM Officer";

  const handleSave = async () => {
    const error = await updateConcernStatus(concern.id, status);
    if (error) {
      showToast("Concern status could not be updated. Please try again.");
      return;
    }
    showToast("Concern status updated successfully.");
    onClose();
  };

  return (
    <div className="modal active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content">
        <button className="close" onClick={onClose} aria-label="Close">&times;</button>
        <h2>Concern Details</h2>
        <br />

        {[
          ["Reference", concern.id],
          ["Student", concern.name],
          ["Category", concern.category],
          ["Subject", concern.subject],
          ["Date", concern.date],
        ].map(([label, value]) => (
          <div className="detail-item" key={label}>
            <span className="detail-label">{label}</span>
            {value}
          </div>
        ))}

        <div className="detail-item">
          <span className="detail-label">Concern</span>
          <div className="detail-message">{concern.message}</div>
        </div>

        {canUpdate ? (
          <>
            <div className="detail-item">
              <span className="detail-label">Update Status</span>
              <select
                id="statusUpdate"
                className="form-control"
                style={{ marginTop: "8px" }}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Received">Received</option>
                <option value="Under Review">Under Review</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleSave}>Save Status</button>
          </>
        ) : (
          <div style={{ marginTop: "15px", padding: "12px", borderRadius: "10px", background: "#0b0b0b", color: "#888" }}>
            You have viewing access. Status changes must be handled by an authorized officer or operator.
          </div>
        )}
      </div>
    </div>
  );
}
