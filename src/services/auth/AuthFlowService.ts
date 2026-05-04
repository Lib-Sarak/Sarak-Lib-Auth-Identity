import { authApi } from '../../api/auth-client';
import { maskUserData } from '../../utils/masking';
import manifest from '../../../manifest.json';

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
 * AuthFlowService (v8.0)
 * Responsabilidade: Gerenciar ciclos de vida de sessão baseado em Manifesto.
 */
export const AuthFlowService = {
    login: async (identification: string, password?: string, system?: string) => {
        try {
            const response = await authApi.post(manifest.endpoints.v1.login, { 
                email: identification, 
                password,
                system
            });

            // Handle MFA challenge (v7.7) - Status lido do contrato do manifesto
            if (response.data.status === manifest.capabilities.security.mfa.challengeStatus) {
                return {
                    success: true,
                    mfa_required: true,
                    mfa_token: response.data.mfa_token,
                    user: response.data.user
                };
            }

            const { access_token, refresh_token, user: userData } = response.data;
            
            return { 
                success: true, 
                token: access_token, 
                refreshToken: refresh_token,
                user: maskUserData(userData),
                status: response.status 
            };
        } catch (error: any) {
            const status = error.response?.status;
            
            if (status === manifest.capabilities.security.rateLimit.handleStatus) {
                return {
                    success: false,
                    status: 429,
                    isRateLimited: true,
                    error: manifest.capabilities.security.rateLimit.message
                };
            }

            return { 
                success: false, 
                status: status,
                error: status === 422 
                    ? `Erro de Validação: ${formatError(error)}` 
                    : (error.response?.data?.detail || 'Usuário ou senha inválidos.')
            };
        }
    },

    verifyMFA: async (mfaToken: string, code: string, system: string) => {
        try {
            const response = await authApi.post(manifest.endpoints.v1.mfa_verify, { 
                mfa_token: mfaToken, 
                code,
                system
            });
            const { access_token, refresh_token, user: userData } = response.data;
            return { 
                success: true, 
                token: access_token, 
                refreshToken: refresh_token,
                user: maskUserData(userData)
            };
        } catch (error: any) {
            return { success: false, error: error.response?.data?.detail || 'Código MFA inválido.' };
        }
    },

    setupMFA: async () => {
        try {
            const response = await authApi.post(manifest.endpoints.v1.mfa_setup);
            return { success: true, ...response.data };
        } catch (error: any) {
            return { success: false, error: formatError(error) };
        }
    },

    enableMFA: async (code: string) => {
        try {
            await authApi.post(manifest.endpoints.v1.mfa_enable, { code });
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.response?.data?.detail || 'Falha ao ativar MFA.' };
        }
    },

    refresh: async (refreshToken: string) => {
        try {
            const response = await authApi.post(manifest.endpoints.v1.refresh, { refresh_token: refreshToken });
            return { success: true, token: response.data.access_token };
        } catch (error) {
            return { success: false };
        }
    },

    logout: async (refreshToken: string) => {
        try {
            await authApi.post(manifest.endpoints.v1.logout, { refresh_token: refreshToken });
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    },

    register: async (email: string, password: string, system: string) => {
        try {
            await authApi.post('/register', { 
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
            await authApi.post('/password-reset/request', { email, system });
            return { success: true };
        } catch (error: any) {
            return { success: false, error: formatError(error) };
        }
    },

    confirmPasswordReset: async (token: string, newPassword: string, system: string) => {
        try {
            await authApi.post('/password-reset/confirm', { token, new_password: newPassword, system });
            return { success: true };
        } catch (error: any) {
            return { success: false, error: formatError(error) };
        }
    },

    getOAuthLoginUrl: async (provider: string, system: string) => {
        try {
            const response = await authApi.get(`/oauth/${provider}/login`, { params: { system } });
            return { success: true, url: response.data.url };
        } catch (error: any) {
            return { success: false, error: formatError(error) };
        }
    },

    processOAuthCallback: async (provider: string, code: string, system: string) => {
        try {
            const response = await authApi.post(`/oauth/${provider}/callback`, { code, system });
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
