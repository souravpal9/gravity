import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import AuthSelection from './pages/auth/AuthSelection';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ProfessionalDashboard from './pages/dashboard/ProfessionalDashboard';
import PersonalDashboard from './pages/dashboard/PersonalDashboard';
import MailDashboard from './pages/dashboard/MailDashboard';
import { useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';

const DashboardRoute = () => {
  const { mode } = useTheme();
  if (mode === 'mail') return <MailDashboard />;
  return mode === 'professional' ? <ProfessionalDashboard /> : <PersonalDashboard />;
};

function App() {
  const { getThemeClass } = useTheme();
  const { isAuthenticated } = useAuth();

  return (
    <div className={`min-h-screen transition-colors duration-200 ${getThemeClass()}`}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<AuthSelection />} />
          <Route
            path="login"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
          />
          <Route
            path="signup"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />}
          />
          <Route
            path="dashboard"
            element={isAuthenticated ? <DashboardRoute /> : <Navigate to="/login" replace />}
          />
          {/* Catch all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
