import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Signup = () => {
    const { mode, isDark } = useTheme();
    const { signup } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => { setError(''); }, [name, email, password]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) { setError('Please enter your name.'); return; }
        if (!email.trim()) { setError('Please enter your email.'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

        setIsLoading(true);
        setTimeout(() => {
            const result = signup({ name: name.trim(), email: email.trim(), password, mode });
            setIsLoading(false);

            if (!result.ok) {
                setError('An account with this email already exists.');
                return;
            }
            navigate('/dashboard', { replace: true });
        }, 50);
    };

    const modeConfig = {
        professional: {
            accent: 'blue',
            gradient: 'from-blue-600 to-blue-400',
            ring: 'focus:ring-blue-500/30',
            border: 'focus:border-blue-500',
            btn: 'from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-blue-500/25',
            label: 'Workspace',
        },
        personal: {
            accent: 'emerald',
            gradient: 'from-emerald-500 to-teal-400',
            ring: 'focus:ring-emerald-500/30',
            border: 'focus:border-emerald-500',
            btn: 'from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-emerald-500/25',
            label: 'Personal',
        },
        mail: {
            accent: 'purple',
            gradient: 'from-purple-600 to-purple-400',
            ring: 'focus:ring-purple-500/30',
            border: 'focus:border-purple-500',
            btn: 'from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 shadow-purple-500/25',
            label: 'Mail',
        },
    };

    const cfg = modeConfig[mode] || modeConfig.professional;

    const inputClass = (extra = '') => `w-full py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2
        ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}
        ${cfg.ring} ${cfg.border} ${extra}`;

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4">
            <div className={`w-full max-w-md ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl shadow-xl p-8`}>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shadow-lg`}>
                        <User size={26} className="text-white" />
                    </div>
                    <h1 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Create account</h1>
                    <p className={`text-sm capitalize ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Join the {cfg.label} network
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    {/* Name */}
                    <div>
                        <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Full name</label>
                        <div className="relative">
                            <User size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                autoComplete="name"
                                placeholder="John Doe"
                                className={inputClass('pl-10 pr-4')}
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Email address</label>
                        <div className="relative">
                            <Mail size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                autoComplete="email"
                                placeholder="you@example.com"
                                className={inputClass('pl-10 pr-4')}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Password</label>
                        <div className="relative">
                            <Lock size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                autoComplete="new-password"
                                placeholder="Min. 6 characters"
                                className={inputClass('pl-10 pr-10')}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(v => !v)}
                                className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {/* Strength indicator */}
                        {password.length > 0 && (
                            <div className="mt-1.5 flex gap-1">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${password.length >= (i + 1) * 2
                                        ? password.length < 6 ? 'bg-red-400' : password.length < 10 ? 'bg-yellow-400' : 'bg-green-400'
                                        : isDark ? 'bg-slate-700' : 'bg-slate-200'
                                        }`} />
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-2.5 mt-2 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 bg-gradient-to-r ${cfg.btn} shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                        {isLoading ? (
                            <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>Create Account <ArrowRight size={16} /></>
                        )}
                    </button>
                </form>

                <p className={`mt-6 text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Already have an account?{' '}
                    <Link to="/login" className={`font-semibold hover:underline text-${cfg.accent}-${isDark ? '400' : '600'}`}>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;