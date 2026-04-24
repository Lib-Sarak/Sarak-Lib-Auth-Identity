import { authApi } from '../../api/auth-client';
import { UserProfile, RoleLevel } from '../../types/models/user';

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
    },

    /**
     * UtilitÃ¡rio de acesso hierÃ¡rquico (v7.6).
     * Compara o nÃ­vel do usuÃ¡rio atual com o nÃ­vel exigido.
     */
    canAccess: (user: UserProfile | null, requiredLevel: RoleLevel): boolean => {
        if (!user) return requiredLevel === RoleLevel.ANONYMOUS;
        if (user.is_superuser) return true;
        
        // Se o backend enviar o nÃ­vel mÃ¡ximo (recomendado) ou se tivermos que inferir das roles
        const userLevel = (user as any).max_role_level || 
                         (user.role_names?.includes('MASTER') ? 100 : 
                          user.role_names?.includes('ADMIN') ? 50 : 10);
                          
        return userLevel >= requiredLevel;
    }
};
