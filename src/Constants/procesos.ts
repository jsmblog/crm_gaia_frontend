import type {
  TipoClasificacion, TipoProceso, PrioridadProceso,
  NivelDetalle, TipoInteraccion, EstatusProceso, WizardPayload,
} from '../../Interfaces/i_procesos';

export const TODAY = new Date().toISOString().split('T')[0];

export const TIPOS_CLASIFICACION: TipoClasificacion[] = ['Proyecto Nuevo', 'Solicitud de Cambio'];
export const TIPOS_PROCESO: TipoProceso[] = ['Automatización', 'Consultoría', 'Implementación', 'Desarrollo', 'Integración'];
export const PRIORIDADES: PrioridadProceso[] = ['Bajo', 'Medio', 'Alto', 'Muy Alto'];
export const PROB_LIST = ['1. Alto', '2. Medio', '3. Bajo'];
export const NIVEL_DETALLE: NivelDetalle[] = ['CPD', 'Ejecutivo', 'Detallado'];
export const TIPOS_INTERACCION: TipoInteraccion[] = ['Llamada', 'Email', 'Reunión', 'Demo', 'WhatsApp'];
export const ESTATUS_LIST: EstatusProceso[] = [
  'Lead', 'Contactado', 'Levantamiento', 'Estimacion', 'Propuesta',
  'En Aprobacion', 'Aprobado', 'Rechazado', 'En Ejecución', 'Cerrado', 'Stand BY', 'Facturada',
];
export const STEPS = ['Lead', 'Levantamiento', 'Propuesta', 'Aprobación', 'Ejecución'];

export const EMPTY_WIZARD: WizardPayload = {
  proyecto_id: '', nombre_proceso: '', tipo: '', tipo_proceso: '', probabilidad_aprobacion: '',
  prioridad: '', fecha_lead: TODAY, plazo_inicio: '', herramienta_rpa_id: '', accion_responsable: '',
  lev_consultores_ids: [], lev_fecha: TODAY, lev_observaciones: '',
  est_consultores_ids: [], est_fecha: TODAY, est_observaciones: '',
  prop_consultores_ids: [], prop_nivel_detalle: '', prop_fecha_entrega: '', prop_valor: '', prop_horas: '', prop_observaciones: '',
  pre_fecha: '', pre_resultado: '', pre_viable: null,
  apr_aprobado: '', apr_fecha: TODAY, apr_motivo_rechazo: '',
  ejec_consultores_ids: [], ejec_consultor_responsable_id: '', ejec_fecha_inicio: '', ejec_fecha_fin: '', ejec_horas_reales: '', ejec_observaciones: '',
  int_tipo: '', int_consultor_id: '', int_descripcion: '', int_fecha: TODAY,
  estatus: 'Lead',
};

export type Setter = (k: keyof WizardPayload, v: any) => void;
export interface Opt { id: string; nombre: string; }

export const estatusClass = (e: string) =>
  e.toLowerCase().replace(/\s+/g, '-').replace(/[áéíóú]/g, c =>
    ({ á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' }[c]!));

export const fmtFecha = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

export const fmtMoney = (v?: number | null) =>
  v != null ? `$${Number(v).toLocaleString('es-EC', { minimumFractionDigits: 2 })}` : null;
