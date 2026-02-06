import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Briefcase, MessageCircle, ArrowRight } from 'lucide-react';

const AuthSelection = () => {
    const navigate = useNavigate();
    const { setMode } = useTheme();

    const handleSelect = (mode) => {
        setMode(mode);
        navigate('/login');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-12">
            <div className="text-center space-y-4">
                <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                    Welcome to DualSpace
                </h1>
                <p className="text-xl text-slate-400 max-w-lg mx-auto">
                    One platform, two worlds. Seamlessly switch between your professional workflow and personal connections.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
                {/* Professional Card */}
                <div
                    onClick={() => handleSelect('professional')}
                    className="group relative overflow-hidden rounded-2xl bg-slate-800/50 border border-slate-700 p-8 cursor-pointer hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative z-10 flex flex-col items-center text-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform duration-300">
                            <Briefcase size={40} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-white">Professional</h2>
                            <p className="text-slate-400">
                                For teams, projects, and productivity. Focus on work with a structured environment.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-blue-400 font-medium group-hover:gap-4 transition-all">
                            Enter Workspace <ArrowRight size={18} />
                        </div>
                    </div>
                </div>

                {/* Personal Card */}
                <div
                    onClick={() => handleSelect('personal')}
                    className="group relative overflow-hidden rounded-2xl bg-slate-800/50 border border-slate-700 p-8 cursor-pointer hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative z-10 flex flex-col items-center text-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                            <MessageCircle size={40} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-white">Personal</h2>
                            <p className="text-slate-400">
                                For friends, family, and casual chats. Relax with a vibrant, social atmosphere.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-400 font-medium group-hover:gap-4 transition-all">
                            Start Chatting <ArrowRight size={18} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthSelection;
