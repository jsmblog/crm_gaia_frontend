import type { EstatusProceso, Proceso, WizardPayload } from "../../../Interfaces/i_procesos";

const TODAY = new Date().toISOString().split('T')[0];
const isoToDate = (s?: string | null) => s ? s.split('T')[0] : '';

const resolveEstatus = (p: Proceso): string =>
  (p as any).estadoObj?.nombre ?? (p as any).estatus ?? '';

export const procesoToWizard = (p: Proceso): WizardPayload => ({
  proyecto_id:             p.proyecto_id,
  nombre_proceso:          p.nombre_proceso,
  tipo:                    p.tipo || '',
  probabilidad_aprobacion: p.probabilidad_aprobacion || '',
  prioridad:               p.prioridad || '',
  herramientas_ids:        p.herramientas?.map((h: any) => h.id) ?? [],
  estatus:                 resolveEstatus(p) as EstatusProceso,
  fecha_lead:              isoToDate(p.fecha_creacion) || TODAY,
  plazo_inicio:            isoToDate(p.fecha_inicio) || TODAY,
  accion_responsable:      p.accion_responsable || '',

  // Step 2 — Levantamiento
  lev_consultores_ids: p.levantamiento?.consultores?.map(c => c.id) || [],
  lev_fecha:           isoToDate(p.levantamiento?.fecha_levantamiento) || TODAY,
  lev_observaciones:   p.levantamiento?.observaciones || '',
  lev_proximos_pasos:  (p.levantamiento as any)?.proximos_pasos || '',
  lev_estado_id:       (p.levantamiento as any)?.estado_id || '',

  // Step 2 — Estimación (base)
  est_consultores_ids: p.estimacion?.consultores?.map(c => c.id) || [],
  est_fecha:           isoToDate(p.estimacion?.fecha_estimacion) || TODAY,
  est_observaciones:   p.estimacion?.observaciones || '',
  est_proximos_pasos:  p.estimacion?.proximos_pasos || '',
  est_estado_id:       p.estimacion?.estado_id || '',
  // Métricas operativas
  est_volumen_transaccional_mensual: p.estimacion?.volumen_transaccional_mensual ?? undefined,
  est_tiempo_ejecucion_transaccion:  p.estimacion?.tiempo_ejecucion_transaccion  ?? undefined,
  // Captcha
  est_requiere_captcha:    p.estimacion?.requiere_captcha    ?? false,
  est_volumen_captcha_mes: p.estimacion?.volumen_captcha_mes ?? undefined,
  // IA
  est_requiere_ai:               p.estimacion?.requiere_ai               ?? false,
  est_ai_para_que:               p.estimacion?.ai_para_que               ?? undefined,
  est_ai_nombre:                 p.estimacion?.ai_nombre                 ?? undefined,
  est_ai_metodo_pago:            p.estimacion?.ai_metodo_pago            ?? undefined,
  est_ai_volumen_mensual_tokens: p.estimacion?.ai_volumen_mensual_tokens ?? undefined,
  // OCR
  est_requiere_ocr:        p.estimacion?.requiere_ocr        ?? false,
  est_ocr_nombre:          p.estimacion?.ocr_nombre          ?? undefined,
  est_ocr_volumen_mensual: p.estimacion?.ocr_volumen_mensual ?? undefined,
  est_ocr_costo:           p.estimacion?.ocr_costo           ?? undefined,
  // IDP
  est_requiere_idp:        p.estimacion?.requiere_idp        ?? false,
  est_idp_documentos:      p.estimacion?.idp_documentos      ?? undefined,
  est_idp_volumen_mensual: p.estimacion?.idp_volumen_mensual ?? undefined,

  // Step 3 — Propuesta
  prop_consultores_ids: p.propuesta?.consultores?.map(c => c.id) || [],
  prop_nivel_detalle:   p.propuesta?.nivel_detalle || '',
  prop_fecha_entrega:   isoToDate(p.propuesta?.fecha_entrega_propuesta),
  prop_valor:           p.propuesta?.valor_presupuestado || '',
  prop_horas:           p.propuesta?.horas_presupuestadas || '',
  prop_observaciones:   p.propuesta?.observaciones || '',
  prop_horas_gerencia:  (p.propuesta as any)?.horas_gerencia || '',
  prop_valor_gerencia:  (p.propuesta as any)?.valor_gerencia || '',
  prop_estado_id:       (p.propuesta as any)?.estado_id || '',

  // Step 4 — Preliminar
  pre_fecha:     isoToDate(p.preliminar?.fecha_preliminar),
  pre_resultado: p.preliminar?.resultado || '',
  pre_viable:    p.preliminar?.viable ?? null,

  // Step 4 — Aprobación
  apr_aprobado:       p.aprobacion ? (p.aprobacion.aprobado ? 'Aprobado' : 'Rechazado') : '',
  apr_fecha:          isoToDate(p.aprobacion?.fecha_aprobacion) || TODAY,
  apr_motivo_rechazo: p.aprobacion?.motivo_rechazo || '',
  apr_estado_id:      p.aprobacion?.estado_id || '',

  // Step 5 — Aprobado
  aprobado_consultores_ids: p.aprobado?.consultores?.map((c: any) => c.id) || [],
  aprobado_fecha:           isoToDate(p.aprobado?.fecha_aprobado) || '',
  aprobado_observaciones:   p.aprobado?.observaciones || '',
  aprobado_proximos_pasos:  p.aprobado?.proximos_pasos || '',
  aprobado_estado_id:       p.aprobado?.estado_id || '',

  // Step 5 — Ejecución
  ejec_consultores_ids:          p.ejecucion?.consultores?.map(c => c.id) || [],
  ejec_fecha_inicio:             isoToDate(p.ejecucion?.fecha_inicio),
  ejec_fecha_fin:                isoToDate(p.ejecucion?.fecha_fin),
  ejec_horas_reales:             p.ejecucion?.horas_reales || '',
  ejec_observaciones:            p.ejecucion?.observaciones || '',
  ejec_proximos_pasos:           p.ejecucion?.proximos_pasos || '',
  ejec_estado_id:                p.ejecucion?.estado_id || '',

  // Step 5 — Interacción
  int_tipo: '', int_consultor_id: '', int_descripcion: '', int_fecha: TODAY,

  // Step 6 — Cierre
  cierre_consultores_ids: p.cierre?.consultores?.map((c: any) => c.id) || [],
  cierre_fecha:           isoToDate(p.cierre?.fecha_cierre) || '',
  cierre_observaciones:   p.cierre?.observaciones || '',
  cierre_proximos_pasos:  p.cierre?.proximos_pasos || '',
  cierre_estado_id:       p.cierre?.estado_id || '',

  // Step 6 — Facturado
  facturado_consultores_ids:   p.facturado?.consultores?.map((c: any) => c.id) || [],
  facturado_numero_factura:    p.facturado?.numero_factura || '',
  facturado_fecha_factura:     isoToDate(p.facturado?.fecha_factura) || '',
  facturado_valor:             p.facturado?.valor_facturado || '',
  facturado_fecha_vencimiento: isoToDate(p.facturado?.fecha_vencimiento) || '',
  facturado_estado_cobro:      p.facturado?.estado_cobro || '',
  facturado_observaciones:     p.facturado?.observaciones || '',
  facturado_proximos_pasos:    p.facturado?.proximos_pasos || '',
  facturado_estado_id:         p.facturado?.estado_id || '',

  // Rechazado
  rechazado_consultores_ids:  p.rechazado?.consultores?.map((c: any) => c.id) || [],
  rechazado_fecha:            isoToDate(p.rechazado?.fecha_rechazo) || '',
  rechazado_motivo_categoria: p.rechazado?.motivo_categoria || '',
  rechazado_motivo_detalle:   p.rechazado?.motivo_detalle || '',
  rechazado_decision_por:     p.rechazado?.decision_por || '',
  rechazado_recuperable:      p.rechazado?.recuperable || '',
  rechazado_fecha_recontacto: isoToDate(p.rechazado?.fecha_recontacto) || '',
  rechazado_observaciones:    p.rechazado?.observaciones || '',
  rechazado_proximos_pasos:   p.rechazado?.proximos_pasos || '',
  rechazado_estado_id:        p.rechazado?.estado_id || '',
  standby_consultores_ids:     p.stand_by?.consultores?.map((c: any) => c.id) || [],
  standby_fecha_inicio:        isoToDate(p.stand_by?.fecha_inicio_pausa) || '',
  standby_fecha_retorno:       isoToDate(p.stand_by?.fecha_estimada_retorno) || '',
  standby_motivo_categoria:    p.stand_by?.motivo_categoria || '',
  standby_motivo_detalle:      p.stand_by?.motivo_detalle || '',
  standby_decision_por:        p.stand_by?.decision_por || '',
  standby_condicion_reactivar: p.stand_by?.condicion_reactivar || '',
  standby_observaciones:       p.stand_by?.observaciones || '',
  standby_proximos_pasos:      p.stand_by?.proximos_pasos || '',
  standby_estado_id:           p.stand_by?.estado_id || '',
});

export const resolveInitialSavedSteps = (p: Proceso): Set<number> => {
  const s = new Set<number>();
  s.add(1);
  if (p.levantamiento || p.estimacion) s.add(2);
  if (p.estimacion) s.add(3);
  if (p.propuesta) s.add(4);
  if (p.preliminar || p.aprobacion) s.add(5);
  if ((p as any).aprobado) s.add(6);
  if (p.ejecucion) s.add(7);
  if ((p as any).cierre) s.add(8);
  if ((p as any).facturado) s.add(9);
  if ((p as any).rechazado) s.add(10);
  if ((p as any).stand_by) s.add(11);
  return s;
};