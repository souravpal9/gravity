import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Briefcase, MessageCircle, ArrowRight } from 'lucide-react';

const AuthSelection = () => {
    const navigate = useNavigate();
    const { setMode, currentTheme } = useTheme();
    const isDark = currentTheme === 'dark';

    const handleSelect = (mode) => {
        setMode(mode);
        navigate('/login');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-12">
            <div className="text-center space-y-4">
                <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
                    Welcome to DualSpace
                </h1>
                <p className={`text-xl max-w-lg mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    One platform, two worlds. Seamlessly switch between your professional workflow and personal connections.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
                {/* Professional Card */}
                <div
                    onClick={() => handleSelect('professional')}
                    className={`group relative overflow-hidden rounded-2xl border p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 ${isDark ? 'bg-slate-800/50 border-slate-700 hover:border-blue-500/50' : 'bg-white border-slate-200 hover:border-blue-400/60'}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative z-10 flex flex-col items-center text-center gap-6">
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                            <Briefcase size={40} />
                        </div>
                        <div className="space-y-2">
                            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Professional</h2>
                            <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                                For teams, projects, and productivity. Focus on work with a structured environment.
                            </p>
                        </div>
                        <div className={`flex items-center gap-2 font-medium group-hover:gap-4 transition-all ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                            Enter Workspace <ArrowRight size={18} />
                        </div>
                    </div>
                </div>

                {/* Personal Card */}
                <div
                    onClick={() => handleSelect('personal')}
                    className={`group relative overflow-hidden rounded-2xl border p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 ${isDark ? 'bg-slate-800/50 border-slate-700 hover:border-emerald-500/50' : 'bg-white border-slate-200 hover:border-emerald-400/60'}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative z-10 flex flex-col items-center text-center gap-6">
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                            <MessageCircle size={40} />
                        </div>
                        <div className="space-y-2">
                            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Personal</h2>
                            <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                                For friends, family, and casual chats. Relax with a vibrant, social atmosphere.
                            </p>
                        </div>
                        <div className={`flex items-center gap-2 font-medium group-hover:gap-4 transition-all ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            Start Chatting <ArrowRight size={18} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthSelection;
