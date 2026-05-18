import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { Shield, Users, Gavel, Activity } from 'lucide-react';
import { SecurityVault } from '../rbac/SecurityVault';
import { UserDirectory } from '../rbac/UserDirectory';
import { RbacGovernance } from '../rbac/RbacGovernance';
import { AuditMonitor } from '../rbac/AuditMonitor';

/**
 * TAB_ICONS (v2.0)
 */
const TAB_ICONS: Record<string, any> = {
    'Segurança': Shield,
    'Identidades': Users,
    'Governança': Gavel,
    'Monitoramento': Activity
};

/**
 * SecurityModule (v10.0)
 * Modernizado e 100% Autônomo: Não depende do DynamicRenderer ou de outros módulos.
 * Controles de Permissão Nativa com Paridade Estética e Funcional Completa.
 */
export const SecurityModule: React.FC = () => {
    const { user, loading } = useAuth();
    const [activeTab, setActiveTab] = useState<string>('Segurança');

    // 1. Determinação de Abas Permitidas baseado no Perfil de Acesso do Usuário
    const allowedTabs = useMemo(() => {
        if (loading || !user) return ['Segurança'];
        
        const isSuper = user.is_superuser || user.permissions?.includes('*');
        const list = ['Segurança'];

        if (isSuper || user.permissions?.includes('user:manage')) {
            list.push('Identidades');
        }
        if (isSuper || user.permissions?.includes('rbac:manage')) {
            list.push('Governança');
        }
        if (isSuper || user.permissions?.includes('rbac:view')) {
            list.push('Monitoramento');
        }

        return list;
    }, [user, loading]);

    // Sincronização de Aba Ativa ao mudar privilégios
    useEffect(() => {
        if (!loading && allowedTabs.length > 0 && !allowedTabs.includes(activeTab)) {
            setActiveTab(allowedTabs[0]);
        }
    }, [allowedTabs, activeTab, loading]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-96 text-white/20 animate-pulse">
            <Shield className="mb-3 animate-spin-slow text-emerald-400" size={32} />
            <span className="uppercase tracking-[0.3em] text-[10px] font-black text-white/60">Sincronizando Identidade Soberana...</span>
        </div>
    );

    return (
        <div className="sarak-identity-module flex flex-col h-full bg-black/40 rounded-3xl border border-white/5 overflow-hidden shadow-2xl backdrop-blur-sm">
            {/* 1. NAVEGAÇÃO POR ABAS (Derivada do Perfil Autônomo) */}
            <nav className="flex items-center gap-1 p-3 bg-white/5 border-b border-white/5 overflow-x-auto no-scrollbar">
                {allowedTabs.map(tab => {
                    const Icon = TAB_ICONS[tab] || Shield;
                    const isActive = activeTab === tab;
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`
                                flex items-center gap-3 px-5 py-3 rounded-2xl text-[10px] font-black transition-all duration-500 group
                                ${isActive 
                                    ? 'bg-emerald-500 text-black shadow-[0_10px_30px_rgba(16,185,129,0.2)]' 
                                    : 'text-white/30 hover:text-white/80 hover:bg-white/5'
                                }
                            `}
                        >
                            <Icon size={14} className={`${isActive ? 'scale-110' : 'opacity-50 group-hover:opacity-100'} transition-transform duration-500`} />
                            <span className="uppercase tracking-[0.2em]">{tab}</span>
                        </button>
                    );
                })}
            </nav>

            {/* 2. CONTEÚDO PRINCIPAL DAS ABAS */}
            <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="max-w-6xl mx-auto w-full py-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Header da Aba */}
                    <div className="flex items-center gap-4 mb-2 opacity-85">
                        <div className="h-[1px] w-8 bg-emerald-500/40" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">
                            {activeTab === 'Segurança' && 'Configurações de Segurança e Cofre'}
                            {activeTab === 'Identidades' && 'Diretório de Identidades Ativas'}
                            {activeTab === 'Governança' && 'Governança & Controle de Acesso (RBAC)'}
                            {activeTab === 'Monitoramento' && 'Monitoramento de Atividades & Auditoria'}
                        </h3>
                        <div className="h-[1px] flex-1 bg-white/5" />
                    </div>

                    {/* Renderização Direta dos Componentes Coesos */}
                    <div className="tab-content transition-all duration-500">
                        {activeTab === 'Segurança' && <SecurityVault />}
                        {activeTab === 'Identidades' && <UserDirectory />}
                        {activeTab === 'Governança' && <RbacGovernance />}
                        {activeTab === 'Monitoramento' && <AuditMonitor />}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SecurityModule;
