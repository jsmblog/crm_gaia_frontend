export type EstadoSoporte = "En Aprobación" | "Aprobado" | "Rechazado";

export interface Soporte {
  id: string;
  cliente_id: string;
  cliente?: { id: string; nombre: string; empresa: string };
  estado: EstadoSoporte;
  propuesta?: string;
  horas?: number;
  tarifa?: number;
  valor_paquete?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  horario?: string;
  dias?: string[];
  observacion?: string;
  responsable_cliente_id?: string;
  responsableCliente?: { id: string; nombre: string; email: string };
  fecha_aprobacion?: string;
  fecha_rechazo?: string;
  motivo_rechazo?: string;
  fecha_inicio_soporte?: string;
  created_by?: string;
  updated_by?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SoportePayload {
  cliente_id: string;
  estado?: EstadoSoporte;
  propuesta?: string;
  horas?: number;
  tarifa?: number;
  valor_paquete?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  horario?: string;
  dias?: string;
  observacion?: string;
  responsable_cliente_id?: string;
  fecha_aprobacion?: string;
  fecha_rechazo?: string;
  motivo_rechazo?: string;
  fecha_inicio_soporte?: string;
}

export interface SoporteListResponse {
  ok: boolean;
  total: number;
  page: number;
  pages: number;
  data: Soporte[];
}

export interface SoporteResponse {
  ok: boolean;
  mensaje: string;
  data: Soporte;
}