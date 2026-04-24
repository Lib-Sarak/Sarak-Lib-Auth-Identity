import axios from 'axios';

/**
 * Serviço de API Autônomo para Auth-Identity
 * v5.5 - Independência total da lib-shared
 */

const baseURL = '/api/auth';

export const authApi = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Exportação secundária para compatibilidade
export const api = authApi;

// Interceptor de Token para persistência de sessão
authApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('sarak_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default authApi;
