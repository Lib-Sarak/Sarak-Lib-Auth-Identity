import axios from 'axios';

/**
 * Serviço de API Autônomo para Auth-Identity
 * v5.5 - Independência total da lib-shared
 */

let currentBaseURL = '/api/auth'; // Fallback

export const authApi = axios.create({
    baseURL: currentBaseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const configureAuthApi = (baseUrl: string) => {
    currentBaseURL = baseUrl;
    authApi.defaults.baseURL = baseUrl;
    console.log(`[Auth-Identity] Cliente HTTP configurado com baseURL: ${baseUrl}`);
};

// Exportação secundária para compatibilidade
export const api = authApi;

// Interceptor de Token com Isolamento por Sistema (v6.0)
authApi.interceptors.request.use((config) => {
    // Obtenção segura do identificador do sistema via contexto global
    const system = (window as any).__SARAK_SYSTEM__ || 'global';
    
    // Recuperação de token isolado para o sistema atual
    const token = localStorage.getItem(`${system}_token`);
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Injeção obrigatória do contexto do sistema para o backend (Sincronizado v10.2)
    config.headers['X-System-ID'] = system;
    config.headers['X-Tenant-ID'] = system;
    
    return config;
});

export default authApi;
