import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Briefcase, MessageCircle, Mail } from 'lucide-react';

const ModeToggle = () => {
    const { mode, setMode, currentTheme } = useTheme();
    const isDark = currentTheme === 'dark';

    const modes = [
        {
            id: 'professional',
            icon: Briefcase,
            label: 'Pro',
            color: isDark ? 'text-blue-400' : 'text-blue-600',
            activeBg: isDark ? 'bg-slate-800' : 'bg-blue-100'
        },
        {
            id: 'personal',
            icon: MessageCircle,
            label: 'Personal',
            color: isDark ? 'text-emerald-400' : 'text-emerald-600',
            activeBg: isDark ? 'bg-emerald-900/30' : 'bg-emerald-100'
        },
        {
            id: 'mail',
            icon: Mail,
            label: 'Mail',
            color: isDark ? 'text-purple-400' : 'text-purple-600',
            activeBg: isDark ? 'bg-purple-900/30' : 'bg-purple-100'
        }
    ];

    return (
        <div className={`flex p-1 rounded-full border ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-white border-slate-200'}`}>
            {modes.map((m) => (
                <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`
            relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300
            ${mode === m.id ? `${m.activeBg} ${m.color} shadow-sm` : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'}
          `}
                >
                    <m.icon size={18} />
                    <span className={`text-sm font-medium transition-all duration-300 ${mode === m.id ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                        {m.label}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default ModeToggle;
