import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, ArrowRight, Briefcase, MessageCircle } from 'lucide-react';

const Signup = () => {
    const { mode, currentTheme } = useTheme();
    const { signup, error } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formError, setFormError] = useState('');
    const isDark = currentTheme === 'dark';

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');
        const result = signup({ name, email, password, mode });
        if (!result.ok) {
            setFormError('Unable to create your account. Try a different email.');
            return;
        }
        navigate('/dashboard');
    };

    const getModeConfig = () => {
        switch (mode) {
            case 'personal':
                return {
                    icon: MessageCircle,
                    themeColor: 'emerald',
                    bgColor: isDark ? 'bg-emerald-500/20' : 'bg-emerald-100',
                    textColor: isDark ? 'text-emerald-400' : 'text-emerald-600',
                    borderColor: isDark ? 'border-emerald-900/30' : 'border-emerald-200',
                    shadowColor: isDark ? 'shadow-emerald-900/10' : 'shadow-emerald-200/60',
                    buttonBg: 'bg-emerald-600 hover:bg-emerald-500',
                    buttonShadow: 'shadow-emerald-600/20',
                    linkText: isDark ? 'text-emerald-400' : 'text-emerald-600',
                    inputFocus: 'focus:border-emerald-500 focus:ring-emerald-500/20'
                };
            case 'mail':
                return {
                    icon: Mail,
                    themeColor: 'purple',
                    bgColor: isDark ? 'bg-purple-500/20' : 'bg-purple-100',
                    textColor: isDark ? 'text-purple-400' : 'text-purple-600',
                    borderColor: isDark ? 'border-purple-900/30' : 'border-purple-200',
                    shadowColor: isDark ? 'shadow-purple-900/10' : 'shadow-purple-200/60',
                    buttonBg: 'bg-purple-600 hover:bg-purple-500',
                    buttonShadow: 'shadow-purple-600/20',
                    linkText: isDark ? 'text-purple-400' : 'text-purple-600',
                    inputFocus: 'focus:border-purple-500 focus:ring-purple-500/20'
                };
            case 'professional':
            default:
                return {
                    icon: Briefcase,
                    themeColor: 'blue',
                    bgColor: isDark ? 'bg-blue-500/20' : 'bg-blue-100',
                    textColor: isDark ? 'text-blue-400' : 'text-blue-600',
                    borderColor: isDark ? 'border-slate-700' : 'border-blue-200',
                    shadowColor: isDark ? 'shadow-blue-900/10' : 'shadow-blue-200/60',
                    buttonBg: 'bg-blue-600 hover:bg-blue-500',
                    buttonShadow: 'shadow-blue-600/20',
                    linkText: isDark ? 'text-blue-400' : 'text-blue-600',
                    inputFocus: 'focus:border-blue-500 focus:ring-blue-500/20'
                };
        }
    };

    const config = getModeConfig();
    const ModeIcon = config.icon;

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4">
            <div className={`
        w-full max-w-md p-8 rounded-2xl border backdrop-blur-sm transition-all duration-500 shadow-xl
        ${isDark ? 'bg-slate-900/50' : 'bg-white'}
        ${config.borderColor} ${config.shadowColor}
      `}>
                <div className="text-center mb-8">
                    <div className={`
            w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-colors duration-500
            ${config.bgColor} ${config.textColor}
          `}>
                        <ModeIcon size={32} />
                    </div>
                    <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Create Account</h2>
                    <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} capitalize`}>
                        Join the {mode} network
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {(formError || error) && (
                        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                            {formError || error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Full Name</label>
                        <div className="relative">
                            <User className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} size={20} />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`
                  w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all
                  ${isDark ? 'bg-slate-950/50 text-white placeholder:text-slate-500' : 'bg-white text-slate-900 placeholder:text-slate-400'}
                  ${config.borderColor} ${config.inputFocus}
                `}
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Email Address</label>
                        <div className="relative">
                            <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`
                  w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all
                  ${isDark ? 'bg-slate-950/50 text-white placeholder:text-slate-500' : 'bg-white text-slate-900 placeholder:text-slate-400'}
                  ${config.borderColor} ${config.inputFocus}
                `}
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Password</label>
                        <div className="relative">
                            <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`
                  w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all
                  ${isDark ? 'bg-slate-950/50 text-white placeholder:text-slate-500' : 'bg-white text-slate-900 placeholder:text-slate-400'}
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
                        Create Account <ArrowRight size={20} />
                    </button>
                </form>

                <div className={`mt-6 text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        className={`font-medium hover:underline ${config.linkText}`}
                    >
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
