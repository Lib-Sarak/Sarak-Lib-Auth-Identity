import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { api, authApi, useSarak } from '@sarak/lib-shared';

export interface UserProfile {
    id: string | number;
    username: string;
    email?: string;
    full_name?: string;
    [key: string]: any;
}

interface AuthContextType {
    user: UserProfile | null;
    token: string | null;
    loading: boolean;
    isHydrated: boolean; // Flag de proteção contra flickering
    register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    login: (email: string, password?: string) => Promise<{ success: boolean; error?: string; token?: string; user?: any }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // Consumir o estado central do SarakProvider para evitar redundância e loops
    const { 
        user, 
        token, 
        loading: sarakLoading, 
        isHydrated,
        loginAPI,
        registerAPI,
        logout: sarakLogout
    } = useSarak();

    const [internalLoading, setInternalLoading] = useState(false);

    // O loading final é a combinação do motor central e inicialização local se houver
    const loading = sarakLoading || internalLoading;

    const login = async (identification: string, password?: string) => {
        setInternalLoading(true);
        try {
            const result = await loginAPI(identification, password);
            return result;
        } finally {
            setInternalLoading(false);
        }
    };

    const logout = () => {
        sarakLogout();
    };

    const value = useMemo(() => ({
        user,
        token,
        loading,
        isHydrated,
        register: registerAPI,
        login,
        logout
    }), [user, token, loading, isHydrated, registerAPI, loginAPI, sarakLogout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
