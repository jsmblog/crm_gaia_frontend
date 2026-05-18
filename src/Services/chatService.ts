import { connection_to_backend } from "../Connection/connection";
import type {
  ChatListResponse,
  ChatResponse,
  MensajesResponse,
  EnviarMensajeResponse,
  CrearChatPayload,
  EnviarMensajePayload,
} from "../Interfaces/i_chat";

export const chatService = {

  crear: (payload: Partial<CrearChatPayload> = {}) =>
    connection_to_backend
      .post<ChatResponse>("/chat", payload)
      .then(r => r.data.data),

  listar: () =>
    connection_to_backend
      .get<ChatListResponse>("/chat/consultor/me")
      .then(r => r.data.data),

  getMensajes: (chatId: string) =>
    connection_to_backend
      .get<MensajesResponse>(`/chat/${chatId}/mensajes`)
      .then(r => r.data),

  enviar: (chatId: string, payload: EnviarMensajePayload) =>
    connection_to_backend
      .post<EnviarMensajeResponse>(`/chat/${chatId}/mensaje`, payload)
      .then(r => r.data),

  eliminar: (chatId: string) =>
    connection_to_backend
      .delete<{ ok: boolean; mensaje: string }>(`/chat/${chatId}`)
      .then(r => r.data),
  enviarConArchivos: (chatId: string, formData: FormData) =>
    connection_to_backend
      .post<EnviarMensajeResponse>(`/chat/${chatId}/mensaje`, formData)
      .then(r => r.data),
};