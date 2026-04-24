import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token, loading, isHydrated } = useAuth();
    const location = useLocation();

    if (!isHydrated || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-theme-body text-theme-primary">
                <div className="w-12 h-12 border-4 border-theme-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!token) {
        // Redirect to login but keep current location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};
