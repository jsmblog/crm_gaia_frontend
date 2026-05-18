import type { Setter } from "../Constants/procesos";
export type TipoProceso       = 'Automatización' | 'Consultoría' | 'Implementación' | 'Desarrollo' | 'Integración';
export type TipoClasificacion = 'Proyecto Nuevo' | 'Solicitud de Cambio';
export type EstatusProceso    = 'Lead' | 'Contactado' | 'Levantamiento' | 'Estimacion' | 'Propuesta' |
                                'En Aprobacion' | 'Aprobado' | 'Rechazado' | 'En Ejecución' | 'Cerrado' | 'Stand BY' | 'Facturada';
export type PrioridadProceso  = 'Bajo' | 'Medio' | 'Alto' | 'Muy Alto';
export type TipoInteraccion   = 'Llamada' | 'Email' | 'Reunión' | 'Demo' | 'WhatsApp';
export type NivelDetalle      = 'CPD' | 'PPT' | 'CPD Resumido';

export type EstadoCobro =
  | 'Pendiente'
  | 'Pagado'
  | 'Vencido'
  | 'Anulado';

export type MotivoRechazoCat =
  | 'Precio'
  | 'Presupuesto'
  | 'Competencia'
  | 'Tiempo'
  | 'Alcance'
  | 'Decisión interna'
  | 'Sin respuesta'
  | 'Otro';

export type RecuperableOpt = 'Sí' | 'No' | 'Posiblemente';

export type MotivoStandByCat =
  | 'Presupuesto congelado'
  | 'Decisión pendiente'
  | 'Cambio interno cliente'
  | 'Espera técnica'
  | 'Prioridad baja'
  | 'Retraso externo'
  | 'Otro';

export interface LevantamientoPayload {
  consultores_ids?:    string[];
  fecha_levantamiento?: string;
  observaciones?:      string;
  proximos_pasos?:     string;
  estado_id?:          string;
}

export interface EstimacionPayload {
  consultores_ids?:  string[];
  fecha_estimacion?: string;
  observaciones?:    string;
  proximos_pasos?:   string;
  estado_id?:        string;
  volumen_transaccional_mensual?: number;
  tiempo_ejecucion_transaccion?:  number;
  requiere_captcha?:    boolean;
  volumen_captcha_mes?: number;
  requiere_ai?:               boolean;
  ai_para_que?:               string;
  ai_nombre?:                 string;
  ai_metodo_pago?:            string;
  ai_volumen_mensual_tokens?: number;
  requiere_ocr?:        boolean;
  ocr_nombre?:          string;
  ocr_volumen_mensual?: number;
  ocr_costo?:           number;
  requiere_idp?:        boolean;
  idp_documentos?:      string;
  idp_volumen_mensual?: number;
}

export interface PropuestaPayload {
  consultores_ids?:         string[];
  nivel_detalle?:           NivelDetalle;
  fecha_entrega_propuesta?: string;
  valor_presupuestado?:     number;
  horas_presupuestadas?:    number;
  observaciones?:           string;
  horas_gerencia?:          number;
  valor_gerencia?:          number;
  estado_id?:               string;
}

export interface PreliminarPayload {
  fecha_preliminar?: string;
  resultado?:        string;
  viable?:           boolean | null;
}

export interface AprobacionPayload {
  aprobado?:        boolean;
  fecha_aprobacion?: string;
  motivo_rechazo?:  string;
  fecha_rechazo?:   string;
  observaciones?:   string;
  estado_id?:       string;
}

export interface AprobadoPayload {
  consultores_ids?: string[];
  fecha_aprobado?:  string;
  observaciones?:   string;
  proximos_pasos?:  string;
  estado_id?:       string;
}

export interface EjecucionPayload {
  consultores_ids?:          string[];
  fecha_inicio?:             string;
  fecha_fin?:                string;
  horas_reales?:             number;
  observaciones?:            string;
  proximos_pasos?:           string;
  estado_id?:                string;
}

export interface CierrePayload {
  consultores_ids?: string[];
  fecha_cierre?:    string;
  observaciones?:   string;
  proximos_pasos?:  string;
  estado_id?:       string;
}

export interface FacturadoPayload {
  consultores_ids?:    string[];
  numero_factura?:     string;
  fecha_factura?:      string;
  valor_facturado?:    number;
  fecha_vencimiento?:  string;
  estado_cobro?:       EstadoCobro;
  observaciones?:      string;
  proximos_pasos?:     string;
  estado_id?:          string;
}

