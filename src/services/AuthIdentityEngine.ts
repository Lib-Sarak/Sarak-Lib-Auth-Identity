import { authApi } from '../api/auth-api';

export interface ISarakAuthEngine {
    login: (identification: string, password?: string) => Promise<any>;
    register: (email: string, password: string) => Promise<any>;
    getMe: () => Promise<any>;
}

/**
 * Auth & Identity Engine (Sarak Matrix v5.0)
 * 
 * Implementação padrão do motor de autenticação para o Sarak OS.
 */
export const AuthIdentityEngine: ISarakAuthEngine = {
    login: async (identification: string, password?: string) => {
        try {
            const response = await (authApi as any).post('/auth/login', { 
                username: identification, 
                password 
            });
            const { access_token, user: userData } = response.data;
            
            return { 
                success: true, 
                token: access_token, 
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

    register: async (email: string, password: string) => {
        try {
            await (authApi as any).post('/auth/register', { 
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
            const response = await (authApi as any).get('/auth/me');
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
    }
};
