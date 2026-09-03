import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import MainSite from "./pages/MainSite";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Toast from "./components/Toast";

function ProtectedRoute({ children }) {
  const { currentRole, authLoading } = useApp();
  if (authLoading) return <div className="route-loading">Checking staff access...</div>;
  if (!currentRole) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<MainSite />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
