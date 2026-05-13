import React, { useMemo, useState } from 'react';
import { DynamicRenderer } from '@sarak/lib-ui-core';
import { AuthModuleManifest } from '../../manifest';
import { useAuth } from '../../providers/AuthProvider';
import { ChevronDown, ChevronUp, Eye } from 'lucide-react';

/**
 * SecurityModule (v1.4)
 * Auditoria Soberana: Toggles integrados e Sincronização de Dados (v8.6)
 */
export const SecurityModule: React.FC = () => {
    const { user, loading } = useAuth();
    const [expandedMetric, setExpandedMetric] = useState<string | null>(null);
    
    const filteredContracts = useMemo(() => {
        // [Importante] Se não houver usuário e não estiver carregando, 
        // ou se as permissões ainda não chegaram, mostramos apenas o básico.
        if (loading) return [];

        return AuthModuleManifest.visualContracts.filter(contract => {
            if (!contract.requiredPermission) return true;
            
            // Lógica Soberana: Superuser tem acesso total, outros dependem de permissões explícitas.
            if (user?.is_active && user?.is_superuser) return true;

            return user?.permissions?.includes(contract.requiredPermission);
        });
    }, [user, loading]);

    const statsContract = filteredContracts.find(c => c.type === 'STATS' && c.tab === 'Auditoria');
    
    // Filtramos contratos para abas que NÃO são Auditoria
    const otherTabsContracts = filteredContracts.filter(c => c.tab !== 'Auditoria');
    
    // Contratos de auditoria que NÃO são o STATS principal e NÃO são detalhamentos escondidos
    const auditBodyContracts = filteredContracts.filter(c => 
        c.tab === 'Auditoria' && 
        c.type !== 'STATS' && 
        !c.id.includes('audit_')
    );

    const toggleMetric = (key: string) => {
        setExpandedMetric(prev => prev === key ? null : key);
    };

    if (loading) return <div className="p-8 text-center text-white/20 animate-pulse">Autenticando Identidade Soberana...</div>;

    return (
        <div className="sarak-security-module flex flex-col gap-6 p-2">
            {/* 1. ABA AUDITORIA (Layout Customizado) */}
            {statsContract && (
                <div className="audit-dashboard flex flex-col gap-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                        <h2 className="text-lg font-bold text-white/90">{statsContract.label}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(statsContract.mapping || {}).map(([key, label]) => (
                            <div 
                                key={key}
                                className={`group relative flex flex-col p-4 rounded-xl border transition-all duration-300 ${
                                    expandedMetric === key 
                                    ? 'bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/20' 
                                    : 'bg-zinc-900/50 border-white/5 hover:border-white/10'
                                }`}
                            >
                                <div className="pointer-events-none mb-4">
                                    <DynamicRenderer 
                                        contracts={[{
                                            ...statsContract,
                                            mapping: { [key]: label }
                                        }] as any} 
                                        module={AuthModuleManifest as any} 
                                    />
                                </div>

                                <button
                                    onClick={() => toggleMetric(key)}
                                    className={`mt-auto flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                                        expandedMetric === key
                                        ? 'bg-emerald-500 text-black'
                                        : 'bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white/70'
                                    }`}
                                >
                                    {expandedMetric === key ? (
                                        <>Recolher <ChevronUp size={12} /></>
                                    ) : (
                                        <>Analisar <Eye size={12} /></>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>

                    {expandedMetric && (
                        <div className="mt-2 animate-in fade-in zoom-in-95 duration-300">
                            {(() => {
                                const detailContractId = statsContract.config?.detailMappings?.[expandedMetric];
                                const detailContract = filteredContracts.find(c => c.id === detailContractId);
                                if (!detailContract) return null;
                                
                                const scope = statsContract.config?.detailMappings?.[expandedMetric]?.replace('audit_', '').replace('_table', '');
                                
                                return (
                                    <div className="bg-zinc-900/80 rounded-xl border border-white/5 overflow-hidden shadow-2xl">
                                        <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Detalhamento Soberano</span>
                                                <span className="text-lg font-bold text-white">{detailContract.label}</span>
                                            </div>
                                            <button 
                                                onClick={() => setExpandedMetric(null)}
                                                className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"
                                            >
                                                <ChevronUp size={20} />
                                            </button>
                                        </div>
                                        <div className="p-2">
                                            <DynamicRenderer 
                                                contracts={[{
                                                    ...detailContract,
                                                    config: { 
                                                        ...detailContract.config, 
                                                        params: { ...detailContract.config?.params, scope } 
                                                    }
                                                }] as any} 
                                                module={AuthModuleManifest as any} 
                                            />
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* Outros componentes da Auditoria (se houver) */}
                    <DynamicRenderer 
                        contracts={auditBodyContracts as any} 
                        module={AuthModuleManifest as any} 
                    />
                </div>
            )}

            {/* 2. OUTRAS ABAS (Usuários, Governança, Minha Conta) */}
            <DynamicRenderer 
                contracts={otherTabsContracts as any} 
                module={AuthModuleManifest as any} 
            />
        </div>
    );
};

export default SecurityModule;
