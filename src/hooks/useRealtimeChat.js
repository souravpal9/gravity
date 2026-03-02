import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const DEFAULT_SERVER_URL = 'http://localhost:5174';

export const useRealtimeChat = ({ room, user, mockMessages = [] }) => {
    const [messages, setMessages] = useState([]);
    const [status, setStatus] = useState('connecting');
    const socketRef = useRef(null);

    const serverUrl = useMemo(
        () => import.meta.env.VITE_BACKEND_URL || DEFAULT_SERVER_URL,
        []
    );

    useEffect(() => {
        if (!room) {
            socketRef.current?.disconnect();
            socketRef.current = null;
            setStatus('offline');
            return;
        }

        setMessages(mockMessages.length > 0 ? [...mockMessages] : []);

        const socket = io(serverUrl, { transports: ['websocket'] });
        socketRef.current = socket;

        socket.on('connect', () => {
            setStatus('online');
            socket.emit('room:join', { room, user });
        });

        socket.on('connect_error', () => setStatus('offline'));
        socket.on('disconnect', () => setStatus('offline'));

        socket.on('room:history', (history) => {
            if (Array.isArray(history) && history.length > 0) {
                setMessages(history);
            }
        });

        // Only OTHER users messages arrive here.
        // Server uses socket.to(room) which excludes the sender.
        socket.on('chat:message', (message) => {
            setMessages(prev => [...prev, message]);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [room, serverUrl]);

    const sendMessage = useCallback((text, options = {}) => {
        if (!text?.trim()) return;

        const message = {
            id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            room,
            text: text.trim(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            user: { id: user?.id || 'guest', name: user?.name || 'Guest' },
            replyTo: options.replyTo || null,
        };

        // Optimistic update - server won't echo back to sender
        setMessages(prev => [...prev, message]);

        if (socketRef.current?.connected) {
            socketRef.current.emit('chat:message', {
                room,
                text: message.text,
                time: message.time,
                user: message.user,
                replyTo: message.replyTo,
            });
        }
    }, [room, user]);

    return { messages, sendMessage, status };
};