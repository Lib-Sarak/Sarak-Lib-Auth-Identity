import React from 'react';
import { SecurityModule } from '../components/auth/SecurityModule';
import { SarakAnalyticalPage } from '@sarak/lib-ui-core';

/**
 * Painel Mestre do Auth
 * Envelopado na SarakAnalyticalPage. Mantemos o isolamento visual 
 * sem alterar o componente interno, preservando a regra arquitetural.
 */
const Painel: React.FC<any> = (props) => {
    return (
        <SarakAnalyticalPage 
            mainContent={
                <div className="max-sm:[&>div]:!p-4 max-sm:[&>div]:!px-2">
                    <SecurityModule {...props} />
                </div>
            }
        />
    );
};

export default Painel;
