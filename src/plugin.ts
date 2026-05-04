import { registerLocalComponent } from '@sarak/lib-ui-core';
import { AuthModuleManifest } from './manifest';
import { SecurityModule } from './components/auth/SecurityModule';
import { configureAuthApi } from './api/auth-client';

/**
 * Bootstrapper Soberano do Módulo de Identidade (v10.0)
 * 
 * Esta função deve ser chamada no ponto de entrada do sistema hospedeiro (ex: main.tsx)
 * passando o manifesto local. Ela se encarrega de:
 * 1. Fundir os contratos visuais (tabs, stats, grids) no manifesto do hospedeiro.
 * 2. Registrar o componente nativo na UI-Core automaticamente.
 * 3. Configurar a base URL dinâmica para o cliente HTTP interno.
 */
export const withIdentityModule = (hostManifest: any) => {
    console.log("[AuthIdentity:Plugin] Inicializando integração Plug & Play...");

    // 1. Encontra a definição do módulo de identidade no manifesto do hospedeiro
    const identityModuleConfig = hostManifest.modules.find(
        (mod: any) => mod.id === 'sarak-lib-auth-identity' || mod.id === 'auth'
    );

    if (!identityModuleConfig) {
        console.warn("[AuthIdentity:Plugin] Módulo não encontrado no manifesto do hospedeiro. A integração pode falhar.");
    }

    // 2. Extrai o baseUrl (prioridade para o hospedeiro, fallback para o da lib)
    const activeBaseUrl = identityModuleConfig?.baseUrl || AuthModuleManifest.baseUrl;
    
    // 3. Configura o cliente HTTP interno da biblioteca
    configureAuthApi(activeBaseUrl);

    // 4. Cria o manifesto final fazendo a fusão
    const finalManifest = {
        ...hostManifest,
        modules: hostManifest.modules.map((mod: any) => {
            if (mod.id === 'sarak-lib-auth-identity' || mod.id === 'auth') {
                return {
                    ...AuthModuleManifest, // Traz os visualContracts e capabilities da lib
                    ...mod,                // Sobrepõe com customizações do hospedeiro (label, icon, baseUrl)
                    baseUrl: activeBaseUrl
                };
            }
            return mod;
        })
    };

    // 5. Auto-registro do componente de Segurança na UI-Core
    try {
        registerLocalComponent('sarak-lib-auth-identity', SecurityModule);
        if (identityModuleConfig && identityModuleConfig.id !== 'sarak-lib-auth-identity') {
            registerLocalComponent(identityModuleConfig.id, SecurityModule);
        }
        console.log("[AuthIdentity:Plugin] Componente de Segurança registrado com sucesso na UI-Core.");
    } catch (e) {
        console.error("[AuthIdentity:Plugin] Falha ao auto-registrar componente:", e);
    }

    return finalManifest;
};
