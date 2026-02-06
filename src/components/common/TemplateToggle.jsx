import React from 'react';
import { Palette, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const TemplateToggle = () => {
    const { themeTemplate, toggleTemplate } = useTheme();

    return (
        <button
            onClick={toggleTemplate}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium border border-slate-200 dark:border-slate-700"
            title={themeTemplate === 'colored' ? 'Switch to Dark/Gray Theme' : 'Switch to Colored Theme'}
        >
            {themeTemplate === 'colored' ? (
                <>
                    <Moon size={16} />
                    <span className="hidden sm:inline">Dark/Gray</span>
                </>
            ) : (
                <>
                    <Palette size={16} />
                    <span className="hidden sm:inline">Colored</span>
                </>
            )}
        </button>
    );
};

export default TemplateToggle;
