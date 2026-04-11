import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ProfileSettings from './pages/ProfileSettings';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import MedicalHistory from './pages/MedicalHistory';
import DashboardOverview from './pages/DashboardOverview'; // Brand new central core mapping
import MedicalReports from './pages/MedicalReports'; // Gemini Hub
import BillingPage from './pages/BillingPage';
import InsightsPage from './pages/InsightsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardOverview />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/profile" element={<ProfileSettings />} />
        <Route path="/history" element={<MedicalHistory />} />
        <Route path="/reports" element={<MedicalReports />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/insights" element={<InsightsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
