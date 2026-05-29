import React, { useState, useEffect } from 'react';
import { authApi } from '../../api/auth-client';
import { Search, ShieldAlert, Trash2, UserPlus, UserCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';

interface User {
    user_id: string;
    email: string;
    is_active: boolean;
    is_superuser: boolean;
    role?: string;
    permissions?: string[];
}

export const UserDirectory: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; userId: string; userEmail: string }>({
        isOpen: false,
        userId: '',
        userEmail: '',
    });
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await authApi.get('/users');
            const mappedUsers = (response.data || []).map((u: any) => ({
                ...u,
                role: u.role || u.role_names || (u.roles && u.roles.length > 0 ? u.roles[0].name : 'USER')
            }));
            setUsers(mappedUsers);
        } catch (error: any) {
            console.error('[UserDirectory] Failed to fetch users', error);
            showNotification('Erro ao buscar usuários do diretório.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            await authApi.patch(`/users/${userId}/role`, { role_name: newRole });
            showNotification(`Papel atualizado com sucesso para o usuário.`, 'success');
            fetchUsers();
        } catch (error: any) {
            const errorMsg = error.response?.data?.detail || 'Erro ao atualizar o papel do usuário.';
            showNotification(errorMsg, 'error');
        }
    };

    const handleDeleteUser = async () => {
        if (!deleteModal.userId) return;
        try {
            await authApi.delete(`/users/${deleteModal.userId}`);
            showNotification(`Usuário removido com sucesso.`, 'success');
            setDeleteModal({ isOpen: false, userId: '', userEmail: '' });
            fetchUsers();
        } catch (error: any) {
            const errorMsg = error.response?.data?.detail || 'Erro ao remover o usuário.';
            showNotification(errorMsg, 'error');
        }
    };

    const filteredUsers = users.filter(
        (u) =>
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.role && u.role.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
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

            {/* Header Control */}
            <div className="flex flex-col @sm:flex-row gap-4 items-center justify-between bg-white/5 border border-white/5 p-4 rounded-2xl">
                <div className="relative w-full @sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                    <input
                        type="text"
                        placeholder="Buscar por e-mail ou papel..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-white/5 text-white placeholder-white/30 text-xs focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    Total: {users.length} usuários
                </div>
            </div>

            {/* List / Table */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-white/20 animate-pulse">
                    <UserPlus className="animate-spin-slow mb-3" size={24} />
                    <span className="uppercase tracking-[0.3em] text-[9px] font-black">Carregando diretório de identidades...</span>
                </div>
            ) : filteredUsers.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl border border-white/5 bg-black/20 backdrop-blur-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5 text-[9px] font-black uppercase tracking-wider text-white/50">
                                <th className="px-6 py-4">Usuário</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Papel Atribuído</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-xs text-white/80">
                            {filteredUsers.map((u) => {
                                const isSelf = currentUser?.user_id === u.user_id;
                                const isMaster = u.role === 'MASTER';
                                return (
                                    <tr key={u.user_id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-[10px] text-emerald-400">
                                                {u.email.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-white/95">
                                                    {u.email} {isSelf && <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase font-black tracking-wider">Você</span>}
                                                </span>
                                                <span className="text-[10px] text-white/40">{u.user_id.slice(0, 8)}...</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                                    u.is_active
                                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                                }`}
                                            >
                                                {u.is_active ? 'Ativo' : 'Bloqueado'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {isSelf || isMaster ? (
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                                                    <ShieldCheck size={14} />
                                                    {u.role || 'USER'}
                                                </div>
                                            ) : (
                                                <select
                                                    value={u.role || 'USER'}
                                                    onChange={(e) => handleRoleChange(u.user_id, e.target.value)}
                                                    className="bg-black/60 border border-white/10 rounded-xl px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                                                >
                                                    <option value="USER">USER</option>
                                                    <option value="LEITOR">LEITOR</option>
                                                    <option value="EDITOR">EDITOR</option>
                                                    <option value="ADMIN">ADMIN</option>
                                                    <option value="MASTER">MASTER</option>
                                                </select>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {!isSelf && !isMaster && (
                                                <button
                                                    onClick={() =>
                                                        setDeleteModal({ isOpen: true, userId: u.user_id, userEmail: u.email })
                                                    }
                                                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 transition-colors"
                                                    title="Excluir Usuário"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-white/20 border border-white/5 rounded-2xl bg-black/20">
                    <ShieldAlert size={36} strokeWidth={1} className="mb-3" />
                    <span className="uppercase tracking-widest text-xs font-bold">Nenhum usuário correspondente encontrado.</span>
                </div>
            )}

            {/* Modal de Confirmação de Exclusão */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
                        <div className="flex items-center gap-3 text-rose-500">
                            <ShieldAlert size={20} />
                            <h3 className="text-sm font-black uppercase tracking-wider">Aviso de Segurança</h3>
                        </div>
                        <p className="text-xs text-white/70 leading-relaxed">
                            Tem certeza que deseja remover permanentemente o usuário <strong className="text-white">{deleteModal.userEmail}</strong>? Esta ação revogará todo o acesso ao sistema imediatamente e não poderá ser desfeita.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteModal({ isOpen: false, userId: '', userEmail: '' })}
                                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs font-bold uppercase tracking-wider border border-white/5 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-black text-xs font-bold uppercase tracking-wider shadow-lg transition-colors"
                            >
                                Confirmar Exclusão
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDirectory;

