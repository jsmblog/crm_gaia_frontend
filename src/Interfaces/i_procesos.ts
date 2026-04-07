// Interfaces/i_proceso.ts

export type TipoProceso       = 'Automatización' | 'Consultoría' | 'Implementación' | 'Desarrollo' | 'Integración';
export type TipoClasificacion = 'Proyecto Nuevo' | 'Solicitud de Cambio';
export type EstatusProceso    = 'Lead' | 'Contactado' | 'Levantamiento' | 'Estimacion' | 'Propuesta' |
                                'En Aprobacion' | 'Aprobado' | 'Rechazado' | 'En Ejecución' | 'Cerrado' | 'Stand BY' | 'Facturada';
export type PrioridadProceso  = 'Bajo' | 'Medio' | 'Alto' | 'Muy Alto';
export type TipoInteraccion   = 'Llamada' | 'Email' | 'Reunión' | 'Demo' | 'WhatsApp';
export type NivelDetalle      = 'CPD' | 'Ejecutivo' | 'Detallado';

// ── Shared ────────────────────────────────────────────────────

export interface ConsultorRef {
  id:     string;
  nombre: string;
}

// ── Etapas ────────────────────────────────────────────────────

export interface EtapaLevantamiento {
  id:                  string;
  proceso_id:          string;
  fecha_levantamiento: string | null;
  observaciones:       string | null;
  consultores:         ConsultorRef[];   // N:M — array siempre presente (puede ser [])
}

export interface EtapaEstimacion {
  id:               string;
  proceso_id:       string;
  fecha_estimacion: string | null;
  observaciones:    string | null;
  consultores:      ConsultorRef[];
}

export interface EtapaPropuesta {
  id:                      string;
  proceso_id:              string;
  nivel_detalle:           NivelDetalle | null;
  fecha_entrega_propuesta: string | null;
  valor_presupuestado:     number | null;
  horas_presupuestadas:    number | null;
  observaciones:           string | null;
  consultores:             ConsultorRef[];
}

export interface EtapaPreliminar {
  id:               string;
  proceso_id:       string;
  fecha_preliminar: string | null;
  resultado:        string | null;
  observaciones:    string | null;
  viable:           boolean | null;
  consultores:      ConsultorRef[];
}

export interface EtapaAprobacion {
  id:               string;
  proceso_id:       string;
  aprobado:         boolean | null;
  fecha_aprobacion: string | null;
  motivo_rechazo:   string | null;
  fecha_rechazo:    string | null;
  observaciones:    string | null;
  consultores:      ConsultorRef[];
}

export interface EtapaEjecucion {
  id:                       string;
  proceso_id:               string;
  consultor_responsable_id: string | null;
  fecha_inicio:             string;
  fecha_fin:                string | null;
  horas_reales:             number | null;
  observaciones:            string | null;
  consultor:                ConsultorRef | null;  // responsable único
  consultores:              ConsultorRef[];       // equipo adicional N:M
}

export interface Interaccion {
  id:           string;
  proceso_id:   string;
  consultor_id: string;
  tipo:         TipoInteraccion | null;
  descripcion:  string | null;
  fecha:        string;
  consultor:    ConsultorRef | null;
}

// ── Proceso completo ──────────────────────────────────────────

export interface Proceso {
  id:                      string;
  proyecto_id:             string;
  nombre_proceso:          string;
  tipo:                    TipoClasificacion | null;
  tipo_proceso:            TipoProceso;
  estatus:                 EstatusProceso;
  probabilidad_aprobacion: string | null;
  prioridad:               PrioridadProceso | null;
  plazo_inicio:            string | null;
  fecha_lead:              string | null;
  fecha_contactado:        string | null;
  accion_responsable:      string | null;
  herramienta_rpa_id:      string | null;
  horas_estimadas:         number | null;
  valor_presupuestado:     number | null;
  horas_presupuestadas:    number | null;
  createdAt:               string;
  updatedAt:               string;
  // relaciones embebidas
  proyecto:      { id: string; nombre: string };
  herramienta:   { id: string; nombre: string } | null;
  levantamiento: EtapaLevantamiento | null;
  estimacion:    EtapaEstimacion    | null;
  propuesta:     EtapaPropuesta     | null;
  preliminar:    EtapaPreliminar    | null;
  aprobacion:    EtapaAprobacion    | null;
  ejecucion:     EtapaEjecucion     | null;
  interacciones: Interaccion[];
}

