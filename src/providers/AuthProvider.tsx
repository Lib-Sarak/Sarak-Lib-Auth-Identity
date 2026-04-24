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

    const getOAuthLoginUrl = async (provider: string) => {
        return await AuthFlowService.getOAuthLoginUrl(provider, system);
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
        const hydrate = async () => {
            // 1. Capture OAuth Tokens from URL Fragment (#token=...&refresh=...)
            const hash = window.location.hash;
            let currentToken = token;

            if (hash.includes('token=')) {
                const params = new URLSearchParams(hash.substring(1));
                const urlToken = params.get('token');
                const urlRefresh = params.get('refresh');

                if (urlToken && urlRefresh) {
                    currentToken = urlToken;
                    setToken(urlToken);
                    localStorage.setItem(`${system}_token`, urlToken);
                    localStorage.setItem(`${system}_refresh_token`, urlRefresh);
                    
                    window.history.replaceState(null, '', window.location.pathname + window.location.search);
                    InteractionService.logInteraction(system, 'auth', 'oauth_capture_success', { method: 'hash' });
                }
            }

            // 2. Fetch/Refresh User Profile if we have a token
            if (currentToken) {
                try {
                    // We use authApi directly to get the current profile
                    const response = await authApi.get('/me');
                    const profile = response.data;
                    setUser(profile);
                    localStorage.setItem(`${system}_user`, JSON.stringify(profile));
                } catch (error) {
                    console.error("Failed to fetch user profile", error);
                    // If token is invalid, we might want to clear it, 
                    // but for now let's just use the stored user as fallback
                    const storedUser = localStorage.getItem(`${system}_user`);
                    if (storedUser && storedUser !== 'undefined') {
                        setUser(JSON.parse(storedUser));
                    }
                }
            } else {
                const storedUser = localStorage.getItem(`${system}_user`);
                if (storedUser && storedUser !== 'undefined') {
                    setUser(JSON.parse(storedUser));
                }
            }
            
            setIsHydrated(true);
            setLoading(false);
        };

        hydrate();
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
        getOAuthLoginUrl,
        logInteraction: InteractionService.logInteraction,
        authApi
    }), [user, token, loading, isHydrated, logout, refreshToken, verifyMFA, setupMFA, enableMFA, getOAuthLoginUrl]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
