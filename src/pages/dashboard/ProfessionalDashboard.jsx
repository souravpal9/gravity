import React, { useState, useEffect } from 'react';
import { Hash, Bell, Search, MoreHorizontal, Phone, Video, Users, Calendar, FileText, Plus, Menu, X, Settings, UserPlus, LogOut, Reply, Smile } from 'lucide-react';
import useMediaQuery from '../../hooks/useMediaQuery';
import DropdownMenu from '../../components/common/DropdownMenu';
import TemplateToggle from '../../components/common/TemplateToggle';
import SettingsModal from '../../components/common/SettingsModal';
import CallInterface from '../../components/common/CallInterface';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useRealtimeChat } from '../../hooks/useRealtimeChat';

const ProfessionalDashboard = () => {
    const { currentTheme } = useTheme();
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
    const messagesEndRef = React.useRef(null);

    useEffect(() => {
        if (!isMobile) {
            setIsSidebarOpen(false); // Reset on desktop
        } else {
            setIsSidebarOpen(false); // Ensure closed on mobile mount/resize unless explicitly opened
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
        <div className={currentTheme === 'dark' ? 'dark' : ''}>
            <div className="w-full flex h-[calc(100vh-8rem)] bg-white dark:bg-primary-950 border border-slate-200 dark:border-primary-900 rounded-2xl overflow-hidden relative text-slate-900 dark:text-primary-100">
                <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} scope="professional" />

                {/* Mobile Sidebar Overlay */}
                {isMobile && isSidebarOpen && (
                    <div
                        className="absolute inset-0 bg-black/50 z-20"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Teams/Channels Sidebar */}
                <div className={`
        w-64 bg-slate-50 dark:bg-primary-900/50 border-r border-slate-200 dark:border-primary-800 flex flex-col 
        fixed md:relative inset-y-0 left-0 z-30 transition-transform duration-300
        ${isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
      `}>
                    <div className="p-4 border-b border-slate-200 dark:border-primary-800 flex justify-between items-center">
                        <h2 className="font-bold text-slate-800 dark:text-primary-100">Teams</h2>
                        <div className="flex gap-2">
                            <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white">
                                <Plus size={18} />
                            </button>
                            <button
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white md:hidden"
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-4">
                        {teams.map((team) => (
                            <div key={team.id}>
                                <div
                                    className={`flex items-center gap-2 px-2 py-1 font-semibold text-sm uppercase tracking-wider mb-1 cursor-pointer hover:text-slate-200 transition-colors ${activeTeam === team.id ? 'text-primary-400' : 'text-slate-400'}`}
                                    onClick={() => setActiveTeam(team.id)}
                                >
                                    <Users size={14} /> {team.name}
                                </div>
                                <div className="space-y-0.5">
                                    {team.channels.map((channel) => (
                                        <button
                                            key={channel}
                                            onClick={() => {
                                                setActiveChannel(channel);
                                                if (isMobile) setIsSidebarOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${activeChannel === channel
                                                ? 'bg-primary-100 dark:bg-primary-600/20 text-primary-600 dark:text-primary-400 font-medium'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
                                                }`}
                                        >
                                            <Hash size={14} /> {channel}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col bg-slate-50/50 dark:bg-primary-950/30 w-full min-w-0">
                    {/* Header */}
                    <div className="h-16 border-b border-slate-200 dark:border-primary-800 flex items-center justify-between px-4 md:px-6 bg-white/50 dark:bg-primary-900/50 backdrop-blur-sm flex-shrink-0">
                        <div className="flex items-center gap-3 min-w-0">
                            <button
                                className="md:hidden p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                                onClick={() => setIsSidebarOpen(true)}
                            >
                                <Menu size={20} />
                            </button>
                            <Hash size={20} className="text-slate-400 hidden sm:block" />
                            <h2 className="font-bold text-lg text-slate-800 dark:text-white capitalize truncate">{activeChannel}</h2>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hidden sm:inline-block whitespace-nowrap">
                                24 members
                            </span>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                            <span className={`text-xs font-semibold ${status === 'online' ? 'text-emerald-400' : 'text-slate-400'}`}>
                                {status === 'online' ? 'Live' : 'Offline'}
                            </span>
                            <div className="flex -space-x-2 hidden lg:flex">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-xs font-medium text-white">
                                        U{i}
                                    </div>
                                ))}
                                <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-xs font-medium text-slate-400">
                                    +5
                                </div>
                            </div>
                            <div className="h-6 w-px bg-slate-700 hidden lg:block" />
                            <div className="flex gap-1 sm:gap-2 items-center">
                                <TemplateToggle />
                                <button
                                    onClick={() => setCallData({ isOpen: true, type: 'voice' })}
                                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                                >
                                    <Phone size={18} />
                                </button>
                                <button
                                    onClick={() => setCallData({ isOpen: true, type: 'video' })}
                                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                                >
                                    <Video size={18} />
                                </button>
                                <DropdownMenu
                                    icon={MoreHorizontal}
                                    options={[
                                        { label: 'Channel Settings', icon: Settings, action: () => alert('Settings clicked') },
                                        { label: 'Invite Members', icon: UserPlus, action: () => alert('Invite clicked') },
                                        { label: 'App Settings', icon: Settings, action: () => setIsSettingsOpen(true) },
                                        { label: 'Leave Channel', icon: LogOut, action: () => alert('Leave clicked'), danger: true }
                                    ]}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-primary-50/50 dark:bg-primary-950/30">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                                <Hash size={44} className="mb-3 opacity-40" />
                                <p className="text-sm">Start a new update in #{activeChannel}.</p>
                            </div>
                        )}
                        {messages.map((msg) => {
                            const isMe = msg.user?.id === user?.id;
                            return (
                            <div key={msg.id} className={`group flex gap-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-4 ${isMe ? 'flex-row-reverse' : 'flex-row'} max-w-[85%] md:max-w-[70%]`}>
                                    <div className={`w-10 h-10 rounded-lg flex-shrink-0 ${isMe ? 'bg-primary-600 text-white' : 'bg-gradient-to-br from-primary-500 to-purple-600 text-white'} flex items-center justify-center font-semibold`}>
                                        {isMe ? 'Y' : (msg.user?.name || 'G').charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`flex items-baseline gap-2 mb-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{isMe ? 'You' : msg.user?.name || 'Guest'}</span>
                                            <span className="text-xs text-slate-500">{msg.time}</span>
                                        </div>
                                        {msg.replyTo && (
                                            <div className="mb-1 pl-2 border-l-2 border-slate-300 dark:border-slate-600">
                                                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                    <Reply size={10} />  Replying to {msg.replyTo.user?.name || 'Guest'}
                                                </div>
                                                <div className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-md">
                                                    {msg.replyTo.text}
                                                </div>
                                            </div>
                                        )}
                                        <div className={`text-slate-700 dark:text-slate-200 leading-relaxed break-words px-4 py-2 rounded-2xl shadow-sm ${isMe ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/60 rounded-tl-none'}`}>
                                            <p>{msg.text}</p>
                                        </div>

                                        <div className={`flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <button
                                                onClick={() => setReplyingTo(msg)}
                                                className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition-colors"
                                            >
                                                <Reply size={12} /> Reply
                                            </button>
                                            <button className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition-colors">
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

                    {/* Input */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 flex-shrink-0">
                        {replyingTo && (
                            <div className="mb-2 flex items-center justify-between p-2 bg-primary-50 dark:bg-slate-800/80 rounded-lg border-l-4 border-primary-500">
                                <div className="text-sm">
                                    <span className="text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1">
                                        <Reply size={12} /> Replying to {replyingTo.user?.name || 'Guest'}
                                    </span>
                                    <span className="text-slate-500 dark:text-slate-400 truncate block max-w-xs">{replyingTo.text}</span>
                                </div>
                                <button
                                    onClick={() => setReplyingTo(null)}
                                    className="p-1 hover:bg-primary-100 dark:hover:bg-slate-700 rounded-full text-slate-500"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                        <div className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-2 focus-within:ring-2 focus-within:ring-primary-500/50 focus-within:border-primary-500/50 transition-all">
                            <div className="flex gap-2 mb-2 p-1 border-b border-slate-200 dark:border-slate-700/50">
                                <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400"><FileText size={16} /></button>
                                <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400"><Calendar size={16} /></button>
                                <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400"><Plus size={16} /></button>
                            </div>
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={`Message #${activeChannel}`}
                                className="w-full bg-transparent border-none focus:ring-0 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 resize-none h-20 p-2"
                            />
                            <div className="flex justify-between items-center p-1">
                                <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">Press Enter to send</span>
                                <button
                                    onClick={handleSend}
                                    disabled={!inputText.trim()}
                                    className={`p-2 rounded-lg transition-colors ml-auto ${inputText.trim() ? 'bg-primary-600 hover:bg-primary-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'}`}
                                >
                                    <MoreHorizontal size={16} className="rotate-90" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Call Interface */}
                <CallInterface
                    isOpen={callData.isOpen}
                    onClose={() => setCallData({ ...callData, isOpen: false })}
                    type={callData.type}
                    userInfo={{
                        name: `#${activeChannel}`,
                        image: null
                    }}
                />
            </div>
        </div>
    );
};

export default ProfessionalDashboard;
