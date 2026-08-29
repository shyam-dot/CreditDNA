import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import BankConnectPage from './pages/BankConnectPage';
import DashboardPage from './pages/DashboardPage';
import StressTestPage from './pages/StressTestPage';
import RecommendationPage from './pages/RecommendationPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/connect"
        element={
          <ProtectedRoute>
            <BankConnectPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stress-test"
        element={
          <ProtectedRoute>
            <StressTestPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recommendation"
        element={
          <ProtectedRoute>
            <RecommendationPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
