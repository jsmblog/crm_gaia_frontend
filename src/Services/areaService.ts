import { connection_to_backend } from "../Connection/connection";
import type {
  AreaPayload,
  AreaListResponse,
  AreaResponse,
} from "../Interfaces/i_area";

export const areaService = {

  getAll: (params?: { search?: string; activo?: boolean; page?: number; limit?: number }) =>
    connection_to_backend
      .get<AreaListResponse>("/areas", { params })
      .then(r => r.data),

  getById: (id: string) =>
    connection_to_backend
      .get<AreaResponse>(`/areas/${id}`)
      .then(r => r.data.data),

  create: (payload: AreaPayload) =>
    connection_to_backend
      .post<AreaResponse>("/areas", payload)
      .then(r => r.data.data),

  update: (id: string, payload: Partial<AreaPayload>) =>
    connection_to_backend
      .put<AreaResponse>(`/areas/${id}`, payload)
      .then(r => r.data.data),

  remove: (id: string) =>
    connection_to_backend
      .delete<{ ok: boolean; mensaje: string }>(`/areas/${id}`)
      .then(r => r.data),
};