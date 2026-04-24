import { ReactNode } from 'react';
import { UserProfile } from './models/user';

export interface AuthContextType {
    user: UserProfile | null;
    token: string | null;
    loading: boolean;
    isHydrated: boolean; 
    register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    login: (email: string, password?: string) => Promise<{ success: boolean; error?: string; token?: string; user?: any; mfa_required?: boolean; mfa_token?: string }>;
    verifyMFA: (mfaToken: string, code: string) => Promise<{ success: boolean; error?: string; token?: string; user?: any }>;
    setupMFA: () => Promise<{ success: boolean; secret?: string; provisioning_uri?: string; error?: string }>;
    enableMFA: (code: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    authApi: any; 
    logInteraction: (moduleId: string, action: string, payload?: any) => Promise<void>;
    getOAuthLoginUrl: (provider: string) => Promise<{ success: boolean; url?: string; error?: string }>;
}

export interface AuthProviderProps {
    children: ReactNode;
}
