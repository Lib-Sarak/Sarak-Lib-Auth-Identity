import { ReactNode } from 'react';

export interface UserProfile {
    id: string | number;
    username: string;
    email?: string;
    full_name?: string;
    [key: string]: any;
}

export interface AuthContextType {
    user: UserProfile | null;
    token: string | null;
    loading: boolean;
    isHydrated: boolean; 
    register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    login: (email: string, password?: string) => Promise<{ success: boolean; error?: string; token?: string; user?: any }>;
    logout: () => void;
    authApi: any; 
}

export interface AuthProviderProps {
    children: ReactNode;
}
