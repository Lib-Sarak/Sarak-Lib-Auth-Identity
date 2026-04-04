import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { api, authApi } from '@sarak/lib-shared';

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
    register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    login: (email: string, password?: string) => Promise<{ success: boolean; error?: string; token?: string; user?: any }>;
    logout: () => void;
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
    // Chaves padronizadas para o Ecossistema Sarak Matrix
    const tokenKey = 'sarak_token';
    const userKey = 'sarak_user';

    const [user, setUser] = useState<UserProfile | null>(() => {
        const saved = localStorage.getItem(userKey);
        if (!saved || saved === 'undefined') return null;
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error("Failed to parse user from localStorage", e);
            return null;
        }
    });
    
    const [token, setToken] = useState<string | null>(localStorage.getItem(tokenKey));
    const [loading, setLoading] = useState(true);

    // Load user on startup or token change
    useEffect(() => {
        const fetchMe = async () => {
            if (token) {
                // Atualiza o header do Axios para garantir que a próxima chamada tenha o token
                authApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                try {
                    const response = await authApi.get('/api/auth/me');
                    setUser(response.data);
                    localStorage.setItem(userKey, JSON.stringify(response.data));
                } catch (e) {
                    console.error("Error loading profile:", e);
                    logout();
                }
            } else {
                setUser(null);
                delete authApi.defaults.headers.common['Authorization'];
            }
            setLoading(false);
        };
        fetchMe();
    }, [token]);

    const register = async (email: string, password: string) => {
        try {
            await authApi.post('/api/auth/register', { 
                username: email, 
                email: email, 
                password 
            });
            return { success: true };
        } catch (error: any) {
            console.error('Registration failed:', error);
            return { success: false, error: error.response?.data?.detail || 'Erro ao criar conta.' };
        }
    };

    const login = async (identification: string, password?: string) => {
        try {
            const response = await authApi.post('/api/auth/login', { username: identification, password });
            const { access_token, user: userData } = response.data;

            // Gravação Simétrica (Mesma chave da leitura)
            localStorage.setItem(tokenKey, access_token);
            if (userData) {
                localStorage.setItem(userKey, JSON.stringify(userData));
            }

            // Atualiza o estado e o header global IMEDIATAMENTE
            authApi.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
            setUser(userData);
            setToken(access_token);
            setLoading(false);
            
            return { 
                success: true, 
                token: access_token, 
                user: userData 
            };
        } catch (error: any) {
            console.error('Login failed:', error);
            return { success: false, error: error.response?.data?.detail || 'Usuário ou senha inválidos.' };
        }
    };

    const logout = () => {
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(userKey);
        delete authApi.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
        window.location.href = '/login';
    };

    const value = useMemo(() => ({
        user,
        token,
        loading,
        register,
        login,
        logout
    }), [user, token, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
