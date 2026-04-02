import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useSarak } from '@sarak/lib-shared';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Cpu,
    Lock,
    User,
    Eye,
    EyeOff,
    ShieldCheck,
    Activity,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface Branding {
    name: string;
    logo?: string;
}

function cn(...inputs: any[]) {
    return twMerge(clsx(inputs));
}

export const Login: React.FC<{ branding?: Branding, onSuccess?: () => void }> = ({ branding, onSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string>('');
    const [isPending, setIsPending] = useState(false);

    const { login } = useAuth();
    const { login: syncSarak } = useSarak();
    const navigate = useNavigate();
    const location = useLocation();

    // Where to redirect after login
    const from = (location.state as any)?.from?.pathname || "/";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsPending(true);

        // Correção Matrix: Passar argumentos posicionais para evitar objeto aninhado (Fix 422)
        const result = await login(username, password);

        if (result.success) {
            navigate(from, { replace: true });
        } else {
            setError(result.error || 'Erro ao realizar login');
            setIsPending(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-theme-body text-theme-text selection:bg-theme-primary/30 font-sans overflow-hidden">

            {/* Left Side - Hero Section */}
            <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-gradient-to-br from-theme-body via-theme-body to-theme-primary/20 items-center justify-center p-12">

                {/* Animated Decorative Background */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-theme-primary/20 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]"></div>
                </div>

                {/* Visual Grid */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

                <div className="relative z-10 max-w-xl text-center flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 0.8, type: "spring" }}
                        className="w-24 h-24 bg-gradient-to-tr from-theme-primary to-theme-primary/60 rounded-3xl flex items-center justify-center shadow-2xl shadow-theme-primary/20 mb-8 border border-theme-primary/20"
                    >
                        {branding?.logo ? (
                            <img src={branding.logo} alt="Logo" className="w-12 h-12 object-contain" />
                        ) : (
                            <Cpu className="w-12 h-12 text-white" />
                        )}
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-6xl font-black tracking-tighter mb-6 bg-gradient-to-r from-theme-primary via-white to-theme-primary bg-[length:200%_auto] animate-gradient-text bg-clip-text text-transparent uppercase"
                    >
                        {branding?.name}
                    </motion.h1>



                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="mt-12 flex gap-4"
                    >
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full sarak-glass bg-theme-card border border-theme-border backdrop-blur-md">
                            <ShieldCheck className="w-4 h-4 text-theme-secondary" />
                            <span className="text-xs font-bold text-theme-muted uppercase tracking-widest">Secure</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full sarak-glass bg-theme-card border border-theme-border backdrop-blur-md">
                            <Activity className="w-4 h-4 text-theme-primary" />
                            <span className="text-xs font-bold text-theme-muted uppercase tracking-widest">Neural</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Form Section */}
            <div className="w-full lg:w-2/5 flex items-center justify-center p-8 bg-theme-body border-l border-theme-border shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    <div className="mb-10 block lg:hidden text-center">
                        <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
                            {branding?.logo ? (
                                <img src={branding.logo} alt="Logo" className="w-8 h-8 object-contain" />
                            ) : (
                                <Cpu className="w-8 h-8 text-white" />
                            )}
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">{branding?.name}</h2>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-3xl font-black text-theme-text mb-2 tracking-tight">Login do Sistema</h3>
                        <p className="text-theme-muted font-medium">Insira suas credenciais para continuar.</p>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm font-medium"
                            >
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Usuário / E-mail</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500 text-slate-500">
                                    <User className="h-5 w-5" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-4 sarak-glass bg-theme-card border border-theme-border rounded-2xl focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary outline-none transition-all placeholder:text-theme-muted/30 text-theme-text font-medium"
                                    placeholder="Ex: Igor ou seu@email.com"
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Senha</label>
                                <button type="button" className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors">Esqueceu?</button>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500 text-slate-500">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-12 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-700 text-white font-medium"
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-600 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full mt-4 flex items-center justify-center gap-2 py-4 bg-theme-primary hover:opacity-90 disabled:bg-theme-card disabled:text-theme-muted text-theme-text rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-theme-primary/10 active:scale-[0.98]"
                        >
                            {isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>Acessar Sistema <ChevronRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 space-y-3">
                        <button
                            type="button"
                            onClick={() => {
                                setUsername('usuario@teste.com');
                                setPassword('test1234');
                            }}
                            className="w-full py-3 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 text-blue-400 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all"
                        >
                            Entrar como usuário teste
                        </button>

                    </div>

                    <div className="mt-10 pt-8 border-t border-slate-900 text-center">
                        <p className="text-slate-500 text-sm font-medium">
                            Não tem uma conta? <button className="text-blue-500 font-bold hover:underline">Solicitar acesso</button>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

// Removida exportação default para consistência do ecossistema Sarak
