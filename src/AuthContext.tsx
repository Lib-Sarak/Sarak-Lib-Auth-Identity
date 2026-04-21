import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
// Sarak Matrix v5.5: authApi e api agora são providos via props ou importados de serviço local
// Sarak Matrix v5.5: authApi e api agora são importados do serviço local do módulo
import { api, authApi } from './api';

export interface UserProfile {
    id: string | number;
    username: string;
    email?: string;
    full_name?: string;
    [key: string]: any;
}

interface AuthContextType {
    user: UserProfile | null;
    token: string | null;
    loading: boolean;
    isHydrated: boolean; // Flag de proteção contra flickering
    register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    login: (email: string, password?: string) => Promise<{ success: boolean; error?: string; token?: string; user?: any }>;
    logout: () => void;
    authApi: any; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('sarak_token'));
    const [loading, setLoading] = useState(true);
    const [isHydrated, setIsHydrated] = useState(false);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('sarak_token');
        localStorage.removeItem('sarak_user');
        window.location.href = '/login';
    }, []);

    const login = async (identification: string, password?: string) => {
        setLoading(true);
        try {
            const response = await authApi.post('/auth/login', { email: identification, password });
            if (response.data && response.data.access_token) {
                const newToken = response.data.access_token;
                const newUser = response.data.user;
                setToken(newToken);
                setUser(newUser);
                localStorage.setItem('sarak_token', newToken);
                localStorage.setItem('sarak_user', JSON.stringify(newUser));
                return { success: true, token: newToken, user: newUser };
            }
            return { success: false, error: 'Falha no login' };
        } catch (err: any) {
            let errorMessage = err.message;
            if (err.response?.data?.detail) {
                const detail = err.response.data.detail;
                errorMessage = typeof detail === 'string' ? detail : JSON.stringify(detail);
            }
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const registerAPI = async (email: string, password: string) => {
        try {
            await authApi.post('/auth/register', { email, password });
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.detail || err.message };
        }
    };

    // Hydration
    useEffect(() => {
        const storedUser = localStorage.getItem('sarak_user');
        if (storedUser && storedUser !== 'undefined') {
            setUser(JSON.parse(storedUser));
        }
        setIsHydrated(true);
        setLoading(false);
    }, []);

    const value = useMemo(() => ({
        user,
        token,
        loading,
        isHydrated,
        register: registerAPI,
        login,
        logout,
        authApi
    }), [user, token, loading, isHydrated]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
