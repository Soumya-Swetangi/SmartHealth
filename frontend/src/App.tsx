import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { HealthWorkerDashboard } from './pages/HealthWorkerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ReportSubmissionPage } from './pages/ReportSubmissionPage';
import { MyReportsPage } from './pages/MyReportsPage';
import { AlertsPage } from './pages/AlertsPage';
import { WaterTestPage } from './pages/WaterTestPage';
import { UsersManagementPage } from './pages/UsersManagementPage';
import { SmartPredictPage } from './pages/SmartPredictPage';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#f9dec9]/40">
      <Navbar />
      <div className="flex-1 flex">
        {isAuthenticated && <Sidebar />}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Citizen Dashboard Routes */}
            <Route
              path="/citizen"
              element={
                <ProtectedRoute allowedRoles={['citizen', 'health_worker', 'admin']}>
                  <CitizenDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['citizen', 'health_worker', 'admin']}>
                  <CitizenDashboard />
                </ProtectedRoute>
              }
            />

            {/* Health Worker Dashboard Routes */}
            <Route
              path="/health-worker"
              element={
                <ProtectedRoute allowedRoles={['health_worker', 'admin']}>
                  <HealthWorkerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/worker"
              element={
                <ProtectedRoute allowedRoles={['health_worker', 'admin']}>
                  <HealthWorkerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Dashboard Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UsersManagementPage />
                </ProtectedRoute>
              }
            />

            {/* Report Submission & History Routes */}
            <Route
              path="/report-submission"
              element={
                <ProtectedRoute allowedRoles={['citizen', 'health_worker', 'admin']}>
                  <ReportSubmissionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report/new"
              element={
                <ProtectedRoute allowedRoles={['citizen', 'health_worker', 'admin']}>
                  <ReportSubmissionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-reports"
              element={
                <ProtectedRoute allowedRoles={['citizen', 'health_worker', 'admin']}>
                  <MyReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/my"
              element={
                <ProtectedRoute allowedRoles={['citizen', 'health_worker', 'admin']}>
                  <MyReportsPage />
                </ProtectedRoute>
              }
            />

            {/* Alerts & Water Tests */}
            <Route
              path="/alerts"
              element={
                <ProtectedRoute allowedRoles={['citizen', 'health_worker', 'admin']}>
                  <AlertsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/water-tests"
              element={
                <ProtectedRoute allowedRoles={['health_worker', 'admin']}>
                  <WaterTestPage />
                </ProtectedRoute>
              }
            />

            {/* SmartPredict ML Outbreak Forecasting */}
            <Route
              path="/smart-predict"
              element={
                <ProtectedRoute allowedRoles={['citizen', 'health_worker', 'admin']}>
                  <SmartPredictPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
