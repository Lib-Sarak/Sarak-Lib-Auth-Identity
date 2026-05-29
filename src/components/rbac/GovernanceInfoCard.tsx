import React, { useState } from 'react';
import { Shield, Info, ArrowDown, Zap, Edit3, Eye, User, X, CheckCircle2, AlertCircle, BookOpen, Key } from 'lucide-react';
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

interface TechPermission {
    key: string;
    label: string;
    description: string;
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

    const techPermissions: TechPermission[] = [
        { key: 'identity:view', label: 'Identidade: Visualização', description: 'Visualização de perfis, status de sessões e metadados de identidade.' },
        { key: 'user:manage', label: 'Usuário: Gestão', description: 'Gestão de ciclo de vida (Criar, Editar e Suspender usuários).' },
        { key: 'user:security', label: 'Usuário: Segurança', description: 'Gestão de credenciais (Reset de senhas, MFA e Tokens de acesso).' },
        { key: 'rbac:manage', label: 'RBAC: Gestão', description: 'Controle total da matriz de permissões, papéis e regras de acesso.' },
        { key: 'rbac:view', label: 'RBAC: Visualização', description: 'Visualizar matriz de governança e auditoria de regras aplicadas.' },
        { key: 'audit:view', label: 'Auditoria: Visualização', description: 'Consulta de logs de interação e trilhas de auditoria do sistema.' },
        { key: 'audit:config', label: 'Auditoria: Conformidade', description: 'Configuração de retenção de logs e exportação para conformidade legal.' },
        { key: 'system:config', label: 'Sistema: Configurações', description: 'Alteração de parâmetros operacionais e configurações globais não sensíveis.' },
        { key: 'security:secrets', label: 'Segurança: Segredos', description: 'Gestão de chaves de API, tokens OAuth e segredos criptográficos.' },
        { key: 'content:manage', label: 'Conteúdo: Gestão', description: 'Gerenciar fluxos de dados, metadados de negócio e ativos digitais.' },
        { key: 'service:edit', label: 'Serviço: Edição', description: 'Configurar parâmetros técnicos de execução e limites de serviços.' },
        { key: 'service:execute', label: 'Serviço: Execução', description: 'Capacidade de acionar as funcionalidades finais do ecossistema.' }
    ];

    return (
        <div className="mb-12 space-y-6">
            
            {/* 1. CARD DE PAPÉIS (CONTROLE SOBERANO) */}
            <motion.div 
                key="rbac-roles-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-950/40 border border-white/5 rounded-3xl overflow-hidden shadow-2xl"
            >
                <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <Shield size={20} />
                        </div>
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">Papéis de Acesso (RBAC)</h2>
                            <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Clique nos cards para detalhes de capacidades e limites</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 @lg:grid-cols-5 gap-4">
                        {roles.map((role, index) => (
                            <div key={`role-col-${role.name}`} className="relative flex flex-col h-full">
                                <motion.div 
                                    key={`role-card-${role.name}`}
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
                                </motion.div>
                                
                                {index < 4 && index !== 3 && (
                                    <div className="hidden @lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-white/10">
                                        <ArrowDown className="-rotate-90" size={16} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* 2. CARD DE HIERARQUIA E HERANÇA */}
            <motion.div 
                key="rbac-hierarchy-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-zinc-950/40 border border-white/5 rounded-3xl overflow-hidden shadow-2xl p-6"
            >
                <div className="flex flex-col @md:flex-row items-center gap-6">
                    <div className="h-14 w-14 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 shrink-0">
                        <ArrowDown size={24} />
                    </div>
                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white mb-2 flex items-center gap-2">
                            Fluxo de Herança Vertical
                            <span className="text-[8px] px-2 py-0.5 rounded bg-white/5 text-white/30 border border-white/10">SARK LOGIC</span>
                        </h4>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
                            O ecossistema Sarak utiliza um modelo de <span className="text-white font-bold">Herança em Cascata</span>. 
                            Papeis de nível superior herdam automaticamente todas as permissões dos níveis inferiores, 
                            garantindo uma gestão simplificada e segura. O perfil <span className="text-amber-400 font-bold">MASTER</span> opera 
                            fora da matriz convencional como autoridade de bypass.
                        </p>
                    </div>
                    <div className="flex gap-2 shrink-0 overflow-x-auto pb-2 @md:pb-0">
                        {['MASTER', 'ADMIN', 'EDITOR', 'USER'].map((r, i) => (
                            <div key={`hierarchy-step-${r}`} className="flex items-center gap-2">
                                <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-[9px] font-black text-white/40 uppercase tracking-widest">
                                    {r}
                                </div>
                                {i < 3 && <ArrowDown size={12} className="-rotate-90 text-white/10" />}
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* 3. CARD DE DICIONÁRIO DE REGRAS TÉCNICAS */}
            <motion.div 
                key="rbac-dictionary-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-zinc-950/40 border border-white/5 rounded-3xl overflow-hidden shadow-2xl"
            >
                <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                            <BookOpen size={20} />
                        </div>
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">Dicionário de Regras Técnicas</h2>
                            <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Mapeamento funcional das chaves de acesso do sistema</p>
                        </div>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2">
                        <Key size={12} className="text-blue-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-400/70">DICTIONARY V1.0</span>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 gap-3">
                        {techPermissions.map((perm) => (
                            <div key={`perm-row-${perm.key}`} className="p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-blue-500/20 transition-all group flex flex-col @md:flex-row @md:items-center justify-between gap-4">
                                <div className="flex flex-col @md:flex-row @md:items-center gap-2 @md:gap-6">
                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest min-w-[120px]">{perm.key}</span>
                                    <div className="h-4 w-px bg-white/5 hidden @md:block" />
                                    <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">{perm.label}</span>
                                </div>
                                <p className="text-[10px] text-white/30 font-medium italic @md:text-right">
                                    "{perm.description}"
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Detailed Role Modal */}
            <AnimatePresence mode="wait">
                {selectedRole && (
                    <motion.div
                        key="role-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 @sm:p-6"
                    >
                        <motion.div
                            key="modal-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedRole(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            key={`modal-content-${selectedRole.name}`}
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

                                    <div className="grid grid-cols-1 @md:grid-cols-2 gap-6">
                                        {/* Capabilities */}
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-2">
                                                <CheckCircle2 size={14} />
                                                Capacidades Técnicas
                                            </h4>
                                            <div className="space-y-2">
                                                {selectedRole.capabilities.map((cap, i) => (
                                                    <div key={`cap-${selectedRole.name}-${i}`} className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
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
                                                    <div key={`res-${selectedRole.name}-${i}`} className="flex items-start gap-3 p-3 rounded-2xl bg-rose-500/5 border border-rose-500/10">
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
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

