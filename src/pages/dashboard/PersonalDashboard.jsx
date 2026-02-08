import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Phone, Video, Image, MoreVertical, Search, ArrowLeft, User, BellOff, Trash2, Settings as SettingsIcon, Reply, X, Send, Paperclip, Smile } from 'lucide-react';
import useMediaQuery from '../../hooks/useMediaQuery';
import DropdownMenu from '../../components/common/DropdownMenu';
import TemplateToggle from '../../components/common/TemplateToggle';
import SettingsModal from '../../components/common/SettingsModal';

import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useRealtimeChat } from '../../hooks/useRealtimeChat';

const chats = [
    { id: 1, name: 'Alice Smith', message: 'Hey, are we still on for tonight?', time: '10:30 AM', unread: 2, online: true },
    { id: 2, name: 'Bob Jones', message: 'Can you send me that file?', time: 'Yesterday', unread: 0, online: false },
    { id: 3, name: 'Charlie Day', message: 'LMAO that was hilarious 😂', time: 'Yesterday', unread: 0, online: true },
    { id: 4, name: 'David Miller', message: 'Meeting rescheduled to Monday.', time: 'Mon', unread: 0, online: false },
    { id: 5, name: 'Eva Green', message: 'Thanks!', time: 'Mon', unread: 0, online: false },
];