export interface RechazadoPayload {
  consultores_ids?:   string[];
  fecha_rechazo?:     string;
  motivo_categoria?:  MotivoRechazoCat;
  motivo_detalle?:    string;
  decision_por?:      string;
  recuperable?:       RecuperableOpt;
  fecha_recontacto?:  string;
  observaciones?:     string;
  proximos_pasos?:    string;
  estado_id?:         string;
}

export interface StandByPayload {
  consultores_ids?:       string[];
  fecha_inicio_pausa?:    string;
  fecha_estimada_retorno?: string;
  motivo_categoria?:      MotivoStandByCat;
  motivo_detalle?:        string;
  decision_por?:          string;
  condicion_reactivar?:   string;
  observaciones?:         string;
  proximos_pasos?:        string;
  estado_id?:             string;
}

export interface ConsultorRef {
  id:     string;
  nombre: string;
}

export interface EtapaLevantamiento {
  id:                  string;
  proceso_id:          string;
  fecha_levantamiento: string | null;
  observaciones:       string | null;
  consultores:         ConsultorRef[];
}

export interface EtapaEstimacion {
  id:               string;
  proceso_id:       string;
  fecha_estimacion: string | null;
  observaciones:    string | null;
  proximos_pasos:   string | null;
  estado_id:        string | null;
  consultores:      ConsultorRef[];
  volumen_transaccional_mensual: number | null;
  tiempo_ejecucion_transaccion:  number | null;
  requiere_captcha:   boolean;
  volumen_captcha_mes: number | null;
  requiere_ai:              boolean;
  ai_para_que:              string | null;
  ai_nombre:                string | null;
  ai_metodo_pago:           string | null;
  ai_volumen_mensual_tokens: number | null;
  requiere_ocr:        boolean;
  ocr_nombre:          string | null;
  ocr_volumen_mensual: number | null;
  ocr_costo:           number | null;
  requiere_idp:        boolean;
  idp_documentos:      string | null;
  idp_volumen_mensual: number | null;
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
  estado_id:        string | null;
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
  proximos_pasos:           string | null;
  estado_id:                string | null;
  consultor:                ConsultorRef | null;
  consultores:              ConsultorRef[];
}

export interface Interaccion {
  id:           string;
  proceso_id:   string;
  consultor_id: string;
  tipo:         TipoInteraccion | null;
  descripcion:  string | null;
  fecha:        string;
  consultor:    ConsultorRef | null;
  observaciones?: string;
  proximos_pasos?: string;
  estadoObj?: { id: string; nombre: string };
  consultores: ConsultorRef[];
}

export interface Proceso {
  id:                      string;
  proyecto_id:             string;
  nombre_proceso:          string;
  tipo:                    TipoClasificacion | null;
  estatus:                 EstatusProceso;
  probabilidad_aprobacion: string | null;
  prioridad:               PrioridadProceso | null;
  herramientas:            { id: string; nombre: string }[];
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
  proyecto:      { id: string; nombre: string };
  herramienta:   { id: string; nombre: string } | null;
  levantamiento: EtapaLevantamiento | null;
  estimacion:    EtapaEstimacion    | null;
  propuesta:     EtapaPropuesta     | null;
  preliminar:    EtapaPreliminar    | null;
  aprobacion:    EtapaAprobacion    | null;
  ejecucion:     EtapaEjecucion     | null;
  interacciones: Interaccion[];
  fecha_creacion?: string;
  fecha_inicio?:   string;
  aprobado?:  any;
  cierre?:    any;
  facturado?: any;
  rechazado?: any;
  stand_by?:  any;
}

export interface ProcesoPayload {
  nombre_proceso:           string;
  tipo?:                    TipoClasificacion;
  estatus?:                 EstatusProceso;
  prioridad?:               PrioridadProceso;
  probabilidad_aprobacion?: string;
  plazo_inicio?:            string;
  herramienta_rpa_id?:      string;
  accion_responsable?:      string;
}

export interface EtapaPayload {
  consultores_ids?:          string[];
  fecha_levantamiento?:      string;
  fecha_estimacion?:         string;
  nivel_detalle?:            NivelDetalle;
  fecha_entrega_propuesta?:  string;
  valor_presupuestado?:      number;
  horas_presupuestadas?:     number;
  fecha_preliminar?:         string;
  resultado?:                string;
  viable?:                   boolean | null;
  aprobado?:                 boolean;
  fecha_aprobacion?:         string;
  motivo_rechazo?:           string;
  fecha_rechazo?:            string;
  consultor_responsable_id?: string;
  fecha_inicio?:             string;
  fecha_fin?:                string;
  horas_reales?:             number;
  observaciones?:            string;
  proximos_pasos?:           string;
  estado_id?:                string;
}

