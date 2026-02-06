import React, { useState, useEffect } from 'react';
import { MessageCircle, Phone, Video, Image, MoreVertical, Search, ArrowLeft, User, BellOff, Trash2, Settings as SettingsIcon, Reply, X } from 'lucide-react';
import useMediaQuery from '../../hooks/useMediaQuery';
import DropdownMenu from '../../components/common/DropdownMenu';
import TemplateToggle from '../../components/common/TemplateToggle';
import SettingsModal from '../../components/common/SettingsModal';
import CallInterface from '../../components/common/CallInterface';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useRealtimeChat } from '../../hooks/useRealtimeChat';

const PersonalDashboard = () => {
    const { dashboardThemes } = useTheme();
    const [activeChat, setActiveChat] = useState(null);
    const [callData, setCallData] = useState({ isOpen: false, type: 'voice' });
    const [inputText, setInputText] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { user } = useAuth();
    const { messages, sendMessage, status } = useRealtimeChat({
        room: activeChat ? `personal-${activeChat}` : null,
        user
    });
    const isMobile = useMediaQuery('(max-width: 767px)');
    const messagesEndRef = React.useRef(null);

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
        <div className={dashboardThemes.personal === 'dark' ? 'dark' : ''}>
            <div className="w-full flex h-[calc(100vh-8rem)] bg-white dark:bg-primary-950 border border-slate-200 dark:border-primary-900 rounded-2xl overflow-hidden relative">
                <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} scope="personal" />

                {/* Chat List */}
                <div className={`
        w-full md:w-80 border-r border-slate-200 dark:border-primary-800 flex flex-col bg-slate-50/50 dark:bg-primary-900/30 
        fixed md:relative inset-0 md:inset-auto z-10 md:z-auto transition-transform duration-300
        ${isMobile && activeChat ? '-translate-x-full' : 'translate-x-0'}
      `}>
                    <div className="p-4 border-b border-slate-200 dark:border-primary-800 flex gap-2 items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search chats..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-primary-900/30 focus:outline-none focus:border-primary-500 text-slate-800 dark:text-primary-100 placeholder-slate-400 dark:placeholder-slate-500"
                            />
                        </div>
                        <div className="flex gap-1">
                            <TemplateToggle />
                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
                            >
                                <SettingsIcon size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div
                                    key={i}
                                    onClick={() => setActiveChat(i)}
                                    className="p-4 hover:bg-primary-50 dark:hover:bg-primary-900/10 cursor-pointer transition-colors border-b border-slate-100 dark:border-primary-900/10 last:border-0"
                                >
                                    <div className="flex gap-3">
                                        <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-800/30 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-medium text-slate-800 dark:text-primary-50 truncate">Friend Name {i}</h4>
                                                <span className="text-xs text-slate-500">12:30 PM</span>
                                            </div>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm truncate">Hey, are we still on for tonight?</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className={`
        flex-1 flex flex-col bg-white dark:bg-primary-950/50 
        fixed md:relative inset-0 md:inset-auto z-20 md:z-auto transition-transform duration-300
        ${isMobile ? (activeChat ? 'translate-x-0' : 'translate-x-full') : 'translate-x-0'}
      `}>
                        {activeChat ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-slate-200 dark:border-primary-800 flex justify-between items-center bg-white/80 dark:bg-primary-900/80 backdrop-blur-sm flex-shrink-0">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setActiveChat(null)}
                                            className="md:hidden p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                                        >
                                            <ArrowLeft size={20} />
                                        </button>
                                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-800/30" />
                                        <div>
                                            <h3 className="font-bold text-slate-800 dark:text-primary-50">Friend Name {activeChat}</h3>
                                            <span className="text-xs text-primary-400 flex items-center gap-1">
                                                <span className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-primary-500 animate-pulse' : 'bg-slate-400'}`} />
                                                {status === 'online' ? 'Live' : 'Offline'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCallData({ isOpen: true, type: 'voice' })}
                                            className="p-2 rounded-full hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-600 dark:text-primary-400 transition-colors"
                                        >
                                            <Phone size={20} />
                                        </button>
                                        <button
                                            onClick={() => setCallData({ isOpen: true, type: 'video' })}
                                            className="p-2 rounded-full hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-600 dark:text-primary-400 transition-colors"
                                        >
                                            <Video size={20} />
                                        </button>
                                        <DropdownMenu
                                            icon={MoreVertical}
                                            options={[
                                                { label: 'View Profile', icon: User, action: () => alert('Profile clicked') },
                                                { label: 'Mute Notifications', icon: BellOff, action: () => alert('Mute clicked') },
                                                { label: 'Delete Chat', icon: Trash2, action: () => alert('Delete clicked'), danger: true }
                                            ]}
                                        />
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-950/30">
                                    {messages.map((msg) => {
                                        const isMe = msg.user?.id === user?.id;
                                        return (
                                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className={`group relative flex items-center gap-2 max-w-[85%] md:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>

                                                {/* Message Bubble */}
                                                <div className={`relative px-4 py-2 rounded-2xl ${isMe
                                                    ? 'bg-primary-600 text-white rounded-tr-none'
                                                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-transparent rounded-tl-none shadow-sm dark:shadow-none'
                                                    }`}>
                                                    {msg.replyTo && (
                                                        <div className={`text-xs mb-1 pb-1 border-b ${isMe ? 'border-primary-500 text-primary-100' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}>
                                                            Replying to: {msg.replyTo.text.substring(0, 30)}...
                                                        </div>
                                                    )}
                                                    {msg.text}
                                                </div>

                                                {/* Actions (Reply/React) */}
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                    <button
                                                        onClick={() => setReplyingTo(msg)}
                                                        className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors shadow-sm"
                                                        title="Reply"
                                                    >
                                                        <Reply size={14} />
                                                    </button>
                                                    <button
                                                        className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors shadow-sm"
                                                        title="React"
                                                    >
                                                        <MessageCircle size={14} className="fill-current" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-4 border-t border-slate-200 dark:border-primary-900/30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex-shrink-0">
                                    {replyingTo && (
                                        <div className="mb-2 flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-800 rounded-lg border-l-4 border-primary-500">
                                            <div className="text-sm">
                                                <span className="text-primary-600 dark:text-primary-400 font-medium block">Replying to {replyingTo.user?.name || 'Friend'}</span>
                                                <span className="text-slate-500 dark:text-slate-400 truncate block max-w-xs">{replyingTo.text}</span>
                                            </div>
                                            <button
                                                onClick={() => setReplyingTo(null)}
                                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex gap-3 items-center">
                                        <button
                                            onClick={() => alert('Opening image picker...')}
                                            className="p-2 rounded-full hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-600 dark:text-primary-400 transition-colors hidden sm:block"
                                        >
                                            <Image size={20} />
                                        </button>
                                        <input
                                            type="text"
                                            value={inputText}
                                            onChange={(e) => setInputText(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Type a message..."
                                            className="flex-1 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-primary-900/30 focus:outline-none focus:border-primary-500 text-slate-800 dark:text-primary-100 placeholder-slate-400 dark:placeholder-slate-500"
                                        />
                                        <button
                                            onClick={handleSend}
                                            disabled={!inputText.trim()}
                                            className={`p-2 rounded-full transition-colors shadow-lg ${inputText.trim()
                                                ? 'bg-primary-600 hover:bg-primary-500 text-white shadow-primary-600/20'
                                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                                }`}
                                        >
                                            <MessageCircle size={20} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 hidden md:flex">
                                <MessageCircle size={48} className="mb-4 opacity-50" />
                                <p>Select a chat to start messaging</p>
                            </div>
                        )}
                    </div>
                    {/* Call Interface */}
                    <CallInterface
                        isOpen={callData.isOpen}
                        onClose={() => setCallData({ ...callData, isOpen: false })}
                        type={callData.type}
                        userInfo={{
                            name: `Friend Name ${activeChat}`,
                            image: null
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default PersonalDashboard;
