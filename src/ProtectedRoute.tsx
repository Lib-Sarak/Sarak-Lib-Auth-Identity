import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { token, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-mono animate-pulse">Verifying authorization...</p>
            </div>
        );
    }

    if (!token) {
        // Redirect to login, but save current location to return later
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

// Removida exportação default para consistência do ecossistema Sarak
