import { authApi } from '../api/auth-api';

export interface ISarakAuthEngine {
    login: (identification: string, password?: string) => Promise<any>;
    register: (email: string, password: string) => Promise<any>;
    getMe: () => Promise<any>;
    refresh: (refreshToken: string) => Promise<any>;
    logout: (refreshToken: string) => Promise<any>;
    logInteraction: (moduleId: string, action: string, payload?: any) => Promise<void>;
}

/**
 * Sovereign Identity Engine (v6.8)
 * 
 * Implementação do motor de autenticação e rastreamento de interações.
 */
export const AuthIdentityEngine: ISarakAuthEngine = {
    login: async (identification: string, password?: string) => {
        try {
            const response = await (authApi as any).post('/login', { 
                email: identification, 
                password 
            });
            const { access_token, refresh_token, user: userData } = response.data;
            
            return { 
                success: true, 
                token: access_token, 
                refreshToken: refresh_token,
                user: userData,
                status: response.status 
            };
        } catch (error: any) {
            return { 
                success: false, 
                status: error.response?.status,
                error: error.response?.data?.detail || 'Usuário ou senha inválidos.' 
            };
        }
    },

    refresh: async (refreshToken: string) => {
        try {
            const response = await (authApi as any).post('/refresh', { refresh_token: refreshToken });
            return { success: true, token: response.data.access_token };
        } catch (error) {
            return { success: false };
        }
    },

    logout: async (refreshToken: string) => {
        try {
            await (authApi as any).post('/logout', { refresh_token: refreshToken });
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    },

    register: async (email: string, password: string) => {
        try {
            await (authApi as any).post('/register', { 
                username: email, 
                email: email, 
                password 
            });
            return { success: true };
        } catch (error: any) {
            return { 
                success: false, 
                status: error.response?.status,
                error: error.response?.data?.detail || 'Erro ao criar conta.' 
            };
        }
    },

    getMe: async () => {
        try {
            const response = await (authApi as any).get('/me');
            return { 
                success: true, 
                user: response.data,
                status: response.status
            };
        } catch (error: any) {
            return { 
                success: false,
                status: error.response?.status
            };
        }
    },

    logInteraction: async (moduleId: string, action: string, payload?: any) => {
        // Safe access to env variables (Vite/Webpack compatible)
        const INTERACTION_MODE = (window as any)._env_?.SARAK_INTERACTION_MODE || 
                                 (import.meta as any).env?.VITE_SARAK_INTERACTION_MODE || 
                                 'local';
        
        const event = {
            moduleId,
            action,
            payload,
            timestamp: new Date().toISOString()
        };

        if (INTERACTION_MODE === 'db') {
            try {
                await (authApi as any).post('/interactions', {
                    module_id: moduleId,
                    action,
                    payload
                });
            } catch (error) {
                console.error('[Identity] Failed to sync interaction to DB, falling back to local.', error);
                saveToLocal(event);
            }
        } else {
            saveToLocal(event);
        }
    }
};

function saveToLocal(event: any) {
    const history = JSON.parse(localStorage.getItem('sarak_interaction_history') || '[]');
    history.push(event);
    localStorage.setItem('sarak_interaction_history', JSON.stringify(history.slice(-100))); // Keep last 100
}
