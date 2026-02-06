import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

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

    const currentTheme = dashboardThemes[mode] || 'dark';

    useEffect(() => {
        const root = document.documentElement;
        if (currentTheme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [currentTheme]);

    const toggleTheme = () => {
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setDashboardThemes({
            professional: nextTheme,
            personal: nextTheme,
            mail: nextTheme
        });
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

    const value = useMemo(
        () => ({
            mode,
            setMode,
            dashboardThemes,
            currentTheme,
            toggleTheme,
            setTheme,
            themeTemplate,
            toggleTemplate,
            getThemeClass
        }),
        [mode, dashboardThemes, currentTheme, themeTemplate]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
