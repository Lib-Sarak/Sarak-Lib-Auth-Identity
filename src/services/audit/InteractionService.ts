import { authApi } from '../../api/auth-client';

/**
 * InteractionService (v7.0)
 * Responsabilidade: Rastrear e persistir interações do usuário para fins de auditoria.
 */
export const InteractionService = {
    logInteraction: async (system: string, moduleId: string, action: string, payload?: any) => {
        // Safe access to env variables (Vite/Webpack compatible)
        const INTERACTION_MODE = (window as any)._env_?.SARAK_INTERACTION_MODE || 
                                 (import.meta as any).env?.VITE_SARAK_INTERACTION_MODE || 
                                 'local';
        
        const event = {
            system,
            moduleId,
            action,
            payload,
            timestamp: new Date().toISOString()
        };

        if (INTERACTION_MODE === 'db') {
            try {
                await (authApi as any).post('/interactions', {
                    system,
                    module_id: moduleId,
                    action,
                    payload
                });
            } catch (error) {
                console.error('[Identity] Failed to sync interaction to DB, falling back to local.', error);
                saveToLocal(system, event);
            }
        } else {
            saveToLocal(system, event);
        }
    }
};

function saveToLocal(system: string, event: any) {
    const storageKey = `${system}_interaction_history`;
    const history = JSON.parse(localStorage.getItem(storageKey) || '[]');
    history.push(event);
    localStorage.setItem(storageKey, JSON.stringify(history.slice(-100))); // Keep last 100
}
