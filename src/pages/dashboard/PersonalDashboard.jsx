import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    MessageCircle, Phone, Video, MoreVertical, Search, ArrowLeft,
    Settings as SettingsIcon, Reply, X, Send, Paperclip, Smile, Image, File,
    UserCircle, BellOff, Trash2, Ban
} from 'lucide-react';
import useMediaQuery from '../../hooks/useMediaQuery';
import SettingsModal from '../../components/common/SettingsModal';
import DropdownMenu from '../../components/common/DropdownMenu';
import { useAuth } from '../../context/AuthContext';
import { useRealtimeChat } from '../../hooks/useRealtimeChat';

const chats = [
    { id: 1, name: 'Alice Smith', message: 'Hey, are we still on for tonight?', time: '10:30 AM', unread: 2, online: true },
    { id: 2, name: 'Bob Jones', message: 'Can you send me that file?', time: 'Yesterday', unread: 0, online: false },
    { id: 3, name: 'Charlie Day', message: 'LMAO that was hilarious 😂', time: 'Yesterday', unread: 0, online: true },
    { id: 4, name: 'David Miller', message: 'Meeting rescheduled to Monday.', time: 'Mon', unread: 0, online: false },
    { id: 5, name: 'Eva Green', message: 'Thanks!', time: 'Mon', unread: 0, online: false },
];

const EMOJIS = ['😀', '😂', '😍', '🥰', '😎', '🤔', '👍', '❤️', '🔥', '🎉', '😢', '😮'];

