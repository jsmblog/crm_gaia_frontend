export interface AreaBasica {
  id:     string;
  nombre: string;
}

export interface MiembroProyecto {
  id:    string;
  nombre: string;
  email:  string | null;
  cargo:  string | null;
  proyecto_usuario_rol: {
    rol_id: string | null;
    activo: boolean;
    nota:   string | null;
  };
}

export interface AsignacionHerramienta {
  id:                 string;
  proyecto_id:        string;
  herramienta_rpa_id: string;
  cod_licencia:       string | null;
  fecha_asignacion:   string;
  fecha_expiracion:   string | null;
  estado:             EstadoHerramienta;
  motivo_cambio:      string | null;
  asignado_por:       string;
  createdAt:          string;
  herramienta: {
    id:         string;
    nombre:     string;
    fabricante: string | null;
  };
}

export type EstadoProyectoEnum =
  | 'Lead'
  | 'Pendiente'
  | 'Contactado'
  | 'Levantamiento'
  | 'Estimacion'
  | 'Propuesta'
  | 'En Aprobacion'
  | 'Aprobado'
  | 'Rechazado'
  | 'En Ejecución'
  | 'Cerrado'
  | 'Stand BY'
  | 'Facturada';

export interface EstadoProyectoEntry {
  id:           string;
  proyecto_id:  string;
  estado:       EstadoProyectoEnum;
  observacion:  string | null;
  consultor_id: string | null;
  fecha:        string;
  createdAt:    string;
  consultor:    { id: string; nombre: string } | null;
}

export interface EstadoProyectoPayload {
  estado:        EstadoProyectoEnum;
  observacion?:  string;
  consultor_id?: string;
  fecha?:        string;
}

export type EstadoHerramienta = 'Activa' | 'Suspendida' | 'Expirada' | 'Revocada';


export interface Proyecto {
  id:              string;
  cliente_id:      string;
  nombre:          string;
  descripcion:     string | null;
  horas_estimadas: number | null;
  costo_estimado:  number | null;
  estado_actual:   EstadoProyectoEnum;
  activo:          boolean;
  createdAt:       string;
  updatedAt:       string;
  precio_hora_desarrollo: number | null;
  precio_hora_soporte:    number | null;
  precio_hora_cambio:     number | null;
  porcentaje_gobierno:    number | null;
  cliente:           { id: string; nombre: string; empresa: string };
  areas:             AreaBasica[];
  miembros:          MiembroProyecto[];
  herramientas:      AsignacionHerramienta[];
  historial_estados: EstadoProyectoEntry[];
}

export interface ProyectoPayload {
  cliente_id:       string;
  nombre:           string;
  descripcion?:     string;
  horas_estimadas?: number;
  areas?:           string[];
}

export interface ProyectoUpdatePayload {
  nombre?:          string;
  descripcion?:     string;
  horas_estimadas?: number | null;
  activo?:          boolean;
}

export interface MiembroPayload {
  usuario_cliente_id: string;
  rol_id:             string;
  nota?:              string;
}

export interface AsignarHerramientaPayload {
  herramienta_rpa_id: string;
  asignado_por:       string;  // consultor_id
  cod_licencia?:      string;
  fecha_asignacion?:  string;
  fecha_expiracion?:  string;
  motivo_cambio?:     string;
}

export interface ProyectoListResponse {
  ok:    boolean;
  total: number;
  page:  number;
  pages: number;
  data:  Proyecto[];
}

export interface ProyectoResponse {
  ok:      boolean;
  mensaje: string;
  data:    Proyecto;
}