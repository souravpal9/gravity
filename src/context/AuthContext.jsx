import React, { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext();

const USERS_KEY = 'gravity_users';
const SESSION_KEY = 'gravity_session';

const readUsers = () => {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
};

const writeUsers = (users) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const readSession = () => {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
};

const writeSession = (session) => {
    if (!session) {
        localStorage.removeItem(SESSION_KEY);
        return;
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

const resolveSessionUser = () => {
    const session = readSession();
    if (!session?.email) return null;
    const users = readUsers();
    return users.find((user) => user.email === session.email) || null;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => resolveSessionUser());
    const [error, setError] = useState('');

    const signup = ({ name, email, password, mode }) => {
        setError('');
        const users = readUsers();
        const normalizedEmail = email.trim().toLowerCase();
        if (users.some((existing) => existing.email === normalizedEmail)) {
            setError('An account with this email already exists.');
            return { ok: false };
        }

        const newUser = {
            id: crypto.randomUUID(),
            name: name.trim(),
            email: normalizedEmail,
            password,
            mode
        };
        const nextUsers = [...users, newUser];
        writeUsers(nextUsers);
        writeSession({ email: newUser.email });
        setUser(newUser);
        return { ok: true, user: newUser };
    };

    const login = ({ email, password }) => {
        setError('');
        const users = readUsers();
        const normalizedEmail = email.trim().toLowerCase();
        const matchedUser = users.find(
            (existing) => existing.email === normalizedEmail && existing.password === password
        );

        if (!matchedUser) {
            setError('Invalid email or password.');
            return { ok: false };
        }

        writeSession({ email: matchedUser.email });
        setUser(matchedUser);
        return { ok: true, user: matchedUser };
    };

    const logout = () => {
        writeSession(null);
        setUser(null);
    };

    const value = useMemo(
        () => ({
            user,
            error,
            signup,
            login,
            logout,
            isAuthenticated: Boolean(user)
        }),
        [user, error]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
