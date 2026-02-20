import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Restaurar usuario desde localStorage
        const token = localStorage.getItem('token');
        const usuarioGuardado = localStorage.getItem('usuario');

        if (token && usuarioGuardado) {
            setUser(JSON.parse(usuarioGuardado));
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('usuario', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={[user, setUser, { login, logout }]}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
