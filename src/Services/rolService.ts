import { connection_to_backend } from "../Connection/connection";
import type { RolPayload, RolListResponse, RolResponse } from "../Interfaces/i_rol";

export const rolService = {

  getAll: (params?: { search?: string; activo?: boolean; page?: number; limit?: number }) =>
    connection_to_backend
      .get<RolListResponse>("/roles", { params })
      .then(r => r.data),

  getById: (id: string) =>
    connection_to_backend
      .get<RolResponse>(`/roles/${id}`)
      .then(r => r.data.data),

  create: (payload: RolPayload) =>
    connection_to_backend
      .post<RolResponse>("/roles", payload)
      .then(r => r.data.data),

  update: (id: string, payload: Partial<RolPayload>) =>
    connection_to_backend
      .put<RolResponse>(`/roles/${id}`, payload)
      .then(r => r.data.data),

  remove: (id: string) =>
    connection_to_backend
      .delete<{ ok: boolean; mensaje: string }>(`/roles/${id}`)
      .then(r => r.data),
};