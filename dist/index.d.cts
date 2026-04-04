import React, { ReactNode } from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';

interface Branding {
    name: string;
    logo?: string;
}
declare const Login: React.FC<{
    branding?: Branding;
    onSuccess?: () => void;
}>;

declare const ProtectedRoute: ({ children }: {
    children: React.ReactNode;
}) => string | number | boolean | react_jsx_runtime.JSX.Element | Iterable<React.ReactNode> | null | undefined;

interface UserProfile {
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
    register: (email: string, password: string) => Promise<{
        success: boolean;
        error?: string;
    }>;
    login: (email: string, password?: string) => Promise<{
        success: boolean;
        error?: string;
        token?: string;
        user?: any;
    }>;
    logout: () => void;
}
declare const useAuth: () => AuthContextType;
declare const AuthProvider: ({ children }: {
    children: ReactNode;
}) => react_jsx_runtime.JSX.Element;

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}
declare const ChangePasswordModal: ({ isOpen, onClose }: ChangePasswordModalProps) => React.ReactPortal | null;

export { AuthProvider, ChangePasswordModal, Login, ProtectedRoute, type UserProfile, useAuth };
