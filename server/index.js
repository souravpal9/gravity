import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 5174;
const roomMessages = new Map();
const MAX_HISTORY = 50;

const getRoomHistory = (room) => roomMessages.get(room) || [];

const addRoomMessage = (room, message) => {
    const history = getRoomHistory(room);
    const next = [...history, message].slice(-MAX_HISTORY);
    roomMessages.set(room, next);
};

io.on('connection', (socket) => {
    socket.on('room:join', ({ room, user }) => {
        if (!room) return;
        socket.join(room);
        socket.data.room = room;
        socket.data.user = user;
        socket.emit('room:history', getRoomHistory(room));
        socket.to(room).emit('room:presence', {
            id: user?.id || socket.id,
            name: user?.name || 'Guest',
            status: 'online'
        });
    });

    socket.on('chat:message', (payload) => {
        const room = payload?.room || socket.data.room;
        if (!room || !payload?.text) return;
        const message = {
            id: payload.id,
            room,
            text: payload.text,
            time: payload.time,
            user: payload.user,
            replyTo: payload.replyTo || null
        };
        addRoomMessage(room, message);
        io.to(room).emit('chat:message', message);
    });

    socket.on('mail:send', (payload) => {
        const room = payload?.room || 'mail';
        if (!payload?.subject) return;
        io.to(room).emit('mail:message', payload);
    });

    socket.on('disconnect', () => {
        const room = socket.data.room;
        const user = socket.data.user;
        if (room && user) {
            socket.to(room).emit('room:presence', {
                id: user?.id || socket.id,
                name: user?.name || 'Guest',
                status: 'offline'
            });
        }
    });
});

app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

server.listen(PORT, () => {
    console.log(`Realtime server listening on port ${PORT}`);
});
