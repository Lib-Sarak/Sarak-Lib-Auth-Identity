import React, { useState, useEffect } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { GovernanceService } from '../../services/rbac/GovernanceService';
import { Role, Permission } from '../../types/models/rbac';
import { 
    Shield, 
    ChevronRight, 
    Save, 
    CheckCircle2, 
    Circle, 
    Lock,
    Info,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const RBACManager: React.FC = () => {
    const { authApi } = useAuth();
    const [roles, setRoles] = useState<Role[]>([]);
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Estado local das permissões do papel selecionado para edição rápida
    const [currentPermissions, setCurrentPermissions] = useState<string[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Chamadas via GovernanceService (Granularidade v7.0)
            const [rolesRes, permsRes] = await Promise.all([
                GovernanceService.getRoles(),
                GovernanceService.getPermissions()
            ]);
            
            setRoles(rolesRes.data || []);
            setAllPermissions(permsRes.data || []);
            
            if (rolesRes.data && rolesRes.data.length > 0) {
                handleSelectRole(rolesRes.data[0]);
            }
        } catch (err) {
            console.error('[RBAC] Erro ao carregar:', err);
            setMessage({ type: 'error', text: 'Erro ao carregar dados de segurança.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSelectRole = (role: Role) => {
        setSelectedRoleId(role.role_id);
        // Garantir que mapeamos IDs de permissão
        setCurrentPermissions((role.permissions || []).map(p => p.permission_id));
        setMessage(null);
    };

    const togglePermission = (permId: string) => {
        const selectedRole = roles.find(r => r.role_id === selectedRoleId);
        if (selectedRole?.name === 'MASTER') return;

        setCurrentPermissions(prev => 
            prev.includes(permId) 
                ? prev.filter(id => id !== permId) 
                : [...prev, permId]
        );
    };

    const saveChanges = async () => {
        if (!selectedRoleId) return;
        setSaving(true);
        setMessage(null);

        try {
            await GovernanceService.updateRolePermissions(selectedRoleId, currentPermissions);
            
            setMessage({ type: 'success', text: 'Matriz de acesso atualizada com sucesso!' });
            
            // Recarregar papéis para atualizar estado global
            const rolesRes = await GovernanceService.getRoles();
            setRoles(rolesRes.data || []);
            
            // Timeout para limpar mensagem
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Erro ao salvar alterações.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <Loader2 className="w-8 h-8 animate-spin text-theme-primary" />
        </div>
    );

    const activeRole = roles.find(r => r.role_id === selectedRoleId);

    return (
        <div className="flex flex-col lg:flex-row gap-6 p-4 bg-theme-body/50 rounded-sarak border border-theme-border/30 min-h-[600px]">
            
            {/* Sidebar de Papéis */}
            <div className="w-full lg:w-72 space-y-2">
                <div className="px-3 py-2 text-xs font-black text-theme-muted uppercase tracking-widest flex items-center gap-2">
                    <Lock className="w-3 h-3" /> Categorias (Papéis)
                </div>
                {roles.map(role => (
                    <button
                        key={role.role_id}
                        onClick={() => handleSelectRole(role)}
                        className={cn(
                            "w-full flex items-center justify-between p-4 rounded-xl transition-all border group",
                            selectedRoleId === role.role_id 
                                ? "bg-theme-primary/10 border-theme-primary/40 text-theme-primary shadow-lg shadow-theme-primary/5" 
                                : "bg-theme-card/30 border-theme-border/20 hover:border-theme-primary/30 text-theme-muted hover:text-theme-text"
                        )}
                    >
                        <div className="text-left">
                            <div className="font-bold text-sm">{role.name}</div>
                            <div className="text-[10px] opacity-60 uppercase tracking-tighter">{(role.permissions?.length || 0)} capacidades</div>
                        </div>
                        <ChevronRight className={cn("w-4 h-4 transition-transform", selectedRoleId === role.role_id ? "rotate-90" : "group-hover:translate-x-1")} />
                    </button>
                ))}
            </div>

            {/* Grid de Permissões */}
            <div className="flex-1 space-y-6">
                <AnimatePresence mode="wait">
                    {activeRole && (
                        <motion.div 
                            key={activeRole.role_id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {/* Header do Painel */}
                            <div className="p-6 rounded-2xl bg-gradient-to-r from-theme-card to-transparent border border-theme-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-black text-theme-title uppercase tracking-tighter flex items-center gap-2">
                                        <Shield className="w-6 h-6 text-theme-primary" />
                                        Configurando: {activeRole.name}
                                    </h2>
                                    <p className="text-theme-muted text-sm mt-1">{activeRole.description}</p>
                                </div>
                                <button
                                    onClick={saveChanges}
                                    disabled={saving || activeRole.name === 'MASTER'}
                                    className="flex items-center justify-center gap-2 px-8 py-3 bg-theme-primary hover:opacity-90 disabled:opacity-50 disabled:bg-theme-card text-theme-text font-black uppercase tracking-widest text-xs rounded-xl shadow-xl shadow-theme-primary/10 transition-all active:scale-[0.95]"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Salvar Configuração</>}
                                </button>
                            </div>

                            {/* Feedback de Status */}
                            {message && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={cn(
                                        "p-4 rounded-xl border flex items-center gap-3 text-sm font-bold",
                                        message.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                                    )}
                                >
                                    {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                    {message.text}
                                </motion.div>
                            )}

                            {/* Alerta MASTER */}
                            {activeRole.name === 'MASTER' && (
                                <div className="p-4 rounded-xl bg-theme-primary/5 border border-theme-primary/10 flex items-center gap-3 text-xs text-theme-primary/80 font-medium">
                                    <Info className="w-4 h-4" />
                                    Nota: O papel MASTER possui acesso total e imutável ao sistema por design de segurança.
                                </div>
                            )}

                            {/* Matrix de Capacidades */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {allPermissions.map(perm => {
                                    const isSelected = currentPermissions.includes(perm.permission_id);
                                    const isImmutable = activeRole.name === 'MASTER';
                                    
                                    return (
                                        <button
                                            key={perm.permission_id}
                                            onClick={() => !isImmutable && togglePermission(perm.permission_id)}
                                            disabled={isImmutable}
                                            className={cn(
                                                "flex items-start gap-4 p-4 rounded-xl border transition-all text-left group",
                                                isSelected 
                                                    ? "bg-theme-primary/5 border-theme-primary/30" 
                                                    : "bg-theme-card/10 border-theme-border/10 hover:border-theme-primary/20"
                                            )}
                                        >
                                            <div className="mt-1">
                                                {isSelected 
                                                    ? <CheckCircle2 className="w-5 h-5 text-theme-primary" /> 
                                                    : <Circle className="w-5 h-5 text-theme-muted/30 group-hover:text-theme-muted/50" />
                                                }
                                            </div>
                                            <div>
                                                <div className={cn("text-sm font-bold uppercase tracking-tight", isSelected ? "text-theme-text" : "text-theme-muted")}>
                                                    {perm.name}
                                                </div>
                                                <div className="text-[11px] text-theme-muted/70 leading-tight mt-1">
                                                    {perm.description}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
