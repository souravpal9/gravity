import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState('professional'); // 'professional', 'personal', or 'mail'
    const [themeTemplate, setThemeTemplate] = useState('colored'); // 'colored' or 'monochrome'
    const [dashboardThemes, setDashboardThemes] = useState(() => {
        const saved = localStorage.getItem('dashboardThemes');
        return saved ? JSON.parse(saved) : {
            professional: 'dark',
            personal: 'dark',
            mail: 'dark'
        };
    });

    useEffect(() => {
        localStorage.setItem('dashboardThemes', JSON.stringify(dashboardThemes));
    }, [dashboardThemes]);

    const toggleTheme = (scope) => {
        setDashboardThemes(prev => ({
            ...prev,
            [scope]: prev[scope] === 'dark' ? 'light' : 'dark'
        }));
    };

    const setTheme = (scope, value) => {
        setDashboardThemes(prev => ({
            ...prev,
            [scope]: value
        }));
    };

    const toggleTemplate = () => {
        setThemeTemplate(prev => prev === 'colored' ? 'monochrome' : 'colored');
    };

    const getThemeClass = (currentMode) => {
        if (themeTemplate === 'monochrome') return 'theme-gray';

        switch (currentMode || mode) {
            case 'professional': return 'theme-blue';
            case 'personal': return 'theme-green';
            case 'mail': return 'theme-purple';
            default: return 'theme-blue';
        }
    };

    return (
        <ThemeContext.Provider value={{
            mode,
            setMode,
            dashboardThemes,
            toggleTheme,
            setTheme,
            themeTemplate,
            toggleTemplate,
            getThemeClass
        }}>
            {children}
        </ThemeContext.Provider>
    );
};
