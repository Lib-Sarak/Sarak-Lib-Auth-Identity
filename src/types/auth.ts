import { ReactNode } from 'react';
import { UserProfile } from './models/user';

export interface AuthContextType {
    user: UserProfile | null;
    token: string | null;
    loading: boolean;
    isHydrated: boolean; 
    register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    login: (email: string, password?: string) => Promise<{ success: boolean; error?: string; token?: string; user?: any }>;
    logout: () => void;
    authApi: any; 
    logInteraction: (moduleId: string, action: string, payload?: any) => Promise<void>;
}

export interface AuthProviderProps {
    children: ReactNode;
}
