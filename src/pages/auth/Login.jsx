import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Mail, Lock, ArrowRight, Briefcase, MessageCircle } from 'lucide-react';

const Login = () => {
    const { mode } = useTheme();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock login logic
        console.log(`Logging in to ${mode} mode with`, { email, password });
        navigate('/dashboard');
    };

    const getModeConfig = () => {
        switch (mode) {
            case 'personal':
                return {
                    icon: MessageCircle,
                    themeColor: 'emerald',
                    bgColor: 'bg-emerald-500/20',
                    textColor: 'text-emerald-400',
                    borderColor: 'border-emerald-900/30',
                    shadowColor: 'shadow-emerald-900/10',
                    buttonBg: 'bg-emerald-600 hover:bg-emerald-500',
                    buttonShadow: 'shadow-emerald-600/20',
                    linkText: 'text-emerald-400',
                    inputFocus: 'focus:border-emerald-500 focus:ring-emerald-500/20'
                };
            case 'mail':
                return {
                    icon: Mail,
                    themeColor: 'purple',
                    bgColor: 'bg-purple-500/20',
                    textColor: 'text-purple-400',
                    borderColor: 'border-purple-900/30',
                    shadowColor: 'shadow-purple-900/10',
                    buttonBg: 'bg-purple-600 hover:bg-purple-500',
                    buttonShadow: 'shadow-purple-600/20',
                    linkText: 'text-purple-400',
                    inputFocus: 'focus:border-purple-500 focus:ring-purple-500/20'
                };
            case 'professional':
            default:
                return {
                    icon: Briefcase,
                    themeColor: 'blue',
                    bgColor: 'bg-blue-500/20',
                    textColor: 'text-blue-400',
                    borderColor: 'border-slate-700',
                    shadowColor: 'shadow-blue-900/10',
                    buttonBg: 'bg-blue-600 hover:bg-blue-500',
                    buttonShadow: 'shadow-blue-600/20',
                    linkText: 'text-blue-400',
                    inputFocus: 'focus:border-blue-500 focus:ring-blue-500/20'
                };
        }
    };

    const config = getModeConfig();
    const ModeIcon = config.icon;

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className={`
        w-full max-w-md p-8 rounded-2xl border backdrop-blur-sm transition-all duration-500
        bg-slate-900/50 shadow-xl ${config.borderColor} ${config.shadowColor}
      `}>
                <div className="text-center mb-8">
                    <div className={`
            w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-colors duration-500
            ${config.bgColor} ${config.textColor}
          `}>
                        <ModeIcon size={32} />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                    <p className="text-slate-400 capitalize">
                        Sign in to your {mode} account
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`
                  w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/50 border focus:outline-none focus:ring-2 transition-all
                  ${config.borderColor} ${config.inputFocus}
                `}
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`
                  w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/50 border focus:outline-none focus:ring-2 transition-all
                  ${config.borderColor} ${config.inputFocus}
                `}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`
              w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-white shadow-lg
              ${config.buttonBg} ${config.buttonShadow}
            `}
                    >
                        Sign In <ArrowRight size={20} />
                    </button>
                </form>

                <div className="mt-6 text-center text-slate-400">
                    Don't have an account?{' '}
                    <Link
                        to="/signup"
                        className={`font-medium hover:underline ${config.linkText}`}
                    >
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
