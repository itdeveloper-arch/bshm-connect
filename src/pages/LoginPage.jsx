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
  const [mfaFactor, setMfaFactor] = useState(null);
  const [mfaChallengeId, setMfaChallengeId] = useState("");
  const [mfaCode, setMfaCode] = useState("");

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
      const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (assurance?.currentLevel !== assurance?.nextLevel) {
        const { data: factors, error: factorError } = await supabase.auth.mfa.listFactors();
        const factor = factors?.totp?.find((item) => item.status === "verified");
        if (factorError || !factor) {
          showToast("Two-factor authentication is unavailable.");
        } else {
          const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: factor.id });
          if (challengeError) showToast("Unable to start two-factor authentication.");
          else {
            setMfaFactor(factor);
            setMfaChallengeId(challenge.id);
            showToast("Enter your authenticator code.");
          }
        }
      } else {
        showToast("Login successful.");
        navigate("/dashboard");
      }
    }
    setPassword("");
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.mfa.verify({ factorId: mfaFactor.id, challengeId: mfaChallengeId, code: mfaCode.trim() });
    if (error) {
      showToast("Invalid authenticator code.");
      setMfaCode("");
      return;
    }
    showToast("Login successful.");
    navigate("/dashboard");
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

        {mfaFactor ? (
          <form onSubmit={handleMfaSubmit}>
            <div className="form-group">
              <label htmlFor="mfa-code" style={{ textAlign: "left" }}>Authenticator code</label>
              <input id="mfa-code" className="form-control" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" placeholder="Enter 6-digit code" value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Verify and continue</button>
          </form>
        ) : <form onSubmit={handleSubmit}>
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
        </form>}

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
