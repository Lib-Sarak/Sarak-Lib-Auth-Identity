import { registerSarakModule } from '@sarak/lib-shared';
import Login from './Login';

registerSarakModule({
    id: 'auth-profile',
    label: 'Meu Perfil',
    icon: 'User',
    component: Login, // No Sarak OS, o componente de Login muitas vezes serve como Profile quando autenticado
    priority: 0
});

export { AuthProvider, useAuth } from './AuthContext';
export { default as ProtectedRoute } from './ProtectedRoute';
export { default as Login } from './Login';
export { default as ChangePasswordModal } from './ChangePasswordModal';
