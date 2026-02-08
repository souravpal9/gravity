import { useEffect, useMemo, useRef, useState } from 'react';
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
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            setStatus('offline');
            return;
        }

        // Initialize with mock messages if provided
        if (mockMessages && mockMessages.length > 0) {
            setMessages(mockMessages);
        } else {
            setMessages([]);
        }

        const socket = io(serverUrl, { transports: ['websocket'] });
        socketRef.current = socket;

        socket.on('connect', () => {
            setStatus('online');
            socket.emit('room:join', { room, user });
        });

        socket.on('disconnect', () => {
            setStatus('offline');
        });

        socket.on('room:history', (history) => {
            setMessages(Array.isArray(history) ? history : []);
        });

        socket.on('chat:message', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            socket.disconnect();
        };
    }, [room, serverUrl, user]);

    const sendMessage = (text, options = {}) => {
        if (!text.trim()) return;
        const message = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            room,
            text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            user: {
                id: user?.id || 'guest',
                name: user?.name || 'Guest'
            },
            replyTo: options.replyTo || null
        };

        // Optimistic update
        setMessages((prev) => [...prev, message]);

        if (socketRef.current) {
            socketRef.current.emit('chat:message', message);
        }
    };

    return { messages, sendMessage, status };
};