const PersonalDashboard = () => {
    const { user } = useAuth();
    const [activeChat, setActiveChat] = useState(null);
    const [callData, setCallData] = useState({ isOpen: false, type: 'voice' });
    const [inputText, setInputText] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const isMobile = useMediaQuery('(max-width: 767px)');

    const mockMessages = React.useMemo(() => {
        const chat = chats.find(c => c.id === activeChat);
        return chat ? [{
            id: 'mock-1',
            text: chat.message,
            time: chat.time,
            user: { id: 'other', name: chat.name },
            replyTo: null,
        }] : [];
    }, [activeChat]);

    const { messages, sendMessage, status } = useRealtimeChat({
        room: activeChat ? `personal-${activeChat}` : null,
        user,
        mockMessages,
    });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, activeChat]);

    const handleSend = useCallback(() => {
        const text = inputText.trim();
        if (!text && attachments.length === 0) return;

        if (attachments.length > 0) {
            attachments.forEach(att => {
                sendMessage(`📎 ${att.name}`, { replyTo: replyingTo });
            });
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
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        setAttachments(prev => [...prev, ...files.map(f => ({ name: f.name, size: f.size, type: f.type }))]);
        e.target.value = '';
    };

    const removeAttachment = (idx) => setAttachments(prev => prev.filter((_, i) => i !== idx));

    const handleEmojiClick = (emoji) => {
        setInputText(prev => prev + emoji);
        setShowEmoji(false);
    };

    const activeContact = chats.find(c => c.id === activeChat);

    return (
        <div className="flex h-[calc(100vh-8rem)] rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 relative">
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

            {/* Mobile Sidebar Overlay */}
            {isMobile && isSidebarOpen && (
                <div className="absolute inset-0 bg-black/50 z-20" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* ── Sidebar ── */}
            <div className={`
                w-full md:w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
                flex flex-col transition-all duration-300 absolute md:relative z-30 h-full
                ${isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
            `}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Chats</h2>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                            >
                                <SettingsIcon size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white placeholder-slate-400 text-sm"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
                    {chats.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => { setActiveChat(chat.id); if (isMobile) setIsSidebarOpen(false); }}
                            className={`p-4 flex gap-3 cursor-pointer transition-colors border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50
                                ${activeChat === chat.id ? 'bg-slate-50 dark:bg-slate-800 border-l-4 border-l-primary-500' : 'border-l-4 border-l-transparent'}`}
                        >
                            <div className="relative flex-shrink-0">
                                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-lg font-bold text-slate-600 dark:text-slate-300">
                                    {chat.name.charAt(0)}
                                </div>
                                {chat.online && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h4 className={`font-semibold truncate text-slate-900 dark:text-white ${chat.unread > 0 ? 'font-bold' : ''}`}>
                                        {chat.name}
                                    </h4>
                                    <span className={`text-xs flex-shrink-0 ml-2 ${chat.unread > 0 ? 'text-primary-600 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                                        {chat.time}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className={`text-sm truncate ${chat.unread > 0 ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {chat.message}
                                    </p>
                                    {chat.unread > 0 && (
                                        <span className="bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center ml-2 flex-shrink-0">
                                            {chat.unread}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Chat Area ── */}
            {activeChat ? (
                <div className="flex-1 flex flex-col w-full min-w-0">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center shadow-sm z-10">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setActiveChat(null)}
                                className="md:hidden p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                                    {activeContact?.name.charAt(0)}
                                </div>
                                {activeContact?.online && (
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{activeContact?.name}</h3>
                                <span className="text-xs flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                    <span className={`w-1.5 h-1.5 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-slate-400'}`} />
                                    {status === 'online' ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setCallData({ isOpen: true, type: 'voice' })} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"><Phone size={20} /></button>
                            <button onClick={() => setCallData({ isOpen: true, type: 'video' })} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"><Video size={20} /></button>
                            <DropdownMenu
                                icon={MoreVertical}
                                options={[
                                    { label: 'View Profile', icon: UserCircle, action: () => setIsSettingsOpen(true) },
                                    { label: 'Mute Notifications', icon: BellOff, action: () => { } },
                                    { label: 'Clear Chat', icon: Trash2, action: () => { }, danger: true },
                                    { label: 'Block Contact', icon: Ban, action: () => { }, danger: true },
                                ]}
                            />
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-2 bg-whatsapp-beige dark:bg-slate-950 transition-colors duration-300">
                        {messages.map(msg => {
                            const isMe = msg.user?.id === user?.id;
                            return (
                                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-end gap-2 max-w-[85%] md:max-w-[70%]">
                                        {!isMe && (
                                            <div className="w-7 h-7 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 text-xs font-bold mb-1 flex-shrink-0">
                                                {msg.user?.name?.charAt(0) || 'G'}
                                            </div>
                                        )}
                                        <div className="relative group">
                                            {msg.replyTo && (
                                                <div className={`text-xs mb-1 px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border-l-4 ${isMe ? 'border-white/50' : 'border-primary-500'}`}>
                                                    <span className="font-semibold block text-[10px] opacity-75">↩ {msg.replyTo.user?.name}</span>
                                                    <span className="block truncate max-w-[150px] text-slate-600 dark:text-slate-300">{msg.replyTo.text}</span>
                                                </div>
                                            )}
                                            <div className={`px-3 py-2 rounded-2xl text-[14px] leading-relaxed shadow-sm
                                                ${isMe
                                                    ? 'bg-primary-600 text-white rounded-tr-none'
                                                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none'
                                                }`}
                                            >
                                                {msg.text}
                                                <div className={`flex items-center gap-1 float-right ml-3 mt-1 text-[10px] ${isMe ? 'text-white/70' : 'text-slate-400 dark:text-slate-500'}`}>
                                                    <span>{msg.time}</span>
                                                    {isMe && <span className="text-white/80">✓✓</span>}
                                                </div>
                                            </div>
                                            {/* Hover actions */}
                                            <div className={`absolute top-1/2 -translate-y-1/2 ${isMe ? '-left-16' : '-right-16'} opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 p-1 rounded-lg bg-white dark:bg-slate-800 shadow border border-slate-100 dark:border-slate-700`}>
                                                <button onClick={() => setReplyingTo(msg)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400">
                                                    <Reply size={13} />
                                                </button>
                                                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400">
                                                    <Smile size={13} />
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
                    <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                        {/* Reply preview */}
                        {replyingTo && (
                            <div className="mb-2 flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border-l-4 border-primary-500">
                                <div>
                                    <span className="text-primary-600 dark:text-primary-400 text-xs font-bold flex items-center gap-1"><Reply size={11} /> {replyingTo.user?.name}</span>
                                    <span className="text-slate-500 dark:text-slate-400 text-xs truncate block max-w-xs">{replyingTo.text}</span>
                                </div>
                                <button onClick={() => setReplyingTo(null)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"><X size={15} /></button>
                            </div>
                        )}

                        {/* Attachment previews */}
                        {attachments.length > 0 && (
                            <div className="mb-2 flex flex-wrap gap-2">
                                {attachments.map((att, i) => (
                                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm border border-slate-200 dark:border-slate-700">
                                        {att.type?.startsWith('image/') ? <Image size={14} className="text-blue-500" /> : <File size={14} className="text-slate-500" />}
                                        <span className="text-slate-700 dark:text-slate-300 max-w-[120px] truncate">{att.name}</span>
                                        <button onClick={() => removeAttachment(i)} className="text-slate-400 hover:text-red-500"><X size={13} /></button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Emoji picker */}
                        {showEmoji && (
                            <div className="mb-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg flex flex-wrap gap-1.5">
                                {EMOJIS.map(e => (
                                    <button key={e} onClick={() => handleEmojiClick(e)} className="text-xl hover:scale-125 transition-transform p-0.5">{e}</button>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2 items-end">
                            {/* Hidden file input */}
                            <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mb-0.5"
                                title="Attach file"
                            >
                                <Paperclip size={22} />
                            </button>

                            <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center border border-slate-200 dark:border-slate-700 focus-within:border-primary-500 transition-all">
                                <button
                                    onClick={() => setShowEmoji(v => !v)}
                                    className="p-2 text-slate-400 hover:text-yellow-500 transition-colors ml-1"
                                    title="Emoji"
                                >
                                    <Smile size={22} />
                                </button>
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type a message..."
                                    className="flex-1 px-2 py-3 bg-transparent border-none focus:outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-[15px]"
                                />
                            </div>

                            <button
                                onClick={handleSend}
                                disabled={!inputText.trim() && attachments.length === 0}
                                className={`p-3 rounded-full shadow transition-all transform hover:scale-105 active:scale-95 mb-0.5 ${inputText.trim() || attachments.length > 0
                                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-whatsapp-beige dark:bg-slate-950">
                    <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                        <MessageCircle size={48} className="text-slate-400 dark:text-slate-500" />
                    </div>
                    <h2 className="text-2xl font-light text-slate-700 dark:text-slate-200 mb-2">Select a chat</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm text-sm">
                        Choose a conversation from the sidebar to start messaging.
                    </p>
                </div>
            )}

            {/* Call Overlay */}
            {callData.isOpen && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-slate-800 p-8 rounded-2xl flex flex-col items-center gap-6 shadow-2xl border border-slate-700 animate-in zoom-in-95">
                        <div className="w-24 h-24 rounded-full bg-slate-600 flex items-center justify-center text-3xl font-bold text-white border-4 border-slate-700 shadow-xl">
                            {activeContact?.name.charAt(0)}
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-white mb-1">{activeContact?.name}</h3>
                            <p className="text-slate-400 animate-pulse">{callData.type === 'voice' ? 'Calling...' : 'Video calling...'}</p>
                        </div>
                        <div className="flex gap-6 mt-2">
                            <button className="p-4 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors border border-slate-600">
                                <Video size={22} />
                            </button>
                            <button
                                onClick={() => setCallData({ isOpen: false, type: null })}
                                className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-lg transform hover:scale-110 transition-all"
                            >
                                <Phone size={22} className="rotate-[135deg]" />
                            </button>
                            <button className="p-4 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors border border-slate-600">
                                <Smile size={22} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PersonalDashboard;