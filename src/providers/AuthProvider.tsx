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
    
    // Injeção de soberania para interceptores de rede (v7.0)
    if (typeof window !== 'undefined') {
        (window as any).__SARAK_SYSTEM__ = system;
    }

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
        
        // Redirecionamento inteligente: prioriza a raiz do sistema atual (v8.2)
        const loginPath = (window as any).__SARAK_LOGIN_PATH__ || '/login';
        window.location.href = loginPath;
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
                setUser(result.user as any);
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
                setUser(result.user as any);
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
                    const response = await authApi.get('me');
                    const profile = response.data;
                    setUser(profile);
                    localStorage.setItem(`${system}_user`, JSON.stringify(profile));
                } catch (error: any) {
                    const status = error.response?.status;
                    console.warn(`[AuthProvider] Falha na validação da sessão (Status: ${status || 'Network Error'})`);

                    // Se falhou (401, 403 ou erro de rede ao validar), limpamos a sessão para segurança
                    localStorage.removeItem(`${system}_token`);
                    localStorage.removeItem(`${system}_refresh_token`);
                    localStorage.removeItem(`${system}_user`);
                    setUser(null);
                    setToken(null);
                }
            } else {
                // Se não há token, garantimos que não haja usuário (v8.3)
                setUser(null);
                localStorage.removeItem(`${system}_user`);
            }
            
            setIsHydrated(true);
            setLoading(false);
        };

        hydrate();
    }, [system]);

    // --- Idle Timeout Logic (v10.5) ---
    useEffect(() => {
        // Só monitoramos se o usuário estiver logado e hidratado
        if (!user || !token || !isHydrated) return;

        let idleTimer: NodeJS.Timeout;
        // Padrão: 60 minutos (pode ser expandido para ler do manifest no futuro)
        const IDLE_TIME_LIMIT = 60 * 60 * 1000; 

        const resetTimer = () => {
            if (idleTimer) clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                console.warn('[AuthProvider] Sessão encerrada por inatividade (1h)');
                logout();
            }, IDLE_TIME_LIMIT);
        };

        // Eventos que indicam atividade humana real
        const activityEvents = [
            'mousedown', 'mousemove', 'keypress', 
            'scroll', 'touchstart', 'click'
        ];
        
        activityEvents.forEach(event => 
            window.addEventListener(event, resetTimer, { passive: true })
        );

        // Início imediato do timer ao logar/hidratar
        resetTimer();

        return () => {
            if (idleTimer) clearTimeout(idleTimer);
            activityEvents.forEach(event => 
                window.removeEventListener(event, resetTimer)
            );
        };
    }, [user, token, isHydrated, logout]);

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
