import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Hash, Phone, Video, Users, Plus, Menu, X, Settings,
    Reply, Smile, Send, Mic, Paperclip, Image, File,
    MoreVertical, BellOff, UserCircle, LogOut
} from 'lucide-react';
import useMediaQuery from '../../hooks/useMediaQuery';
import SettingsModal from '../../components/common/SettingsModal';
import DropdownMenu from '../../components/common/DropdownMenu';
import { useAuth } from '../../context/AuthContext';
import { useRealtimeChat } from '../../hooks/useRealtimeChat';

const EMOJIS = ['😀', '😂', '😍', '🥰', '😎', '🤔', '👍', '❤️', '🔥', '🎉', '✅', '⚡'];

const teams = [
    { id: 'engineering', name: 'Engineering', channels: ['general', 'frontend', 'backend', 'deployments'] },
    { id: 'design', name: 'Design', channels: ['general', 'ui-kit', 'user-research'] },
    { id: 'marketing', name: 'Marketing', channels: ['general', 'campaigns', 'social-media'] },
];

const ProfessionalDashboard = () => {
    const [activeChannel, setActiveChannel] = useState('general');
    const [activeTeam, setActiveTeam] = useState('engineering');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [callData, setCallData] = useState({ isOpen: false, type: 'voice' });
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [inputText, setInputText] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [showEmoji, setShowEmoji] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const { user } = useAuth();
    const isMobile = useMediaQuery('(max-width: 767px)');

    const { messages, sendMessage, status } = useRealtimeChat({
        room: `professional-${activeChannel}`,
        user,
    });

    useEffect(() => {
        if (!isMobile) setIsSidebarOpen(false);
    }, [isMobile]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = useCallback(() => {
        const text = inputText.trim();
        if (!text && attachments.length === 0) return;

        if (attachments.length > 0) {
            attachments.forEach(att => sendMessage(`📎 ${att.name}`, { replyTo: replyingTo }));
            setAttachments([]);
        }
        if (text) {
            sendMessage(text, { replyTo: replyingTo });
        }
        setInputText('');
        setReplyingTo(null);
        setShowEmoji(false);
    }, [inputText, attachments, replyingTo, sendMessage]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        setAttachments(prev => [...prev, ...files.map(f => ({ name: f.name, size: f.size, type: f.type }))]);
        e.target.value = '';
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 relative">
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

            {isMobile && isSidebarOpen && (
                <div className="absolute inset-0 bg-black/50 z-20" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* ── Sidebar ── */}
            <div className={`
                w-full md:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
                flex flex-col transition-all duration-300 absolute md:relative z-30 h-full
                ${isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
            `}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="font-bold text-slate-900 dark:text-white tracking-tight text-lg">Teams</h2>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            <Settings size={16} />
                        </button>
                        <button
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-500 dark:text-slate-400 md:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-5">
                    {teams.map(team => (
                        <div key={team.id}>
                            <div
                                className={`flex items-center gap-2 px-2 py-1.5 font-bold text-xs uppercase tracking-wider mb-1 cursor-pointer rounded-lg transition-colors
                                    ${activeTeam === team.id ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                onClick={() => setActiveTeam(team.id)}
                            >
                                <Users size={13} /> {team.name}
                            </div>
                            <div className="space-y-0.5">
                                {team.channels.map(channel => (
                                    <button
                                        key={channel}
                                        onClick={() => { setActiveChannel(channel); if (isMobile) setIsSidebarOpen(false); }}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all
                                            ${activeChannel === channel
                                                ? 'bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-semibold border-l-4 border-primary-500'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 border-l-4 border-transparent'
                                            }`}
                                    >
                                        <Hash size={15} className={activeChannel === channel ? 'text-primary-500' : 'text-slate-400'} />
                                        {channel}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* User footer */}
                <div className="p-3 border-t border-slate-200 dark:border-slate-800">
                    <div
                        onClick={() => setIsSettingsOpen(true)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name || 'User'}</div>
                            <div className="text-xs text-green-500 flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
                            </div>
                        </div>
                        <DropdownMenu
                            icon={MoreVertical}
                            btnClass="ml-auto"
                            options={[
                                { label: 'Edit Profile', icon: UserCircle, action: () => setIsSettingsOpen(true) },
                                { label: 'Mute Notifications', icon: BellOff, action: () => { } },
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* ── Main Chat ── */}
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 min-w-0">
                {/* Header */}
                <div className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-6 bg-white dark:bg-slate-900 flex-shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <button className="md:hidden p-2 -ml-2 text-slate-500 dark:text-slate-400" onClick={() => setIsSidebarOpen(true)}>
                            <Menu size={20} />
                        </button>
                        <Hash size={22} className="text-slate-400 hidden sm:block flex-shrink-0" />
                        <div className="min-w-0">
                            <h2 className="font-bold text-lg text-slate-900 dark:text-white capitalize truncate">{activeChannel}</h2>
                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Users size={11} /> 24 members
                                <span className="ml-2 flex items-center gap-1">
                                    <span className={`w-1.5 h-1.5 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-slate-400'}`} />
                                    {status === 'online' ? 'connected' : 'disconnected'}
                                </span>
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setCallData({ isOpen: true, type: 'voice' })} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"><Phone size={18} /></button>
                        <button onClick={() => setCallData({ isOpen: true, type: 'video' })} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"><Video size={18} /></button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-950">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600">
                            <Hash size={48} className="mb-4 opacity-30" />
                            <p className="font-medium">No messages yet in #{activeChannel}</p>
                            <p className="text-sm mt-1">Be the first to say something!</p>
                        </div>
                    )}
                    {messages.map(msg => {
                        const isMe = msg.user?.id === user?.id;
                        return (
                            <div key={msg.id} className="group">
                                <div className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white font-bold text-sm shadow flex-shrink-0">
                                        {msg.user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0 max-w-2xl">
                                        <div className={`flex items-baseline gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                                            <span className="font-bold text-slate-900 dark:text-white text-sm truncate">{msg.user?.name || 'Guest'}</span>
                                            <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">{msg.time}</span>
                                        </div>
                                        <div className={`p-3 rounded-xl shadow-sm border text-sm leading-relaxed
                                            ${isMe
                                                ? 'bg-primary-600 text-white border-primary-500'
                                                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800'
                                            }`}
                                        >
                                            {msg.replyTo && (
                                                <div className={`mb-2 pl-3 border-l-4 py-1 rounded text-xs ${isMe ? 'border-white/50 bg-white/10' : 'border-primary-500 bg-slate-50 dark:bg-slate-800'}`}>
                                                    <span className={`font-bold block ${isMe ? 'text-white/80' : 'text-primary-600 dark:text-primary-400'}`}>↩ {msg.replyTo.user?.name}</span>
                                                    <span className={isMe ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}>{msg.replyTo.text}</span>
                                                </div>
                                            )}
                                            <p className="whitespace-pre-wrap">{msg.text}</p>
                                        </div>
                                        <div className={`flex gap-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'flex-row-reverse' : ''}`}>
                                            <button onClick={() => setReplyingTo(msg)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                                <Reply size={11} /> Reply
                                            </button>
                                            <button className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                                <Smile size={11} /> React
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
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                    <div className="max-w-4xl mx-auto">
                        {replyingTo && (
                            <div className="mb-2 flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border-l-4 border-primary-500">
                                <div>
                                    <span className="text-primary-600 dark:text-primary-400 text-xs font-bold flex items-center gap-1"><Reply size={11} /> {replyingTo.user?.name}</span>
                                    <span className="text-slate-500 dark:text-slate-400 text-xs truncate block max-w-xs">{replyingTo.text}</span>
                                </div>
                                <button onClick={() => setReplyingTo(null)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"><X size={15} /></button>
                            </div>
                        )}

                        {attachments.length > 0 && (
                            <div className="mb-2 flex flex-wrap gap-2">
                                {attachments.map((att, i) => (
                                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm border border-slate-200 dark:border-slate-700">
                                        {att.type?.startsWith('image/') ? <Image size={13} className="text-blue-500" /> : <File size={13} className="text-slate-500" />}
                                        <span className="text-slate-700 dark:text-slate-300 max-w-[120px] truncate">{att.name}</span>
                                        <button onClick={() => setAttachments(p => p.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500"><X size={12} /></button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {showEmoji && (
                            <div className="mb-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg flex flex-wrap gap-1.5">
                                {EMOJIS.map(e => (
                                    <button key={e} onClick={() => { setInputText(p => p + e); setShowEmoji(false); }} className="text-xl hover:scale-125 transition-transform p-0.5">{e}</button>
                                ))}
                            </div>
                        )}

                        <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />

                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 focus-within:ring-2 focus-within:ring-primary-500/30 focus-within:border-primary-500 transition-all">
                            {/* Formatting toolbar */}
                            <div className="flex gap-1 mb-2 p-1 border-b border-slate-200 dark:border-slate-800">
                                <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-900 rounded text-slate-500 dark:text-slate-400 font-bold text-xs">B</button>
                                <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-900 rounded text-slate-500 dark:text-slate-400 italic text-xs">I</button>
                                <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-900 rounded text-slate-500 dark:text-slate-400 line-through text-xs">S</button>
                                <div className="w-px h-5 bg-slate-200 dark:border-slate-800 mx-1 self-center" />
                                <button onClick={() => fileInputRef.current?.click()} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-900 rounded text-slate-500 dark:text-slate-400 hover:text-primary-600" title="Attach file">
                                    <Paperclip size={14} />
                                </button>
                                <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-900 rounded text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white" title="Mention">
                                    <Users size={14} />
                                </button>
                            </div>

                            <textarea
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={`Message #${activeChannel}`}
                                className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none h-16 p-2 text-[14px] leading-relaxed"
                            />

                            <div className="flex justify-between items-center p-1">
                                <div className="flex gap-1">
                                    <button onClick={() => fileInputRef.current?.click()} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-900 rounded-full text-slate-400 hover:text-primary-600 transition-colors" title="Attach">
                                        <Plus size={17} />
                                    </button>
                                    <button onClick={() => setShowEmoji(v => !v)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-900 rounded-full text-slate-400 hover:text-yellow-500 transition-colors" title="Emoji">
                                        <Smile size={17} />
                                    </button>
                                    <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-900 rounded-full text-slate-400 hover:text-slate-600 transition-colors" title="Voice">
                                        <Mic size={17} />
                                    </button>
                                </div>
                                <button
                                    onClick={handleSend}
                                    disabled={!inputText.trim() && attachments.length === 0}
                                    className={`px-4 py-1.5 rounded-lg flex items-center gap-2 font-medium text-sm transition-all ${inputText.trim() || attachments.length > 0
                                            ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm'
                                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                        }`}
                                >
                                    Send <Send size={13} />
                                </button>
                            </div>
                        </div>
                        <p className="text-center mt-2 text-xs text-slate-400 dark:text-slate-600">
                            Enter to send · Shift+Enter for new line
                        </p>
                    </div>
                </div>
            </div>

            {/* Call Overlay */}
            {callData.isOpen && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col items-center gap-6 animate-in zoom-in-95 shadow-2xl">
                        <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center text-3xl font-bold text-white border-4 border-slate-600">
                            {activeChannel.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-white mb-1">#{activeChannel}</h3>
                            <p className="text-primary-400 animate-pulse font-medium">
                                {callData.type === 'voice' ? 'Voice call in progress...' : 'Video channel live...'}
                            </p>
                        </div>
                        <div className="flex gap-6">
                            <button className="p-4 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"><Mic size={22} /></button>
                            <button onClick={() => setCallData({ isOpen: false, type: null })} className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-lg transform hover:scale-110 transition-all border border-red-500">
                                <Phone size={22} />
                            </button>
                            <button className="p-4 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"><Video size={22} /></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfessionalDashboard;