import { ISarakAuthEngine, authApi } from '@sarak/lib-shared';

/**
 * Auth & Identity Engine (Sarak Matrix v5.0)
 * 
 * Implementação padrão do motor de autenticação para o Sarak OS.
 */
export const AuthIdentityEngine: ISarakAuthEngine = {
    login: async (identification: string, password?: string) => {
        try {
            const response = await (authApi as any).post('/api/auth/login', { 
                username: identification, 
                password 
            });
            const { access_token, user: userData } = response.data;
            
            // O SarakProvider cuidará de salvar no localStorage e configurar o header
            return { 
                success: true, 
                token: access_token, 
                user: userData 
            };
        } catch (error: any) {
            return { 
                success: false, 
                error: error.response?.data?.detail || 'Usuário ou senha inválidos.' 
            };
        }
    },

    register: async (email: string, password: string) => {
        try {
            await (authApi as any).post('/api/auth/register', { 
                username: email, 
                email: email, 
                password 
            });
            return { success: true };
        } catch (error: any) {
            return { 
                success: false, 
                error: error.response?.data?.detail || 'Erro ao criar conta.' 
            };
        }
    },

    fetchMe: async (token: string) => {
        (authApi as any).defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await (authApi as any).get('/api/auth/me');
        return response.data;
    }
};
