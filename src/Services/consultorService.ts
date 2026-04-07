// Services/consultorService.ts

import { connection_to_backend } from "../Connection/connection";
import type {
  Consultor,
  ConsultorPayload,
  ConsultorListResponse,
  ConsultorResponse,
} from "../Interfaces/i_consultor";

export const consultorService = {

  /** Lista paginada. Acepta filtros opcionales. */
  getAll: (params?: { search?: string; rol?: string; activo?: boolean; page?: number; limit?: number }) =>
    connection_to_backend
      .get<ConsultorListResponse>("/consultores", { params })
      .then(r => r.data),             // devuelve { ok, total, page, pages, data[] }

  getById: (id: string) =>
    connection_to_backend
      .get<ConsultorResponse>(`/consultores/${id}`)
      .then(r => r.data.data),

  create: (payload: ConsultorPayload) =>
    connection_to_backend
      .post<ConsultorResponse>("/consultores", payload)
      .then(r => r.data.data),

  update: (id: string, payload: Partial<ConsultorPayload>) =>
    connection_to_backend
      .put<ConsultorResponse>(`/consultores/${id}`, payload)
      .then(r => r.data.data),

  remove: (id: string) =>
    connection_to_backend
      .delete<{ ok: boolean; mensaje: string }>(`/consultores/${id}`)
      .then(r => r.data),

};