// ── Payloads ──────────────────────────────────────────────────

export interface ProcesoPayload {
  nombre_proceso:           string;
  tipo?:                    TipoClasificacion;
  tipo_proceso:             TipoProceso;
  estatus?:                 EstatusProceso;
  prioridad?:               PrioridadProceso;
  probabilidad_aprobacion?: string;
  plazo_inicio?:            string;
  herramienta_rpa_id?:      string;
  accion_responsable?:      string;
}

export interface EtapaPayload {
  consultores_ids?:              string[];
  // Levantamiento
  fecha_levantamiento?:          string;
  // Estimación
  fecha_estimacion?:             string;
  // Propuesta
  nivel_detalle?:                NivelDetalle;
  fecha_entrega_propuesta?:      string;
  valor_presupuestado?:          number;
  horas_presupuestadas?:         number;
  // Preliminar
  fecha_preliminar?:             string;
  resultado?:                    string;
  viable?:                       boolean | null;
  // Aprobación
  aprobado?:                     boolean;
  fecha_aprobacion?:             string;
  motivo_rechazo?:               string;
  fecha_rechazo?:                string;
  // Ejecución
  consultor_responsable_id?:     string;
  fecha_inicio?:                 string;
  fecha_fin?:                    string;
  horas_reales?:                 number;
  // Compartido
  observaciones?:                string;
}

export interface WizardPayload {
  // Step 1 — Lead
  proyecto_id:                  string;
  nombre_proceso:               string;
  tipo:                         TipoClasificacion | '';
  tipo_proceso:                 TipoProceso | '';
  probabilidad_aprobacion:      string;
  prioridad:                    PrioridadProceso | '';
  fecha_lead:                   string;
  plazo_inicio:                 string;
  herramienta_rpa_id:           string;
  accion_responsable:           string;
  // Step 2 — Levantamiento
  lev_consultores_ids:          string[];
  lev_fecha:                    string;
  lev_observaciones:            string;
  // Step 2 — Estimación
  est_consultores_ids:          string[];
  est_fecha:                    string;
  est_observaciones:            string;
  // Step 3 — Propuesta
  prop_consultores_ids:         string[];
  prop_nivel_detalle:           NivelDetalle | '';
  prop_fecha_entrega:           string;
  prop_valor:                   number | '';
  prop_horas:                   number | '';
  prop_observaciones:           string;
  // Step 4 — Preliminar
  pre_fecha:                    string;
  pre_resultado:                string;
  pre_viable:                   boolean | null;
  // Step 4 — Aprobación
  apr_aprobado:                 'Aprobado' | 'Rechazado' | '';
  apr_fecha:                    string;
  apr_motivo_rechazo:           string;
  // Step 5 — Ejecución
  ejec_consultores_ids:         string[];   // equipo adicional N:M
  ejec_consultor_responsable_id: string;   // responsable único
  ejec_fecha_inicio:            string;
  ejec_fecha_fin:               string;
  ejec_horas_reales:            number | '';
  ejec_observaciones:           string;
  // Step 5 — Interacción
  int_tipo:                     TipoInteraccion | '';
  int_consultor_id:             string;
  int_descripcion:              string;
  int_fecha:                    string;
  // Step 5 — Estatus
  estatus:                      EstatusProceso;
}

// ── Respuestas HTTP ───────────────────────────────────────────

export interface ProcesoListResponse {
  ok:    boolean;
  total: number;
  page:  number;
  pages: number;
  data:  Proceso[];
}

export interface ProcesoResponse {
  ok:      boolean;
  mensaje: string;
  data:    Proceso;
}