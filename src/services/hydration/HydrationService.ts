import { AuthFlowService } from '../auth/AuthFlowService';
import { GovernanceService } from '../rbac/GovernanceService';
import { StorageManager } from '../storage/StorageManager';

/**
 * HydrationService (v7.5)
 * Responsabilidade: Restaurar o estado da biblioteca e validar sessões ao carregar.
 */
export class HydrationService {
    private storage: StorageManager;

    constructor(storage: StorageManager) {
        this.storage = storage;
    }

    /**
     * Executa a hidratação inicial do sistema.
     * Verifica sessão, restaura UX e bloqueia rotas se necessário.
     */
    public async hydrate(): Promise<{ isAuthenticated: boolean; user: any | null }> {
        const system = this.storage.getSystem();
        const refreshToken = localStorage.getItem(`${system}_refresh_token`);

        if (!refreshToken) {
            console.warn(`[Identity:Hydration] No session found for system: ${system}`);
            return { isAuthenticated: false, user: null };
        }

        try {
            // 1. Tenta validar/renovar o token
            const refreshResult = await AuthFlowService.refresh(refreshToken);
            
            if (!refreshResult.success) {
                this.clearSystemSession(system);
                return { isAuthenticated: false, user: null };
            }

            // 2. Recupera dados do usuário logado (masked)
            const user = await GovernanceService.getMe();
            
            if (!user) {
                this.clearSystemSession(system);
                return { isAuthenticated: false, user: null };
            }

            console.info(`[Identity:Hydration] System ${system} hydrated successfully for user: ${user.username}`);
            return { isAuthenticated: true, user };

        } catch (error) {
            console.error(`[Identity:Hydration] Critical failure during hydration for ${system}:`, error);
            return { isAuthenticated: false, user: null };
        }
    }

    /**
     * Limpa apenas os dados da sessão do sistema ativo.
     */
    private clearSystemSession(system: string): void {
        localStorage.removeItem(`${system}_access_token`);
        localStorage.removeItem(`${system}_refresh_token`);
        localStorage.removeItem(`${system}_user`);
    }
}
