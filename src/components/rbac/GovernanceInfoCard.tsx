import React, { useState } from 'react';
import { Shield, Info, ArrowDown, Zap, Edit3, Eye, User, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RoleDetail {
    name: string;
    level: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
    border: string;
    description: string;
    inheritance: string;
    capabilities: string[];
    restrictions: string[];
}

export const GovernanceInfoCard: React.FC = () => {
    const [selectedRole, setSelectedRole] = useState<RoleDetail | null>(null);

    const roles: RoleDetail[] = [
        {
            name: 'MASTER',
            level: 'Soberano',
            icon: <Zap size={16} />,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            description: 'Autoridade máxima com bypass total. Possui controle absoluto sobre a infraestrutura, chaves de segurança e definições de governança.',
            inheritance: 'Herda tudo + Bypass Casbin',
            capabilities: [
                'Acesso irrestrito a todos os módulos',
                'Gestão de chaves criptográficas e segredos',
                'Alteração de políticas de segurança globais',
                'Criação e exclusão de perfis ADMIN',
                'Acesso direto a logs de auditoria brutos'
            ],
            restrictions: [
                'Nenhuma restrição técnica aplicada'
            ]
        },
        {
            name: 'ADMIN',
            level: 'Gestor',
            icon: <Shield size={16} />,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            description: 'Responsável pela integridade operacional. Gerencia o ciclo de vida de usuários, políticas de acesso e auditoria do sistema.',
            inheritance: 'Herda EDITOR',
            capabilities: [
                'Gestão completa de diretório de usuários',
                'Atribuição de papéis e permissões (RBAC)',
                'Visualização e exportação de logs de auditoria',
                'Configuração de provedores de autenticação (OAuth/MFA)',
                'Aprovação de fluxos operacionais críticos'
            ],
            restrictions: [
                'Não pode alterar configurações de infraestrutura MASTER',
                'Não pode visualizar segredos de sistema criptografados'
            ]
        },
        {
            name: 'EDITOR',
            level: 'Operador Técnico',
            icon: <Edit3 size={16} />,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            description: 'Autonomia técnica sobre regras de negócio. Configura parâmetros de serviços, fluxos de conteúdo e execuções técnicas avançadas.',
            inheritance: 'Herda USER',
            capabilities: [
                'Configuração de parâmetros de serviços ativos',
                'Gestão de conteúdo e metadados de sistema',
                'Execução de scripts técnicos autorizados',
                'Visualização de dashboards de monitoramento',
                'Ajuste de fluxos de trabalho operacionais'
            ],
            restrictions: [
                'Não pode gerenciar outros usuários',
                'Não pode alterar políticas de acesso RBAC',
                'Não possui acesso a logs de auditoria de segurança'
            ]
        },
        {
            name: 'LEITOR',
            level: 'Auditor',
            icon: <Eye size={16} />,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20',
            description: 'Perfil estritamente consultivo. Acesso granular para visualização de logs, configurações e matrizes de auditoria sem poder de alteração.',
            inheritance: 'Independente (Leitura)',
            capabilities: [
                'Visualização de matrizes de governança',
                'Consulta de logs de interação e auditoria',
                'Leitura de configurações de sistema',
                'Geração de relatórios de conformidade',
                'Monitoramento de atividades em tempo real'
            ],
            restrictions: [
                'Proibido qualquer tipo de escrita ou alteração',
                'Não pode executar ações operacionais ou técnicas',
                'Não pode alterar senhas de terceiros'
            ]
        },
        {
            name: 'USER',
            level: 'Consumidor',
            icon: <User size={16} />,
            color: 'text-zinc-400',
            bg: 'bg-zinc-500/10',
            border: 'border-zinc-500/20',
            description: 'Nível base de interação. Permite a utilização padrão das funcionalidades finais e serviços disponibilizados ao ecossistema.',
            inheritance: 'Nível Base',
            capabilities: [
                'Uso das funcionalidades de negócio padrão',
                'Gestão do próprio perfil e preferências',
                'Execução de tarefas operacionais básicas',
                'Acesso a serviços públicos do sistema'
            ],
            restrictions: [
                'Acesso limitado apenas ao escopo de uso final',
                'Sem acesso a configurações ou auditoria',
                'Sem visibilidade sobre outros usuários'
            ]
        }
    ];

    return (
        <div className="mb-8">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-950/40 border border-white/5 rounded-3xl overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <Info size={20} />
                        </div>
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">Arquitetura de Governança</h2>
                            <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Clique nos cards para detalhes profundos</p>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/5">
                        <Shield size={12} className="text-emerald-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400/70">RBAC SOBERANO V9.0</span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                        {roles.map((role, index) => (
                            <div key={role.name} className="relative flex flex-col h-full">
                                <motion.div 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedRole(role)}
                                    className={`flex-1 p-4 rounded-2xl border cursor-pointer ${role.border} ${role.bg} transition-all duration-300 group`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`p-2 rounded-xl bg-black/40 border border-white/5 ${role.color}`}>
                                            {role.icon}
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-tighter opacity-40 group-hover:opacity-100 transition-opacity">
                                            Nível {5 - index}
                                        </span>
                                    </div>
                                    <h3 className={`text-xs font-black uppercase tracking-widest mb-1 ${role.color}`}>
                                        {role.name}
                                    </h3>
                                    <p className="text-[9px] font-bold text-white/60 uppercase tracking-tight mb-3">
                                        {role.level}
                                    </p>
                                    <p className="text-[10px] text-white/40 leading-relaxed font-medium line-clamp-3">
                                        {role.description}
                                    </p>
                                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Herança:</span>
                                        <span className="text-[8px] font-black text-white/50 uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded-md border border-white/5">
                                            {role.inheritance}
                                        </span>
                                    </div>
                                </motion.div>
                                
                                {index < 4 && index !== 3 && (
                                    <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-white/10">
                                        <ArrowDown className="-rotate-90" size={16} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Footer / Hierarchy Note */}
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                        <div className="p-3 rounded-full bg-white/5 text-white/40">
                            <ArrowDown size={18} />
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/80">Fluxo de Herança Vertical</h4>
                            <p className="text-[9px] text-white/40 uppercase tracking-wider leading-relaxed">
                                Papeis de nível superior herdam automaticamente todas as permissões dos níveis inferiores, 
                                garantindo uma gestão em cascata simplificada e segura. O perfil <span className="text-amber-400 font-bold">MASTER</span> opera 
                                fora da matriz convencional como autoridade de bypass.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Detailed Role Modal */}
            <AnimatePresence>
                {selectedRole && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedRole(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className={`relative w-full max-w-2xl bg-zinc-950 border ${selectedRole.border} rounded-[2.5rem] overflow-hidden shadow-2xl`}
                        >
                            <div className="p-8 space-y-8">
                                {/* Modal Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className={`p-4 rounded-[1.5rem] bg-black/40 border ${selectedRole.border} ${selectedRole.color}`}>
                                            {React.cloneElement(selectedRole.icon as React.ReactElement, { size: 32 })}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h2 className={`text-2xl font-black uppercase tracking-[0.1em] ${selectedRole.color}`}>
                                                    {selectedRole.name}
                                                </h2>
                                                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-white/40 uppercase tracking-widest">
                                                    {selectedRole.level}
                                                </span>
                                            </div>
                                            <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest">
                                                Definição e Limites de Governança
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedRole(null)}
                                        className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <div className="space-y-6">
                                    <div className="p-5 rounded-3xl bg-white/5 border border-white/5">
                                        <p className="text-sm text-white/80 leading-relaxed italic">
                                            "{selectedRole.description}"
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Capabilities */}
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-2">
                                                <CheckCircle2 size={14} />
                                                Capacidades Técnicas
                                            </h4>
                                            <div className="space-y-2">
                                                {selectedRole.capabilities.map((cap, i) => (
                                                    <div key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                                        <span className="text-[11px] font-medium text-white/70 leading-tight">{cap}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Restrictions */}
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400 flex items-center gap-2">
                                                <AlertCircle size={14} />
                                                Restrições e Limites
                                            </h4>
                                            <div className="space-y-2">
                                                {selectedRole.restrictions.map((res, i) => (
                                                    <div key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                                                        <span className="text-[11px] font-medium text-white/70 leading-tight">{res}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Inheritance Footer */}
                                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Lógica de Herança:</span>
                                            <div className="px-4 py-2 rounded-xl bg-black/40 border border-white/10 flex items-center gap-3">
                                                <ArrowDown size={14} className="text-white/20" />
                                                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                                                    {selectedRole.inheritance}
                                                </span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setSelectedRole(null)}
                                            className="px-6 py-2.5 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-colors"
                                        >
                                            Entendido
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