export interface WizardPayload {
  proyecto_id:             string;
  nombre_proceso:          string;
  tipo:                    TipoClasificacion | '';
  probabilidad_aprobacion: string;
  prioridad:               PrioridadProceso | '';
  fecha_lead:              string;
  plazo_inicio:            string;
  herramienta_rpa_id?:     string;
  herramientas_ids?:       string[];
  accion_responsable:      string;
  estatus:                 EstatusProceso | '';
  lev_consultores_ids: string[];
  lev_fecha:           string;
  lev_observaciones:   string;
  lev_proximos_pasos:  string;
  lev_estado_id:       string;
  est_consultores_ids: string[];
  est_fecha:           string;
  est_observaciones:   string;
  est_proximos_pasos:  string;
  est_estado_id:       string;
  est_volumen_transaccional_mensual?: number;
  est_tiempo_ejecucion_transaccion?:  number;
  est_requiere_captcha?:   boolean;
  est_volumen_captcha_mes?: number;
  est_requiere_ai?:              boolean;
  est_ai_para_que?:              string;
  est_ai_nombre?:                string;
  est_ai_metodo_pago?:           string;
  est_ai_volumen_mensual_tokens?: number;
  est_requiere_ocr?:        boolean;
  est_ocr_nombre?:          string;
  est_ocr_volumen_mensual?: number;
  est_ocr_costo?:           number;
  est_requiere_idp?:        boolean;
  est_idp_documentos?:      string;
  est_idp_volumen_mensual?: number;
  prop_consultores_ids: string[];
  prop_nivel_detalle:   NivelDetalle | '';
  prop_fecha_entrega:   string;
  prop_valor:           number | '';
  prop_horas:           number | '';
  prop_observaciones:   string;
  prop_horas_gerencia:  number | '';
  prop_valor_gerencia:  number | '';
  prop_estado_id:       string;
  pre_fecha:     string;
  pre_resultado: string;
  pre_viable:    boolean | null;
  apr_aprobado:       'Aprobado' | 'Rechazado' | '';
  apr_fecha:          string;
  apr_motivo_rechazo: string;
  apr_estado_id:      string;
  aprobado_consultores_ids: string[];
  aprobado_fecha:           string;
  aprobado_observaciones:   string;
  aprobado_proximos_pasos:  string;
  aprobado_estado_id:       string;
  ejec_consultores_ids:          string[];
  ejec_fecha_inicio:             string;
  ejec_fecha_fin:                string;
  ejec_horas_reales:             number | '';
  ejec_observaciones:            string;
  ejec_proximos_pasos:           string;
  ejec_estado_id:                string;
  int_tipo:         TipoInteraccion | '';
  int_consultor_id: string;
  int_descripcion:  string;
  int_fecha:        string;
  cierre_consultores_ids: string[];
  cierre_fecha:           string;
  cierre_observaciones:   string;
  cierre_proximos_pasos:  string;
  cierre_estado_id:       string;
  facturado_consultores_ids:   string[];
  facturado_numero_factura:    string;
  facturado_fecha_factura:     string;
  facturado_valor:             number | string;
  facturado_fecha_vencimiento: string;
  facturado_estado_cobro:      EstadoCobro | '';
  facturado_observaciones:     string;
  facturado_proximos_pasos:    string;
  facturado_estado_id:         string;
  rechazado_consultores_ids:  string[];
  rechazado_fecha:            string;
  rechazado_motivo_categoria: MotivoRechazoCat | '';
  rechazado_motivo_detalle:   string;
  rechazado_decision_por:     string;
  rechazado_recuperable:      RecuperableOpt | '';
  rechazado_fecha_recontacto: string;
  rechazado_observaciones:    string;
  rechazado_proximos_pasos:   string;
  rechazado_estado_id:        string;
  standby_consultores_ids:     string[];
  standby_fecha_inicio:        string;
  standby_fecha_retorno:       string;
  standby_motivo_categoria:    MotivoStandByCat | '';
  standby_motivo_detalle:      string;
  standby_decision_por:        string;
  standby_condicion_reactivar: string;
  standby_observaciones:       string;
  standby_proximos_pasos:      string;
  standby_estado_id:           string;
}

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

export interface Props {
  d: Partial<WizardPayload>;
  set: Setter;
  wizardProcessId: string | null;
  onSave: () => Promise<void>;
  saving: boolean;
  saved: boolean;
  locked: boolean;
}