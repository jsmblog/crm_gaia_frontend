export type TipoProceso =
  | 'Automatización' | 'Consultoría' | 'Implementación'
  | 'Desarrollo'     | 'Integración';

export type EstatusOportunidad =
  | 'Lead' | 'Contactado' | 'Levantamiento' | 'Estimacion'
  | 'Propuesta' | 'En Aprobacion' | 'Aprobado' | 'Rechazado'
  | 'En Ejecución' | 'Cerrado' | 'Stand BY' | 'Facturada';

export type Prioridad = 'Bajo' | 'Medio' | 'Alto' | 'Muy Alto';

export interface Oportunidad {
  id:                      string;
  cliente_id:              string;
  nombre_proceso:          string;
  tipo_proceso:            TipoProceso | null;
  estatus:                 EstatusOportunidad;
  probabilidad_aprobacion: string | null;
  prioridad:               Prioridad | null;
  plazo_inicio:            string | null;
  fecha_lead:              string | null;
  accion_responsable:      string | null;
  createdAt:               string;
  updatedAt:               string;
  Cliente?: { id: string; nombre: string; empresa: string };
  Interaccions?: { id: string }[];
}

export interface EtapaLevantamientoPayload {
  oportunidad_id:      string;
  consultor_id:        string;
  fecha_levantamiento: string;
}

export interface EtapaEstimacionPayload {
  oportunidad_id:  string;
  consultor_id:    string;
  fecha_estimacion: string;
}

export interface EtapaPropuestaPayload {
  oportunidad_id:          string;
  consultor_id:            string;
  nivel_detalle:           string;
  fecha_entrega_propuesta: string;
  valor_presupuestado:     number;
  horas_presupuestadas:    number;
}

export interface EtapaAprobacionPayload {
  oportunidad_id:   string;
  aprobado:         boolean | null;
  fecha_aprobacion: string | null;
  fecha_rechazo:    string | null;
  motivo_rechazo:   string | null;
}

export interface EtapaProyectoPayload {
  oportunidad_id:           string;
  consultor_responsable_id: string;
  fecha_inicio_proyecto:    string | null;
  fecha_cierre_facturacion: string | null;
  horas_reales:             number;
}

export interface InteraccionPayload {
  oportunidad_id: string;
  consultor_id:   string;
  tipo:           string;
  descripcion:    string;
  fecha:          string;
}

export interface WizardPayload {
  cliente_id:              string;
  nombre_proceso:          string;
  tipo_proceso:            TipoProceso;
  probabilidad_aprobacion: string;
  prioridad:               Prioridad;
  fecha_lead:              string;
  plazo_inicio:            string;
  accion_responsable:      string;
  consultor_levantamiento_id: string;
  fecha_levantamiento:        string;
  consultor_estimacion_id:    string;
  fecha_estimacion:           string;
  consultor_propuesta_id:    string;
  nivel_detalle:             string;
  fecha_entrega_propuesta:   string;
  valor_presupuestado:       number;
  horas_presupuestadas:      number;
  resultado_aprobacion: 'Aprobado' | 'Rechazado' | 'Pendiente';
  fecha_aprobacion:     string;
  consultor_responsable_id:    string;
  fecha_inicio_proyecto:       string;
  fecha_cierre_facturacion:    string;
  horas_reales:                number;
  estatus:                     EstatusOportunidad;
  interaccion_tipo:        string;
  interaccion_consultor_id: string;
  interaccion_descripcion: string;
}
