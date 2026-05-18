import type { AgentAction } from "../Components/AI/actionDispactcher";

export interface Chat {
  id:           string;
  consultor_id: string;
  titulo:       string;
  activo:       boolean;
  createdAt:    string;
  updatedAt:    string;
}

export interface Mensaje {
  id:           string;
  chat_id:      string;
  rol:          "user" | "assistant" | "system";
  contenido:    string;
  indice_orden: number;
  tokens:       number | null;
  createdAt:    string;
  updatedAt:    string;
  archivoPreviews?: string[]
  archivos?: string[]
}

export interface ContextoChat {
  id:                 string;
  chat_id:            string;
  resumen:            string | null;
  mensajes_resumidos: number;
  tokens_acumulados:  number;
}

// ── Response shapes ───────────────────────────────────────────

export interface ChatListResponse {
  ok:   boolean;
  data: Chat[];
}

export interface ChatResponse {
  ok:      boolean;
  mensaje: string;
  data:    Chat;
}

export interface MensajesResponse {
  ok:       boolean;
  data:     Mensaje[];
  contexto: ContextoChat | null;
}

export interface EnviarMensajeResponse {
  ok: boolean;
  respuesta: string;
  tiene_datos: boolean;
  sugerencias: string[];
  actions: AgentAction[];  
  contexto?: {
    resumen: string | null;
    mensajes_resumidos: number;
    tokens_acumulados: number;
  };
}

export interface CrearChatPayload {
  consultor_id: string;
  titulo?:      string;
}

export interface EnviarMensajePayload {
  pregunta: string;
}