
import { connection_to_backend } from "../Connection/connection";
import type {
  HerramientaPayload,
  HerramientaListResponse,
  HerramientaResponse,
} from "../Interfaces/i_herramienta";

export const herramientaService = {

  getAll: (params?: { search?: string; activo?: boolean; page?: number; limit?: number }) =>
    connection_to_backend
      .get<HerramientaListResponse>("/herramientas", { params })
      .then(r => r.data),

  getById: (id: string) =>
    connection_to_backend
      .get<HerramientaResponse>(`/herramientas/${id}`)
      .then(r => r.data.data),

  create: (payload: HerramientaPayload) =>
    connection_to_backend
      .post<HerramientaResponse>("/herramientas", payload)
      .then(r => r.data.data),

  update: (id: string, payload: Partial<HerramientaPayload>) =>
    connection_to_backend
      .put<HerramientaResponse>(`/herramientas/${id}`, payload)
      .then(r => r.data.data),

  remove: (id: string) =>
    connection_to_backend
      .delete<{ ok: boolean; mensaje: string }>(`/herramientas/${id}`)
      .then(r => r.data),
};