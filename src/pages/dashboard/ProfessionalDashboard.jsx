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
                                                        <Reply size={10} /> Replying to {msg.replyTo.user?.name || 'Guest'}
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
