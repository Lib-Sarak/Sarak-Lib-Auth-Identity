import { authApi } from '../../api/auth-client';
import { maskUserData } from '../../utils/masking';

const formatError = (error: any): string => {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
        return detail.map(d => `${d.loc.join('.')}: ${d.msg}`).join(', ');
    }
    if (typeof detail === 'object' && detail !== null) {
        return JSON.stringify(detail);
    }
    return 'Erro inesperado.';
};

/**
 * AuthFlowService (v7.0)
 * Responsabilidade: Gerenciar ciclos de vida de sessão (Login, Refresh, Logout).
 */
export const AuthFlowService = {
    login: async (identification: string, password?: string, system?: string) => {
        try {
            const response = await (authApi as any).post('/login', { 
                email: identification, 
                password,
                system
            });
            const { access_token, refresh_token, user: userData } = response.data;
            
            return { 
                success: true, 
                token: access_token, 
                refreshToken: refresh_token,
                user: maskUserData(userData),
                status: response.status 
            };
        } catch (error: any) {
            return { 
                success: false, 
                status: error.response?.status,
                error: error.response?.status === 422 
                    ? `Erro de Validação: ${formatError(error)}` 
                    : (error.response?.data?.detail || 'Usuário ou senha inválidos.')
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

    register: async (email: string, password: string, system: string) => {
        try {
            await (authApi as any).post('/register', { 
                username: email, 
                email: email, 
                password,
                system
            });
            return { success: true };
        } catch (error: any) {
            return { 
                success: false, 
                status: error.response?.status,
                error: error.response?.status === 422 
                    ? `Erro de Registro: ${formatError(error)}` 
                    : (error.response?.data?.detail || 'Erro ao criar conta.')
            };
        }
    },

    requestPasswordReset: async (email: string, system: string) => {
        try {
            await (authApi as any).post('/password-reset/request', { email, system });
            return { success: true };
        } catch (error: any) {
            return { success: false, error: formatError(error) };
        }
    },

    confirmPasswordReset: async (token: string, newPassword: string, system: string) => {
        try {
            await (authApi as any).post('/password-reset/confirm', { token, new_password: newPassword, system });
            return { success: true };
        } catch (error: any) {
            return { success: false, error: formatError(error) };
        }
    },

    getOAuthLoginUrl: async (provider: string, system: string) => {
        try {
            const response = await (authApi as any).get(`/oauth/${provider}/login`, { params: { system } });
            return { success: true, url: response.data.url };
        } catch (error: any) {
            return { success: false, error: formatError(error) };
        }
    },

    processOAuthCallback: async (provider: string, code: string, system: string) => {
        try {
            const response = await (authApi as any).post(`/oauth/${provider}/callback`, { code, system });
            return { 
                success: true, 
                token: response.data.access_token,
                refreshToken: response.data.refresh_token,
                user: maskUserData(response.data.user)
            };
        } catch (error: any) {
            return { success: false, error: formatError(error) };
        }
    }
};
