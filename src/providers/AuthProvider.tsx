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

export const AuthProvider = ({ children, system = 'global' }: { children: ReactNode, system?: string }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem(`${system}_token`));
    const [loading, setLoading] = useState(true);
    const [isHydrated, setIsHydrated] = useState(false);

    const logout = useCallback(async () => {
        const refreshToken = localStorage.getItem(`${system}_refresh_token`);
        if (refreshToken) {
            await AuthFlowService.logout(refreshToken);
        }
        setToken(null);
        setUser(null);
        localStorage.removeItem(`${system}_token`);
        localStorage.removeItem(`${system}_refresh_token`);
        localStorage.removeItem(`${system}_user`);
        window.location.href = '/login';
    }, [system]);

    const login = async (identification: string, password?: string) => {
        setLoading(true);
        try {
            const result = await AuthFlowService.login(identification, password, system);
            
            if (result.success) {
                if (result.mfa_required) {
                    setLoading(false);
                    return { 
                        success: true, 
                        mfa_required: true, 
                        mfa_token: result.mfa_token,
                        user: result.user 
                    };
                }

                setToken(result.token);
                setUser(result.user);
                localStorage.setItem(`${system}_token`, result.token!);
                localStorage.setItem(`${system}_refresh_token`, result.refreshToken!);
                localStorage.setItem(`${system}_user`, JSON.stringify(result.user));
                
                // Log interaction
                InteractionService.logInteraction(system, 'auth', 'login_success', { username: identification });
                
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

    const verifyMFA = async (mfaToken: string, code: string) => {
        setLoading(true);
        try {
            const result = await AuthFlowService.verifyMFA(mfaToken, code, system);
            if (result.success) {
                setToken(result.token!);
                setUser(result.user);
                localStorage.setItem(`${system}_token`, result.token!);
                localStorage.setItem(`${system}_refresh_token`, result.refreshToken!);
                localStorage.setItem(`${system}_user`, JSON.stringify(result.user));
                
                InteractionService.logInteraction(system, 'auth', 'login_mfa_success', { user_id: result.user?.user_id });
                
                setLoading(false);
                return { success: true, token: result.token, user: result.user };
            } else {
                setLoading(false);
                return { success: false, error: result.error };
            }
        } catch (error) {
            setLoading(false);
            return { success: false, error: 'Erro ao verificar código MFA' };
        }
    };

    const setupMFA = async () => {
        return await AuthFlowService.setupMFA();
    };

    const enableMFA = async (code: string) => {
        return await AuthFlowService.enableMFA(code);
    };

    const registerAPI = async (email: string, password: string) => {
        return await AuthFlowService.register(email, password, system);
    };

    // Auto-refresh mechanism
    const refreshToken = useCallback(async () => {
        const storedRefreshToken = localStorage.getItem(`${system}_refresh_token`);
        if (!storedRefreshToken) return false;

        const result = await AuthFlowService.refresh(storedRefreshToken);
        if (result.success) {
            setToken(result.token);
            localStorage.setItem(`${system}_token`, result.token);
            return true;
        } else {
            logout();
            return false;
        }
    }, [logout, system]);

    // Hydration
    useEffect(() => {
        const storedUser = localStorage.getItem(`${system}_user`);
        if (storedUser && storedUser !== 'undefined') {
            setUser(JSON.parse(storedUser));
        }
        setIsHydrated(true);
        setLoading(false);
    }, [system]);

    const value = useMemo(() => ({
        user,
        token,
        loading,
        isHydrated,
        register: registerAPI,
        login,
        verifyMFA,
        setupMFA,
        enableMFA,
        logout,
        refreshToken,
        logInteraction: InteractionService.logInteraction,
        authApi
    }), [user, token, loading, isHydrated, logout, refreshToken, verifyMFA, setupMFA, enableMFA]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
