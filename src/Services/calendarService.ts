import { VITE_API_URL } from "../Config/config";
import { connection_to_backend } from "../Connection/connection";
import type {
  CalEvent,
  CreateEventPayload
} from "../Interfaces/i_calendario";

export const calendarioService = {

  getStatus: (userId: string) =>
    connection_to_backend
      .get<{ ok: boolean; linked: boolean }>(`/calendario/status/${userId}`)
      .then(r => r.data),

  startOAuth: (userId: string) => {
  const base = VITE_API_URL ?? 'http://localhost:3000';
  window.location.href = `${base}/calendario/auth?userId=${userId}`;
},

  unlink: (userId: string) =>
    connection_to_backend
      .delete<{ ok: boolean; mensaje: string }>('/calendario/auth', {
        data: { userId },
      })
      .then(r => r.data),

  listarEventos: (userId: string, timeMin: string, timeMax: string) =>
    connection_to_backend
      .get<{ ok: boolean; data: CalEvent[] }>(`/calendario/eventos/${userId}`, {
        params: { timeMin, timeMax },
      })
      .then(r => r.data.data),

  crearEvento: (payload: CreateEventPayload) =>
    connection_to_backend
      .post<{ ok: boolean; data: CalEvent }>('/calendario/eventos', payload)
      .then(r => r.data.data),

  actualizarEvento: (eventId: string, payload: Partial<CreateEventPayload>) =>
    connection_to_backend
      .put<{ ok: boolean; mensaje: string }>(`/calendario/eventos/${eventId}`, payload)
      .then(r => r.data),

  eliminarEvento: (eventId: string, userId: string) =>
    connection_to_backend
      .delete<{ ok: boolean; mensaje: string }>(`/calendario/eventos/${eventId}`, {
        data: { userId },
      })
      .then(r => r.data),
};