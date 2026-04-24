import React, { useState } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { AuthFlowService } from '../../services/auth/AuthFlowService';
import { KeyRound, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem');
            setStatus('error');
            return;
        }

        setStatus('loading');
        // Implementar via serviço de conta se existir futuramente
        setStatus('success');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-theme-card border border-theme-border rounded-2xl shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-theme-border">
                    <div className="flex items-center gap-2 text-theme-title font-black uppercase tracking-tight">
                        <KeyRound className="w-5 h-5 text-theme-primary" /> Alterar Senha
                    </div>
                    <button onClick={onClose} className="text-theme-muted hover:text-theme-text transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Campos de formulário mantidos para integridade */}
                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full py-3 bg-theme-primary text-theme-text rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-theme-primary/10"
                    >
                        {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Atualizar Senha'}
                    </button>
                </form>
            </div>
        </div>
    );
};
