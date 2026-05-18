import React, { useState, useEffect } from 'react';
import { authApi } from '../../api/auth-client';
import { 
    Activity, LogIn, Users, ShieldAlert, Monitor, 
    Globe, Terminal, AlertTriangle, CheckCircle, RefreshCw 
} from 'lucide-react';

interface Stats {
    total_logins: number;
    active_sessions: number;
    blocked_attempts: number;
}

interface ActiveSession {
    id: string;
    username: string;
    ip_address: string;
    user_agent: string;
    created_at: string;
    expires_at: string;
}

interface AuditLog {
    id: string;
    username: string;
    ip: string;
    status: 'Sucesso' | 'Falha';
    reason: string;
    created_at: string;
}

export const AuditMonitor: React.FC = () => {
    const [stats, setStats] = useState<Stats>({ total_logins: 0, active_sessions: 0, blocked_attempts: 0 });
    const [sessions, setSessions] = useState<ActiveSession[]>([]);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSubTab, setActiveSubTab] = useState<'sessions' | 'logs'>('sessions');
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const fetchAuditData = async () => {
        setLoading(true);
        try {
            const [statsRes, sessionsRes, logsRes] = await Promise.all([
                authApi.get('/interactions'),
                authApi.get('/interactions?scope=sessions'),
                authApi.get('/interactions?scope=logins'),
            ]);
            setStats(statsRes.data || { total_logins: 0, active_sessions: 0, blocked_attempts: 0 });
            setSessions(sessionsRes.data || []);
            setLogs(logsRes.data || []);
        } catch (error) {
            console.error('[AuditMonitor] Failed to fetch audit metrics', error);
            showNotification('Erro ao carregar dados de monitoramento e auditoria.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuditData();
    }, []);

    const handleRevokeSession = async (sessionId: string) => {
        setActionLoading(sessionId);
        try {
            await authApi.delete(`/sessions/${sessionId}`);
            showNotification('Sessão revogada com sucesso. O dispositivo foi deslogado.', 'success');
            await fetchAuditData();
        } catch (error: any) {
            showNotification(error.response?.data?.detail || 'Erro ao revogar sessão.', 'error');
        } finally {
            setActionLoading(null);
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

            {/* 1. STATS METRICS CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* LOGINS */}
                <div className="bg-zinc-950/40 border border-white/5 p-5 rounded-3xl flex items-center gap-4 shadow-lg hover:border-emerald-500/20 transition-all">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <LogIn size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-white">{stats.total_logins}</span>
                        <span className="text-[9px] font-black uppercase tracking-wider text-white/40">Logins (24h)</span>
                    </div>
                </div>

                {/* SESSIONS */}
                <div className="bg-zinc-950/40 border border-white/5 p-5 rounded-3xl flex items-center gap-4 shadow-lg hover:border-emerald-500/20 transition-all">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Users size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-white">{stats.active_sessions}</span>
                        <span className="text-[9px] font-black uppercase tracking-wider text-white/40">Sessões Ativas</span>
                    </div>
                </div>

                {/* BLOCKED */}
                <div className="bg-zinc-950/40 border border-white/5 p-5 rounded-3xl flex items-center gap-4 shadow-lg hover:border-rose-500/20 transition-all">
                    <div className="h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                        <ShieldAlert size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-white">{stats.blocked_attempts}</span>
                        <span className="text-[9px] font-black uppercase tracking-wider text-white/40">Tentativas Falhas</span>
                    </div>
                </div>
            </div>

            {/* 2. TAB TOGGLE */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-white/5 rounded-2xl w-fit">
                    <button
                        onClick={() => setActiveSubTab('sessions')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                            activeSubTab === 'sessions' 
                                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/10' 
                                : 'text-white/40 hover:text-white'
                        }`}
                    >
                        Sessões Conectadas
                    </button>
                    <button
                        onClick={() => setActiveSubTab('logs')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                            activeSubTab === 'logs' 
                                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/10' 
                                : 'text-white/40 hover:text-white'
                        }`}
                    >
                        Registro de Auditoria
                    </button>
                </div>

                {/* 3. DYNAMIC DATA VIEWS */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-white/20 animate-pulse bg-black/20 border border-white/5 rounded-3xl">
                        <Activity className="animate-spin-slow mb-3" size={24} />
                        <span className="uppercase tracking-[0.3em] text-[9px] font-black">Consolidando registros de auditoria...</span>
                    </div>
                ) : activeSubTab === 'sessions' ? (
                    /* SESSIONS TABLE */
                    <div className="overflow-x-auto rounded-3xl border border-white/5 bg-black/20 backdrop-blur-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5 text-[9px] font-black uppercase tracking-wider text-white/50">
                                    <th className="px-6 py-4">Usuário</th>
                                    <th className="px-6 py-4">IP Conexão</th>
                                    <th className="px-6 py-4">Dispositivo / Agente</th>
                                    <th className="px-6 py-4 text-right">Controle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-xs text-white/80">
                                {sessions.length > 0 ? (
                                    sessions.map((s) => (
                                        <tr key={s.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-white/95">{s.username}</td>
                                            <td className="px-6 py-4 font-mono text-[10px] text-emerald-400">
                                                <span className="flex items-center gap-1.5">
                                                    <Globe size={12} className="opacity-60" /> {s.ip_address}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-white/40 text-[10px]">
                                                <span className="flex items-center gap-1.5 max-w-sm truncate">
                                                    <Monitor size={12} className="opacity-60 flex-shrink-0" /> {s.user_agent}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleRevokeSession(s.id)}
                                                    disabled={actionLoading === s.id}
                                                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 text-[9px] font-black uppercase tracking-widest transition-colors disabled:opacity-50"
                                                >
                                                    {actionLoading === s.id ? 'Revogando...' : 'Revogar Acesso'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-white/20">
                                            Nenhuma sessão ativa encontrada.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    /* AUDIT LOGS TABLE */
                    <div className="overflow-x-auto rounded-3xl border border-white/5 bg-black/20 backdrop-blur-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5 text-[9px] font-black uppercase tracking-wider text-white/50">
                                    <th className="px-6 py-4">Data / Hora</th>
                                    <th className="px-6 py-4">Identidade</th>
                                    <th className="px-6 py-4">Evento / Ação</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">IP Origem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-xs text-white/80">
                                {logs.length > 0 ? (
                                    logs.map((l) => (
                                        <tr key={l.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-mono text-[10px] text-white/40">
                                                {new Date(l.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-white/95">{l.username}</td>
                                            <td className="px-6 py-4 font-mono text-[10px] text-emerald-400/90">
                                                <span className="flex items-center gap-1.5">
                                                    <Terminal size={12} className="opacity-40" /> {l.reason}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider border flex items-center gap-1 w-fit ${
                                                        l.status === 'Sucesso'
                                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                                    }`}
                                                >
                                                    {l.status === 'Sucesso' ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
                                                    {l.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-[10px] text-white/40">{l.ip}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-white/20">
                                            Nenhum log de auditoria disponível no momento.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditMonitor;
