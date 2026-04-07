import { connection_to_backend } from "../Connection/connection";

export interface Estado {
  id: string;
  nombre: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EstadoPayload {
  nombre: string;
}

export const estadoService = {
  getAll: () =>
    connection_to_backend
      .get<{ ok: boolean; data: Estado[] }>("/estados")
      .then(r => r.data.data),

  create: (payload: EstadoPayload) =>
    connection_to_backend
      .post<{ ok: boolean; data: Estado }>("/estados", payload)
      .then(r => r.data.data),

  update: (id: string, payload: Partial<EstadoPayload>) =>
    connection_to_backend
      .put<{ ok: boolean; data: Estado }>(`/estados/${id}`, payload)
      .then(r => r.data.data),

  remove: (id: string) =>
    connection_to_backend
      .delete<{ ok: boolean; mensaje: string }>(`/estados/${id}`)
      .then(r => r.data),
};