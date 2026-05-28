import type { EstatusProceso, Proceso, WizardPayload } from "../../../Interfaces/i_procesos";
import { toIdArray } from "../../../Utils/toIdArray";

const TODAY = new Date().toISOString().split('T')[0];
const isoToDate = (s?: string | null) => s ? s.split('T')[0] : '';

const resolveEstatus = (p: Proceso): string =>
  (p as any).estadoObj?.nombre ?? (p as any).estatus ?? '';

export const procesoToWizard = (p: Proceso): WizardPayload => ({

  proyecto_id:             p.proyecto_id,
  nombre_proceso:          p.nombre_proceso,
  tipo:                    p.tipo                    || '',
  probabilidad_aprobacion: p.probabilidad_aprobacion || '',
  prioridad:               p.prioridad               || '',
  herramientas_ids:        toIdArray(p.herramientas),
  estatus:                 resolveEstatus(p) as EstatusProceso,
  fecha_lead:              isoToDate(p.fecha_creacion) || TODAY,
  plazo_inicio:            isoToDate(p.fecha_inicio)   || TODAY,
  accion_responsable:      p.accion_responsable        || '',

  // ── Step 2 — Levantamiento ───────────────────────────────────────
  lev_consultores_ids:  toIdArray(p.levantamiento?.consultores),
  lev_fecha:            isoToDate(p.levantamiento?.fecha_levantamiento) || TODAY,
  lev_observaciones:    p.levantamiento?.observaciones                  || '',
  lev_proximos_pasos:   (p.levantamiento as any)?.proximos_pasos        || '',
  lev_estado_id:        (p.levantamiento as any)?.estado_id             || '',

  // ── Step 2 — Estimación ──────────────────────────────────────────
  est_consultores_ids:  toIdArray(p.estimacion?.consultores),
  est_fecha:            isoToDate(p.estimacion?.fecha_estimacion) || TODAY,
  est_observaciones:    p.estimacion?.observaciones               || '',
  est_proximos_pasos:   p.estimacion?.proximos_pasos              || '',
  est_estado_id:        p.estimacion?.estado_id                   || '',

  // Métricas operativas
  est_volumen_transaccional_mensual: p.estimacion?.volumen_transaccional_mensual ?? undefined,
  est_tiempo_ejecucion_transaccion:  p.estimacion?.tiempo_ejecucion_transaccion  ?? undefined,
  volumen_transaccional_mensual:     undefined,

  // Captcha
  est_requiere_captcha:   p.estimacion?.requiere_captcha   ?? false,
  est_volumen_captcha_mes: p.estimacion?.volumen_captcha_mes ?? undefined,
  est_costo_mensual_captcha: (p.estimacion as any)?.costo_mensual_captcha ?? undefined,

  // IA
  est_requiere_ai:               p.estimacion?.requiere_ai               ?? false,
  est_ai_para_que:               p.estimacion?.ai_para_que               ?? undefined,
  est_ai_nombre:                 p.estimacion?.ai_nombre                 ?? undefined,
  est_ai_metodo_pago:            p.estimacion?.ai_metodo_pago            ?? undefined,
  est_ai_volumen_mensual_tokens: p.estimacion?.ai_volumen_mensual_tokens ?? undefined,
  est_costo_mensual_ai:          (p.estimacion as any)?.costo_mensual_ai ?? undefined,

  // OCR
  est_requiere_ocr:        p.estimacion?.requiere_ocr        ?? false,
  est_ocr_nombre:          p.estimacion?.ocr_nombre          ?? undefined,
  est_ocr_volumen_mensual: p.estimacion?.ocr_volumen_mensual ?? undefined,
  est_ocr_costo:           p.estimacion?.ocr_costo           ?? undefined,

  // IDP
  est_requiere_idp:        p.estimacion?.requiere_idp        ?? false,
  est_idp_documentos:      p.estimacion?.idp_documentos      ?? undefined,
  est_idp_volumen_mensual: p.estimacion?.idp_volumen_mensual ?? undefined,
  est_costo_mensual_idp:   (p.estimacion as any)?.costo_mensual_idp ?? undefined,

  // ── Step 3 — Propuesta ───────────────────────────────────────────
  prop_consultores_ids:  toIdArray(p.propuesta?.consultores),
  prop_nivel_detalle:    p.propuesta?.nivel_detalle                        || '',
  prop_fecha_entrega:    isoToDate(p.propuesta?.fecha_entrega_propuesta),
  prop_valor:            p.propuesta?.valor_presupuestado                  || '',
  prop_horas:            p.propuesta?.horas_presupuestadas                 || '',
  prop_observaciones:    p.propuesta?.observaciones                        || '',
  prop_horas_gerencia:   (p.propuesta as any)?.horas_gerencia             || '',
  prop_valor_gerencia:   (p.propuesta as any)?.valor_gerencia             || '',
  prop_estado_id:        (p.propuesta as any)?.estado_id                  || '',

  // Hitos de pago
  prop_hito_inicio_pct:         (p.propuesta as any)?.hito_inicio_pct         ?? 30,
  prop_hito_pruebas_pct:        (p.propuesta as any)?.hito_pruebas_pct        ?? 50,
  prop_hito_estabilizacion_pct: (p.propuesta as any)?.hito_estabilizacion_pct ?? 20,

  // Costos recurrentes
  prop_lic_forma_pago:     (p.propuesta as any)?.lic_forma_pago     ?? '',
  prop_ocr_forma_pago:     (p.propuesta as any)?.ocr_forma_pago     ?? '',
  prop_captcha_forma_pago: (p.propuesta as any)?.captcha_forma_pago ?? '',
  prop_soporte_forma_pago: (p.propuesta as any)?.soporte_forma_pago ?? '',
  prop_idp_forma_pago:     (p.propuesta as any)?.idp_forma_pago     ?? '',
  prop_ia_forma_pago:      (p.propuesta as any)?.ia_forma_pago      ?? '',

  // ── Step 4 — Preliminar ──────────────────────────────────────────
  pre_fecha:        isoToDate(p.preliminar?.fecha_preliminar),
  pre_resultado:    p.preliminar?.resultado   || '',
  pre_probabilidad: p.preliminar?.probabilidad || '',

  // ── Step 4 — Aprobación ──────────────────────────────────────────
  apr_consultores_ids: toIdArray(p.aprobacion?.consultores),
  apr_aprobado:        p.aprobacion
    ? (p.aprobacion.aprobado ? 'Aprobado' : 'Rechazado')
    : '',
  apr_fecha:           isoToDate(p.aprobacion?.fecha_aprobacion) || TODAY,
  apr_motivo_rechazo:  p.aprobacion?.motivo_rechazo || '',
  apr_estado_id:       p.aprobacion?.estado_id       || '',

  // ── Step 5 — Aprobado ────────────────────────────────────────────
  aprobado_consultores_ids: toIdArray(p.aprobado?.consultores),
  aprobado_fecha:           isoToDate(p.aprobado?.fecha_aprobado) || '',
  aprobado_observaciones:   p.aprobado?.observaciones  || '',
  aprobado_proximos_pasos:  p.aprobado?.proximos_pasos || '',
  aprobado_estado_id:       p.aprobado?.estado_id      || '',

  // ── Step 6 — Ejecución ───────────────────────────────────────────
  ejec_consultores_ids: toIdArray(p.ejecucion?.consultores),
  ejec_fecha_inicio:    isoToDate(p.ejecucion?.fecha_inicio),
  ejec_fecha_fin:       isoToDate(p.ejecucion?.fecha_fin),
  ejec_observaciones:   p.ejecucion?.observaciones  || '',
  ejec_proximos_pasos:  p.ejecucion?.proximos_pasos || '',
  ejec_estado_id:       p.ejecucion?.estado_id      || '',

  // Interacción (siempre vacío al abrir)
  int_tipo: '', int_consultor_id: '', int_descripcion: '', int_fecha: TODAY,

  // ── Step 7 — Cierre ──────────────────────────────────────────────
  cierre_consultores_ids: toIdArray(p.cierre?.consultores),
  cierre_fecha:           isoToDate(p.cierre?.fecha_cierre) || '',
  cierre_observaciones:   p.cierre?.observaciones           || '',
  cierre_proximos_pasos:  p.cierre?.proximos_pasos          || '',
  cierre_estado_id:       p.cierre?.estado_id               || '',
  horas_reales:           p.cierre?.horas_reales            ?? '',  // ?? para no perder el 0

  // ── Step 8 — Facturado ───────────────────────────────────────────
  facturado_consultores_ids: toIdArray(p.facturado?.consultores),
  facturado_observaciones:   p.facturado?.observaciones  || '',
  facturado_proximos_pasos:  p.facturado?.proximos_pasos || '',
  facturado_estado_id:       p.facturado?.estado_id      || '',

  // Campos legacy (por si algún componente aún los lee)
  facturado_numero_factura:   p.facturado?.numero_factura                    || '',
  facturado_fecha_factura:    isoToDate((p.facturado as any)?.fecha_factura) || '',
  facturado_valor:            (p.facturado as any)?.valor_facturado          || '',
  facturado_fecha_vencimiento: isoToDate((p.facturado as any)?.fecha_vencimiento) || '',
  facturado_estado_cobro:     (p.facturado as any)?.estado_cobro             || '',

  // Items de factura (nueva estructura multi-factura)
  facturado_items: ((p.facturado as any)?.facturas ?? []).map((f: any) => ({
    id:                f.id,
    nombre:            f.nombre            || '',
    numero_factura:    f.numero_factura    || '',
    fecha_factura:     isoToDate(f.fecha_factura),
    dias_credito:      f.dias_credito      ?? '',
    fecha_vencimiento: isoToDate(f.fecha_vencimiento),
    valor_facturado:   f.valor_facturado   ?? '',
    estado_cobro:      f.estado_cobro      || '',
  })),

  // ── Step 9 — Rechazado ───────────────────────────────────────────
  rechazado_consultores_ids:  toIdArray(p.rechazado?.consultores),
  rechazado_fecha:            isoToDate(p.rechazado?.fecha_rechazo)  || '',
  rechazado_motivo_categoria: p.rechazado?.motivo_categoria          || '',
  rechazado_motivo_detalle:   p.rechazado?.motivo_detalle            || '',
  rechazado_decision_por:     p.rechazado?.decision_por              || '',
  rechazado_recuperable:      p.rechazado?.recuperable               || '',
  rechazado_fecha_recontacto: isoToDate(p.rechazado?.fecha_recontacto) || '',
  rechazado_observaciones:    p.rechazado?.observaciones             || '',
  rechazado_proximos_pasos:   p.rechazado?.proximos_pasos            || '',
  rechazado_estado_id:        p.rechazado?.estado_id                 || '',

  // ── Step 10 — Stand By ───────────────────────────────────────────
  standby_consultores_ids:    toIdArray(p.stand_by?.consultores),
  standby_fecha_inicio:       isoToDate(p.stand_by?.fecha_inicio_pausa)     || '',
  standby_fecha_retorno:      isoToDate(p.stand_by?.fecha_estimada_retorno) || '',
  standby_motivo_categoria:   p.stand_by?.motivo_categoria    || '',
  standby_motivo_detalle:     p.stand_by?.motivo_detalle      || '',
  standby_decision_por:       p.stand_by?.decision_por        || '',
  standby_condicion_reactivar: p.stand_by?.condicion_reactivar || '',
  standby_observaciones:      p.stand_by?.observaciones       || '',
  standby_proximos_pasos:     p.stand_by?.proximos_pasos      || '',
  standby_estado_id:          p.stand_by?.estado_id           || '',
});

export const resolveInitialSavedSteps = (p: Proceso): Set<number> => {
  const s = new Set<number>();
  s.add(1);
  if (p.levantamiento || p.estimacion)  s.add(2);
  if (p.estimacion)                      s.add(3);
  if (p.propuesta)                       s.add(4);
  if (p.preliminar || p.aprobacion)      s.add(5);
  if ((p as any).aprobado)               s.add(6);
  if (p.ejecucion)                       s.add(7);
  if ((p as any).cierre)                 s.add(8);
  if ((p as any).facturado)              s.add(9);
  if ((p as any).rechazado)              s.add(10);
  if ((p as any).stand_by)              s.add(11);
  return s;
};