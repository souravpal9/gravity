import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Briefcase, MessageCircle, Mail } from 'lucide-react';

const ModeToggle = () => {
    const { mode, setMode } = useTheme();

    const modes = [
        { id: 'professional', icon: Briefcase, label: 'Pro', color: 'text-blue-400', activeBg: 'bg-slate-800' },
        { id: 'personal', icon: MessageCircle, label: 'Personal', color: 'text-emerald-400', activeBg: 'bg-emerald-900/30' },
        { id: 'mail', icon: Mail, label: 'Mail', color: 'text-purple-400', activeBg: 'bg-purple-900/30' },
    ];

    return (
        <div className="flex bg-slate-950/50 p-1 rounded-full border border-slate-800">
            {modes.map((m) => (
                <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`
            relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300
            ${mode === m.id ? `${m.activeBg} ${m.color} shadow-sm` : 'text-slate-500 hover:text-slate-300'}
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
