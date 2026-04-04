import React from 'react';
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

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}
declare const ChangePasswordModal: ({ isOpen, onClose }: ChangePasswordModalProps) => React.ReactPortal | null;

export { ChangePasswordModal, Login, ProtectedRoute };
