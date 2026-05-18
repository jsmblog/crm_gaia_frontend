import { connection_to_backend } from "../Connection/connection";
import type { LicenciaPayload, LicenciaListResponse, LicenciaResponse } from "../Interfaces/i_licencia";

export const licenciaService = {
  getAll: (params?: any) =>
    connection_to_backend.get<LicenciaListResponse>("/licencias", { params }).then(r => r.data),
  getById: (id: string) =>
    connection_to_backend.get<LicenciaResponse>(`/licencias/${id}`).then(r => r.data.data),
  create: (payload: LicenciaPayload) =>
    connection_to_backend.post<LicenciaResponse>("/licencias", payload).then(r => r.data.data),
  update: (id: string, payload: Partial<LicenciaPayload>) =>
    connection_to_backend.put<LicenciaResponse>(`/licencias/${id}`, payload).then(r => r.data.data),
  remove: (id: string) =>
    connection_to_backend.delete<{ ok: boolean; mensaje: string }>(`/licencias/${id}`).then(r => r.data),
  restaurar: (id: string) =>
    connection_to_backend.patch<LicenciaResponse>(`/licencias/${id}/restaurar`).then(r => r.data.data),
};