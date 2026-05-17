import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import { SarakAuthScreen, useSarakUI } from '@sarak/lib-ui-core';
import { AuthModuleManifest } from "../../manifest";

interface Branding {
    name: string;
    logo?: string;
}

/**
 * Login (Logical Container v9.5)
 * 
 * Este componente agora é apenas um provedor de lógica.
 * A renderização foi terceirizada para o template SarakAuthScreen da UI-Core.
 */
export const Login: React.FC<{ branding?: Branding, onSuccess?: () => void }> = ({ branding, onSuccess }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string>('');
    const [isPending, setIsPending] = useState(false);
    
    // MFA State (v7.7)
    const [mfaStep, setMfaStep] = useState(false);
    const [mfaToken, setMfaToken] = useState<string | null>(null);
    const [mfaCode, setMfaCode] = useState('');

    const { login: loginAPI, register: registerAPI, verifyMFA, getOAuthLoginUrl } = useAuth();
    const { registeredModules } = useSarakUI();
    const navigate = useNavigate();
    const location = useLocation();

    // Recupera o manifesto dinâmico (fundido pelo plugin)
    const activeModule = registeredModules?.find((m: any) => m.id === 'sarak-lib-auth-identity' || m.id === 'auth');
    const manifest = (activeModule?.manifest || AuthModuleManifest) as typeof AuthModuleManifest;
    const oauthConfig = manifest.capabilities?.security?.oauth;

    // Where to redirect after login
    const from = (location.state as any)?.from?.pathname || "/";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsPending(true);

        if (mfaStep && mfaToken) {
            const mfaResult = await verifyMFA(mfaToken, mfaCode);
            if (mfaResult.success) {
                onSuccess?.();
                setIsPending(false);
                navigate(from, { replace: true });
            } else {
                setError(mfaResult.error || 'Código MFA inválido.');
                setIsPending(false);
            }
            return;
        }

        if (isRegistering) {
            const regResult = await registerAPI(username, password);
            if (regResult.success) {
                const loginResult = await loginAPI(username, password);
                if (loginResult.success) {
                    if (loginResult.mfa_required) {
                        setMfaStep(true);
                        setMfaToken(loginResult.mfa_token!);
                    } else {
                        onSuccess?.();
                        navigate(from, { replace: true });
                    }
                }
                setIsPending(false);
            } else {
                setError(regResult.error || 'Erro ao criar conta');
                setIsPending(false);
            }
        } else {
            const result = await loginAPI(username, password);
            if (result.success) {
                if (result.mfa_required) {
                    setMfaStep(true);
                    setMfaToken(result.mfa_token!);
                    setIsPending(false);
                } else if (result.token) {
                    onSuccess?.();
                    setIsPending(false);
                    navigate(from, { replace: true });
                }
            } else {
                setError(result.error || 'Erro ao realizar login');
                setIsPending(false);
            }
        }
    };

    const handleSocialLogin = async (provider: string) => {
        window.dispatchEvent(new CustomEvent('auth:oauth_init', { detail: { provider } }));
        const result = await getOAuthLoginUrl(provider);
        if (result.success && result.url) {
            window.location.href = result.url;
        } else {
            setError(result.error || 'Falha ao iniciar login social.');
        }
    };

    return (
        <SarakAuthScreen 
            branding={branding}
            isRegistering={isRegistering}
            setIsRegistering={setIsRegistering}
            mfaStep={mfaStep}
            setMfaStep={setMfaStep}
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            mfaCode={mfaCode}
            setMfaCode={setMfaCode}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            error={error}
            isPending={isPending}
            onSubmit={handleSubmit}
            onSocialLogin={handleSocialLogin}
            socialConfig={{
                enabled: oauthConfig?.enabled || false,
                display: oauthConfig?.display || 'full',
                providers: (oauthConfig?.providers || []).map((p: any) => ({ id: p, variant: 'glass' }))
            }}
            onMasterLogin={() => {
                setUsername('master@seed.com');
                setPassword('Sarak1234');
            }}
        />
    );
};
