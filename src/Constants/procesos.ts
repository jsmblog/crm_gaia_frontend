import type {
  TipoClasificacion, TipoProceso, PrioridadProceso,
  NivelDetalle, TipoInteraccion, WizardPayload,
} from '../../src/Interfaces/i_procesos';

export const TODAY = new Date().toISOString().split('T')[0];

export const TIPOS_CLASIFICACION: TipoClasificacion[] = ['Proyecto Nuevo', 'Solicitud de Cambio'];
export const TIPOS_PROCESO: TipoProceso[]             = ['Automatización', 'Consultoría', 'Implementación', 'Desarrollo', 'Integración'];
export const PRIORIDADES: PrioridadProceso[]          = ['Bajo', 'Medio', 'Alto', 'Muy Alto'];
export const PROB_LIST                                = ['1. Alto', '2. Medio', '3. Bajo'];
export const NIVEL_DETALLE: NivelDetalle[]            = ['CPD', 'PPT', 'CPD Resumido'];
export const TIPOS_INTERACCION: TipoInteraccion[]     = ['Llamada', 'Email', 'Reunión', 'Demo', 'WhatsApp'];

export const STEPS = [
  'Creación', 'Levantamiento', 'Estimacion', 'Propuesta',
  'En Aprobación', 'Aprobado', 'En Ejecución', 'Cerrado',
  'Facturado', 'Rechazado', 'Stand By',
];

export const EMPTY_WIZARD: WizardPayload = {
  // Step 1 — Lead
  proyecto_id: '', nombre_proceso: '', tipo: '', probabilidad_aprobacion: '',
  prioridad: '', fecha_lead: TODAY, plazo_inicio: '', herramienta_rpa_id: '',
  accion_responsable: '', estatus: '',

  // Step 2 — Levantamiento
  lev_consultores_ids: [], lev_fecha: TODAY, lev_observaciones: '',
  lev_proximos_pasos: '', lev_estado_id: '',

  // Step 2 — Estimación 
  est_consultores_ids: [], est_fecha: TODAY, est_observaciones: '',
  est_proximos_pasos: '', est_estado_id: '',
  // Métricas operativas
  est_volumen_transaccional_mensual: undefined,
  est_tiempo_ejecucion_transaccion:  undefined,
  // Captcha
  est_requiere_captcha:    false,
  est_volumen_captcha_mes: undefined,
  // IA
  est_requiere_ai:               false,
  est_ai_para_que:               undefined,
  est_ai_nombre:                 undefined,
  est_ai_metodo_pago:            undefined,
  est_ai_volumen_mensual_tokens: undefined,
  // OCR
  est_requiere_ocr:        false,
  est_ocr_nombre:          undefined,
  est_ocr_volumen_mensual: undefined,
  est_ocr_costo:           undefined,
  // IDP
  est_requiere_idp:        false,
  est_idp_documentos:      undefined,
  est_idp_volumen_mensual: undefined,

  // Step 3 — Propuesta
  prop_consultores_ids: [], prop_nivel_detalle: '', prop_fecha_entrega: '',
  prop_valor: '', prop_horas: '', prop_observaciones: '',
  prop_horas_gerencia: '', prop_valor_gerencia: '', prop_estado_id: '',

  // Step 4 — Preliminar
  pre_fecha: '', pre_resultado: '', pre_viable: null,

  // Step 4 — Aprobación
  apr_aprobado: '', apr_fecha: TODAY, apr_motivo_rechazo: '', apr_estado_id: '',

  // Step 5 — Aprobado
  aprobado_consultores_ids: [], aprobado_fecha: '',
  aprobado_observaciones: '', aprobado_proximos_pasos: '', aprobado_estado_id: '',

  // Step 5 — Ejecución
  ejec_consultores_ids: [],
  ejec_fecha_inicio: '', ejec_fecha_fin: '', ejec_horas_reales: '',
  ejec_observaciones: '', ejec_proximos_pasos: '', ejec_estado_id: '',

  // Step 5 — Interacción
  int_tipo: '', int_consultor_id: '', int_descripcion: '', int_fecha: TODAY,

  // Step 6 — Cierre
  cierre_consultores_ids: [], cierre_fecha: '', cierre_observaciones: '',
  cierre_proximos_pasos: '', cierre_estado_id: '',

  // Step 6 — Facturado
  facturado_consultores_ids: [], facturado_numero_factura: '',
  facturado_fecha_factura: '', facturado_valor: '',
  facturado_fecha_vencimiento: '', facturado_estado_cobro: '',
  facturado_observaciones: '', facturado_proximos_pasos: '', facturado_estado_id: '',

  // Rechazado
  rechazado_consultores_ids: [], rechazado_fecha: '',
  rechazado_motivo_categoria: '', rechazado_motivo_detalle: '',
  rechazado_decision_por: '', rechazado_recuperable: '',
  rechazado_fecha_recontacto: '', rechazado_observaciones: '',
  rechazado_proximos_pasos: '', rechazado_estado_id: '',

  // Stand By
  standby_consultores_ids: [], standby_fecha_inicio: '', standby_fecha_retorno: '',
  standby_motivo_categoria: '', standby_motivo_detalle: '', standby_decision_por: '',
  standby_condicion_reactivar: '', standby_observaciones: '',
  standby_proximos_pasos: '', standby_estado_id: '',
};

export type Setter = (k: keyof WizardPayload, v: any) => void;
export interface Opt { id: string; nombre: string; }

export const estatusClass = (s?: string | null) =>
  s ? s.toLowerCase().replace(/\s+/g, '-') : 'desconocido';

export const fmtFecha = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

export const fmtMoney = (v?: number | null) =>
  v != null ? `$${Number(v).toLocaleString('es-EC', { minimumFractionDigits: 2 })}` : null;

export const ESTADOS_COBRO = ['Pendiente', 'Pagado', 'Vencido', 'Anulado'] as const;

export const MOTIVOS = [
  'Precio', 'Presupuesto', 'Competencia', 'Tiempo',
  'Alcance', 'Decisión interna', 'Sin respuesta', 'Otro'
] as const;

export const RECUPERABLE = ['Sí', 'No', 'Posiblemente'] as const;
export const MOTIVOS_STANDBY = [
  'Presupuesto congelado', 'Decisión pendiente', 'Cambio interno cliente',
  'Espera técnica', 'Prioridad baja', 'Retraso externo', 'Otro'
] as const;
