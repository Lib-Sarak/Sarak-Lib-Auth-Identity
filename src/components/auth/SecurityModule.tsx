import React, { useMemo, useState, useEffect } from 'react';
import { DynamicRenderer } from '@sarak/lib-ui-core';
import { AuthModuleManifest } from '../../manifest';
import { useAuth } from '../../providers/AuthProvider';
import { Shield, Users, Gavel, Activity, UserCircle } from 'lucide-react';

/**
 * TAB_ICONS (v2.0)
 * Mapeamento de ícones para abas do manifesto.
 */
const TAB_ICONS: Record<string, any> = {
    'Auditoria': Activity,
    'Usuários': Users,
    'Governança': Gavel,
    'Segurança': Shield,
    'Minha Conta': UserCircle
};

/**
 * SecurityModule (v2.0)
 * 100% Manifest-Driven: Purificado de lógica de UI hardcoded.
 * Orquestração Dinâmica: Renderiza abas e contratos exclusivamente via manifest.json.
 */
export const SecurityModule: React.FC = () => {
    const { user, loading } = useAuth();
    
    // 1. Filtragem Soberana de Contratos por Permissão
    const allowedContracts = useMemo(() => {
        if (loading) return [];
        return AuthModuleManifest.visualContracts.filter(contract => {
            if (!contract.requiredPermission) return true;
            
            // Superuser ignora verificações de permissão
            if (user?.is_active && user?.is_superuser) return true;

            // Verificação explícita de permissões do usuário ou wildcard
            return user?.permissions?.includes(contract.requiredPermission) || user?.permissions?.includes('*');
        });
    }, [user, loading]);

    // 2. Extração Dinâmica de Abas do Manifesto
    const tabs = useMemo(() => {
        const uniqueTabs = Array.from(new Set(allowedContracts.map(c => c.tab)));
        
        // Ordenação Industrial: Segurança sempre como aba central/primeira
        return uniqueTabs.sort((a, b) => {
            if (a === 'Segurança') return -1;
            if (b === 'Segurança') return 1;
            if (a === 'Auditoria') return 1; // Auditoria geralmente no final
            if (b === 'Auditoria') return -1;
            return a.localeCompare(b);
        });
    }, [allowedContracts]);

    const [activeTab, setActiveTab] = useState<string>('');

    // Sincronização de Aba Ativa
    useEffect(() => {
        if (tabs.length > 0 && (!activeTab || !tabs.includes(activeTab))) {
            setActiveTab(tabs[0]);
        }
    }, [tabs, activeTab]);

    if (loading) return (
        <div className="flex items-center justify-center h-64 text-white/20 animate-pulse">
            <Shield className="mr-2 animate-spin-slow" size={20} />
            <span className="uppercase tracking-[0.3em] text-[10px] font-black">Sincronizando Identidade Soberana...</span>
        </div>
    );

    // Contratos da aba atual
    const currentContracts = allowedContracts.filter(c => c.tab === activeTab);

    return (
        <div className="sarak-identity-module flex flex-col h-full bg-black/40 rounded-3xl border border-white/5 overflow-hidden shadow-2xl backdrop-blur-sm">
            {/* 1. NAVEGAÇÃO POR ABAS (Derivada do Manifest) */}
            <nav className="flex items-center gap-1 p-3 bg-white/5 border-b border-white/5 overflow-x-auto no-scrollbar">
                {tabs.map(tab => {
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

            {/* 2. RENDERIZADOR DINÂMICO SOBERANO */}
            <main className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="max-w-6xl mx-auto w-full py-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {currentContracts.length > 0 ? (
                        currentContracts.map(contract => (
                            <div key={contract.id} className="contract-wrapper">
                                <DynamicRenderer 
                                    contracts={[contract] as any} 
                                    module={AuthModuleManifest as any} 
                                />
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-white/10 opacity-50">
                            <Shield size={48} strokeWidth={1} className="mb-4" />
                            <p className="text-xs uppercase tracking-widest font-bold">Nenhum contrato visual disponível para este nível de acesso.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default SecurityModule;
