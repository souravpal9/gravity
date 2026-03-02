import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../common/ThemeToggle';
import { Zap, LogOut, LayoutGrid } from 'lucide-react';

const MainLayout = () => {
    const { isDark, mode } = useTheme();
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isDashboard = location.pathname === '/dashboard';

    const modeColors = {
        professional: 'from-blue-600 to-blue-500',
        personal: 'from-emerald-500 to-teal-500',
        mail: 'from-purple-600 to-purple-500',
    };

    return (
        <div className={`min-h-screen flex flex-col ${isDark ? 'bg-slate-950' : 'bg-slate-100'}`}>
            {/* ── Top Nav ── */}
            <header className={`h-14 flex items-center justify-between px-4 md:px-6 border-b flex-shrink-0 sticky top-0 z-40
                ${isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'} backdrop-blur-sm shadow-sm`}>

                {/* Logo */}
                <button onClick={() => navigate('/')} className="flex items-center gap-2 font-bold text-lg">
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${modeColors[mode] || modeColors.professional} flex items-center justify-center shadow-sm`}>
                        <Zap size={14} className="text-white" />
                    </div>
                    <span className={`hidden sm:block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Gravity
                    </span>
                </button>

                {/* Right controls */}
                <div className="flex items-center gap-1">
                    {/* Switch Mode — only shown on dashboard, navigates to /select-mode */}
                    {isDashboard && isAuthenticated && (
                        <button
                            onClick={() => navigate('/select-mode')}
                            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors mr-1
                                ${isDark
                                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                        >
                            <LayoutGrid size={14} /> Switch Mode
                        </button>
                    )}

                    {/* ── MASTER THEME TOGGLE (only one in the whole app) ── */}
                    <ThemeToggle />

                    {isAuthenticated && (
                        <button
                            onClick={() => { logout(); navigate('/'); }}
                            title="Log out"
                            className={`p-2 rounded-xl transition-colors ${isDark
                                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                        >
                            <LogOut size={18} />
                        </button>
                    )}
                </div>
            </header>

            {/* ── Page content ── */}
            <main className="flex-1 flex flex-col p-2 md:p-4 overflow-hidden">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;