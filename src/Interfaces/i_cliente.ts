import type { Consultor } from "./i_consultor";

export interface Pais {
  id:         number;
  nombre:     string;
  codigo_iso: string | null;
}

export interface Ciudad {
  id:      number;
  nombre:  string;
  pais_id: number;
}

export interface Rubro {
  id:          number;
  nombre:      string;
  descripcion: string | null;
}

export type EstadoCliente = "Lead" | "Contactado" | "Activo" | "Inactivo";

export type MedioSeguimiento =
  | 'email' | 'telefono' | 'videollamada'
  | 'presencial' | 'whatsapp' | 'linkedin' | 'otro';

export type TipoSeguimiento =
  | 'llamada' | 'reunion' | 'negociacion' | 'contacto'
  | 'demo' | 'propuesta' | 'seguimiento' | 'otro';

export type EstadoSeguimiento = "programado" | "completado" | "cancelado";

export interface ContextoSeguimientoIA {
  contexto:                 string;
  estado_relacion:          "frio" | "tibio" | "caliente" | "en_riesgo" | "cerrado";
  compromisos_pendientes:   string[];
  temas_recurrentes:        string[];
  proxima_accion_sugerida:  string;
}

export interface SeguimientoCliente {
  id:                   string;
  cliente_id:           string;
  consultor_id:         string;
  contactos_ids:   string[];
  fecha:                string;
  fecha_proxima_accion: string | null;
  medio:                MedioSeguimiento;
  tipo:                 TipoSeguimiento;
  descripcion:          string;
  resultado:            string | null;
  estado:               EstadoSeguimiento;
  contexto_seguimiento: string | null;         
  createdAt:            string;
  updatedAt:            string;
  consultor?:           { id: string; nombre: string; email: string };
  contacto_cliente?:    { id: string; nombre: string; email: string; cargo: string };
  contexto_ia?:         ContextoSeguimientoIA | null;
}
export interface SeguimientoPayload {
  consultor_id:         string;
  contactos_ids:        string[];   
  fecha:                string;
  fecha_proxima_accion: string | null;
  medio:                MedioSeguimiento;
  tipo:                 TipoSeguimiento;
  descripcion:          string;
  resultado:            string | null;
  estado:               string;
}
export interface EstadoObj {
  id:     string;
  nombre: string;
}
export interface Cliente {
  id:                     string;
  empresa:                string;
  pais_id:                number | null;
  ciudad_id:              number | null;
  direccion:              string | null;
  rubro_id:               number | null;
  estado_id:              string | null;        
  estado:                 EstadoCliente;        
  estadoObj?:             EstadoObj | null;     
  referido_por:           string | null;
  precio_hora_desarrollo: number | null;
  precio_hora_soporte:    number | null;
  precio_hora_cambio:     number | null;
  porcentaje_gobierno:    number | null;
  nota:                   string | null;
  createdAt:              string;
  updatedAt:              string;
  deletedAt:              string | null;
  pais?:        Pais   | null;
  ciudad?:      Ciudad | null;
  rubro?:       Rubro  | null;
  usuarios:     UsuarioCliente[];
  proyectos:    { id: string; nombre: string }[];
  seguimientos?: SeguimientoCliente[];
}

export const ESTADOS_PERMITIDOS = ['Lead', 'Contactado', 'Activo', 'Inactivo'];

export interface ClientePayload {
  empresa:                 string;
  pais_id?:                number | null;
  ciudad_id?:              number | null;
  direccion?:              string | null;
  rubro_id?:               number | null;
  estado?:                 EstadoCliente;
  estado_id?:              string | null;
  referido_por?:           string | null;
  precio_hora_desarrollo?: number | null;
  precio_hora_soporte?:    number | null;
  precio_hora_cambio?:     number | null;
  porcentaje_gobierno?:    number | null;
  nota?:                   string | null;
}

// ─── Usuarios ─────────────────────────────────────────────────
export interface UsuarioCliente {
  id:         string;
  cliente_id: string;
  nombre:     string;
  email:      string | null;
  telefono:   string | null;
  linkedin:   string | null;
  cargo:      string | null;
  activo:     boolean;
  createdAt:  string;
  updatedAt:  string;
}

export interface UsuarioClientePayload {
  nombre:    string;
  email?:    string;
  telefono?: string;
  linkedin?: string;
  cargo?:    string;
}

// ─── Respuestas HTTP ──────────────────────────────────────────
export interface ClienteListResponse {
  ok:    boolean;
  total: number;
  page:  number;
  pages: number;
  data:  Cliente[];
}

export interface ClienteResponse {
  ok:      boolean;
  mensaje: string;
  data:    Cliente;
}

export interface UsuarioListResponse {
  ok:   boolean;
  data: UsuarioCliente[];
}

export interface UsuarioClienteResponse {
  ok:      boolean;
  mensaje: string;
  data:    UsuarioCliente;
}

export interface SeguimientoListResponse {
  ok:    boolean;
  total: number;
  page:  number;
  pages: number;
  data:  SeguimientoCliente[];
}

export interface SeguimientoResponse {
  ok:      boolean;
  mensaje: string;
  data:    SeguimientoCliente;
}

export interface CatalogoResponse<T> {
  ok:   boolean;
  data: T[];
}
export interface ClienteModalProps {
  initial?: Cliente | null;
  onClose: () => void;
  onSaved: () => void;
}
export interface SeguimientoModalProps {
  clienteId:   string;
  usuarios:    UsuarioCliente[];
  consultores: Consultor[];
  initial?:    SeguimientoCliente | null;
  onClose:     () => void;
  onSaved:     () => void;
}
export interface UsuarioModalProps {
  clienteId: string;
  initial?:  UsuarioCliente | null;
  onClose:   () => void;
  onSaved:   () => void;
}
