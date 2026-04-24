export interface UserProfile {
    user_id: string; // Uniformizando com o backend
    username: string;
    email: string;
    system: string;
    is_active?: boolean;
    is_superuser?: boolean;
    role_names?: string;
    permissions?: string[];
    
    // OAuth Fields (v7.6)
    oauth_provider?: string;
    oauth_id?: string;
    avatar_url?: string;
    
    // MFA (v7.7)
    mfa_enabled?: boolean;
    
    // UI Metadata
    last_login?: string;
}

export enum RoleLevel {
    MASTER = 100,
    ADMIN = 50,
    EDITOR = 30,
    LEITOR = 20,
    USER = 10,
    ANONYMOUS = 0
}
