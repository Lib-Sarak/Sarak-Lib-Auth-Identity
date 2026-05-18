import React, { useState, useEffect } from 'react';
import { authApi } from '../../api/auth-client';
import { 
    Shield, QrCode, Lock, Unlock, Key, Github, Chrome, 
    RefreshCw, CheckCircle2, ShieldAlert, Clipboard 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface MfaStatusResponse {
    mfa_enabled: boolean;
    has_backup_codes: boolean;
}

interface OAuthStatusResponse {
    google_connected: boolean;
    github_connected: boolean;
}

export const SecurityVault: React.FC = () => {
    const [mfaStatus, setMfaStatus] = useState<MfaStatusResponse | null>(null);
    const [oauthStatus, setOauthStatus] = useState<OAuthStatusResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [mfaSetupData, setMfaSetupData] = useState<{ secret: string; qr_code: string } | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const fetchSecurityStatus = async () => {
        setLoading(true);
        try {
            const [mfaRes, oauthRes] = await Promise.all([
                authApi.get('/mfa/status'),
                authApi.get('/oauth/status'),
            ]);
            setMfaStatus(mfaRes.data);
            setOauthStatus(oauthRes.data);
        } catch (error) {
            console.error('[SecurityVault] Failed to fetch security vault status', error);
            showNotification('Erro ao carregar dados do Cofre de Segurança.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSecurityStatus();
    }, []);

    const handleStartMfaSetup = async () => {
        setActionLoading(true);
        try {
            const response = await authApi.post('/mfa/setup');
            setMfaSetupData(response.data);
        } catch (error: any) {
            showNotification(error.response?.data?.detail || 'Erro ao iniciar setup do MFA.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleEnableMfa = async (e: React.FormEvent) => {
        e.preventDefault();
        if (verificationCode.length !== 6) {
            showNotification('O código de verificação deve ter exatamente 6 dígitos.', 'error');
            return;
        }

        setActionLoading(true);
        try {
            const response = await authApi.post('/mfa/enable', { code: verificationCode });
            setBackupCodes(response.data.backup_codes || []);
            showNotification('MFA ativado com sucesso!', 'success');
            setMfaSetupData(null);
            setVerificationCode('');
            await fetchSecurityStatus();
        } catch (error: any) {
            showNotification(error.response?.data?.detail || 'Código de verificação incorreto.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDisableMfa = async () => {
        setActionLoading(true);
        try {
            await authApi.post('/mfa/disable');
            showNotification('Autenticação Multifator (MFA) desativada com sucesso.', 'success');
            setBackupCodes([]);
            await fetchSecurityStatus();
        } catch (error: any) {
            showNotification(error.response?.data?.detail || 'Erro ao desativar MFA.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleOAuthConnect = async (provider: string) => {
        try {
            // Recovers URL for redirect
            const response = await authApi.get(`/oauth/${provider}/login`);
            if (response.data && response.data.url) {
                window.location.href = response.data.url;
            } else {
                showNotification(`Não foi possível obter URL de conexão do ${provider}.`, 'error');
            }
        } catch (error: any) {
            showNotification(`Erro ao conectar provedor ${provider}.`, 'error');
        }
    };

    const copyBackupCodes = () => {
        navigator.clipboard.writeText(backupCodes.join('\n'));
        showNotification('Códigos de recuperação copiados para a área de transferência.', 'success');
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

            {/* AUTENTICAÇÃO MULTIFATOR (MFA) CARD */}
            <div className="bg-zinc-950/40 border border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-xl space-y-6">
                <div>
                    <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                        <Lock size={16} className="text-emerald-400" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-white">Autenticação Multifator (MFA)</h3>
                    </div>

                    <p className="text-xs text-white/50 leading-relaxed mt-4">
                        Adicione uma camada extra de segurança à sua conta exigindo um token gerado temporariamente no seu celular (Google Authenticator, Authy, etc.) a cada login.
                    </p>

                    {loading ? (
                        <div className="py-12 flex justify-center text-white/20 animate-pulse">
                            <RefreshCw className="animate-spin mb-2" size={20} />
                        </div>
                    ) : mfaStatus?.mfa_enabled ? (
                        <div className="mt-6 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-4">
                            <div className="flex items-center gap-3 text-emerald-400">
                                <CheckCircle2 size={18} />
                                <span className="text-xs font-black uppercase tracking-wider">MFA Ativo e Protegendo sua Conta</span>
                            </div>
                            <button
                                onClick={handleDisableMfa}
                                disabled={actionLoading}
                                className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                            >
                                {actionLoading ? 'Processando...' : 'Desativar Proteção MFA'}
                            </button>
                        </div>
                    ) : (
                        <div className="mt-6 space-y-6">
                            {!mfaSetupData && (
                                <button
                                    onClick={handleStartMfaSetup}
                                    disabled={actionLoading}
                                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    <QrCode size={14} />
                                    {actionLoading ? 'Iniciando...' : 'Configurar Autenticação de 2 Fatores'}
                                </button>
                            )}

                            {/* Setup Mode */}
                            {mfaSetupData && (
                                <div className="p-4 rounded-2xl bg-black/60 border border-white/5 space-y-6 animate-in zoom-in-95 duration-300">
                                    <div className="flex flex-col items-center space-y-3">
                                        <div className="bg-white p-3 rounded-2xl">
                                            <QRCodeSVG value={mfaSetupData.qr_code} size={130} />
                                        </div>
                                        <span className="text-[10px] text-white/40 font-black uppercase tracking-wider text-center">
                                            Escaneie o QR Code acima no seu app de autenticação.
                                        </span>
                                        <div className="w-full px-3 py-1.5 rounded-lg bg-white/5 text-center text-[10px] text-emerald-400 font-mono select-all">
                                            Chave: {mfaSetupData.secret}
                                        </div>
                                    </div>

                                    <form onSubmit={handleEnableMfa} className="space-y-3">
                                        <input
                                            type="text"
                                            maxLength={6}
                                            required
                                            placeholder="Digite o código de 6 dígitos..."
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                            className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-center font-mono text-sm tracking-[0.4em] text-white placeholder-white/10 focus:outline-none focus:border-emerald-500/50"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setMfaSetupData(null)}
                                                className="w-1/3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider border border-white/5 transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={actionLoading}
                                                className="w-2/3 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                                            >
                                                {actionLoading ? 'Validando...' : 'Confirmar e Ativar'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* BACKUP CODES DISPLAY */}
                {backupCodes.length > 0 && (
                    <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                                <ShieldAlert size={14} /> Guarde seus Códigos de Recuperação!
                            </span>
                            <button onClick={copyBackupCodes} className="text-white/40 hover:text-white transition-colors" title="Copiar códigos">
                                <Clipboard size={14} />
                            </button>
                        </div>
                        <p className="text-[9px] text-white/50 leading-relaxed">
                            Se você perder o acesso ao seu dispositivo MFA, cada um destes códigos servirá para acessar sua conta uma única vez:
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono text-white/95 bg-black/50 p-3 rounded-xl border border-white/5">
                            {backupCodes.map((code, idx) => (
                                <div key={idx}>{code}</div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* INTEGRATING OAUTH SSO PROVIDERS */}
            <div className="bg-zinc-950/40 border border-white/5 rounded-3xl p-6 shadow-xl space-y-6 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                        <Key size={16} className="text-emerald-400" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-white">Provedores Externos (OAuth SSO)</h3>
                    </div>

                    <p className="text-xs text-white/50 leading-relaxed mt-4">
                        Conecte sua conta local do Sarak com provedores de SSO para efetuar login rápido de forma nativa e sem precisar digitar senhas.
                    </p>

                    {loading ? (
                        <div className="py-12 flex justify-center text-white/20 animate-pulse">
                            <RefreshCw className="animate-spin mb-2" size={20} />
                        </div>
                    ) : (
                        <div className="mt-8 space-y-4">
                            {/* GOOGLE CARD */}
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <Chrome size={18} className="text-emerald-400" />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-white">Google SSO</span>
                                        <span className="text-[9px] text-white/30">Acesso via conta corporativa</span>
                                    </div>
                                </div>
                                {oauthStatus?.google_connected ? (
                                    <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest">
                                        Conectado
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => handleOAuthConnect('google')}
                                        className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider border border-white/5 transition-colors"
                                    >
                                        Conectar
                                    </button>
                                )}
                            </div>

                            {/* GITHUB CARD */}
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <Github size={18} className="text-emerald-400" />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-white">GitHub SSO</span>
                                        <span className="text-[9px] text-white/30">Acesso via identidade técnica</span>
                                    </div>
                                </div>
                                {oauthStatus?.github_connected ? (
                                    <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest">
                                        Conectado
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => handleOAuthConnect('github')}
                                        className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider border border-white/5 transition-colors"
                                    >
                                        Conectar
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 text-[9px] text-white/30 leading-normal flex items-start gap-2">
                    <ShieldAlert size={14} className="flex-shrink-0 text-emerald-400/50" />
                    <span>
                        Para segurança soberana, você não pode desconectar todas as contas SSO se você não possuir uma senha forte configurada no sistema.
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SecurityVault;
