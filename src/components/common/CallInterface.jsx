import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Maximize2, Minimize2 } from 'lucide-react';

const CallInterface = ({
    isOpen,
    onClose,
    userInfo = { name: 'Unknown User', image: null },
    type = 'voice' // 'voice' or 'video'
}) => {
    const [callStatus, setCallStatus] = useState('calling'); // calling, connected, ended
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(type === 'voice');
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setCallStatus('calling');
            setDuration(0);
            return;
        }

        // Simulate connection after 2 seconds
        const connectTimer = setTimeout(() => {
            setCallStatus('connected');
        }, 2000);

        return () => clearTimeout(connectTimer);
    }, [isOpen]);

    useEffect(() => {
        let timer;
        if (callStatus === 'connected' && isOpen) {
            timer = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [callStatus, isOpen]);

    if (!isOpen) return null;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleEndCall = () => {
        setCallStatus('ended');
        setTimeout(() => {
            onClose();
        }, 1000);
    };

    if (isMinimized) {
        return (
            <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${callStatus === 'connected' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
                    {type === 'video' ? <Video size={20} /> : <Mic size={20} />}
                </div>
                <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{userInfo.name}</h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                        {callStatus === 'connected' ? formatTime(duration) : 'Calling...'}
                    </span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsMinimized(false)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-800 dark:hover:text-white"
                    >
                        <Maximize2 size={18} />
                    </button>
                    <button
                        onClick={handleEndCall}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-full"
                    >
                        <PhoneOff size={18} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
                {/* Header */}
                <div className="absolute top-4 right-4 z-10">
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/70 hover:text-white backdrop-blur-sm transition-colors"
                    >
                        <Minimize2 size={20} />
                    </button>
                </div>

                {/* Main Content */}
                <div className="h-[500px] relative flex flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-900 to-slate-950">
                    {/* Background Pattern or Video Placeholder */}
                    {type === 'video' && !isVideoOff && callStatus === 'connected' ? (
                        <div className="absolute inset-0 bg-slate-800 flex items-center justify-center text-slate-600">
                            {/* In a real app, this would be the video stream */}
                            <Video size={64} className="opacity-20 animate-pulse" />
                        </div>
                    ) : (
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800/50 via-slate-900 to-slate-950" />
                    )}

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full border-4 border-slate-800 bg-slate-800 overflow-hidden mb-6 shadow-xl relative">
                            {userInfo.image ? (
                                <img src={userInfo.image} alt={userInfo.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                                    <span className="text-4xl font-bold">{userInfo.name.charAt(0)}</span>
                                </div>
                            )}
                            {callStatus === 'calling' && (
                                <div className="absolute inset-0 border-4 border-emerald-500/50 rounded-full animate-ping" />
                            )}
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2">{userInfo.name}</h2>
                        <p className={`text-lg font-medium ${callStatus === 'ended' ? 'text-red-400' : 'text-emerald-400'}`}>
                            {callStatus === 'calling' && 'Calling...'}
                            {callStatus === 'connected' && formatTime(duration)}
                            {callStatus === 'ended' && 'Call Ended'}
                        </p>
                    </div>
                </div>

                {/* Controls */}
                <div className="p-6 bg-slate-900 border-t border-slate-800 flex justify-center items-center gap-6">
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-4 rounded-full transition-all ${isMuted ? 'bg-white text-slate-900' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                    >
                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>

                    <button
                        onClick={handleEndCall}
                        className="p-5 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 transform hover:scale-105 transition-all"
                    >
                        <PhoneOff size={32} />
                    </button>

                    <button
                        onClick={() => setIsVideoOff(!isVideoOff)}
                        className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-white text-slate-900' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                    >
                        {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CallInterface;
