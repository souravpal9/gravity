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
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${getThemeClass()}`}>
      <Routes>
        <Route path="/" element={<MainLayout />}>

          {/* Root: unauthenticated → pick mode, authenticated → dashboard */}
          <Route
            index
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthSelection />}
          />

          {/* /select-mode: always accessible — lets authenticated users switch mode */}
          <Route path="select-mode" element={<AuthSelection />} />

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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;