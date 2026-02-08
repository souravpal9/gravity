import React, { useState, useEffect, useRef } from 'react';
import { Hash, Bell, Search, MoreHorizontal, Phone, Video, Users, Calendar, FileText, Plus, Menu, X, Settings, UserPlus, LogOut, Reply, Smile, Send, Mic, Paperclip } from 'lucide-react';
import useMediaQuery from '../../hooks/useMediaQuery';
import DropdownMenu from '../../components/common/DropdownMenu';
import TemplateToggle from '../../components/common/TemplateToggle';
import SettingsModal from '../../components/common/SettingsModal';
import CallInterface from '../../components/common/CallInterface';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useRealtimeChat } from '../../hooks/useRealtimeChat';


const ProfessionalDashboard = () => {
    const [activeChannel, setActiveChannel] = useState('general');
    const [activeTeam, setActiveTeam] = useState('engineering');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [callData, setCallData] = useState({ isOpen: false, type: 'voice' });
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [inputText, setInputText] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const { user } = useAuth();
    const { messages, sendMessage, status } = useRealtimeChat({
        room: `professional-${activeChannel}`,
        user
    });
    const isMobile = useMediaQuery('(max-width: 767px)');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!isMobile) {
            setIsSidebarOpen(false); // Reset on desktop
        }
    }, [isMobile]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!inputText.trim()) return;

        sendMessage(inputText, { replyTo: replyingTo });
        setInputText('');
        setReplyingTo(null);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const teams = [
        { id: 'engineering', name: 'Engineering', channels: ['general', 'frontend', 'backend', 'deployments'] },
        { id: 'design', name: 'Design', channels: ['general', 'ui-kit', 'user-research'] },
        { id: 'marketing', name: 'Marketing', channels: ['general', 'campaigns', 'social-media'] },
    ];

    return (
        <div className="flex h-[calc(100vh-8rem)] rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} scope="professional" />

            {/* Mobile Sidebar Overlay */}
            {isMobile && isSidebarOpen && (
                <div
                    className="absolute inset-0 bg-black/50 z-20"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                w-full md:w-72 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 absolute md:relative z-30 h-full
                ${isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
            `}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-100 dark:bg-slate-900">
                    <h2 className="font-bold text-slate-950 dark:text-white tracking-tight">Teams</h2>
                    <div className="flex gap-1">
                        <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                            <Plus size={18} />
                        </button>
                        <button
                            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white md:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-6">
                    {/* Teams List */}
                    {teams.map((team) => (
                        <div key={team.id}>
                            <div
                                className={`flex items-center gap-2 px-2 py-1.5 font-bold text-xs uppercase tracking-wider mb-2 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors ${activeTeam === team.id ? 'text-primary-600 dark:text-primary-400' : 'text-slate-600 dark:text-slate-400'}`}
                                onClick={() => setActiveTeam(team.id)}
                            >
                                <span className={activeTeam === team.id ? 'text-primary-600' : 'text-slate-400'}>
                                    <Users size={14} />
                                </span>
                                {team.name}
                            </div>
                            <div className="space-y-0.5">
                                {team.channels.map((channel) => (
                                    <button
                                        key={channel}
                                        onClick={() => {
                                            setActiveChannel(channel);
                                            if (isMobile) setIsSidebarOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${activeChannel === channel
                                            ? 'bg-slate-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-semibold shadow-sm border-l-4 border-primary-500'
                                            : 'text-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                                            }`}
                                    >
                                        <Hash size={16} className={activeChannel === channel ? 'text-primary-500' : 'text-slate-400'} />
                                        {channel}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* User Status Footer */}
                <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                        <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold shadow-sm">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-slate-950 dark:text-white truncate">{user?.name || 'User'}</div>
                            <div className="text-xs text-green-500 flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
                            </div>
                        </div>
                        <Settings size={16} className="text-slate-400" />
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 w-full min-w-0">
                {/* Header */}
                <div className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-6 bg-slate-50 dark:bg-slate-900 flex-shrink-0 z-10">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            className="md:hidden p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu size={20} />
                        </button>
                        <Hash size={24} className="text-slate-400 hidden sm:block" />
                        <div>
                            <h2 className="font-bold text-lg text-slate-950 dark:text-white capitalize truncate flex items-center gap-2">
                                {activeChannel}
                            </h2>
                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Users size={12} /> 24 members
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2 mr-2 hidden sm:flex">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs text-slate-500 dark:text-slate-300">
                                    U{i}
                                </div>
                            ))}
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs font-medium text-slate-500 dark:text-slate-400 shadow-sm cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-700">
                                +5
                            </div>
                        </div>
                        <div className="h-6 w-px bg-slate-300 dark:bg-slate-800 hidden sm:block" />
                        <div className="flex items-center gap-1">
                            <TemplateToggle />
                            <button
                                onClick={() => setCallData({ isOpen: true, type: 'voice' })}
                                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                title="Start Voice Call"
                            >
                                <Phone size={18} />
                            </button>
                            <button
                                onClick={() => setCallData({ isOpen: true, type: 'video' })}
                                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                title="Start Video Call"
                            >
                                <Video size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 bg-slate-50 dark:bg-slate-950">
                    {messages.map((msg) => {
                        const isMe = msg.user?.id === user?.id;
                        return (
                            <div key={msg.id} className="group animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white font-bold shadow-md">
                                            {msg.user?.name?.charAt(0) || 'U'}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0 max-w-3xl">
                                        <div className={`flex items-baseline gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                                            <span className="font-bold text-slate-950 dark:text-white truncate hover:underline cursor-pointer">{msg.user?.name || 'Guest'}</span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">{msg.time}</span>
                                        </div>

                                        <div className={`
                                            p-4 rounded-xl shadow-sm border
                                            ${isMe
                                                ? 'bg-blue-600 text-white border-blue-500'
                                                : 'bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-200 border-slate-200 dark:border-slate-800'
                                            }
                                        `}>
                                            {msg.replyTo && (
                                                <div className={`mb-3 pl-3 border-l-4 p-2 rounded bg-black/5 dark:bg-white/5 ${isMe ? 'border-white/50' : 'border-primary-500'}`}>
                                                    <div className={`text-xs font-bold flex items-center gap-1 ${isMe ? 'text-white/80' : 'text-primary-600 dark:text-primary-400'}`}>
                                                        <Reply size={10} />  Replying to {msg.replyTo.user?.name || 'Guest'}
                                                    </div>
                                                    <div className={`text-xs mt-0.5 ${isMe ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>
                                                        {msg.replyTo.text}
                                                    </div>
                                                </div>
                                            )}

                                            <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                        </div>

                                        <div className={`flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'flex-row-reverse' : ''}`}>
                                            <button
                                                onClick={() => setReplyingTo(msg)}
                                                className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs text-slate-600 dark:text-slate-300 transition-colors shadow-sm"
                                            >
                                                <Reply size={12} /> Reply
                                            </button>
                                            <button className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs text-slate-600 dark:text-slate-300 transition-colors shadow-sm">
                                                <Smile size={12} /> React
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                    <div className="max-w-4xl mx-auto">
                        {replyingTo && (
                            <div className="mb-2 flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border-l-4 border-primary-500 shadow-sm animate-in slide-in-from-bottom-2">
                                <div className="text-sm">
                                    <span className="text-primary-600 dark:text-primary-400 font-bold flex items-center gap-1 text-xs uppercase tracking-wide">
                                        <Reply size={12} /> Replying to {replyingTo.user?.name || 'Guest'}
                                    </span>
                                    <span className="text-slate-600 dark:text-slate-300 truncate block max-w-xs mt-0.5">{replyingTo.text}</span>
                                </div>
                                <button
                                    onClick={() => setReplyingTo(null)}
                                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        <div className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 focus-within:ring-2 focus-within:ring-primary-500/30 focus-within:border-primary-500 transition-all shadow-inner">
                            <div className="flex gap-1 mb-2 p-1 border-b border-slate-200 dark:border-slate-800">
                                <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-900 rounded text-slate-500 dark:text-slate-400 font-bold font-mono text-xs" title="Bold">B</button>
                                <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-900 rounded text-slate-500 dark:text-slate-400 italic font-mono text-xs" title="Italic">I</button>
                                <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-900 rounded text-slate-500 dark:text-slate-400 line-through font-mono text-xs" title="Strikethrough">S</button>
                                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
                                <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-900 rounded text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" title="Link"><Paperclip size={14} /></button>
                                <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-900 rounded text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" title="Mention"><Users size={14} /></button>
                            </div>
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={`Message #${activeChannel}`}
                                className="w-full bg-transparent border-none focus:ring-0 text-black dark:text-white placeholder-slate-500 dark:placeholder-slate-400 resize-none h-16 p-2 text-[15px] leading-relaxed"
                            />
                            <div className="flex justify-between items-center p-1 mt-1">
                                <div className="flex gap-2">
                                    <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-900 rounded-full text-slate-500 hover:text-slate-700 transition-colors">
                                        <Plus size={18} />
                                    </button>
                                    <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-900 rounded-full text-slate-500 hover:text-slate-700 transition-colors">
                                        <Smile size={18} />
                                    </button>
                                    <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-900 rounded-full text-slate-500 hover:text-slate-700 transition-colors">
                                        <Mic size={18} />
                                    </button>
                                </div>
                                <button
                                    onClick={handleSend}
                                    disabled={!inputText.trim()}
                                    className={`px-4 py-1.5 rounded-lg flex items-center gap-2 font-medium transition-all ${inputText.trim()
                                        ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm'
                                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                        }`}
                                >
                                    Send <Send size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="text-center mt-2 text-xs text-slate-400 dark:text-slate-500">
                            <strong>Tip:</strong> Press Enter to send, Shift+Enter for new line
                        </div>
                    </div>
                </div>
            </div>

            {/* Call Overlay */}
            {callData.isOpen && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col items-center gap-6 animate-in zoom-in-95 shadow-2xl">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-700 shadow-xl">
                            <div className="w-full h-full bg-slate-800 flex items-center justify-center text-3xl font-bold text-white">
                                {activeChannel.charAt(0)}
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-white mb-1">{activeChannel}</h3>
                            <p className="text-primary-400 animate-pulse font-medium">
                                {callData.type === 'voice' ? 'Voice Call in progress...' : 'Video Channel live...'}
                            </p>
                        </div>
                        <div className="flex gap-6 mt-4">
                            <button className="p-4 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors border border-slate-700">
                                <Mic size={24} />
                            </button>
                            <button
                                onClick={() => setCallData({ isOpen: false, type: null })}
                                className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-lg transform hover:scale-110 transition-all border border-red-500"
                            >
                                <Phone size={24} />
                            </button>
                            <button className="p-4 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors border border-slate-700">
                                <Video size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfessionalDashboard;
