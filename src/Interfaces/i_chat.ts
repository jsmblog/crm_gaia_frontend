// Interfaces/i_chat.ts

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
  ok:          boolean;
  respuesta:   string;
  tiene_datos: boolean;
  sugerencias: string[];
  contexto?:any;
  debug: {
    query_generada: string | null;
    total_filas:    number;
    error_sql:      string | null;
  };
}

// ── Payloads ──────────────────────────────────────────────────

export interface CrearChatPayload {
  consultor_id: string;
  titulo?:      string;
}

export interface EnviarMensajePayload {
  pregunta: string;
}