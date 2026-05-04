import React from 'react';
import { DynamicRenderer } from '@sarak/lib-ui-core';
import { AuthModuleManifest } from '../../manifest';

/**
 * SecurityModule (v1.0)
 * Componente Soberano que encapsula o DynamicRenderer para garantir que os 
 * visualContracts da lib de identidade sejam renderizados mesmo se o hook 
 * de descoberta da UI-Core falhar em mapeá-los.
 */
export const SecurityModule: React.FC = () => {
    console.log("[AuthIdentity:SecurityModule] Inicializando renderização dinâmica de segurança...");

    return (
        <DynamicRenderer 
            contracts={AuthModuleManifest.visualContracts as any} 
            module={AuthModuleManifest as any} 
        />
    );
};

export default SecurityModule;
