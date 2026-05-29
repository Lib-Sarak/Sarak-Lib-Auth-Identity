import { AuthModuleManifest } from '../manifest';
import Painel from './Painel';

// Contrato Duplo do Auth: Espalha o manifesto na raiz para compatibilidade com registerSarakModule
export const UI = {
    ...AuthModuleManifest,
    component: Painel
};

export default UI;
