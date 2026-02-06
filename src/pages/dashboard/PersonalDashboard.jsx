                                {/* Messages */}
                                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-primary-50/60 dark:bg-slate-950/30">
                                    {messages.length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                                            <MessageCircle size={44} className="mb-3 opacity-40" />
                                            <p className="text-sm">Start the conversation with a friendly hello.</p>
                                        </div>
                                    )}
                                    {messages.map((msg) => {
                                        const isMe = msg.user?.id === user?.id;
                                        return (
                                            <div key={msg.id} className={`flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                                                <div className={`flex items-center gap-2 text-xs ${isMe ? 'text-primary-600 dark:text-primary-300' : 'text-slate-500 dark:text-slate-400'}`}>
                                                    <span className="font-semibold">{isMe ? 'You' : msg.user?.name || 'Friend'}</span>
                                                    <span>{msg.time}</span>
                                                </div>
                                                <div className={`group relative flex items-center gap-2 max-w-[85%] md:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>

                                                    {/* Message Bubble */}
                                                    <div className={`relative px-4 py-2 rounded-2xl shadow-sm ${isMe
                                                        ? 'bg-primary-600 text-white rounded-tr-none'
                                                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700/60 rounded-tl-none'
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