const PersonalDashboard = () => {

    const { user } = useAuth();
    const [activeChat, setActiveChat] = useState(null);
    const [callData, setCallData] = useState({ isOpen: false, type: 'voice' });
    const [inputText, setInputText] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);


    // Memoize mockMessages to prevent unnecessary re-renders or hook updates
    const mockMessages = React.useMemo(() => {
        const activeChatData = chats.find(c => c.id === activeChat);
        return activeChatData ? [
            {
                id: 'mock-1',
                text: activeChatData.message,
                time: activeChatData.time,
                user: { id: 'other', name: activeChatData.name },
                replyTo: null
            }
        ] : [];
    }, [activeChat]);

    const { messages, sendMessage, status } = useRealtimeChat({
        room: activeChat ? `personal-${activeChat}` : null,
        user,
        mockMessages
    });
    // const messages = mockMessages;
    // const sendMessage = () => { };
    // const status = 'offline';
    const isMobile = useMediaQuery('(max-width: 767px)');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, activeChat]);

    // Ensure state consistency when switching viewports
    useEffect(() => {
        if (!isMobile && activeChat) {
            // Keep activeChat when switching to desktop
        }
    }, [isMobile, activeChat]);

    const handleSend = () => {
        if (!inputText.trim()) return;

        sendMessage(inputText, { replyTo: replyingTo });
        setInputText('');
        setReplyingTo(null);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };



    return (
        <div className="flex h-[calc(100vh-8rem)] rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} scope="personal" />

            {/* Mobile Sidebar Overlay */}
            {isMobile && isSidebarOpen && (
                <div
                    className="absolute inset-0 bg-black/50 z-20"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                w-full md:w-80 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 absolute md:relative z-30 h-full
                ${isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
            `}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Chats</h2>
                        <div className="flex gap-2">
                            <TemplateToggle />
                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
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
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white placeholder-slate-400 text-sm transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {chats.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => {
                                setActiveChat(chat.id);
                                if (isMobile) setIsSidebarOpen(false);
                            }}
                            className={`p-4 flex gap-3 cursor-pointer transition-colors border-b border-slate-200 dark:border-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800/50 ${activeChat === chat.id ? 'bg-white dark:bg-slate-800 shadow-sm' : ''}`}
                        >
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-lg font-bold text-slate-600 dark:text-slate-300">
                                    {chat.name.charAt(0)}
                                </div>
                                {chat.online && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className={`font-semibold truncate ${activeChat === chat.id ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-slate-200'}`}>
                                        {chat.name}
                                    </h4>
                                    <span className={`text-xs ${chat.unread > 0 ? 'text-primary-600 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>{chat.time}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className={`text-sm truncate ${chat.unread > 0 ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {chat.message}
                                    </p>
                                    {chat.unread > 0 && (
                                        <span className="bg-primary-600 text-white textxs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                                            {chat.unread}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            {activeChat ? (
                <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-950 w-full relative">
                    {/* Chat Header */}
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex justify-between items-center shadow-sm z-10">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setActiveChat(null)}
                                className="md:hidden p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                                {chats.find(c => c.id === activeChat)?.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">
                                    {chats.find(c => c.id === activeChat)?.name}
                                </h3>
                                <span className="text-xs flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                    <span className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-slate-400'}`} />
                                    {status === 'online' ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCallData({ isOpen: true, type: 'voice' })}
                                className="p-2.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                            >
                                <Phone size={20} />
                            </button>
                            <button
                                onClick={() => setCallData({ isOpen: true, type: 'video' })}
                                className="p-2.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                            >
                                <Video size={20} />
                            </button>
                            <button className="p-2.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
                                <MoreVertical size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 bg-whatsapp-beige dark:bg-slate-950 transition-colors duration-300"> {/* Muted beige for light akin to WhatsApp */}
                        {messages.map((msg) => {
                            const isMe = msg.user?.id === user?.id;
                            return (
                                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                    <div className="flex items-end gap-2 max-w-[85%] md:max-w-[70%]">
                                        {!isMe && (
                                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 text-xs font-bold mb-1 shadow-sm">
                                                {msg.user?.name?.charAt(0) || 'G'}
                                            </div>
                                        )}

                                        <div className={`relative group ${isMe ? 'items-end' : 'items-start'}`}>
                                            {/* Reply Preview */}
                                            {msg.replyTo && (
                                                <div className={`text-xs mb-1 px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 backdrop-blur-sm border-l-4 ${isMe ? 'border-primary-300 text-white/90' : 'border-primary-500 text-slate-700 dark:text-slate-300'}`}>
                                                    <span className="font-semibold block text-[10px] opacity-75">Replying to {msg.replyTo.user?.name || 'User'}</span>
                                                    <span className="block truncate max-w-[150px]">{msg.replyTo.text}</span>
                                                </div>
                                            )}

                                            {/* Message Bubble */}
                                            <div className={`
                                                px-3 py-1.5 rounded-lg text-[15px] leading-relaxed shadow-sm relative
                                                ${isMe
                                                    ? 'bg-[#059669] !text-white rounded-tr-none' // Sent: Green (Hex for safety) + Force White Text
                                                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none' // Received
                                                }
                                            `}>
                                                {msg.text}
                                                <div className={`flex items-center gap-1 float-right ml-2 mt-1.5 text-[10px] ${isMe ? '!text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>
                                                    <span>{msg.time}</span>
                                                    {isMe && <span>✓✓</span>}
                                                </div>
                                            </div>

                                            {/* Hover Actions */}
                                            <div className={`absolute top-1/2 -translate-y-1/2 ${isMe ? '-left-16' : '-right-16'} opacity-0 group-hover:opacity-100 transition-all flex gap-1 p-1 rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur shadow-sm`}>
                                                <button
                                                    onClick={() => setReplyingTo(msg)}
                                                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-500 dark:text-slate-400"
                                                >
                                                    <Reply size={14} />
                                                </button>
                                                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-500 dark:text-slate-400">
                                                    <Smile size={14} />
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
                    <div className="p-3 md:p-4 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
                        {replyingTo && (
                            <div className="mb-2 flex items-center justify-between p-2 pl-3 bg-white dark:bg-slate-800 rounded-lg border-l-4 border-primary-500 shadow-sm animate-in slide-in-from-bottom-2">
                                <div className="text-sm">
                                    <span className="text-primary-600 font-bold flex items-center gap-1 text-xs uppercase tracking-wide">
                                        <Reply size={12} /> Replying to {replyingTo.user?.name || 'Friend'}
                                    </span>
                                    <span className="text-slate-600 dark:text-slate-300 truncate block max-w-xs md:max-w-md mt-0.5">
                                        {replyingTo.text}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setReplyingTo(null)}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                        <div className="flex gap-2 items-end">
                            <div className="flex gap-1 mb-1.5">
                                <button className="p-2.5 rounded-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                                    <Paperclip size={24} />
                                </button>
                            </div>

                            <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl flex items-center shadow-sm border border-transparent focus-within:border-slate-300 dark:focus-within:border-slate-700 transition-all">
                                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors ml-1">
                                    <Smile size={24} />
                                </button>
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type a message..."
                                    className="flex-1 px-2 py-3 bg-transparent border-none focus:outline-none !text-black dark:!text-white placeholder-slate-500 text-[15px]"
                                />
                            </div>

                            <button
                                onClick={handleSend}
                                disabled={!inputText.trim()}
                                className={`p-3 rounded-full shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95 mb-0.5 ${inputText.trim()
                                    ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                <Send size={20} className={inputText.trim() ? "ml-0.5" : "opacity-50"} />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 hidden md:flex min-h-screen bg-whatsapp-beige dark:bg-slate-950 border-white dark:border-slate-800 border-l-8"> {/* WA style thicker border */}
                    <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                        <MessageCircle size={48} className="text-slate-400 dark:text-slate-500" />
                    </div>
                    <h2 className="text-2xl font-light text-slate-700 dark:text-slate-200 mb-2">Welcome to WhatsApp</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm">
                        Send and receive messages without keeping your phone online. Use WhatsApp on up to 4 linked devices and 1 phone.
                    </p>
                </div>
            )}

            {/* Call Overlay */}
            {callData.isOpen && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-slate-800 p-8 rounded-2xl flex flex-col items-center gap-6 animate-in zoom-in-95 shadow-2xl border border-slate-700">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-700 shadow-xl">
                            <div className="w-full h-full bg-slate-600 flex items-center justify-center text-3xl font-bold text-white">
                                {chats.find(c => c.id === activeChat)?.name.charAt(0)}
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-white mb-1">
                                {chats.find(c => c.id === activeChat)?.name}
                            </h3>
                            <p className="text-slate-400 animate-pulse">
                                {callData.type === 'voice' ? 'Calling...' : 'Video Calling...'}
                            </p>
                        </div>
                        <div className="flex gap-6 mt-4">
                            <button className="p-4 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors">
                                {/* Video/Mic placeholders if needed, or just remove if causing crash */}
                                <Video size={24} />
                            </button>
                            <button
                                onClick={() => setCallData({ isOpen: false, type: null })}
                                className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-lg transform hover:scale-110 transition-all"
                            >
                                <Phone size={24} className="rotate-[135deg]" /> {/* Rotate Phone to look like Hangup */}
                            </button>
                            <button className="p-4 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors">
                                <Video size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PersonalDashboard;
