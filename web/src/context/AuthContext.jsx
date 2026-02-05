import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await api.get('/auth/profile');
                setUser(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch profile', error);
            // Don't auto-logout on simple refresh error if we want but for now keep it
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            await fetchProfile();
        };
        init();
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
    };

    const register = async (email, password, role) => {
        const response = await api.post('/auth/register', { email, password, role });
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, refreshProfile: fetchProfile }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
