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
    const tokenKey = (window as any).SARAK_AUTH_KEY || 'auth_token';
    const [user, setUser] = useState<UserProfile | null>(null);
    const [token, setToken] = useState<string | null>(
        localStorage.getItem(tokenKey) || 
        sessionStorage.getItem(tokenKey)
    );
    const [loading, setLoading] = useState(true);

    // Load user on startup or token change
    useEffect(() => {
        const fetchMe = async () => {
            if (token) {
                try {
                    const response = await authApi.get('/api/auth/me');
                    setUser(response.data);
                } catch (e) {
                    console.error("Error loading profile:", e);
                    logout();
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        };
        fetchMe();
    }, [token]);

    const login = async (identification: string, password?: string) => {
        try {
            // No backend, o contrato Pydantic espera 'username'
            const response = await authApi.post('/api/auth/login', { username: identification, password });
            const { access_token, user: userData } = response.data;

            // Sincronização com a Sarak Matrix v3 (SarakProvider)
            const isUnified = (window as any).SARAK_UNIFIED_AUTH === true;
            const systemId = (window as any).SARAK_SYSTEM_ID || 'sarak';
            
            const activeTokenKey = isUnified ? 'sarak_token' : `${systemId}_token`;
            const activeUserKey = isUnified ? 'sarak_user' : `${systemId}_user`;

            localStorage.setItem(activeTokenKey, access_token);
            if (userData) {
                localStorage.setItem(activeUserKey, JSON.stringify(userData));
            }

            setToken(access_token);
            
            // Retornamos os dados para que o componente Login possa sincronizar o Sarak OS Core
            return { 
                success: true, 
                token: access_token, 
                user: userData 
            };
        } catch (error: any) {
            console.error('Login failed:', error);
            
            let message = error.response?.data?.detail || 'Usuário ou senha inválidos.';
            
            // Se o FastAPI retornar um erro de validação (lista/objeto), converte para string
            if (typeof message === 'object') {
                message = 'Erro nos dados de login. Verifique os campos.';
            }
            
            return { success: false, error: message };
        }
    };

    const logout = () => {
        const activeTokenKey = (window as any).SARAK_AUTH_KEY || 'auth_token';
        const activeUserIdKey = 'user_id';
        const activeUsernameKey = 'username';

        const keysToRemove = [activeTokenKey, activeUserIdKey, activeUsernameKey];
        keysToRemove.forEach(k => {
            localStorage.removeItem(k);
            sessionStorage.removeItem(k);
        });
        setToken(null);
        setUser(null);
        
        // Reload para limpar o resto da aplicação e widgets externos
        window.location.href = '/login';
    };

    const value = useMemo(() => ({
        user,
        token,
        loading,
        login,
        logout
    }), [user, token, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
