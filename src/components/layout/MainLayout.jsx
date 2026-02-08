import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Settings } from 'lucide-react';
import ModeToggle from './ModeToggle';
import ThemeToggle from './ThemeToggle';
import SettingsModal from '../common/SettingsModal';
import { useTheme } from '../../context/ThemeContext';

const MainLayout = () => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { mode, currentTheme } = useTheme();

    const getThemeStyles = () => {
        // Strict Dual Tone: 
        // Light: White Sidebar, Slate-100 Main.
        // Dark: Slate-900 Sidebar, Slate-950 Main.
        return {
            bg: mode === 'personal' ? 'bg-whatsapp-beige dark:bg-slate-950' :
                mode === 'professional' ? 'bg-theme-blue dark:bg-slate-950' :
                    mode === 'mail' ? 'bg-theme-purple dark:bg-slate-950' :
                        'bg-slate-50 dark:bg-slate-950', // Fallback
            text: 'text-slate-950 dark:text-slate-100',
            headerBg: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800', // Sidebar/Header background
            logoBg: 'bg-primary-600', // Keep brand logo
            title: mode === 'professional' ? 'ProConnect' : mode === 'personal' ? 'Personal' : 'MailBox'
        };
    };

    const styles = getThemeStyles();

    return (
        <div className={`min-h-screen transition-colors duration-500 ${styles.bg} ${styles.text}`}>
            <header className={`
        border-b px-4 py-3 flex flex-col sm:flex-row gap-4 justify-between items-center sticky top-0 z-50 backdrop-blur-md transition-colors duration-500
        ${styles.headerBg}
      `}>
                <div className="flex items-center justify-between w-full sm:w-auto">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xl text-white transition-colors duration-500 ${styles.logoBg}`}>
                            {styles.title[0]}
                        </div>
                        <h1 className="font-bold text-xl tracking-tight">
                            {styles.title}
                        </h1>
                    </div>

                    {/* Mobile Settings Button (Visible only on small screens next to logo if needed, but we keep it in the main bar for now) */}
                </div>

                <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-4">
                    <div className="flex-1 sm:flex-none flex justify-center items-center gap-2">
                        <ModeToggle />
                        <ThemeToggle />
                    </div>

                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors flex-shrink-0"
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </header>

            <main className="w-full px-2 md:px-4 py-4 md:py-8">
                <Outlet />
            </main>

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
    );
};

export default MainLayout;
