import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import { authApi } from '../api/auth-client';
import { AuthContextType } from '../types/auth';
import { UserProfile } from '../types/models/user';
import { AuthFlowService } from '../services/auth/AuthFlowService';
import { InteractionService } from '../services/audit/InteractionService';

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

    const logout = useCallback(async () => {
        const refreshToken = localStorage.getItem('sarak_refresh_token');
        if (refreshToken) {
            await AuthFlowService.logout(refreshToken);
        }
        setToken(null);
        setUser(null);
        localStorage.removeItem('sarak_token');
        localStorage.removeItem('sarak_refresh_token');
        localStorage.removeItem('sarak_user');
        window.location.href = '/login';
    }, []);

    const login = async (identification: string, password?: string) => {
        setLoading(true);
        try {
            const result = await AuthFlowService.login(identification, password);
            
            if (result.success) {
                setToken(result.token);
                setUser(result.user);
                localStorage.setItem('sarak_token', result.token);
                localStorage.setItem('sarak_refresh_token', result.refreshToken);
                localStorage.setItem('sarak_user', JSON.stringify(result.user));
                
                // Log interaction
                InteractionService.logInteraction('auth', 'login_success', { username: identification });
                
                setLoading(false);
                return { success: true, token: result.token, user: result.user };
            } else {
                setLoading(false);
                return { success: false, error: result.error };
            }
        } catch (error) {
            setLoading(false);
            return { success: false, error: 'Erro inesperado na autenticação' };
        }
    };

    const registerAPI = async (email: string, password: string) => {
        return await AuthFlowService.register(email, password);
    };

    // Auto-refresh mechanism
    const refreshToken = useCallback(async () => {
        const storedRefreshToken = localStorage.getItem('sarak_refresh_token');
        if (!storedRefreshToken) return false;

        const result = await AuthFlowService.refresh(storedRefreshToken);
        if (result.success) {
            setToken(result.token);
            localStorage.setItem('sarak_token', result.token);
            return true;
        } else {
            logout();
            return false;
        }
    }, [logout]);

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
        refreshToken,
        logInteraction: InteractionService.logInteraction,
        authApi
    }), [user, token, loading, isHydrated, logout, refreshToken]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
