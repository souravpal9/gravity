import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Search, PenSquare, Star, Inbox, Send, File, Trash2, MoreHorizontal,
    Paperclip, Menu, X, ArrowLeft, Reply, Forward, AlertCircle, Image,
    Settings, ChevronLeft, ChevronRight, ChevronDown, Archive,
    Minus, Maximize2, Mail, Tag, Filter, Check
} from 'lucide-react';
import useMediaQuery from '../../hooks/useMediaQuery';
import DropdownMenu from '../../components/common/DropdownMenu';
import SettingsModal from '../../components/common/SettingsModal';
import { mailService } from '../../services/mailService';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';

// Simple toast instead of browser alert()
const Toast = ({ message, onDone }) => {
    useEffect(() => {
        const t = setTimeout(onDone, 2500);
        return () => clearTimeout(t);
    }, []);
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl shadow-2xl font-medium text-sm animate-in slide-in-from-bottom-4 duration-300">
            ✓ {message}
        </div>
    );
};

const MailDashboard = () => {
    const serverUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5174';
    const [selectedMail, setSelectedMail] = useState(null);
    const [activeFolder, setActiveFolder] = useState('Inbox');
    const [mails, setMails] = useState([]);
    const [toast, setToast] = useState('');
    const { user } = useAuth();
    const socketRef = useRef(null);

    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [replyAttachments, setReplyAttachments] = useState([]);

    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [composeTo, setComposeTo] = useState('');
    const [composeSubject, setComposeSubject] = useState('');
    const [composeBody, setComposeBody] = useState('');
    const [composeAttachments, setComposeAttachments] = useState([]);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const isMobile = useMediaQuery('(max-width: 767px)');
    const replyEndRef = useRef(null);
    const replyFileRef = useRef(null);
    const composeFileRef = useRef(null);

    const refreshMails = useCallback(() => {
        const fetched = mailService.getMailsByFolder(activeFolder);
        setMails(fetched);
        if (selectedMail) {
            const updated = mailService.getMail(selectedMail.id);
            setSelectedMail(updated || null);
        }
    }, [activeFolder, selectedMail?.id]);

    useEffect(() => { refreshMails(); }, [activeFolder]);

    useEffect(() => {
        const socket = io(serverUrl, { transports: ['websocket'] });
        socketRef.current = socket;
        socket.on('connect', () => socket.emit('room:join', { room: 'mail', user }));
        socket.on('mail:message', (payload) => {
            if (payload?.from?.email === user?.email) return;
            mailService.createMail({ ...payload, folder: 'Inbox' });
            if (activeFolder === 'Inbox') refreshMails();
        });
        return () => socket.disconnect();
    }, [serverUrl, user]);

    useEffect(() => {
        setIsSidebarOpen(!isMobile);
    }, [isMobile]);

    useEffect(() => {
        if (isReplying) replyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [isReplying]);

    const showToast = (msg) => setToast(msg);

    const handleEmailClick = (mail) => {
        if (!mail.read) mailService.updateMail(mail.id, { read: true });
        setSelectedMail(mailService.getMail(mail.id));
        setIsReplying(false);
        refreshMails();
    };

    const handleSendReply = () => {
        if (!replyText.trim()) return;
        const payload = {
            to: selectedMail.from.email,
            from: { name: user?.name || 'Me', email: user?.email || 'me@example.com' },
            subject: `Re: ${selectedMail.subject}`,
            body: replyText,
            attachments: replyAttachments,
        };
        mailService.createMail({ ...payload, folder: 'Sent' });
        socketRef.current?.emit('mail:send', { room: 'mail', ...payload });
        setIsReplying(false);
        setReplyText('');
        setReplyAttachments([]);
        showToast('Reply sent!');
        refreshMails();
    };

    const handleComposeSend = () => {
        if (!composeTo.trim() || !composeSubject.trim()) {
            showToast('Please fill in To and Subject fields.');
            return;
        }
        const payload = {
            to: composeTo,
            from: { name: user?.name || 'Me', email: user?.email || 'me@example.com' },
            subject: composeSubject,
            body: composeBody,
            attachments: composeAttachments,
        };
        mailService.createMail({ ...payload, folder: 'Sent' });
        socketRef.current?.emit('mail:send', { room: 'mail', ...payload });
        setIsComposeOpen(false);
        setComposeTo(''); setComposeSubject(''); setComposeBody(''); setComposeAttachments([]);
        showToast('Message sent!');
        if (activeFolder === 'Sent') refreshMails();
    };

    const handleDelete = (id, e) => {
        e?.stopPropagation();
        mailService.deleteMail(id);
        if (selectedMail?.id === id) setSelectedMail(null);
        refreshMails();
    };

    const toggleStar = (id, e) => {
        e?.stopPropagation();
        const mail = mailService.getMail(id);
        if (mail) { mailService.updateMail(id, { starred: !mail.starred }); refreshMails(); }
    };

    const handleFileAttach = (e, setter) => {
        const files = Array.from(e.target.files || []);
        setter(prev => [...prev, ...files.map(f => ({ name: f.name, size: `${(f.size / 1024).toFixed(1)} KB`, type: f.type }))]);
        e.target.value = '';
    };

    const folders = [
        { icon: Inbox, label: 'Inbox' },
        { icon: Star, label: 'Starred' },
        { icon: Send, label: 'Sent' },
        { icon: File, label: 'Drafts' },
        { icon: Trash2, label: 'Trash' },
    ];

    return (
        <div className="flex h-[calc(100vh-8rem)] rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 relative">
            {toast && <Toast message={toast} onDone={() => setToast('')} />}
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

            {isMobile && isSidebarOpen && (
                <div className="absolute inset-0 bg-slate-900/50 z-20" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* ── Nav Sidebar ── */}
            <div className={`
                w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-4
                fixed md:relative inset-y-0 left-0 z-30 transition-transform duration-300
                ${isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
            `}>
                <div className="flex justify-between items-center mb-4 md:hidden">
                    <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Mail size={18} className="text-primary-600" /> MailBox</h2>
                    <button onClick={() => setIsSidebarOpen(false)} className="text-slate-500 dark:text-slate-400"><X size={20} /></button>
                </div>
                <h2 className="hidden md:flex font-bold text-slate-900 dark:text-white items-center gap-2 text-lg mb-5 pl-1"><Mail size={22} className="text-primary-600" /> MailBox</h2>

                <button
                    onClick={() => setIsComposeOpen(true)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-lg mb-4 text-sm"
                >
                    <PenSquare size={16} /> Compose
                </button>

                <div className="flex gap-2 mb-5">
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-medium"
                    >
                        <Settings size={15} /> Settings
                    </button>
                </div>

                <div className="space-y-0.5 flex-1">
                    {folders.map(({ icon: Icon, label }) => {
                        const count = label === 'Inbox' ? mailService.getMailsByFolder('Inbox').filter(m => !m.read).length : 0;
                        const isActive = activeFolder === label;
                        return (
                            <button
                                key={label}
                                onClick={() => { setActiveFolder(label); setSelectedMail(null); if (isMobile) setIsSidebarOpen(false); }}
                                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon size={17} className={isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'} />
                                    {label}
                                </div>
                                {count > 0 && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary-600 text-white">{count}</span>}
                            </button>
                        );
                    })}

                    <div className="mt-6 px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Labels</div>
                    {[['Work', 'text-blue-500'], ['Personal', 'text-green-500'], ['Finance', 'text-yellow-500']].map(([label, color]) => (
                        <button key={label} className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <Tag size={15} className={color} /> {label}
                        </button>
                    ))}
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-3 mt-3">
                    <div
                        onClick={() => setIsSettingsOpen(true)}
                        className="flex items-center gap-3 p-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-sm">{user?.name?.charAt(0) || 'U'}</div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name || 'User'}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</div>
                        </div>
                        <Settings size={15} className="text-slate-400 flex-shrink-0" />
                    </div>
                </div>
            </div>

            {/* ── Mail List ── */}
            <div className={`
                w-full md:w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900
                fixed md:relative inset-0 md:inset-auto z-10 md:z-auto transition-transform duration-300
                ${isMobile && selectedMail ? '-translate-x-full' : 'translate-x-0'}
            `} style={{ left: isMobile ? 0 : undefined }}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between h-16">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsSidebarOpen(v => !v)} className="md:hidden text-slate-500 dark:text-slate-400 p-1"><Menu size={22} /></button>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{activeFolder}</h3>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><Filter size={16} /></button>
                </div>

                <div className="p-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                        <input type="text" placeholder="Search mail..." className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-none focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {mails.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">No mail in {activeFolder}</div>
                    ) : mails.map(mail => {
                        const isSelected = selectedMail?.id === mail.id;
                        return (
                            <div
                                key={mail.id}
                                onClick={() => handleEmailClick(mail)}
                                className={`p-4 border-b border-slate-100 dark:border-slate-800/50 cursor-pointer transition-all group
                                    ${isSelected ? 'bg-primary-50 dark:bg-primary-900/10 border-l-4 border-l-primary-500' : `${!mail.read ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-900/50'} border-l-4 border-l-transparent hover:bg-slate-50 dark:hover:bg-slate-800`}`}
                            >
                                <div className="flex justify-between items-start mb-0.5">
                                    <h4 className={`text-sm truncate pr-2 ${isSelected ? 'text-primary-700 dark:text-primary-400' : 'text-slate-900 dark:text-white'} ${!mail.read ? 'font-bold' : 'font-medium'}`}>
                                        {activeFolder === 'Sent' || activeFolder === 'Drafts' ? `To: ${mail.to}` : mail.from.name}
                                    </h4>
                                    <span className={`text-xs flex-shrink-0 ${!mail.read ? 'text-primary-600 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                                        {new Date(mail.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <h5 className={`text-sm truncate mb-1 ${!mail.read ? 'font-bold text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>{mail.subject}</h5>
                                <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2">{mail.body}</p>
                                {mail.attachments?.length > 0 && <div className="flex items-center gap-1 mt-1 text-xs text-slate-400"><Paperclip size={11} /> {mail.attachments.length} attachment{mail.attachments.length > 1 ? 's' : ''}</div>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Reading Pane ── */}
            <div className={`
                flex-1 flex flex-col bg-slate-50 dark:bg-slate-950
                fixed md:relative inset-0 md:inset-auto z-20 md:z-auto transition-transform duration-300
                ${isMobile ? (selectedMail ? 'translate-x-0' : 'translate-x-full') : 'translate-x-0'}
            `}>
                {selectedMail ? (
                    <>
                        <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center flex-shrink-0 shadow-sm">
                            <div className="flex items-center gap-2">
                                <button onClick={() => setSelectedMail(null)} className="md:hidden text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white">
                                    <ArrowLeft size={20} />
                                </button>
                                <button onClick={(e) => handleDelete(selectedMail.id, e)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400" title="Delete"><Trash2 size={17} /></button>
                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400" title="Archive"><Archive size={17} /></button>
                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400" title="Mark unread"><Mail size={17} /></button>
                            </div>
                            <div className="flex gap-2 items-center">
                                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                                    <button className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-500"><ChevronLeft size={15} /></button>
                                    <button className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-500"><ChevronRight size={15} /></button>
                                </div>
                                <DropdownMenu
                                    icon={MoreHorizontal}
                                    options={[
                                        { label: 'Reply', icon: Reply, action: () => setIsReplying(true) },
                                        { label: 'Forward', icon: Forward, action: () => showToast('Forward coming soon') },
                                        { label: 'Report Spam', icon: AlertCircle, action: () => showToast('Marked as spam'), danger: true }
                                    ]}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 md:p-8">
                            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                                <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex justify-between items-start mb-5 gap-4">
                                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight flex-1">{selectedMail.subject}</h1>
                                        <button onClick={(e) => toggleStar(selectedMail.id, e)} className={`flex-shrink-0 p-1 ${selectedMail.starred ? 'text-yellow-500' : 'text-slate-300 hover:text-slate-400 dark:hover:text-slate-500'}`}>
                                            <Star size={20} fill={selectedMail.starred ? 'currentColor' : 'none'} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-lg text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                {selectedMail.from.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-white">{selectedMail.from.name}</div>
                                                <div className="text-sm text-slate-400 dark:text-slate-500 flex items-center gap-1 cursor-pointer">
                                                    {selectedMail.from.email} <ChevronDown size={13} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-400 dark:text-slate-500">
                                            {new Date(selectedMail.date).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 md:p-8 text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap text-[15px] flex-1">
                                    {selectedMail.body}
                                </div>

                                {selectedMail.attachments?.length > 0 && (
                                    <div className="p-6 pt-0">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Attachments ({selectedMail.attachments.length})</h4>
                                        <div className="flex flex-wrap gap-3">
                                            {selectedMail.attachments.map((att, i) => (
                                                <div key={i} className="flex items-center gap-3 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer bg-white dark:bg-slate-800/50 shadow-sm min-w-[160px]">
                                                    <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-500"><File size={18} /></div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{att.name}</p>
                                                        <p className="text-xs text-slate-400">{att.size}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Reply / Forward bar */}
                                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                                    {!isReplying ? (
                                        <div className="flex gap-3">
                                            <button onClick={() => setIsReplying(true)} className="flex items-center gap-2 px-5 py-2 border border-slate-300 dark:border-slate-600 rounded-full text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 text-sm font-bold transition-all shadow-sm">
                                                <Reply size={16} /> Reply
                                            </button>
                                            <button className="flex items-center gap-2 px-5 py-2 border border-slate-300 dark:border-slate-600 rounded-full text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 text-sm font-bold transition-all shadow-sm">
                                                <Forward size={16} /> Forward
                                            </button>
                                        </div>
                                    ) : (
                                        <div ref={replyEndRef} className="animate-in fade-in slide-in-from-bottom-2">
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Reply size={15} className="text-slate-400" />
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Replying to <span className="font-bold text-slate-900 dark:text-white">{selectedMail.from.name}</span></span>
                                                </div>
                                                <button onClick={() => setIsReplying(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><X size={16} /></button>
                                            </div>

                                            {replyAttachments.length > 0 && (
                                                <div className="mb-2 flex flex-wrap gap-2">
                                                    {replyAttachments.map((att, i) => (
                                                        <div key={i} className="flex items-center gap-2 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs border border-slate-200 dark:border-slate-700">
                                                            <Paperclip size={11} className="text-slate-400" />
                                                            <span className="text-slate-600 dark:text-slate-300 max-w-[100px] truncate">{att.name}</span>
                                                            <button onClick={() => setReplyAttachments(p => p.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500"><X size={11} /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <textarea
                                                value={replyText}
                                                onChange={e => setReplyText(e.target.value)}
                                                placeholder="Write your reply..."
                                                autoFocus
                                                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 resize-none h-32 mb-3 shadow-sm text-sm"
                                            />
                                            <div className="flex justify-between items-center">
                                                <div className="flex gap-2">
                                                    <input type="file" ref={replyFileRef} className="hidden" multiple onChange={e => handleFileAttach(e, setReplyAttachments)} />
                                                    <button onClick={() => replyFileRef.current?.click()} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400 hover:text-primary-600"><Paperclip size={17} /></button>
                                                    <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400"><Image size={17} /></button>
                                                </div>
                                                <button
                                                    onClick={handleSendReply}
                                                    disabled={!replyText.trim()}
                                                    className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm transition-all shadow ${replyText.trim() ? 'bg-primary-600 hover:bg-primary-700 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                                        }`}
                                                >
                                                    <Send size={15} /> Send
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 hidden md:flex flex-col items-center justify-center">
                        <div className="w-28 h-28 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-5">
                            <Mail size={56} className="text-slate-300 dark:text-slate-700" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">No email selected</h3>
                        <p className="text-slate-400 dark:text-slate-500 text-center max-w-xs text-sm">Pick an email from the list or compose a new one.</p>
                    </div>
                )}
            </div>

            {/* ── Compose Modal ── */}
            {isComposeOpen && (
                <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <h3 className="font-bold text-slate-900 dark:text-white">New Message</h3>
                            <div className="flex gap-1">
                                <button onClick={() => setIsComposeOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"><Minus size={16} /></button>
                                <button onClick={() => setIsComposeOpen(false)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"><X size={18} /></button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <div className="border-b border-slate-100 dark:border-slate-800">
                                <input type="text" placeholder="To" value={composeTo} onChange={e => setComposeTo(e.target.value)} className="w-full bg-transparent border-none p-4 text-slate-900 dark:text-white focus:ring-0 placeholder-slate-400 text-sm" />
                            </div>
                            <div className="border-b border-slate-100 dark:border-slate-800">
                                <input type="text" placeholder="Subject" value={composeSubject} onChange={e => setComposeSubject(e.target.value)} className="w-full bg-transparent border-none p-4 text-slate-900 dark:text-white focus:ring-0 placeholder-slate-400 font-semibold text-sm" />
                            </div>

                            {composeAttachments.length > 0 && (
                                <div className="p-4 pb-0 flex flex-wrap gap-2">
                                    {composeAttachments.map((att, i) => (
                                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs border border-slate-200 dark:border-slate-700">
                                            <Paperclip size={11} className="text-slate-400" />
                                            <span className="text-slate-700 dark:text-slate-300 max-w-[120px] truncate">{att.name}</span>
                                            <span className="text-slate-400">{att.size}</span>
                                            <button onClick={() => setComposeAttachments(p => p.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500"><X size={11} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <textarea
                                placeholder="Write your message..."
                                value={composeBody}
                                onChange={e => setComposeBody(e.target.value)}
                                className="w-full min-h-[280px] bg-transparent border-none focus:ring-0 text-slate-800 dark:text-slate-200 resize-none placeholder-slate-400 p-4 leading-relaxed text-sm"
                            />
                        </div>

                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <div className="flex items-center gap-2">
                                <button onClick={handleComposeSend} className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg transition-all text-sm transform active:scale-95">
                                    Send
                                </button>
                                <input type="file" ref={composeFileRef} className="hidden" multiple onChange={e => handleFileAttach(e, setComposeAttachments)} />
                                <button onClick={() => composeFileRef.current?.click()} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-primary-600" title="Attach file"><Paperclip size={18} /></button>
                                <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400"><Image size={18} /></button>
                            </div>
                            <button onClick={() => setIsComposeOpen(false)} className="text-slate-400 hover:text-red-500 p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"><Trash2 size={18} /></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MailDashboard;