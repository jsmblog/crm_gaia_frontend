import { connection_to_backend } from "../Connection/connection";
import type { SoportePayload, SoporteListResponse, SoporteResponse } from "../Interfaces/i_soporte";

export const soporteService = {
  getAll: (params?: { clienteId?: string; estado?: string; page?: number; limit?: number }) =>
    connection_to_backend.get<SoporteListResponse>("/soportes", { params }).then(r => r.data),
  getById: (id: string) =>
    connection_to_backend.get<SoporteResponse>(`/soportes/${id}`).then(r => r.data.data),
  create: (payload: SoportePayload) =>
    connection_to_backend.post<SoporteResponse>("/soportes", payload).then(r => r.data.data),
  update: (id: string, payload: Partial<SoportePayload>) =>
    connection_to_backend.put<SoporteResponse>(`/soportes/${id}`, payload).then(r => r.data.data),
  remove: (id: string) =>
    connection_to_backend.delete<{ ok: boolean; mensaje: string }>(`/soportes/${id}`).then(r => r.data),
};