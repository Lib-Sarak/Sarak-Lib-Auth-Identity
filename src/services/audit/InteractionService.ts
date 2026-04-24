import { authApi } from '../../api/auth-client';

/**
 * InteractionService (v7.0)
 * Responsabilidade: Rastrear e persistir interações do usuário para fins de auditoria.
 */
export const InteractionService = {
    logInteraction: async (moduleId: string, action: string, payload?: any) => {
        // Safe access to env variables (Vite/Webpack compatible)
        const INTERACTION_MODE = (window as any)._env_?.SARAK_INTERACTION_MODE || 
                                 (import.meta as any).env?.VITE_SARAK_INTERACTION_MODE || 
                                 'local';
        
        const event = {
            moduleId,
            action,
            payload,
            timestamp: new Date().toISOString()
        };

        if (INTERACTION_MODE === 'db') {
            try {
                await (authApi as any).post('/interactions', {
                    module_id: moduleId,
                    action,
                    payload
                });
            } catch (error) {
                console.error('[Identity] Failed to sync interaction to DB, falling back to local.', error);
                saveToLocal(event);
            }
        } else {
            saveToLocal(event);
        }
    }
};

function saveToLocal(event: any) {
    const history = JSON.parse(localStorage.getItem('sarak_interaction_history') || '[]');
    history.push(event);
    localStorage.setItem('sarak_interaction_history', JSON.stringify(history.slice(-100))); // Keep last 100
}
