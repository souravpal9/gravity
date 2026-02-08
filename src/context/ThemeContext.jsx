import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // Mode specific state (for color templates, not light/dark)
    const [mode, setMode] = useState('professional');
    const [themeTemplate, setThemeTemplate] = useState('colored');

    // Global Theme State
    const [currentTheme, setCurrentTheme] = useState(() => {
        const saved = localStorage.getItem('appTheme');
        return saved || 'light';
    });

    // 1. Sync with DOM and LocalStorage
    useEffect(() => {
        localStorage.setItem('appTheme', currentTheme);
        const root = document.documentElement;

        // Remove old theme classes
        root.classList.remove('theme-blue', 'theme-green', 'theme-purple', 'theme-gray');

        // Add new theme class
        const newThemeClass = getThemeClass(mode);
        root.classList.add(newThemeClass);

        if (currentTheme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [currentTheme, mode, themeTemplate]);

    // 2. Toggle Function
    const toggleTheme = () => {
        setCurrentTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    // 3. Set Theme Function
    const setTheme = (scope, value) => {
        setCurrentTheme(value);
    };

    const toggleTemplate = () => {
        setThemeTemplate(prev => prev === 'colored' ? 'monochrome' : 'colored');
    };

    // Helper for legacy color theme classes (Blue/Green/Purple)
    const getThemeClass = (currentMode) => {
        if (themeTemplate === 'monochrome') return 'theme-gray';
        switch (currentMode || mode) {
            case 'professional': return 'theme-blue';
            case 'personal': return 'theme-green';
            case 'mail': return 'theme-purple';
            default: return 'theme-blue';
        }
    };

    const value = useMemo(
        () => ({
            mode,
            setMode,
            currentTheme,
            toggleTheme,
            setTheme,
            themeTemplate,
            toggleTemplate,
            getThemeClass
        }),
        [mode, currentTheme, themeTemplate]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
