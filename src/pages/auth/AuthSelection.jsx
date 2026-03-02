import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, MessageCircle, ArrowRight, Mail, Check } from 'lucide-react';

const AuthSelection = () => {
    const navigate = useNavigate();
    const { setMode, currentTheme, mode: currentMode } = useTheme();
    const { isAuthenticated } = useAuth();
    const isDark = currentTheme === 'dark';

    const handleSelect = (mode) => {
        setMode(mode);
        // If already logged in, skip login and go straight to dashboard
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        } else {
            navigate('/login');
        }
    };

    const cards = [
        {
            mode: 'professional',
            icon: Briefcase,
            title: 'Professional',
            desc: 'Teams-style workspace for projects, channels, and productivity.',
            cta: 'Enter Workspace',
            color: 'blue',
            gradient: 'from-blue-600 to-blue-400',
            hover: isDark ? 'hover:border-blue-500/50 hover:shadow-blue-500/10' : 'hover:border-blue-400/60 hover:shadow-blue-200/60',
            iconBg: isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600',
            ctaColor: isDark ? 'text-blue-400' : 'text-blue-600',
        },
        {
            mode: 'mail',
            icon: Mail,
            title: 'Mail',
            desc: 'Email-style collaboration for updates, announcements, and newsletters.',
            cta: 'Open Inbox',
            color: 'purple',
            gradient: 'from-purple-600 to-purple-400',
            hover: isDark ? 'hover:border-purple-500/50 hover:shadow-purple-500/10' : 'hover:border-purple-400/60 hover:shadow-purple-200/60',
            iconBg: isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600',
            ctaColor: isDark ? 'text-purple-400' : 'text-purple-600',
        },
        {
            mode: 'personal',
            icon: MessageCircle,
            title: 'Personal',
            desc: 'WhatsApp-style chats with a social vibe for friends and family.',
            cta: 'Start Chatting',
            color: 'emerald',
            gradient: 'from-emerald-500 to-teal-400',
            hover: isDark ? 'hover:border-emerald-500/50 hover:shadow-emerald-500/10' : 'hover:border-emerald-400/60 hover:shadow-emerald-200/60',
            iconBg: isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600',
            ctaColor: isDark ? 'text-emerald-400' : 'text-emerald-600',
        },
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-10 px-4">
            <div className="text-center space-y-3">
                <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 bg-clip-text text-transparent">
                    {isAuthenticated ? 'Switch Mode' : 'Welcome to Gravity'}
                </h1>
                <p className={`text-lg max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {isAuthenticated
                        ? 'Choose which workspace you want to switch to.'
                        : 'One platform, three worlds. Pick your experience to get started.'
                    }
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-5 w-full max-w-4xl">
                {cards.map(card => {
                    const Icon = card.icon;
                    const isActive = currentMode === card.mode && isAuthenticated;

                    return (
                        <div
                            key={card.mode}
                            onClick={() => handleSelect(card.mode)}
                            className={`group relative overflow-hidden rounded-2xl border p-7 cursor-pointer transition-all duration-300 hover:shadow-xl
                                ${isDark
                                    ? `bg-slate-800/50 border-slate-700 ${card.hover}`
                                    : `bg-white border-slate-200 ${card.hover}`
                                }
                                ${isActive ? `ring-2 ring-offset-2 ${isDark ? 'ring-offset-slate-950' : 'ring-offset-slate-100'} ring-${card.color}-500` : ''}
                            `}
                        >
                            {/* Active glow bg */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                            <div className="relative flex flex-col items-center text-center gap-5">
                                {/* Icon */}
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${card.iconBg}`}>
                                    <Icon size={32} />
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-center gap-2">
                                        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                            {card.title}
                                        </h2>
                                        {isActive && (
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-${card.color}-100 dark:bg-${card.color}-900/30 text-${card.color}-600 dark:text-${card.color}-400`}>
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {card.desc}
                                    </p>
                                </div>

                                <div className={`flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all ${card.ctaColor}`}>
                                    {isActive ? (
                                        <><Check size={16} /> Currently Active</>
                                    ) : (
                                        <>{card.cta} <ArrowRight size={16} /></>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AuthSelection;