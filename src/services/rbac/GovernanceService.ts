import { authApi } from '../../api/auth-client';

/**
 * GovernanceService (v7.0)
 * Responsabilidade: Gerenciar regras de acesso, papéis e perfil do usuário logado.
 */
export const GovernanceService = {
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

    getRoles: async () => {
        return await authApi.get('/roles');
    },

    getPermissions: async () => {
        return await authApi.get('/permissions');
    },

    updateRolePermissions: async (roleId: string, permissions: string[]) => {
        return await authApi.post(`/roles/${roleId}/permissions`, permissions);
    }
};
