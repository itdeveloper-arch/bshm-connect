import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MS = 30 * 1000;

export default function LoginPage() {
  const { showToast } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const now = Date.now();
    const attempts = Number(sessionStorage.getItem("bshmLoginAttempts") || 0);
    const lockedUntil = Number(sessionStorage.getItem("bshmLoginLockedUntil") || 0);
    if (lockedUntil > now) {
      showToast("Too many attempts. Please try again shortly.");
      setPassword("");
      return;
    }

    let error = null;
    if (isSupabaseConfigured) {
      ({ error } = await supabase.auth.signInWithPassword({ email: email.trim(), password }));
    } else {
      showToast("Supabase is not configured.");
      setPassword("");
      return;
    }

    if (error) {
      const nextAttempts = attempts + 1;
      sessionStorage.setItem("bshmLoginAttempts", String(nextAttempts));
      if (nextAttempts >= MAX_LOGIN_ATTEMPTS) {
        sessionStorage.setItem("bshmLoginLockedUntil", String(now + LOCKOUT_MS));
        sessionStorage.removeItem("bshmLoginAttempts");
      }
      showToast("Invalid email or password.");
    } else {
      sessionStorage.removeItem("bshmLoginAttempts");
      sessionStorage.removeItem("bshmLoginLockedUntil");
      showToast("Login successful.");
      navigate("/dashboard");
    }
    setPassword("");
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo" style={{ justifyContent: "center", marginBottom: "20px" }}>
          <div className="logo-icon">B</div>
          BSHM <span>Connect</span>
        </div>

        <h2>Staff Portal</h2>
        <p>Authorized BSHM Officer and Department Adviser access.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" style={{ textAlign: "left" }}>Email</label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="Enter your staff email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" style={{ textAlign: "left" }}>Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Enter password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            Login
          </button>
        </form>

        <button
          className="btn btn-secondary"
          style={{ marginTop: "15px", width: "100%" }}
          onClick={() => navigate("/")}
        >
          Back to Website
        </button>

      </div>
    </div>
  );
}
