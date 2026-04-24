/**
 * Data Masking Utility (v7.5)
 * Responsabilidade: Garantir que dados sensíveis não vazem para a UI.
 */

export interface RawUser {
    user_id: string;
    username: string;
    email: string;
    system: string;
    is_active?: boolean;
    is_superuser?: boolean;
    password?: string;
    roles?: any[];
    [key: string]: any;
}

export interface MaskedUser {
    user_id: string;
    username: string;
    email: string;
    system: string;
    roles?: string[];
}

/**
 * Remove campos sensíveis de um objeto de usuário.
 */
export function maskUserData(user: RawUser): MaskedUser {
    if (!user) return user;

    // Destructuring para extrair apenas o que é seguro
    const { 
        user_id, 
        username, 
        email, 
        system, 
        roles 
    } = user;

    return {
        user_id,
        username,
        email,
        system,
        roles: Array.isArray(roles) ? roles.map(r => typeof r === 'string' ? r : r.name) : []
    };
}

/**
 * Máscara para listas de usuários (útil em grids de gestão).
 */
export function maskUserList(users: RawUser[]): MaskedUser[] {
    return (users || []).map(maskUserData);
}
