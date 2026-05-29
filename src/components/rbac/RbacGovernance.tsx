import React, { useState, useEffect, useMemo } from 'react';
import { authApi } from '../../api/auth-client';
import { 
    Shield, Key, ChevronDown, ChevronUp, Radio, Check, 
    Plus, HelpCircle, Save, ShieldAlert, ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { GovernanceInfoCard } from './GovernanceInfoCard';

interface SubPermission {
    id: string;
    name: string;
    description: string;
}

interface ModuleRule {
    id: string;
    name: string;
    description: string;
    children: SubPermission[];
}

interface Role {
    role_id: string;
    name: string;
    description: string;
    permission_names: string[];
}

export const RbacGovernance: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissionsTree, setPermissionsTree] = useState<ModuleRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({});
    const [expandedRules, setExpandedRules] = useState<Record<string, Record<string, boolean>>>({});
    const [newPermission, setNewPermission] = useState({ name: '', description: '' });
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [isSaving, setIsSaving] = useState<string | null>(null);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rolesRes, permsRes] = await Promise.all([
                authApi.get('/roles'),
                authApi.get('/permissions'),
            ]);
            setRoles(rolesRes.data || []);
            setPermissionsTree(permsRes.data || []);
            
            // Expand by default the first role
            if (rolesRes.data && rolesRes.data.length > 0) {
                setExpandedRoles({ [rolesRes.data[0].role_id]: true });
            }
        } catch (error: any) {
            console.error('[RbacGovernance] Failed to fetch RBAC data', error);
            showNotification('Erro ao carregar configurações de governança.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleRoleExpand = (roleId: string) => {
        setExpandedRoles(prev => ({ ...prev, [roleId]: !prev[roleId] }));
    };

    const toggleRuleExpand = (roleId: string, ruleId: string) => {
        setExpandedRules(prev => {
            const roleRules = prev[roleId] || {};
            return {
                ...prev,
                [roleId]: {
                    ...roleRules,
                    [ruleId]: !roleRules[ruleId]
                }
            };
        });
    };

    // Implements Radio/Single-Selection Toggle programmatically and calls `/toggle-permission`
    const handlePermissionToggle = async (roleId: string, moduleRule: ModuleRule, targetPermissionId: string) => {
        const isMasterUser = currentUser?.is_superuser || currentUser?.role === 'MASTER' || currentUser?.permissions?.includes('*');
        if (!isMasterUser) {
            showNotification('Acesso negado: Requer privilégios nível MASTER.', 'error');
            return;
        }

        setIsSaving(`${roleId}-${targetPermissionId}`);
        const currentRole = roles.find(r => r.role_id === roleId);
        if (!currentRole) return;

        const isCurrentlyChecked = currentRole.permission_names.includes(targetPermissionId);
        
        try {
            // If checking a permission (radio-like selection), turn off any other checked permission inside this same Module Rule first
            if (!isCurrentlyChecked) {
                const checkedSiblings = moduleRule.children.filter(
                    sibling => sibling.id !== targetPermissionId && currentRole.permission_names.includes(sibling.id)
                );
                
                // Toggle off siblings sequentially
                for (const sibling of checkedSiblings) {
                    await authApi.post(`/roles/${roleId}/toggle-permission`, { permission_name: sibling.id });
                }
            }

            // Toggle target permission
            await authApi.post(`/roles/${roleId}/toggle-permission`, { permission_name: targetPermissionId });

            showNotification('Controle de acesso sincronizado com sucesso.', 'success');
            await fetchData();
        } catch (error: any) {
            console.error('[RbacGovernance] Failed to toggle permission', error);
            showNotification(error.response?.data?.detail || 'Erro ao sincronizar permissão.', 'error');
        } finally {
            setIsSaving(null);
        }
    };

    const handleCreatePermission = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPermission.name.includes(':')) {
            showNotification('Nome da permissão deve conter o prefixo do módulo (ex: modulo:acao).', 'error');
            return;
        }

        try {
            await authApi.post('/permissions', {
                name: newPermission.name.toLowerCase().trim(),
                description: newPermission.description.trim(),
            });
            showNotification('Nova permissão técnica cadastrada com sucesso.', 'success');
            setNewPermission({ name: '', description: '' });
            fetchData();
        } catch (error: any) {
            showNotification(error.response?.data?.detail || 'Erro ao cadastrar permissão.', 'error');
        }
    };

    return (
        <div className="space-y-8">
            {notification && (
                <div
                    className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl border text-xs font-bold uppercase tracking-wider shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 ${
                        notification.type === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}
                >
                    {notification.message}
                </div>
            )}

            <GovernanceInfoCard />

            {/* Matrix Control Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/60 flex items-center gap-2">
                        <Key size={14} className="text-emerald-400" />
                        Controle de Acesso Soberano (RBAC)
                    </h3>
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400/70 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        Enforced by Casbin
                    </span>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-white/20 animate-pulse">
                        <Shield className="animate-spin-slow mb-3" size={24} />
                        <span className="uppercase tracking-[0.3em] text-[9px] font-black">Montando matriz de privilégios...</span>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {roles.map(role => {
                            const isRoleExpanded = !!expandedRoles[role.role_id];
                            return (
                                <div 
                                    key={role.role_id} 
                                    className="bg-zinc-950/40 border border-white/5 rounded-3xl overflow-hidden shadow-lg transition-all duration-300 hover:border-white/10"
                                >
                                    {/* LEVEL 0: Role Card (Collapsible) */}
                                    <div 
                                        onClick={() => toggleRoleExpand(role.role_id)}
                                        className="flex items-center justify-between p-5 cursor-pointer bg-white/5 hover:bg-white/10 transition-colors select-none"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                                                {role.name.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold uppercase tracking-wider text-white">
                                                    {role.name}
                                                </span>
                                                <span className="text-[10px] text-white/40">{role.description}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/30 bg-black/40 px-2.5 py-1 rounded-xl border border-white/5">
                                                {role.permission_names.length} ativas
                                            </span>
                                            {isRoleExpanded ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
                                        </div>
                                    </div>

                                    {/* LEVEL 1 & 2 Nested Container */}
                                    <AnimatePresence>
                                        {isRoleExpanded && (
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: 'auto' }}
                                                exit={{ height: 0 }}
                                                className="overflow-hidden border-t border-white/5 bg-black/40"
                                            >
                                                <div className="p-4 space-y-3 divide-y divide-white/5">
                                                    {permissionsTree.map(rule => {
                                                        const isRuleExpanded = !!(expandedRules[role.role_id]?.[rule.id]);
                                                        
                                                        // Calculates if any permission in this rule is active to display the Collapse Badge
                                                        const activePermission = rule.children.find(child => 
                                                            role.permission_names.includes(child.id)
                                                        );

                                                        return (
                                                            <div key={rule.id} className="pt-3 first:pt-0">
                                                                {/* LEVEL 1: Module Rule Row (Collapsible) */}
                                                                <div 
                                                                    onClick={() => toggleRuleExpand(role.role_id, rule.id)}
                                                                    className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors select-none"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <ChevronDown 
                                                                            size={12} 
                                                                            className={`text-white/40 transition-transform duration-300 ${isRuleExpanded ? 'rotate-180' : ''}`} 
                                                                        />
                                                                        <span className="text-[11px] font-bold uppercase tracking-tight text-white/80">
                                                                            {rule.name}
                                                                        </span>
                                                                        {rule.description && (
                                                                            <span className="text-[9px] text-white/30 hidden @sm:inline">- {rule.description}</span>
                                                                        )}
                                                                    </div>
                                                                    
                                                                    {/* COLLAPSED BADGE: Displays active permission when collapsed */}
                                                                    {!isRuleExpanded && activePermission && (
                                                                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase border border-emerald-500/20 tracking-wider">
                                                                            {activePermission.name}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* LEVEL 2: Inline Checkboxes (Radio behavior) */}
                                                                <AnimatePresence>
                                                                    {isRuleExpanded && (
                                                                        <motion.div
                                                                            initial={{ opacity: 0, height: 0 }}
                                                                            animate={{ opacity: 1, height: 'auto' }}
                                                                            exit={{ opacity: 0, height: 0 }}
                                                                            className="overflow-hidden pl-6 pr-3 py-2 grid grid-cols-1 @sm:grid-cols-2 @md:grid-cols-3 gap-3"
                                                                        >
                                                                            {rule.children.map(perm => {
                                                                                const isChecked = role.permission_names.includes(perm.id);
                                                                                const isSavingThis = isSaving === `${role.role_id}-${perm.id}`;
                                                                                
                                                                                return (
                                                                                    <div 
                                                                                        key={perm.id}
                                                                                        onClick={() => handlePermissionToggle(role.role_id, rule, perm.id)}
                                                                                        className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer select-none transition-all duration-300 ${
                                                                                            isChecked 
                                                                                                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300' 
                                                                                                : 'bg-white/5 border-white/5 text-white/60 hover:border-white/10 hover:text-white'
                                                                                        }`}
                                                                                    >
                                                                                        <div className="flex flex-col gap-0.5">
                                                                                            <span className="text-[10px] font-black uppercase tracking-wider">
                                                                                                {perm.name}
                                                                                            </span>
                                                                                            <span className="text-[8px] text-white/40 leading-normal max-w-[200px]">
                                                                                                {perm.description || 'Nenhuma descrição técnica provida.'}
                                                                                            </span>
                                                                                        </div>
                                                                                        
                                                                                        {/* Premium Checkbox Button */}
                                                                                        <div className={`h-5 w-5 rounded-lg border flex items-center justify-center transition-all ${
                                                                                            isChecked 
                                                                                                ? 'bg-emerald-500 border-emerald-500 text-black' 
                                                                                                : 'border-white/20'
                                                                                        }`}>
                                                                                            {isSavingThis ? (
                                                                                                <div className="h-2 w-2 rounded-full bg-current animate-ping" />
                                                                                            ) : isChecked ? (
                                                                                                <Check size={12} strokeWidth={4} />
                                                                                            ) : null}
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Custom Technical Permission Creator */}
            <div className="bg-zinc-950/40 border border-white/5 rounded-3xl p-6 space-y-4">
                <div className="border-b border-white/5 pb-2">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/60 flex items-center gap-2">
                        <Plus size={14} className="text-emerald-400" />
                        Cadastrar Nova Regra Técnica
                    </h4>
                </div>
                
                <form onSubmit={handleCreatePermission} className="grid grid-cols-1 @md:grid-cols-2 gap-4 items-end">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Nome da Permissão</label>
                        <input
                            type="text"
                            required
                            placeholder="ex: user:export"
                            value={newPermission.name}
                            onChange={(e) => setNewPermission(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Descrição</label>
                        <input
                            type="text"
                            required
                            placeholder="Descrição curta do privilégio..."
                            value={newPermission.description}
                            onChange={(e) => setNewPermission(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50"
                        />
                    </div>
                    <div className="@md:col-span-2 flex justify-end">
                        <button
                            type="submit"
                            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2 transition-colors"
                        >
                            <Save size={13} />
                            Adicionar ao Dicionário
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RbacGovernance;

