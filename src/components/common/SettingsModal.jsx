import React, { useState } from 'react';
import { X, Moon, Sun, Monitor, Settings as SettingsIcon, Bell, Shield, User } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const SettingsModal = ({ isOpen, onClose, scope = 'professional' }) => {
    const [activeTab, setActiveTab] = useState('appearance');
    const { dashboardThemes, setTheme } = useTheme();

    const currentTheme = dashboardThemes[scope];

    if (!isOpen) return null;

    const tabs = [
        { id: 'appearance', label: 'Appearance', icon: Monitor },
        { id: 'account', label: 'Account', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'privacy', label: 'Privacy', icon: Shield },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-4xl h-[600px] bg-white dark:bg-primary-950 rounded-2xl shadow-2xl flex overflow-hidden border border-slate-200 dark:border-primary-900">
                {/* Sidebar */}
                <div className="w-64 bg-slate-50 dark:bg-primary-900/50 border-r border-slate-200 dark:border-primary-800 p-4 flex flex-col">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-primary-100 mb-6 px-2 flex items-center gap-2">
                        <SettingsIcon className="w-6 h-6" />
                        Settings
                    </h2>
                    <nav className="space-y-1 flex-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium
                                    ${activeTab === tab.id
                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col w-full min-w-0">
                    <div className="p-6 border-b border-slate-200 dark:border-primary-800 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-primary-100 capitalize">{activeTab}</h3>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {activeTab === 'appearance' && (
                            <div className="max-w-xl">
                                <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Theme Preferences</h4>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setTheme(scope, 'light')}
                                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3
                                                ${currentTheme === 'light'
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                            }`}
                                    >
                                        <div className="w-full aspect-video bg-slate-100 rounded-lg border border-slate-200 relative overflow-hidden group-hover:shadow-sm transition-shadow">
                                            {/* Mock UI for Light Mode */}
                                            <div className="absolute inset-0 p-2 space-y-2">
                                                <div className="w-1/3 h-2 bg-slate-300 rounded-full" />
                                                <div className="space-y-1">
                                                    <div className="w-full h-1.5 bg-slate-200 rounded-full" />
                                                    <div className="w-2/3 h-1.5 bg-slate-200 rounded-full" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Sun size={18} className={currentTheme === 'light' ? 'text-blue-500' : 'text-slate-400'} />
                                            <span className={`font-medium ${currentTheme === 'light' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>Light Mode</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setTheme(scope, 'dark')}
                                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3
                                                ${currentTheme === 'dark'
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                            }`}
                                    >
                                        <div className="w-full aspect-video bg-slate-900 rounded-lg border border-slate-800 relative overflow-hidden group-hover:shadow-sm transition-shadow">
                                            {/* Mock UI for Dark Mode */}
                                            <div className="absolute inset-0 p-2 space-y-2">
                                                <div className="w-1/3 h-2 bg-slate-700 rounded-full" />
                                                <div className="space-y-1">
                                                    <div className="w-full h-1.5 bg-slate-800 rounded-full" />
                                                    <div className="w-2/3 h-1.5 bg-slate-800 rounded-full" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Moon size={18} className={currentTheme === 'dark' ? 'text-blue-500' : 'text-slate-400'} />
                                            <span className={`font-medium ${currentTheme === 'dark' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>Dark Mode</span>
                                        </div>
                                    </button>
                                </div>

                                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                                    Choose a theme that suits your preference.
                                </p>
                            </div>
                        )}
                        {/* Placeholders for other tabs */}
                        {activeTab !== 'appearance' && (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <SettingsIcon size={48} className="mb-4 opacity-20" />
                                <p>Settings for {activeTab} coming soon.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default SettingsModal;
