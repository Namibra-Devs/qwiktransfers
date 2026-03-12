import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import SystemBrandingManager from './components/SystemBrandingManager';
// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterSuccess from './pages/RegisterSuccess';
import EmailVerified from './pages/EmailVerified';
import ResendVerification from './pages/ResendVerification';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import VendorDashboard from './pages/VendorDashboard';
import Profile from './pages/Profile';
import KycVerification from './pages/KycVerification';
import Home from './pages/Home';
import DownloadRedirect from './pages/DownloadRedirect';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AboutVendor from './pages/AboutVendor';
import ContactUs from './pages/ContactUs';
import VendorRegister from './pages/VendorRegister';

const PrivateRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) {
    if (user.role === 'admin') return <Navigate to="/admin" />;
    if (user.role === 'vendor') return <Navigate to="/vendor" />;
    return <Navigate to="/dashboard" />;
  }
  return children;
};

const GuestRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin" />;
    if (user.role === 'vendor') return <Navigate to="/vendor" />;
    return <Navigate to="/dashboard" />;
  }
  return children;
};

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <SystemBrandingManager />
      <Toaster position="top-center" reverseOrder={false} />
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/register-success" element={<RegisterSuccess />} />
            <Route path="/verify-email" element={<EmailVerified />} />
            <Route path="/resend-verification" element={<ResendVerification />} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
            <Route path="/reset-password" element={<GuestRoute><ResetPassword /></GuestRoute>} />

            <Route
              path="/admin"
              element={
                <PrivateRoute role="admin">
                  <AdminDashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/vendor"
              element={
                <PrivateRoute role="vendor">
                  <VendorDashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />

            <Route
              path="/kyc"
              element={
                <PrivateRoute>
                  <KycVerification />
                </PrivateRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <UserDashboard />
                </PrivateRoute>
              }
            />

            <Route path="/download" element={<DownloadRedirect />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/about-vendor" element={<AboutVendor />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/vendor-register" element={<VendorRegister />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
