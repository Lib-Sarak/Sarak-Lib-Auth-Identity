import { authApi } from '../../api/auth-client';

/**
 * AuthFlowService (v7.0)
 * Responsabilidade: Gerenciar ciclos de vida de sessão (Login, Refresh, Logout).
 */
export const AuthFlowService = {
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
    }
};
