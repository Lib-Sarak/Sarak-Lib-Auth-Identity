import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import api, { authApi, UserProfile } from '@sarak/shared/services/api';

interface AuthContextType {
    user: UserProfile | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
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
                    const profile = await authApi.getProfile();
                    setUser(profile);
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
            // No backend, o campo 'email' é usado para o identificador (pode ser o nome 'Igor')
            const response = await authApi.login({ email: identification, password });
            const { access_token, user_id, username } = response;

            // Persiste utilizando chaves genéricas
            const activeTokenKey = (window as any).SARAK_AUTH_KEY || 'auth_token';
            const activeUserIdKey = 'user_id';
            const activeUsernameKey = 'username';

            localStorage.setItem(activeTokenKey, access_token);
            localStorage.setItem(activeUserIdKey, user_id);
            localStorage.setItem(activeUsernameKey, username);

            setToken(access_token);
            // Pequeno delay e reload forçado para limpar interferência do Google Translate no DOM
            setTimeout(() => {
                window.location.href = window.location.pathname === '/login' ? '/' : window.location.pathname;
            }, 100);
            return { success: true };
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
