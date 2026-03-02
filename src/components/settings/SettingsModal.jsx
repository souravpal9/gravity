import React, { useState, useEffect } from 'react';
import { X, User, Bell, Shield, Palette, LogOut, Sun, Moon, Check, ChevronRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SettingsModal = ({ isOpen, onClose }) => {
    const { currentTheme, toggleTheme, mode, themeTemplate, toggleTemplate, isDark } = useTheme();
    const navigate = useNavigate();
    const { logout, isAuthenticated, user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    // Profile form state
    const [profileName, setProfileName] = useState('');
    const [profileEmail, setProfileEmail] = useState('');
    const [profilePassword, setProfilePassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error

    // Sync form fields when modal opens or user changes
    useEffect(() => {
        if (isOpen && user) {
            setProfileName(user.name || '');
            setProfileEmail(user.email || '');
            setProfilePassword('');
            setProfileError('');
            setSaveState('idle');
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    const handleLogout = () => { logout(); onClose(); navigate('/login'); };

    const handleSave = () => {
        setProfileError('');

        if (activeTab === 'profile') {
            if (!profileName.trim()) { setProfileError('Name cannot be empty.'); return; }
            if (!profileEmail.trim()) { setProfileError('Email cannot be empty.'); return; }

            const updates = { name: profileName, email: profileEmail };
            if (profilePassword.trim()) {
                if (profilePassword.length < 6) { setProfileError('Password must be at least 6 characters.'); return; }
                updates.password = profilePassword;
            }

            setSaveState('saving');
            const result = updateUser(updates);

            if (!result.ok) {
                setProfileError(result.error || 'Failed to save changes.');
                setSaveState('error');
                return;
            }

            setSaveState('saved');
            setTimeout(() => { setSaveState('idle'); onClose(); }, 900);
        } else {
            // Non-profile tabs: just close
            setSaveState('saved');
            setTimeout(() => { setSaveState('idle'); onClose(); }, 600);
        }
    };

    const tabs = [
        { id: 'profile', icon: User, label: 'Profile' },
        { id: 'appearance', icon: Palette, label: 'Appearance' },
        { id: 'notifications', icon: Bell, label: 'Notifications' },
        { id: 'privacy', icon: Shield, label: 'Privacy' },
    ];

    // Shared style tokens
    const bg = isDark ? 'bg-slate-900' : 'bg-white';
    const sideBg = isDark ? 'bg-slate-900/80' : 'bg-slate-50';
    const border = isDark ? 'border-slate-800' : 'border-slate-200';
    const text = isDark ? 'text-white' : 'text-slate-900';
    const subtext = isDark ? 'text-slate-400' : 'text-slate-500';
    const cardBg = isDark ? 'bg-slate-800' : 'bg-slate-50';
    const inputClass = `w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'
        }`;

    const saveBtnClass = saveState === 'saved'
        ? 'bg-green-500 shadow-green-500/20'
        : saveState === 'error'
            ? 'bg-red-500 shadow-red-500/20'
            : 'bg-primary-600 hover:bg-primary-700 shadow-primary-600/20';

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`w-full sm:max-w-3xl h-[90vh] sm:h-auto sm:max-h-[84vh] ${bg} border-0 sm:border ${border} rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col sm:flex-row overflow-hidden`}>

                {/* ── Left sidebar ── */}
                <div className={`${sideBg} border-b sm:border-b-0 sm:border-r ${border} flex-shrink-0 flex flex-col`}>
                    {/* User card */}
                    <div className="p-5 flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0 hidden sm:block">
                            <div className={`font-semibold text-sm truncate ${text}`}>{user?.name || 'User'}</div>
                            <div className={`text-xs truncate ${subtext}`}>{user?.email || ''}</div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <nav className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible px-3 pb-3 sm:flex-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setProfileError(''); setSaveState('idle'); }}
                                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all sm:w-full
                                    ${activeTab === tab.id
                                        ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                                        : `${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-white'}`
                                    }`}
                            >
                                <tab.icon size={15} className="flex-shrink-0" />
                                <span className="hidden sm:inline">{tab.label}</span>
                                <span className="sm:hidden">{tab.label}</span>
                                {activeTab === tab.id && <ChevronRight size={13} className="ml-auto hidden sm:block opacity-60" />}
                            </button>
                        ))}
                    </nav>

                    {isAuthenticated && (
                        <div className="hidden sm:block px-3 pb-4">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                            >
                                <LogOut size={15} /> Log Out
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Right content panel ── */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    {/* Header */}
                    <div className={`flex justify-between items-center px-6 py-4 border-b ${border} flex-shrink-0`}>
                        <h2 className={`text-lg font-bold capitalize ${text}`}>{activeTab}</h2>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'}`}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">

                        {/* ── PROFILE ── */}
                        {activeTab === 'profile' && (
                            <>
                                {/* Avatar card */}
                                <div className={`p-4 rounded-2xl ${cardBg} border ${border} flex items-center gap-4`}>
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0">
                                        {(profileName || user?.name || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <div className={`font-bold ${text} truncate`}>{profileName || user?.name}</div>
                                        <div className={`text-sm ${subtext} truncate`}>{profileEmail || user?.email}</div>
                                        <span className={`text-xs mt-1 capitalize px-2 py-0.5 rounded-full inline-block font-medium
                                            ${isDark ? 'bg-primary-900/40 text-primary-400' : 'bg-primary-100 text-primary-700'}`}>
                                            {mode} mode
                                        </span>
                                    </div>
                                </div>

                                {/* Error */}
                                {profileError && (
                                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm">
                                        <AlertCircle size={15} className="flex-shrink-0" />
                                        {profileError}
                                    </div>
                                )}

                                {/* Form fields */}
                                <div className="space-y-3">
                                    <div>
                                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${subtext}`}>
                                            Display Name
                                        </label>
                                        <input
                                            type="text"
                                            value={profileName}
                                            onChange={e => { setProfileName(e.target.value); setProfileError(''); }}
                                            className={inputClass}
                                            placeholder="Your name"
                                        />
                                    </div>

                                    <div>
                                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${subtext}`}>
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={profileEmail}
                                            onChange={e => { setProfileEmail(e.target.value); setProfileError(''); }}
                                            className={inputClass}
                                            placeholder="your@email.com"
                                        />
                                    </div>

                                    <div>
                                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${subtext}`}>
                                            New Password <span className={`font-normal normal-case ${subtext}`}>(leave blank to keep current)</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={profilePassword}
                                                onChange={e => { setProfilePassword(e.target.value); setProfileError(''); }}
                                                className={`${inputClass} pr-10`}
                                                placeholder="Min. 6 characters"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(v => !v)}
                                                className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── APPEARANCE ── */}
                        {activeTab === 'appearance' && (
                            <>
                                <div>
                                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-3 ${subtext}`}>Color Scheme</label>
                                    <div className={`flex gap-2 p-1.5 rounded-2xl ${cardBg} border ${border}`}>
                                        <button
                                            onClick={() => isDark && toggleTheme()}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${!isDark
                                                    ? `${isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'} shadow-md border ${text}`
                                                    : subtext
                                                }`}
                                        >
                                            <Sun size={15} className={!isDark ? 'text-amber-500' : ''} />
                                            Light
                                            {!isDark && <Check size={13} className="text-primary-600 ml-1" />}
                                        </button>
                                        <button
                                            onClick={() => !isDark && toggleTheme()}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${isDark
                                                    ? 'bg-slate-700 text-white shadow-md border border-slate-600'
                                                    : subtext
                                                }`}
                                        >
                                            <Moon size={15} className={isDark ? 'text-blue-400' : ''} />
                                            Dark
                                            {isDark && <Check size={13} className="text-primary-400 ml-1" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-3 ${subtext}`}>Accent Color</label>
                                    <div className={`flex gap-2 p-1.5 rounded-2xl ${cardBg} border ${border}`}>
                                        {['colored', 'monochrome'].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => themeTemplate !== t && toggleTemplate()}
                                                className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${themeTemplate === t
                                                        ? isDark
                                                            ? 'bg-slate-700 text-white shadow-md border border-slate-600'
                                                            : 'bg-white text-slate-900 shadow-md border border-slate-200'
                                                        : subtext
                                                    }`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Live preview */}
                                <div className={`p-4 rounded-2xl ${cardBg} border ${border}`}>
                                    <div className={`text-xs font-semibold uppercase tracking-wider mb-3 ${subtext}`}>Preview</div>
                                    <div className="flex items-end gap-2 mb-2">
                                        <div className="w-7 h-7 rounded-full bg-slate-400 flex items-center justify-center text-white text-xs font-bold">A</div>
                                        <div className={`px-3 py-2 rounded-2xl text-sm max-w-[70%] ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-white text-slate-700 border border-slate-200'}`}>
                                            Hey! How are you?
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <div className="px-3 py-2 rounded-2xl bg-primary-600 text-white text-sm max-w-[70%]">
                                            I'm doing great, thanks! 😊
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── NOTIFICATIONS ── */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-2">
                                {[
                                    { label: 'Message notifications', desc: 'Get notified for new messages', on: true },
                                    { label: 'Email alerts', desc: 'Receive digest emails', on: false },
                                    { label: 'Desktop notifications', desc: 'Browser push notifications', on: true },
                                    { label: 'Sound alerts', desc: 'Play sounds on new activity', on: false },
                                    { label: 'Mentions only', desc: 'Only notify when @mentioned', on: false },
                                ].map(item => (
                                    <div key={item.label} className={`flex items-center justify-between p-4 rounded-xl border ${border} ${cardBg}`}>
                                        <div>
                                            <div className={`text-sm font-medium ${text}`}>{item.label}</div>
                                            <div className={`text-xs ${subtext} mt-0.5`}>{item.desc}</div>
                                        </div>
                                        <div className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors flex-shrink-0 ${item.on ? 'bg-primary-600' : isDark ? 'bg-slate-700' : 'bg-slate-300'}`}>
                                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform shadow-sm ${item.on ? 'translate-x-5' : 'translate-x-1'}`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ── PRIVACY ── */}
                        {activeTab === 'privacy' && (
                            <div className="space-y-2">
                                {[
                                    { label: 'Last seen', desc: 'Who can see when you were last active' },
                                    { label: 'Profile photo', desc: 'Who can see your profile picture' },
                                    { label: 'Read receipts', desc: 'Show when you have read messages' },
                                    { label: 'Online status', desc: 'Show others when you are online' },
                                ].map(item => (
                                    <div key={item.label} className={`flex items-center justify-between p-4 rounded-xl border ${border} ${cardBg}`}>
                                        <div>
                                            <div className={`text-sm font-medium ${text}`}>{item.label}</div>
                                            <div className={`text-xs ${subtext} mt-0.5`}>{item.desc}</div>
                                        </div>
                                        <select className={`px-3 py-1.5 rounded-lg border text-xs font-medium focus:outline-none ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-700'}`}>
                                            <option>Everyone</option>
                                            <option>Contacts</option>
                                            <option>Nobody</option>
                                        </select>
                                    </div>
                                ))}

                                {isAuthenticated && (
                                    <button
                                        onClick={handleLogout}
                                        className="w-full mt-4 flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold text-sm border border-red-500/20 transition-colors sm:hidden"
                                    >
                                        <LogOut size={15} /> Log Out
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className={`p-4 border-t ${border} flex justify-end gap-2 flex-shrink-0`}>
                        <button
                            onClick={onClose}
                            className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saveState === 'saving' || saveState === 'saved'}
                            className={`px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all shadow-md disabled:opacity-80 ${saveBtnClass}`}
                        >
                            {saveState === 'saving' && <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</span>}
                            {saveState === 'saved' && '✓ Saved!'}
                            {saveState === 'error' && 'Error — Try again'}
                            {saveState === 'idle' && 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;