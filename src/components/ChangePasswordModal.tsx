import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, X, Loader2, Save } from 'lucide-react';
import { authApi } from '../api/auth-api';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChangePasswordModal = ({ isOpen, onClose }: ChangePasswordModalProps) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (newPassword !== confirmPassword) {
            setError('Senhas não coincidem');
            return;
        }

        if (newPassword.length < 6) {
            setError('A nova senha deve ter no mínimo 6 caracteres');
            return;
        }

        setIsPending(true);
        try {
            // Chamada Padronizada Sarak Matrix v5.2
            await authApi.post('/api/auth/change-password', { 
                new_password: newPassword 
            });
            setSuccess('Senha alterada com sucesso!');
            setTimeout(() => {
                onClose();
                setNewPassword('');
                setConfirmPassword('');
                setSuccess(null);
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Erro ao alterar senha.');
        } finally {
            setIsPending(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md sarak-glass bg-theme-card border border-theme-border rounded-2xl shadow-2xl overflow-hidden z-10 backdrop-blur-xl"
                >
                    <div className="flex items-center justify-between p-6 border-b border-theme-border bg-theme-card/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-theme-primary/10 rounded-lg">
                                <KeyRound className="w-5 h-5 text-theme-primary" />
                            </div>
                            <h3 className="text-lg font-bold text-theme-text uppercase tracking-tight">Alterar Senha</h3>
                        </div>
                        <button onClick={onClose} className="text-theme-muted hover:text-theme-text transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 font-medium">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-emerald-400 font-medium">
                                {success}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-theme-muted uppercase tracking-widest">Nova Senha</label>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-theme-body/30 border border-theme-border rounded-xl focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary outline-none text-theme-text transition-all placeholder:text-theme-muted/30 font-medium"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-theme-muted uppercase tracking-widest">Confirmar Nova Senha</label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-theme-body/30 border border-theme-border rounded-xl focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary outline-none text-theme-text transition-all placeholder:text-theme-muted/30 font-medium"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-theme-muted hover:text-theme-text font-bold text-xs uppercase tracking-widest transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isPending || !!success}
                                className="flex items-center gap-2 px-6 py-3 bg-theme-primary hover:opacity-90 disabled:bg-theme-card disabled:text-theme-muted text-theme-text rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-theme-primary/10 active:scale-[0.98]"
                            >
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Salvar Senha</>}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
};

export default ChangePasswordModal;
