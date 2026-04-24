export interface UserProfile {
    id: string | number;
    username: string;
    email?: string;
    full_name?: string;
    is_active?: boolean;
    is_superuser?: boolean;
    role_names?: string;
    permissions?: string[];
    [key: string]: any;
}
