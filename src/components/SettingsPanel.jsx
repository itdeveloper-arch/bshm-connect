import React, { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export default function SettingsPanel({ showToast }) {
  const [user, setUser] = useState(null);
  const [factor, setFactor] = useState(null);
  const [qrCode, setQrCode] = useState("");
  const [setupCode, setSetupCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [credentialChallenge, setCredentialChallenge] = useState(null);
  const [credentialCode, setCredentialCode] = useState("");
  const [pendingUpdates, setPendingUpdates] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadAccount = async () => {
    const [{ data: userData }, { data: factorsData }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.auth.mfa.listFactors(),
    ]);
    const verifiedFactor = factorsData?.totp?.find((item) => item.status === "verified") || null;
    setUser(userData?.user || null);
    setEmail(userData?.user?.email || "");
    setFactor(verifiedFactor);
  };

  useEffect(() => {
    if (isSupabaseConfigured) loadAccount().catch((loadError) => setError(loadError.message));
  }, []);

  const updateAccount = async (event) => {
    event.preventDefault();
    setError("");
    const normalizedEmail = email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    if (!emailPattern.test(normalizedEmail)) return setError("Enter a valid email with a domain, such as name@dept.com.");
    if (password && password !== confirmPassword) return setError("Passwords do not match.");
    if (password && !passwordPattern.test(password)) return setError("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
    if (!email.trim() && !password) return setError("Enter a new email or password.");
    const updates = {};
    if (normalizedEmail !== user?.email) updates.email = normalizedEmail;
    if (password) updates.password = password;
    if (Object.keys(updates).length === 0) return setError("Make an account change before saving.");
    if (factor?.status !== "verified") return setError("Activate Microsoft Authenticator before changing account credentials.");
    setBusy(true);
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: factor.id });
    setBusy(false);
    if (challengeError) return setError("Unable to request authenticator verification.");
    setPendingUpdates(updates);
    setCredentialChallenge(challenge);
    setCredentialCode("");
  };

  const verifyCredentialChange = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const { error: verifyError } = await supabase.auth.mfa.verify({ factorId: factor.id, challengeId: credentialChallenge.id, code: credentialCode.trim() });
    if (verifyError) {
      setBusy(false);
      return setError("Invalid authenticator code. Your changes were not saved.");
    }
    const { error: updateError } = await supabase.auth.updateUser(pendingUpdates);
    setBusy(false);
    if (updateError) return setError(updateError.message);
    setCredentialChallenge(null);
    setPendingUpdates(null);
    setCredentialCode("");
    setPassword("");
    setConfirmPassword("");
    showToast("Account settings updated.");
    await loadAccount();
  };

  const startMfaSetup = async () => {
    setBusy(true);
    setError("");
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Microsoft Authenticator" });
    setBusy(false);
    if (enrollError) return setError(enrollError.message);
    setFactor(data);
    setQrCode(data?.totp?.qr_code || "");
  };

  const verifyMfaSetup = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: factor.id });
    if (challengeError) {
      setBusy(false);
      return setError(challengeError.message);
    }
    const { error: verifyError } = await supabase.auth.mfa.verify({ factorId: factor.id, challengeId: challenge.id, code: setupCode.trim() });
    setBusy(false);
    if (verifyError) return setError(verifyError.message);
    setQrCode("");
    setSetupCode("");
    showToast("Two-factor authentication enabled.");
    await loadAccount();
  };

  const removeMfa = async () => {
    if (!factor || !window.confirm("Disable two-factor authentication for this account?")) return;
    setBusy(true);
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
    setBusy(false);
    if (unenrollError) return setError(unenrollError.message);
    setFactor(null);
    showToast("Two-factor authentication disabled.");
  };

  if (!isSupabaseConfigured) return <div className="dashboard-panel settings-panel"><h2>Settings</h2><p>Supabase is not configured.</p></div>;
  const isPendingSetup = factor && factor.status !== "verified";

  return (
    <div className="dashboard-panel settings-panel">
      <div className="settings-heading">
        <div><span className="dashboard-kicker">ACCOUNT SETTINGS</span><h2>Login and security</h2><p>Update your account credentials and protect staff access.</p></div>
        <span className={`settings-status ${factor?.status === "verified" ? "is-active" : ""}`}>{factor?.status === "verified" ? "2FA enabled" : "2FA not enabled"}</span>
      </div>
      <form className="settings-form" onSubmit={updateAccount}>
        <h3>Account credentials</h3>
        <label htmlFor="settings-email">Login email</label>
        <input id="settings-email" className="form-control" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <label htmlFor="settings-password">New password</label>
        <input id="settings-password" className="form-control" type="password" autoComplete="new-password" placeholder="8+ chars, upper/lowercase, number, symbol" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} />
        <label htmlFor="settings-confirm-password">Confirm new password</label>
        <input id="settings-confirm-password" className="form-control" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={6} />
        <button className="btn btn-primary" type="submit" disabled={busy}>Save account changes</button>
        {credentialChallenge && <form className="mfa-setup credential-verification" onSubmit={verifyCredentialChange}><label htmlFor="credential-mfa-code">Enter the Microsoft Authenticator code to confirm changes</label><input id="credential-mfa-code" className="form-control" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" value={credentialCode} onChange={(event) => setCredentialCode(event.target.value)} required /><button className="btn btn-secondary" type="submit" disabled={busy}>Verify and save</button></form>}
      </form>
      <div className="settings-mfa">
        <h3>Two-factor authentication</h3>
        <p>Use Microsoft Authenticator or another TOTP app to generate a login code.</p>
        {!factor && <button className="btn btn-secondary" type="button" onClick={startMfaSetup} disabled={busy}>Set up Microsoft Authenticator</button>}
        {qrCode && <form className="mfa-setup" onSubmit={verifyMfaSetup}><img src={qrCode} alt="QR code for Microsoft Authenticator setup" /><label htmlFor="mfa-setup-code">Enter the 6-digit code from your app</label><input id="mfa-setup-code" className="form-control" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={setupCode} onChange={(event) => setSetupCode(event.target.value)} required /><button className="btn btn-primary" type="submit" disabled={busy}>Verify and enable 2FA</button></form>}
        {isPendingSetup && <p className="settings-note">Finish verification to enable this authenticator.</p>}
        {factor?.status === "verified" && !qrCode && <button className="btn btn-danger" type="button" onClick={removeMfa} disabled={busy}>Disable 2FA</button>}
      </div>
      {error && <p className="settings-error" role="alert">{error}</p>}
    </div>
  );
}
