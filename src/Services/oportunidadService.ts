import { connection_to_backend } from "../Connection/connection";

/* ─── Types ─────────────────────────────────────────── */
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

export interface WizardPayload {
  /* Step 1 */
  cliente_id:              string;
  nombre_proceso:          string;
  tipo_proceso:            TipoProceso;
  probabilidad_aprobacion: string;
  prioridad:               Prioridad;
  fecha_lead:              string;
  plazo_inicio:            string;
  accion_responsable:      string;
  estatus:                 EstatusOportunidad;
  /* Step 2 */
  consultor_levantamiento_id: string;
  fecha_levantamiento:        string;
  consultor_estimacion_id:    string;
  fecha_estimacion:           string;
  /* Step 3 */
  consultor_propuesta_id:  string;
  nivel_detalle:           string;
  fecha_entrega_propuesta: string;
  valor_presupuestado:     number;
  horas_presupuestadas:    number;
  /* Step 4 */
  resultado_aprobacion: 'Aprobado' | 'Rechazado' | 'Pendiente';
  fecha_aprobacion:     string;
  /* Step 5 */
  consultor_responsable_id:    string;
  fecha_inicio_proyecto:       string;
  fecha_cierre_facturacion:    string;
  horas_reales:                number;
  /* Interacción */
  interaccion_tipo:         string;
  interaccion_consultor_id: string;
  interaccion_descripcion:  string;
}

/* ─── Service ────────────────────────────────────────── */
const api = connection_to_backend;

export const oportunidadService = {

  getAll: (params?: { estatus?: string; cliente?: string }) =>
    api.get<Oportunidad[]>('/oportunidades', { params }).then(r => r.data),

  getById: (id: string) =>
    api.get<Oportunidad>(`/oportunidades/${id}`).then(r => r.data),

  /** Wizard: un solo POST que crea oportunidad + todas las etapas */
  createFull: (payload: Partial<WizardPayload>) =>
    api.post<{ message: string; oportunidad: Oportunidad }>(
      '/oportunidades/full',
      payload,
    ).then(r => r.data),

  update: (id: string, payload: Partial<WizardPayload>) =>
    api.put(`/oportunidades/${id}`, payload).then(r => r.data),

  remove: (id: string) =>
    api.delete(`/oportunidades/${id}`).then(r => r.data),
};