import { InteractionService } from '../audit/InteractionService';

/**
 * StorageManager (v7.5)
 * Responsabilidade: Gerenciar persistência híbrida e isolamento multi-tenancy.
 * 
 * - Experience/UX: LocalStorage com prefixo por sistema.
 * - Session/Audit: PostgreSQL via InteractionService.
 */
export class StorageManager {
    private system: string;

    constructor(system: string) {
        if (!system) {
            throw new Error('[Identity:Storage] System identifier is mandatory for initialization.');
        }
        this.system = system;
    }

    /**
     * Persiste dados voláteis de UX no LocalStorage.
     * Ideal para: rascunhos, abas ativas, filtros recentes.
     */
    public saveExperience(key: string, data: any): void {
        const storageKey = `${this.system}_${key}`;
        localStorage.setItem(storageKey, JSON.stringify(data));
    }

    /**
     * Recupera dados voláteis do LocalStorage.
     */
    public getExperience<T>(key: string): T | null {
        const storageKey = `${this.system}_${key}`;
        const data = localStorage.getItem(storageKey);
        return data ? JSON.parse(data) : null;
    }

    /**
     * Remove um dado específico de experiência.
     */
    public clearExperience(key: string): void {
        localStorage.removeItem(`${this.system}_${key}`);
    }

    /**
     * Persiste tokens de autenticação com isolamento (v7.6).
     */
    public saveAuthSession(token: string, refreshToken: string): void {
        localStorage.setItem(`${this.system}_auth_token`, token);
        localStorage.setItem(`${this.system}_refresh_token`, refreshToken);
    }

    public getAuthToken(): string | null {
        return localStorage.getItem(`${this.system}_auth_token`);
    }

    public clearAuthSession(): void {
        localStorage.removeItem(`${this.system}_auth_token`);
        localStorage.removeItem(`${this.system}_refresh_token`);
        localStorage.removeItem(`${this.system}_oauth_state`);
    }

    /**
     * Persiste logs de auditoria e sessões no PostgreSQL.
     * Ideal para: interações importantes, logs de segurança.
     */
    public async logAudit(type: string, payload: any): Promise<void> {
        await InteractionService.logInteraction(this.system, type, payload);
    }

    /**
     * Retorna o sistema atual vinculado ao manager.
     */
    public getSystem(): string {
        return this.system;
    }
}
