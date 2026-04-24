export interface Permission {
    permission_id: string;
    name: string;
    description: string;
}

export interface Role {
    role_id: string;
    name: string;
    description: string;
    permissions: Permission[];
}
