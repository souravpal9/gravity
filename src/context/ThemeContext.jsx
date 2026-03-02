import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState('professional');
    const [themeTemplate, setThemeTemplate] = useState('colored');

    const [currentTheme, setCurrentTheme] = useState(() => {
        return localStorage.getItem('appTheme') || 'light';
    });

    // Single unified effect: apply dark class + theme class to <html>
    useEffect(() => {
        const root = document.documentElement;

        // 1. Dark / Light
        if (currentTheme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // 2. Color theme class
        root.classList.remove('theme-blue', 'theme-green', 'theme-purple', 'theme-gray');
        if (themeTemplate === 'monochrome') {
            root.classList.add('theme-gray');
        } else {
            const map = { professional: 'theme-blue', personal: 'theme-green', mail: 'theme-purple' };
            root.classList.add(map[mode] || 'theme-blue');
        }

        // 3. Persist
        localStorage.setItem('appTheme', currentTheme);
    }, [currentTheme, mode, themeTemplate]);

    const toggleTheme = () => setCurrentTheme(prev => prev === 'dark' ? 'light' : 'dark');

    // kept for backward compat with SettingsModal
    const setTheme = (_scope, value) => setCurrentTheme(value);

    const toggleTemplate = () =>
        setThemeTemplate(prev => prev === 'colored' ? 'monochrome' : 'colored');

    // Returns the color-theme CSS class name (used in App wrapper div)
    const getThemeClass = (overrideMode) => {
        if (themeTemplate === 'monochrome') return 'theme-gray';
        const map = { professional: 'theme-blue', personal: 'theme-green', mail: 'theme-purple' };
        return map[overrideMode || mode] || 'theme-blue';
    };

    const value = useMemo(() => ({
        mode, setMode,
        currentTheme, toggleTheme, setTheme,
        themeTemplate, toggleTemplate,
        getThemeClass,
        isDark: currentTheme === 'dark',
    }), [mode, currentTheme, themeTemplate]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};