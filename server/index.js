import express from 'express';
import http from 'http';
import cors from 'cors';
import { randomUUID } from 'crypto';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';

const io = new Server(server, {
    cors: {
        origin: ALLOWED_ORIGIN,
        methods: ['GET', 'POST'],
    },
});

const PORT = process.env.PORT || 5174;
const roomMessages = new Map();
const MAX_HISTORY = 50;
const MAX_MESSAGE_LENGTH = 2000;

// Rate limiting: max 1 message per 500ms per socket
const lastMessageTime = new Map();

const getRoomHistory = (room) => roomMessages.get(room) || [];

const addRoomMessage = (room, message) => {
    const next = [...getRoomHistory(room), message].slice(-MAX_HISTORY);
    roomMessages.set(room, next);
};

const cleanupRoom = (room) => {
    const clients = io.sockets.adapter.rooms.get(room);
    if (!clients || clients.size === 0) {
        roomMessages.delete(room);
    }
};

io.on('connection', (socket) => {
    socket.on('room:join', ({ room, user }) => {
        if (!room || typeof room !== 'string' || room.length > 100) return;

        socket.join(room);
        socket.data.room = room;
        socket.data.user = user;

        socket.emit('room:history', getRoomHistory(room));

        socket.to(room).emit('room:presence', {
            id: user?.id || socket.id,
            name: user?.name || 'Guest',
            status: 'online',
        });
    });

    socket.on('chat:message', (payload) => {
        // Rate limit
        const now = Date.now();
        const last = lastMessageTime.get(socket.id) || 0;
        if (now - last < 500) return;
        lastMessageTime.set(socket.id, now);

        const room = payload?.room || socket.data.room;
        const text = payload?.text;

        if (!room || !text || typeof text !== 'string') return;
        if (text.trim().length === 0 || text.length > MAX_MESSAGE_LENGTH) return;

        const message = {
            // Server-generated ID — never trust client-supplied IDs
            id: randomUUID(),
            room,
            text: text.trim(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            user: {
                id: socket.data.user?.id || socket.id,
                name: socket.data.user?.name || 'Guest',
            },
            replyTo: payload.replyTo || null,
        };

        addRoomMessage(room, message);
        // socket.to(room) = everyone in room EXCEPT sender (prevents double-message)
        socket.to(room).emit('chat:message', message);
    });

    socket.on('mail:send', (payload) => {
        if (
            !payload?.subject ||
            typeof payload.subject !== 'string' ||
            !payload?.to ||
            typeof payload.to !== 'string'
        ) return;

        const room = 'mail';
        io.to(room).emit('mail:message', {
            from: {
                id: socket.data.user?.id || socket.id,
                name: socket.data.user?.name || 'Guest',
                email: socket.data.user?.email || '',
            },
            to: payload.to,
            subject: payload.subject.slice(0, 200),
            body: (payload.body || '').slice(0, 10000),
            room,
        });
    });

    socket.on('disconnect', () => {
        const room = socket.data.room;
        const user = socket.data.user;

        lastMessageTime.delete(socket.id);

        if (room && user) {
            socket.to(room).emit('room:presence', {
                id: user?.id || socket.id,
                name: user?.name || 'Guest',
                status: 'offline',
            });
            // Clean up empty rooms to prevent memory leak
            setImmediate(() => cleanupRoom(room));
        }
    });
});

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', rooms: roomMessages.size });
});

server.listen(PORT, () => {
    console.log(`Realtime server listening on port ${PORT}`);
    console.log(`CORS allowed origin: ${ALLOWED_ORIGIN}`);
});