import React, { useState } from 'react';
import { X, User, Bell, Shield, Moon, Monitor, LogOut, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SettingsModal = ({ isOpen, onClose }) => {
    const { mode } = useTheme();
    const navigate = useNavigate();
    const { logout, isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    if (!isOpen) return null;

    const getThemeColors = () => {
        switch (mode) {
            case 'personal':
                return {
                    bg: 'bg-emerald-950',
                    border: 'border-emerald-900/30',
                    text: 'text-emerald-400',
                    hover: 'hover:bg-emerald-900/20',
                    active: 'bg-emerald-900/30 text-emerald-400'
                };
            case 'mail':
                return {
                    bg: 'bg-purple-950',
                    border: 'border-purple-900/30',
                    text: 'text-purple-400',
                    hover: 'hover:bg-purple-900/20',
                    active: 'bg-purple-900/30 text-purple-400'
                };
            case 'professional':
            default:
                return {
                    bg: 'bg-slate-900',
                    border: 'border-slate-700',
                    text: 'text-blue-400',
                    hover: 'hover:bg-slate-800',
                    active: 'bg-slate-800 text-blue-400'
                };
        }
    };

    const colors = getThemeColors();

    const tabs = [
        { id: 'profile', icon: User, label: 'Profile' },
        { id: 'notifications', icon: Bell, label: 'Notifications' },
        { id: 'privacy', icon: Shield, label: 'Privacy' },
        { id: 'appearance', icon: Monitor, label: 'Appearance' },
    ];

    const handleLogout = () => {
        logout();
        onClose();
        navigate('/login');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className={`w-full max-w-4xl max-h-[90vh] md:h-[80vh] ${colors.bg} border ${colors.border} rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden`}>
                {/* Sidebar */}
                <div className={`w-full md:w-64 border-b md:border-b-0 md:border-r ${colors.border} p-4 flex flex-col bg-black/20`}>
                    <h2 className="text-xl font-bold text-white mb-4 px-2">Settings</h2>
                    <div className="flex md:flex-col gap-2 md:gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-4 py-2 md:py-3 rounded-xl transition-all font-medium whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? colors.active
                                        : 'text-slate-400 hover:text-slate-200 ' + colors.hover
                                }`}
                            >
                                <tab.icon size={20} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {isAuthenticated && (
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors md:mt-auto font-medium"
                        >
                            <LogOut size={20} />
                            Log Out
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className={`flex justify-between items-center p-6 border-b ${colors.border}`}>
                        <h3 className="text-2xl font-bold text-white capitalize">{activeTab}</h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {/* ...rest of your tabs content... */}
                    </div>

                    <div className={`p-6 border-t ${colors.border} flex justify-end gap-3`}>
                        <button onClick={onClose} className="px-6 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium">
                            Cancel
                        </button>
                        <button onClick={onClose} className={`px-6 py-2 rounded-lg text-white font-medium shadow-lg ${colors.active.split(' ')[0]} brightness-110 hover:brightness-125 transition-all`}>
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
