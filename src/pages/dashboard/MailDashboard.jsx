import React, { useState, useEffect, useRef } from 'react';
import { Search, PenSquare, Star, Inbox, Send, File, Trash2, MoreHorizontal, Paperclip, Menu, X, ArrowLeft, Reply, Forward, AlertCircle, Image, Settings } from 'lucide-react';
import useMediaQuery from '../../hooks/useMediaQuery';
import DropdownMenu from '../../components/common/DropdownMenu';
import TemplateToggle from '../../components/common/TemplateToggle';
import SettingsModal from '../../components/common/SettingsModal';
import { useTheme } from '../../context/ThemeContext';
import { mailService } from '../../services/mailService';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';

const MailDashboard = () => {
    const { currentTheme } = useTheme();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedMail, setSelectedMail] = useState(null);
    const [activeFolder, setActiveFolder] = useState('Inbox');
    const [mails, setMails] = useState([]);
    const { user } = useAuth();
    const [mailStatus, setMailStatus] = useState('connecting');
    const socketRef = useRef(null);
    const serverUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174';

    // Reply state
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');

    // Compose state
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [composeTo, setComposeTo] = useState('');
    const [composeSubject, setComposeSubject] = useState('');
    const [composeBody, setComposeBody] = useState('');

    // Settings state
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const isMobile = useMediaQuery('(max-width: 767px)');
    const replyEndRef = useRef(null);

    // Initial load and folder change
    useEffect(() => {
        refreshMails();
    }, [activeFolder]);

    useEffect(() => {
        const socket = io(serverUrl, { transports: ['websocket'] });
        socketRef.current = socket;

        socket.on('connect', () => {
            setMailStatus('online');
            socket.emit('room:join', { room: 'mail', user });
        });

        socket.on('disconnect', () => {
            setMailStatus('offline');
        });

        socket.on('mail:message', (payload) => {
            if (payload?.from?.email && payload.from.email === user?.email) return;
            mailService.createMail({
                to: payload.to,
                from: payload.from,
                subject: payload.subject,
                body: payload.body,
                folder: 'Inbox'
            });
            if (activeFolder === 'Inbox') {
                refreshMails();
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [serverUrl, user, activeFolder]);

    const refreshMails = () => {
        const fetchedMails = mailService.getMailsByFolder(activeFolder);
        setMails(fetchedMails);

        // If the currently active email is no longer in the list (e.g. deleted), deselect it
        if (selectedMail && !fetchedMails.find(m => m.id === selectedMail.id)) {
            setSelectedMail(null);
        } else if (selectedMail) {
            // Update active email object with latest state
            const updatedActive = mailService.getMail(selectedMail.id);
            setSelectedMail(updatedActive);
        }
    };

    useEffect(() => {
        if (!isMobile) {
            setIsSidebarOpen(true);
        } else {
            setIsSidebarOpen(false);
        }
    }, [isMobile]);

    useEffect(() => {
        if (isReplying) {
            replyEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [isReplying]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleEmailClick = (mail) => {
        if (!mail.read) {
            mailService.updateMail(mail.id, { read: true });
            refreshMails();
        }
        // Get fresh copy
        const freshMail = mailService.getMail(mail.id);
        setSelectedMail(freshMail);
        setIsReplying(false);
    };

    const handleSendReply = () => {
        if (!replyText.trim()) return;
        // For prototype: add a "reply" mail to Sent folder
        const replyPayload = {
            to: selectedMail.from.email,
            from: { name: user?.name || 'Me', email: user?.email || 'me@example.com' },
            subject: `Re: ${selectedMail.subject} `,
            body: replyText
        };
        mailService.createMail({
            ...replyPayload,
            folder: 'Sent'
        });
        socketRef.current?.emit('mail:send', {
            room: 'mail',
            ...replyPayload
        });

        setIsReplying(false);
        setReplyText('');
        alert('Reply sent!');
        refreshMails();
    };

    const handleComposeSend = () => {
        if (!composeTo.trim() || !composeSubject.trim()) {
            alert('Please fill in To and Subject fields.');
            return;
        }

        const mailPayload = {
            to: composeTo,
            from: { name: user?.name || 'Me', email: user?.email || 'me@example.com' },
            subject: composeSubject,
            body: composeBody
        };
        mailService.createMail({
            ...mailPayload,
            folder: 'Sent' // Explicitly set to Sent, although service defaults to Sent
        });
        socketRef.current?.emit('mail:send', { room: 'mail', ...mailPayload });

        setIsComposeOpen(false);
        setComposeTo('');
        setComposeSubject('');
        setComposeBody('');
        alert('Message sent!');

        // If we are in Sent folder, refresh to show new mail
        if (activeFolder === 'Sent') {
            refreshMails();
        }
    };

    const handleDelete = (id, e) => {
        e?.stopPropagation(); // Prevent opening the email if clicking delete from list
        mailService.deleteMail(id);
        refreshMails();
        if (selectedMail && selectedMail.id === id) {
            setSelectedMail(null);
        }
    };

    const toggleStar = (id, e) => {
        e?.stopPropagation();
        const mail = mailService.getMail(id);
        if (mail) {
            mailService.updateMail(id, { starred: !mail.starred });
            refreshMails();
        }
    };

    return (
        <div className={currentTheme === 'dark' ? 'dark' : ''}>
            <div className="w-full flex h-[calc(100vh-8rem)] bg-white dark:bg-primary-950 border border-slate-200 dark:border-primary-900 rounded-2xl overflow-hidden relative">
                <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} scope="mail" />

                {/* Mobile Sidebar Overlay */}
                {isMobile && isSidebarOpen && (
                    <div
                        className="absolute inset-0 bg-black/50 z-20"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <div className={`
                w-64 bg-slate-50 dark:bg-primary-950 border-r border-slate-200 dark:border-primary-900/30 flex flex-col p-4 
                fixed md:relative inset-y-0 left-0 z-30 transition-transform duration-300
                ${isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
            `}>
                    <div className="flex justify-between items-center mb-6 md:hidden">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-slate-800 dark:text-primary-100">Mailboxes</h2>
                        <span className={`text-xs font-semibold ${mailStatus === 'online' ? 'text-emerald-500' : 'text-slate-400'}`}>
                            {mailStatus === 'online' ? 'Live' : 'Offline'}
                        </span>
                    </div>
                        <button onClick={() => setIsSidebarOpen(false)} className="text-slate-500 dark:text-slate-400">
                            <X size={20} />
                        </button>
                    </div>

                    <button
                        onClick={() => setIsComposeOpen(true)}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold mb-6 transition-colors shadow-lg shadow-primary-600/20"
                    >
                        <PenSquare size={18} /> Compose
                    </button>

                    <div className="mb-4 flex gap-2">
                        <TemplateToggle />
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium border border-slate-200 dark:border-slate-700"
                        >
                            <Settings size={16} />
                            <span className="hidden sm:inline">Settings</span>
                        </button>
                    </div>

                    <div className="space-y-1 flex-1">
                        {[
                            { icon: Inbox, label: 'Inbox' },
                            { icon: Star, label: 'Starred' },
                            { icon: Send, label: 'Sent' },
                            { icon: File, label: 'Drafts' },
                            { icon: Trash2, label: 'Trash' },
                        ].map((item, index) => {
                            // Calculate counts dynamically if needed, for now simplified
                            const count = item.label === 'Inbox' ? mailService.getMailsByFolder('Inbox').filter(m => !m.read).length : 0;

                            return (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setActiveFolder(item.label);
                                        setSelectedMail(null);
                                        if (isMobile) setIsSidebarOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFolder === item.label
                                        ? 'bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon size={18} />
                                        {item.label}
                                    </div>
                                    {count > 0 && <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full">{count}</span>}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Mail List */}
                <div className={`
                w-full md:w-80 border-r border-slate-200 dark:border-primary-900/30 flex flex-col bg-slate-50/50 dark:bg-primary-950/30
                fixed md:relative inset-0 md:inset-auto z-10 md:z-auto transition-transform duration-300
                ${isMobile && selectedMail ? '-translate-x-full' : 'translate-x-0'}
            `}>
                    <div className="p-4 border-b border-slate-200 dark:border-primary-900/30 flex gap-3 items-center">
                        <button onClick={toggleSidebar} className="md:hidden text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white p-1">
                            <Menu size={24} />
                        </button>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                            <input
                                type="text"
                                placeholder="Search mail..."
                                className="w-full pl-9 pr-4 py-2 rounded-lg bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-primary-900/30 focus:outline-none focus:border-primary-500 text-slate-800 dark:text-primary-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {mails.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-sm">
                                No mails in {activeFolder}
                            </div>
                        ) : (
                            mails.map((mail) => (
                                <div
                                    key={mail.id}
                                    onClick={() => handleEmailClick(mail)}
                                    className={`p-4 border-b border-slate-100 dark:border-primary-900/10 cursor-pointer hover:bg-primary-50/70 dark:hover:bg-primary-900/5 transition-colors ${selectedMail?.id === mail.id ? 'bg-primary-100/70 dark:bg-primary-900/10 border-l-2 border-l-primary-500' : ''} ${!mail.read ? 'bg-slate-100 dark:bg-slate-800/20' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`text-sm font-semibold truncate ${!mail.read ? 'text-slate-900 dark:text-primary-100' : 'text-slate-600 dark:text-slate-300'}`}>
                                            {activeFolder === 'Sent' || activeFolder === 'Drafts' ? `To: ${mail.to} ` : mail.from.name}
                                        </h4>
                                        <span className="text-xs text-slate-500">
                                            {new Date(mail.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <h5 className={`text-sm font-medium truncate mb-1 ${!mail.read ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{mail.subject}</h5>
                                    <p className="text-xs text-slate-500 line-clamp-2">
                                        {mail.body}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Reading Pane */}
                <div className={`
                flex-1 flex flex-col bg-white dark:bg-primary-950/50
                fixed md:relative inset-0 md:inset-auto z-20 md:z-auto transition-transform duration-300
                ${isMobile ? (selectedMail ? 'translate-x-0' : 'translate-x-full') : 'translate-x-0'}
            `}>
                    {selectedMail ? (
                        <>
                            <div className="p-4 md:p-6 border-b border-slate-200 dark:border-primary-900/30 flex justify-between items-start flex-shrink-0 bg-white dark:bg-primary-950/50">
                                <div className="flex items-start gap-3 w-full">
                                    <button
                                        onClick={() => setSelectedMail(null)}
                                        className="md:hidden mt-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2 truncate">{selectedMail.subject}</h2>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold flex-shrink-0">
                                                {selectedMail.from.name.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-medium text-slate-800 dark:text-slate-200">{selectedMail.from.name}</span>
                                                    <span className="text-slate-500 text-sm truncate">&lt;{selectedMail.from.email}&gt;</span>
                                                </div>
                                                <div className="text-xs text-slate-500 truncate">To: {selectedMail.to}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-shrink-0 ml-2">
                                    <button
                                        onClick={(e) => toggleStar(selectedMail.id, e)}
                                        className={`p-2 rounded-lg transition-colors ${selectedMail.starred ? 'text-yellow-500 dark:text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-300' : 'text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                    >
                                        <Star size={18} fill={selectedMail.starred ? "currentColor" : "none"} />
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(selectedMail.id, e)}
                                        className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <DropdownMenu
                                        icon={MoreHorizontal}
                                        options={[
                                            { label: 'Reply', icon: Reply, action: () => setIsReplying(true) },
                                            { label: 'Forward', icon: Forward, action: () => alert('Forward clicked') },
                                            { label: 'Report Spam', icon: AlertCircle, action: () => alert('Spam clicked'), danger: true }
                                        ]}
                                    />
                                </div>
                            </div>

                            <div className="flex-1 p-4 md:p-8 overflow-y-auto text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {selectedMail.body}

                                {selectedMail.attachments && selectedMail.attachments.length > 0 && (
                                    <div className="mt-8">
                                        {selectedMail.attachments.map((att, idx) => (
                                            <div key={idx} className="border border-slate-200 dark:border-primary-900/30 rounded-lg p-4 max-w-sm bg-slate-50 dark:bg-slate-950/30 mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-3 bg-primary-100 dark:bg-primary-500/10 rounded-lg text-primary-600 dark:text-primary-400">
                                                        <File size={24} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{att.name}</p>
                                                        <p className="text-xs text-slate-500">{att.size}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {isReplying && (
                                    <div ref={replyEndRef} className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-primary-900/30 rounded-xl p-4 mt-8 mb-4 animate-in fade-in slide-in-from-bottom-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Replying to {selectedMail.from.name}</span>
                                            <button onClick={() => setIsReplying(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                                                <X size={16} />
                                            </button>
                                        </div>
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Type your reply..."
                                            className="w-full bg-transparent border-none focus:ring-0 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 resize-none h-32 p-0 mb-2"
                                            autoFocus
                                        />
                                        <div className="flex justify-between items-center">
                                            <div className="flex gap-2">
                                                <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400"><Paperclip size={18} /></button>
                                                <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400"><Image size={18} /></button>
                                            </div>
                                            <button
                                                onClick={handleSendReply}
                                                disabled={!replyText.trim()}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${replyText.trim()
                                                    ? 'bg-primary-600 hover:bg-primary-500 text-white'
                                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                                    }`}
                                            >
                                                <Send size={16} /> Send
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {!isReplying && (
                                <div className="p-4 border-t border-slate-200 dark:border-primary-900/30 bg-slate-50/50 dark:bg-slate-950/30 flex-shrink-0">
                                    <button
                                        onClick={() => setIsReplying(true)}
                                        className="flex items-center gap-2 px-6 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <Reply size={16} /> Reply
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 hidden md:flex">
                            <Inbox size={48} className="mb-4 opacity-50" />
                            <p>Select an email to read</p>
                        </div>
                    )}
                </div>


                {/* Compose Modal */}
                {
                    isComposeOpen && (
                        <div className="absolute inset-0 z-50 bg-slate-900/50 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-primary-900/30 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                                <div className="p-4 border-b border-slate-200 dark:border-primary-900/30 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-900 dark:text-white">New Message</h3>
                                    <button onClick={() => setIsComposeOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                                    <input
                                        type="text"
                                        placeholder="To"
                                        value={composeTo}
                                        onChange={(e) => setComposeTo(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-primary-900/30 rounded-lg px-4 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500 placeholder-slate-400 dark:placeholder-slate-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Subject"
                                        value={composeSubject}
                                        onChange={(e) => setComposeSubject(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-primary-900/30 rounded-lg px-4 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500 placeholder-slate-400 dark:placeholder-slate-500"
                                    />
                                    <textarea
                                        placeholder="Write your message..."
                                        value={composeBody}
                                        onChange={(e) => setComposeBody(e.target.value)}
                                        className="w-full h-64 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-primary-900/30 rounded-lg px-4 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500 resize-none placeholder-slate-400 dark:placeholder-slate-500"
                                    />
                                </div>
                                <div className="p-4 border-t border-slate-200 dark:border-primary-900/30 flex justify-end gap-3">
                                    <button
                                        onClick={() => setIsComposeOpen(false)}
                                        className="px-4 py-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        onClick={handleComposeSend}
                                        className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-bold shadow-lg shadow-primary-600/20 transition-colors"
                                    >
                                        Send
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div >
        </div>
    );
};

export default MailDashboard;
