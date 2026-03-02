import React, { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext();

const USERS_KEY = 'gravity_users';
const SESSION_KEY = 'gravity_session';

const readUsers = () => {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
    catch { return []; }
};
const writeUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

const readSession = () => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
    catch { return null; }
};
const writeSession = (session) => {
    if (!session) { localStorage.removeItem(SESSION_KEY); return; }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

const resolveSessionUser = () => {
    const session = readSession();
    if (!session?.email) return null;
    return readUsers().find(u => u.email === session.email) || null;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => resolveSessionUser());
    const [isLoading] = useState(false);
    const [error, setError] = useState('');

    const signup = ({ name, email, password, mode }) => {
        setError('');
        const users = readUsers();
        const normalizedEmail = email.trim().toLowerCase();
        if (users.some(u => u.email === normalizedEmail)) {
            setError('An account with this email already exists.');
            return { ok: false };
        }
        const newUser = {
            id: crypto.randomUUID(),
            name: name.trim(),
            email: normalizedEmail,
            password,
            mode,
        };
        writeUsers([...users, newUser]);
        writeSession({ email: newUser.email });
        setUser(newUser);
        return { ok: true, user: newUser };
    };

    const login = ({ email, password }) => {
        setError('');
        const normalizedEmail = email.trim().toLowerCase();
        const matched = readUsers().find(
            u => u.email === normalizedEmail && u.password === password
        );
        if (!matched) {
            setError('Invalid email or password.');
            return { ok: false };
        }
        writeSession({ email: matched.email });
        setUser(matched);
        return { ok: true, user: matched };
    };

    const logout = () => {
        writeSession(null);
        setUser(null);
    };

    // Update profile (name, email, password)
    const updateUser = (updates) => {
        if (!user) return { ok: false };
        const users = readUsers();
        const idx = users.findIndex(u => u.email === user.email);
        if (idx === -1) return { ok: false };

        // If email is changing, make sure it isn't taken by someone else
        if (updates.email && updates.email !== user.email) {
            const taken = users.some(
                (u, i) => i !== idx && u.email === updates.email.trim().toLowerCase()
            );
            if (taken) return { ok: false, error: 'Email already in use.' };
        }

        const updatedUser = {
            ...users[idx],
            ...updates,
            email: (updates.email || users[idx].email).trim().toLowerCase(),
            name: (updates.name || users[idx].name).trim(),
        };

        users[idx] = updatedUser;
        writeUsers(users);

        // Keep session pointing to current email
        writeSession({ email: updatedUser.email });
        setUser(updatedUser);
        return { ok: true, user: updatedUser };
    };

    const value = useMemo(() => ({
        user, error, isLoading,
        signup, login, logout, updateUser,
        isAuthenticated: Boolean(user),
    }), [user, error, isLoading]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);