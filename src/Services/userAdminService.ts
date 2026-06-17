import { connection_to_backend } from "../Connection/connection";

export interface AdminUser {
    id: string;
    nombre: string;
    email: string;
    rol: string;
    activo: boolean;
    verificado: boolean;
    ia_activa: boolean;
    tokens: number;
    renovacion_tokens: string;
    createdAt: string;
    updatedAt: string;
}

export interface AdminUserListResponse {
    ok: boolean;
    data: AdminUser[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const userAdminService = {
    getAll: (params?: {
        search?: string;
        ia_activa?: boolean;
        page?: number;
        limit?: number;
    }) =>
        connection_to_backend
            .get<AdminUserListResponse>("/admin/users", { params })
            .then(r => r.data),

    updateIaActiva: (id: string, ia_activa: boolean) =>
        connection_to_backend
            .put<{ ok: boolean; mensaje: string; data: AdminUser }>(`/admin/users/${id}/ia`, { ia_activa })
            .then(r => r.data),

    renovarTokens: (id: string) =>
        connection_to_backend
            .post<{ ok: boolean; mensaje: string; data: { tokens: number; renovacion_tokens: string } }>(
                `/admin/users/${id}/renovar-tokens`
            )
            .then(r => r.data),

    addTokens: (id: string, cantidad: number) =>
        connection_to_backend
            .post<{ ok: boolean; mensaje: string; data: { tokens: number; renovacion_tokens: string } }>(
                `/admin/users/${id}/add-tokens`,
                { cantidad }
            )
            .then(r => r.data),
    removeTokens: (id: string, cantidad: number) =>
        connection_to_backend
            .post<{ ok: boolean; mensaje: string; data: { tokens: number; renovacion_tokens: string } }>(
                `/admin/users/${id}/remove-tokens`,
                { cantidad }
            )
            .then(r => r.data),
};