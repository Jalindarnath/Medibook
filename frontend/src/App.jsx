import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import BookAppointment from './pages/BookAppointment';
import BookingConfirmation from './pages/BookingConfirmation';
import MyAppointments from './pages/MyAppointments';
import AdminDashboard from './pages/AdminDashboard';

export const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes with MainLayout */}
          <Route
            path="/"
            element={
              <MainLayout>
                <LandingPage />
              </MainLayout>
            }
          />
          <Route
            path="/login"
            element={
              <MainLayout>
                <LoginPage />
              </MainLayout>
            }
          />
          <Route
            path="/register"
            element={
              <MainLayout>
                <RegisterPage />
              </MainLayout>
            }
          />

          {/* Patient Protected Routes with MainLayout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <UserDashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/book"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <BookAppointment />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking-confirmation"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <BookingConfirmation />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-appointments"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <MyAppointments />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Administrator Protected Routes (Uses dedicated AdminLayout internally) */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
