import React, { useState, useEffect, useRef } from 'react';
import {
    Search, PenSquare, Star, Inbox, Send, File, Trash2, MoreHorizontal,
    Paperclip, Menu, X, ArrowLeft, Reply, Forward, AlertCircle, Image,
    Settings, ChevronLeft, ChevronRight, ChevronDown, Archive, Minus,
    Maximize2, Mail, Tag, Filter, Check, Clock, Edit3
} from 'lucide-react';
import useMediaQuery from '../../hooks/useMediaQuery';
import DropdownMenu from '../../components/common/DropdownMenu';
import TemplateToggle from '../../components/common/TemplateToggle';
import SettingsModal from '../../components/common/SettingsModal';
import { useTheme } from '../../context/ThemeContext';
import { mailService } from '../../services/mailService';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';

const MailDashboard = () => {
    const serverUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174';
    const [selectedMail, setSelectedMail] = useState(null);
    const [activeFolder, setActiveFolder] = useState('Inbox');
    const [mails, setMails] = useState([]);
    const { user } = useAuth();
    const [mailStatus, setMailStatus] = useState('connecting');
    const socketRef = useRef(null);

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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        <div className="flex h-[calc(100vh-8rem)] rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} scope="mail" />

            {/* Mobile Sidebar Overlay */}
            {isMobile && isSidebarOpen && (
                <div
                    className="absolute inset-0 bg-slate-900/50 z-20"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar (Navigation) */}
            <div className={`
                w-64 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-4 
                fixed md:relative inset-y-0 left-0 z-30 transition-transform duration-300
                ${isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
            `}>
                <div className="flex justify-between items-center mb-6 md:hidden">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Mail size={20} className="text-primary-600" /> MailBox
                        </h2>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="text-slate-500 dark:text-slate-400">
                        <X size={20} />
                    </button>
                </div>
                <div className="hidden md:flex justify-between items-center mb-6 pl-2">
                    <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-lg">
                        <Mail size={24} className="text-primary-600" /> MailBox
                    </h2>
                </div>


                <div className="mb-6">
                    <button
                        onClick={() => setIsComposeOpen(true)}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-600/20 hover:shadow-primary-600/30"
                    >
                        <PenSquare size={18} /> Compose
                    </button>
                </div>

                <div className="mb-4 flex gap-2">
                    <TemplateToggle />
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors text-sm font-medium border border-slate-200 dark:border-slate-700"
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
                        const count = item.label === 'Inbox' ? mailService.getMailsByFolder('Inbox').filter(m => !m.read).length : 0;
                        const isActive = activeFolder === item.label;

                        return (
                            <button
                                key={index}
                                onClick={() => {
                                    setActiveFolder(item.label);
                                    setSelectedMail(null);
                                    if (isMobile) setIsSidebarOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon size={18} className={isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'} />
                                    {item.label}
                                </div>
                                {count > 0 && <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-primary-200 dark:bg-primary-800 text-primary-800 dark:text-primary-200' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>{count}</span>}
                            </button>
                        )
                    })}
                    <div className="mt-8 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Labels</div>
                    <div className="mt-2 space-y-1">
                        {['Work', 'Personal', 'Finance'].map(label => (
                            <button
                                key={label}
                                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                            >
                                <Tag size={16} className={label === 'Work' ? 'text-blue-500' : label === 'Personal' ? 'text-green-500' : 'text-yellow-500'} />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
                {/* User Status Footer */}
                <div className="p-3 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-200 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name || 'User'}</div>
                            <div className="text-xs text-slate-500 truncate">{user?.email || 'user@example.com'}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mail List */}
            <div className={`
                w-full md:w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-900
                fixed md:relative inset-0 md:inset-auto z-10 md:z-auto transition-transform duration-300
                ${isMobile && selectedMail ? '-translate-x-full' : 'translate-x-0'}
            `}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between h-16">
                    <div className="flex items-center gap-2">
                        <button onClick={toggleSidebar} className="md:hidden text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white p-1">
                            <Menu size={24} />
                        </button>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white capitalize">{activeFolder}</h3>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg">
                        <Filter size={18} />
                    </button>
                </div>
                <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search mail..."
                            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm shadow-sm"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
                    {mails.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                            No mails in {activeFolder}
                        </div>
                    ) : (
                        mails.map((mail) => {
                            const isSelected = selectedMail?.id === mail.id;
                            return (
                                <div
                                    key={mail.id}
                                    onClick={() => handleEmailClick(mail)}
                                    className={`p-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group ${isSelected
                                        ? 'bg-primary-50 dark:bg-primary-900/10 border-l-4 border-l-primary-500'
                                        : 'bg-white dark:bg-slate-900 border-l-4 border-l-transparent'
                                        } ${!mail.read ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-900/50'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`text-sm font-semibold truncate pr-2 ${isSelected ? 'text-primary-700 dark:text-primary-400' : 'text-slate-900 dark:text-white'} ${!mail.read ? 'font-bold' : ''}`}>
                                            {activeFolder === 'Sent' || activeFolder === 'Drafts' ? `To: ${mail.to} ` : mail.from.name}
                                        </h4>
                                        <span className={`text-xs whitespace-nowrap ${!mail.read ? 'text-primary-600 font-bold' : 'text-slate-400'}`}>
                                            {new Date(mail.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <h5 className={`text-sm truncate mb-1 ${!mail.read ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-600 dark:text-slate-300'}`}>{mail.subject}</h5>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                        {mail.body}
                                    </p>
                                    <div className="flex gap-2 mt-2">
                                        {mail.labels?.map((label, i) => (
                                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-500 bg-slate-100 dark:bg-slate-800">
                                                {label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Reading Pane */}
            <div className={`
                flex-1 flex flex-col bg-theme-purple dark:bg-slate-950
                fixed md:relative inset-0 md:inset-auto z-20 md:z-auto transition-transform duration-300
                ${isMobile ? (selectedMail ? 'translate-x-0' : 'translate-x-full') : 'translate-x-0'}
            `}>
                {selectedMail ? (
                    <>
                        <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center flex-shrink-0 shadow-sm z-10">
                            <div className="flex items-center gap-3 w-full">
                                <button
                                    onClick={() => setSelectedMail(null)}
                                    className="md:hidden text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <div className="flex gap-2">
                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors" title="Archive">
                                        <Archive size={18} />
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(selectedMail.id, e)}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors" title="Delete">
                                        <Trash2 size={18} />
                                    </button>
                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors" title="Mark Unread">
                                        <Mail size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-2 items-center flex-shrink-0 ml-4">
                                <span className="text-xs text-slate-400 hidden sm:block">1 of 25</span>
                                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                                    <button className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-500 shadow-sm">
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-500 shadow-sm">
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1"></div>
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

                        <div className="flex-1 overflow-y-auto p-4 md:p-8">
                            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[500px] flex flex-col">
                                <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex justify-between items-start mb-6">
                                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                                            {selectedMail.subject}
                                        </h1>
                                        <div className="flex gap-2">
                                            {selectedMail.labels?.map((label, i) => (
                                                <span key={i} className="text-xs font-semibold px-2 py-1 rounded bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-900/30">
                                                    {label}
                                                </span>
                                            ))}
                                            <button
                                                onClick={(e) => toggleStar(selectedMail.id, e)}
                                                className={`p-1 rounded transition-colors ${selectedMail.starred ? 'text-yellow-500' : 'text-slate-300 hover:text-slate-400'}`}
                                            >
                                                <Star size={20} fill={selectedMail.starred ? "currentColor" : "none"} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-lg border border-slate-200 dark:border-slate-700">
                                                {selectedMail.from.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                                                    {selectedMail.from.name}
                                                    <span className="text-xs font-normal text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Sender</span>
                                                </div>
                                                <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                                                    to me <ChevronDown size={14} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400 flex flex-col items-end">
                                            <span>{selectedMail.time}</span>
                                            {selectedMail.attachments && <Paperclip size={14} className="mt-1" />}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 md:p-8 text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap text-base flex-1">
                                    {selectedMail.body}
                                </div>

                                {selectedMail.attachments && selectedMail.attachments.length > 0 && (
                                    <div className="p-6 md:p-8 pt-0">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Attachments ({selectedMail.attachments.length})</h4>
                                        <div className="flex flex-wrap gap-4">
                                            {selectedMail.attachments.map((att, idx) => (
                                                <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 flex items-center gap-3 min-w-[200px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer bg-white dark:bg-slate-800/50 shadow-sm">
                                                    <div className="p-2.5 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-500">
                                                        <File size={20} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{att.name}</p>
                                                        <p className="text-xs text-slate-400">{att.size}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                                    {!isReplying ? (
                                        <>
                                            <button
                                                onClick={() => setIsReplying(true)}
                                                className="flex items-center gap-2 px-6 py-2.5 border border-slate-300 dark:border-slate-600 rounded-full text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all text-sm font-bold"
                                            >
                                                <Reply size={18} /> Reply
                                            </button>
                                            <button
                                                className="flex items-center gap-2 px-6 py-2.5 border border-slate-300 dark:border-slate-600 rounded-full text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all text-sm font-bold"
                                            >
                                                <Forward size={18} /> Forward
                                            </button>
                                        </>
                                    ) : (
                                        <div ref={replyEndRef} className="w-full animate-in fade-in slide-in-from-bottom-2">
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Reply size={16} className="text-slate-400" />
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Replying to <span className="font-bold text-slate-900 dark:text-white">{selectedMail.from.name}</span></span>
                                                </div>
                                                <button onClick={() => setIsReplying(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                            <textarea
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder="Type your reply..."
                                                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 resize-none h-32 mb-4 shadow-sm"
                                                autoFocus
                                            />
                                            <div className="flex justify-between items-center">
                                                <div className="flex gap-2">
                                                    <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400"><Paperclip size={18} /></button>
                                                    <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400"><Image size={18} /></button>
                                                    <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400"><Smile size={18} /></button>
                                                </div>
                                                <button
                                                    onClick={handleSendReply}
                                                    disabled={!replyText.trim()}
                                                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all shadow-md ${replyText.trim()
                                                        ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-500/20'
                                                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                                                        }`}
                                                >
                                                    <Send size={16} /> Send
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 hidden md:flex">
                        <div className="w-32 h-32 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6">
                            <Mail size={64} className="text-slate-300 dark:text-slate-700" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">No email selected</h3>
                        <p className="max-w-xs text-center text-slate-500">Select an email from the list to read it, or compose a new message.</p>
                    </div>
                )}
            </div>


            {/* Compose Modal */}
            {
                isComposeOpen && (
                    <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 overflow-hidden">
                            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                                <h3 className="font-bold text-slate-900 dark:text-white">New Message</h3>
                                <div className="flex gap-2">
                                    <button onClick={() => setIsComposeOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                        <Minus size={18} />
                                    </button>
                                    <button onClick={() => setIsComposeOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                        <Maximize2 size={16} />
                                    </button>
                                    <button onClick={() => setIsComposeOpen(false)} className="text-slate-400 hover:text-rose-500">
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                                <div className="border-b border-slate-100 dark:border-slate-800">
                                    <input
                                        type="text"
                                        placeholder="To"
                                        value={composeTo}
                                        onChange={(e) => setComposeTo(e.target.value)}
                                        className="w-full bg-transparent border-none p-2 text-slate-900 dark:text-white focus:ring-0 placeholder-slate-400 text-base"
                                    />
                                </div>
                                <div className="border-b border-slate-100 dark:border-slate-800">
                                    <input
                                        type="text"
                                        placeholder="Subject"
                                        value={composeSubject}
                                        onChange={(e) => setComposeSubject(e.target.value)}
                                        className="w-full bg-transparent border-none p-2 text-slate-900 dark:text-white focus:ring-0 placeholder-slate-400 font-bold text-base"
                                    />
                                </div>
                                <textarea
                                    placeholder="Write your message..."
                                    value={composeBody}
                                    onChange={(e) => setComposeBody(e.target.value)}
                                    className="w-full h-full min-h-[300px] bg-transparent border-none focus:ring-0 text-slate-800 dark:text-slate-200 resize-none placeholder-slate-400 p-2 leading-relaxed"
                                />
                            </div>
                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                                <div className="flex gap-4">
                                    <button
                                        onClick={handleComposeSend}
                                        className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold shadow-lg shadow-primary-600/20 transition-all transform active:scale-95"
                                    >
                                        Send
                                    </button>
                                    <div className="flex items-center gap-1">
                                        <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400"><Paperclip size={20} /></button>
                                        <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400"><Link size={20} /></button>
                                        <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400"><Smile size={20} /></button>
                                        <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400"><Image size={20} /></button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsComposeOpen(false)}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default MailDashboard;
