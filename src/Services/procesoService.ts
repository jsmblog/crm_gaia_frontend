import { connection_to_backend } from "../Connection/connection";
import type {
  Proceso,
  ProcesoPayload,
  EtapaPayload,
  WizardPayload,
  ProcesoListResponse,
  ProcesoResponse,
  TipoInteraccion,
  EstatusProceso,
} from "../Interfaces/i_procesos";

export const procesoService = {

  getAll: (params?: { proyectoId?: string; estatus?: string; tipo?: string; page?: number; limit?: number }) =>
    connection_to_backend
      .get<ProcesoListResponse>("/procesos", { params })
      .then(r => r.data),

  getById: (id: string) =>
    connection_to_backend
      .get<ProcesoResponse>(`/procesos/${id}`)
      .then(r => r.data.data),

  create: (proyectoId: string, payload: ProcesoPayload) =>
    connection_to_backend
      .post<ProcesoResponse>(`/proyectos/${proyectoId}/procesos`, payload)
      .then(r => r.data.data),

  update: (id: string, payload: Partial<ProcesoPayload>) =>
    connection_to_backend
      .put<ProcesoResponse>(`/procesos/${id}`, payload)
      .then(r => r.data.data),

  cambiarEstatus: (id: string, estatus: EstatusProceso) =>
    connection_to_backend
      .patch<{ ok: boolean; mensaje: string; data: Proceso }>(`/procesos/${id}/estatus`, { estatus })
      .then(r => r.data),

  remove: (id: string) =>
    connection_to_backend
      .delete<{ ok: boolean; mensaje: string }>(`/procesos/${id}`)
      .then(r => r.data),

  upsertEtapa: (id: string, etapa: string, data: EtapaPayload) =>
    connection_to_backend
      .put(`/procesos/${id}/${etapa}`, data)
      .then(r => r.data),

  upsertLevantamiento: (id: string, data: Pick<EtapaPayload,
    'consultores_ids' | 'fecha_levantamiento' | 'observaciones' | 'proximos_pasos' | 'estado_id'>) =>
    connection_to_backend.put(`/procesos/${id}/levantamiento`, data).then(r => r.data),

  upsertEstimacion: (id: string, data: Pick<EtapaPayload,
    | 'consultores_ids'
    | 'fecha_estimacion'
    | 'observaciones'
    | 'proximos_pasos'
    | 'estado_id'
    | 'volumen_transaccional_mensual'
    | 'tiempo_ejecucion_transaccion'
    | 'requiere_captcha'
    | 'volumen_captcha_mes'
    | 'costo_mensual_captcha'
    | 'requiere_ai'
    | 'ai_para_que'
    | 'ai_nombre'
    | 'ai_metodo_pago'
    | 'ai_volumen_mensual_tokens'
    | 'costo_mensual_ai'
    | 'requiere_ocr'
    | 'ocr_nombre'
    | 'ocr_volumen_mensual'
    | 'ocr_costo'
    | 'requiere_idp'
    | 'idp_documentos'
    | 'idp_volumen_mensual'
    | 'costo_mensual_idp'
  >) =>
    connection_to_backend.put(`/procesos/${id}/estimacion`, data).then(r => r.data),

  crearInteraccionLevantamiento: (id: string, data: {
    consultores_ids?: string[]; fecha: string;
    observaciones?: string; proximos_pasos?: string; estado_id?: string;
  }) =>
    connection_to_backend.post(`/procesos/${id}/levantamiento/interacciones`, data).then(r => r.data),


  eliminarInteraccionLevantamiento: (id: string, interaccionId: string) =>
    connection_to_backend.delete(`/procesos/${id}/levantamiento/interacciones/${interaccionId}`).then(r => r.data),

  crearInteraccionEstimacion: (id: string, data: {
    consultores_ids?: string[]; fecha: string;
    observaciones?: string; proximos_pasos?: string; estado_id?: string;
  }) =>
    connection_to_backend.post(`/procesos/${id}/estimacion/interacciones`, data).then(r => r.data),

  eliminarInteraccionEstimacion: (id: string, interaccionId: string) =>
    connection_to_backend.delete(`/procesos/${id}/estimacion/interacciones/${interaccionId}`).then(r => r.data),
  upsertPropuesta: (id: string, data: Pick<EtapaPayload,
    'consultores_ids' | 'nivel_detalle' | 'fecha_entrega_propuesta' |
    'valor_presupuestado' | 'horas_presupuestadas' | 'observaciones'> & {
      horas_gerencia?: number;
      valor_gerencia?: number;
      estado_id?: string;
      hito_inicio_pct?: number;
      hito_pruebas_pct?: number;
      hito_estabilizacion_pct?: number;
      lic_forma_pago?: string;
      ocr_forma_pago?: string;
      captcha_forma_pago?: string;
      soporte_forma_pago?: string;
      idp_forma_pago?: string;
      ia_forma_pago?: string;
    }) =>
    connection_to_backend.put(`/procesos/${id}/propuesta`, data).then(r => r.data),

  upsertPreliminar: (id: string, data: Pick<EtapaPayload,
    'consultores_ids' | 'fecha_preliminar' | 'resultado' | 'probabilidad' | 'observaciones'>) =>
    connection_to_backend.put(`/procesos/${id}/preliminar`, data).then(r => r.data),

  upsertAprobacion: (id: string, data: Pick<EtapaPayload,
    'consultores_ids' | 'aprobado' | 'fecha_aprobacion' |
    'motivo_rechazo' | 'fecha_rechazo' | 'observaciones' | 'estado_id'>) =>
    connection_to_backend.put(`/procesos/${id}/aprobacion`, data).then(r => r.data),

  upsertEjecucion: (id: string, data: Pick<EtapaPayload,
    'consultores_ids' | 'fecha_inicio' |
    'fecha_fin' | 'observaciones'> & {
      proximos_pasos?: string;
      estado_id?: string;
    }) =>
    connection_to_backend.put(`/procesos/${id}/ejecucion`, data).then(r => r.data),

  listarInteraccionesEjecucion: (procesoId: string) =>
    connection_to_backend.get(`/procesos/${procesoId}/ejecucion/interacciones`),

  crearInteraccionEjecucion: (id: string, data: {
    consultores_ids?: string[]; fecha: string;
    observaciones?: string; proximos_pasos?: string; estado_id?: string;
  }) =>
    connection_to_backend.post(`/procesos/${id}/ejecucion/interacciones`, data).then(r => r.data),

  eliminarInteraccionEjecucion: (id: string, interaccionId: string) =>
    connection_to_backend.delete(`/procesos/${id}/ejecucion/interacciones/${interaccionId}`).then(r => r.data),

  getInteracciones: (id: string) =>
    connection_to_backend
      .get<{ ok: boolean; data: any[] }>(`/procesos/${id}/interacciones`)
      .then(r => r.data.data),
  listarInteraccionesLevantamiento: (procesoId: string) =>
    connection_to_backend.get(`/procesos/${procesoId}/levantamiento/interacciones`),

  listarInteraccionesEstimacion: (procesoId: string) =>
    connection_to_backend.get(`/procesos/${procesoId}/estimacion/interacciones`),

  crearInteraccion: (id: string, data: {
    consultor_id: string; tipo?: TipoInteraccion; descripcion?: string; fecha: string;
  }) =>
    connection_to_backend.post(`/procesos/${id}/interacciones`, data).then(r => r.data),

  eliminarInteraccion: (id: string, interaccionId: string) =>
    connection_to_backend
      .delete(`/procesos/${id}/interacciones/${interaccionId}`)
      .then(r => r.data),

  createFull: async (w: WizardPayload): Promise<Proceso> => {
    // 1. Proceso base
    const proceso = await procesoService.create(w.proyecto_id, {
      tipo: w.tipo || undefined,
      estatus: w.estatus || 'Lead',
      prioridad: w.prioridad || undefined,
      probabilidad_aprobacion: w.probabilidad_aprobacion || undefined,
      plazo_inicio: w.plazo_inicio || undefined,
      herramienta_rpa_id: w.herramienta_rpa_id || undefined,
      accion_responsable: w.accion_responsable || undefined,
    });

    const id = proceso.id;
    const calls: Promise<any>[] = [];

    // 2. Levantamiento
    if (w.lev_consultores_ids.length || w.lev_fecha)
      calls.push(procesoService.upsertLevantamiento(id, {
        consultores_ids: w.lev_consultores_ids.length ? w.lev_consultores_ids : undefined,
        fecha_levantamiento: w.lev_fecha || undefined,
        observaciones: w.lev_observaciones || undefined,
      }));

    // 3. Estimación
    if (w.est_consultores_ids.length || w.est_fecha)
      calls.push(procesoService.upsertEstimacion(id, {
        consultores_ids: w.est_consultores_ids.length ? w.est_consultores_ids : undefined,
        fecha_estimacion: w.est_fecha || undefined,
        observaciones: w.est_observaciones || undefined,
      }));

    // 4. Propuesta
    if (w.prop_valor || w.prop_consultores_ids.length)
      calls.push(procesoService.upsertPropuesta(id, {
        consultores_ids: w.prop_consultores_ids.length ? w.prop_consultores_ids : undefined,
        nivel_detalle: w.prop_nivel_detalle || undefined,
        fecha_entrega_propuesta: w.prop_fecha_entrega || undefined,
        valor_presupuestado: w.prop_valor ? +w.prop_valor : undefined,
        horas_presupuestadas: w.prop_horas ? +w.prop_horas : undefined,
        horas_gerencia: undefined,
        valor_gerencia: undefined,
        observaciones: w.prop_observaciones || undefined,
      }));

    // 5. Preliminar
    if (w.pre_fecha || w.pre_resultado)
      calls.push(procesoService.upsertPreliminar(id, {
        fecha_preliminar: w.pre_fecha || undefined,
        resultado: w.pre_resultado || undefined,
        probabilidad: w.pre_probabilidad ?? undefined,
      }));

    // 6. Aprobación
    if (w.apr_aprobado === 'Aprobado' || w.apr_aprobado === 'Rechazado')
      calls.push(procesoService.upsertAprobacion(id, {
        aprobado: w.apr_aprobado === 'Aprobado',
        fecha_aprobacion: w.apr_fecha || undefined,
        motivo_rechazo: w.apr_motivo_rechazo || undefined,
      }));

    // 7. Ejecución
    if (w.ejec_fecha_inicio)
      calls.push(procesoService.upsertEjecucion(id, {
        consultores_ids: w.ejec_consultores_ids.length ? w.ejec_consultores_ids : undefined,
        fecha_inicio: w.ejec_fecha_inicio,
        fecha_fin: w.ejec_fecha_fin || undefined,
        observaciones: w.ejec_observaciones || undefined,
      }));

    // 8. Interacción opcional
    if (w.int_consultor_id && w.int_fecha)
      calls.push(procesoService.crearInteraccion(id, {
        consultor_id: w.int_consultor_id,
        tipo: w.int_tipo || undefined,
        descripcion: w.int_descripcion || undefined,
        fecha: w.int_fecha,
      }));

    await Promise.allSettled(calls);

    return procesoService.getById(id);
  },
  listarInteraccionesPropuesta: (procesoId: string) =>
    connection_to_backend.get(`/procesos/${procesoId}/propuesta/interacciones`),

  crearInteraccionPropuesta: (id: string, data: {
    consultores_ids?: string[]; fecha: string;
    observaciones?: string; proximos_pasos?: string; estado_id?: string;
  }) =>
    connection_to_backend.post(`/procesos/${id}/propuesta/interacciones`, data).then(r => r.data),

  eliminarInteraccionPropuesta: (id: string, interaccionId: string) =>
    connection_to_backend.delete(`/procesos/${id}/propuesta/interacciones/${interaccionId}`).then(r => r.data),
  listarInteraccionesAprobacion: (procesoId: string) =>
    connection_to_backend.get(`/procesos/${procesoId}/aprobacion/interacciones`),

  crearInteraccionAprobacion: (id: string, data: {
    consultores_ids?: string[]; fecha: string;
    observaciones?: string; proximos_pasos?: string; estado_id?: string;
  }) =>
    connection_to_backend.post(`/procesos/${id}/aprobacion/interacciones`, data).then(r => r.data),

  eliminarInteraccionAprobacion: (id: string, interaccionId: string) =>
    connection_to_backend.delete(`/procesos/${id}/aprobacion/interacciones/${interaccionId}`).then(r => r.data),
  upsertAprobado: (id: string, data: {
    consultores_ids?: string[]; fecha_aprobado?: string;
    observaciones?: string; proximos_pasos?: string; estado_id?: string;
  }) =>
    connection_to_backend.put(`/procesos/${id}/aprobado`, data).then(r => r.data),

  listarInteraccionesAprobado: (procesoId: string) =>
    connection_to_backend.get(`/procesos/${procesoId}/aprobado/interacciones`),

  crearInteraccionAprobado: (id: string, data: {
    consultores_ids?: string[]; fecha: string;
    observaciones?: string; proximos_pasos?: string; estado_id?: string;
  }) =>
    connection_to_backend.post(`/procesos/${id}/aprobado/interacciones`, data).then(r => r.data),

  eliminarInteraccionAprobado: (id: string, interaccionId: string) =>
    connection_to_backend.delete(`/procesos/${id}/aprobado/interacciones/${interaccionId}`).then(r => r.data),
  upsertCierre: (id: string, data: {
    consultores_ids?: string[]; fecha_cierre?: string;
    observaciones?: string; proximos_pasos?: string; estado_id?: string;
  }) =>
    connection_to_backend.put(`/procesos/${id}/cierre`, data).then(r => r.data),

  listarInteraccionesCierre: (procesoId: string) =>
    connection_to_backend.get(`/procesos/${procesoId}/cierre/interacciones`),

  crearInteraccionCierre: (id: string, data: {
    consultores_ids?: string[]; fecha: string;
    observaciones?: string; proximos_pasos?: string; estado_id?: string;
  }) =>
    connection_to_backend.post(`/procesos/${id}/cierre/interacciones`, data).then(r => r.data),

  eliminarInteraccionCierre: (id: string, interaccionId: string) =>
    connection_to_backend.delete(`/procesos/${id}/cierre/interacciones/${interaccionId}`).then(r => r.data),
  upsertFacturado: (id: string, data: {
  consultores_ids?: string[];
  observaciones?: string;
  proximos_pasos?: string;
  estado_id?: string;
  facturas: Array<{
    id?: string;
    nombre?: string;
    numero_factura?: string;
    fecha_factura?: string;
    dias_credito?: number;
    fecha_vencimiento?: string;
    valor_facturado?: number;
    estado_cobro?: string;
  }>;
}) =>
  connection_to_backend.put(`/procesos/${id}/facturado`, data).then(r => r.data),
  listarInteraccionesFacturado: (procesoId: string) =>
    connection_to_backend.get(`/procesos/${procesoId}/facturado/interacciones`),

  crearInteraccionFacturado: (id: string, data: {
    consultores_ids?: string[]; fecha: string;
    observaciones?: string; proximos_pasos?: string; estado_id?: string;
  }) =>
    connection_to_backend.post(`/procesos/${id}/facturado/interacciones`, data).then(r => r.data),

  eliminarInteraccionFacturado: (id: string, interaccionId: string) =>
    connection_to_backend.delete(`/procesos/${id}/facturado/interacciones/${interaccionId}`).then(r => r.data),
  upsertRechazado: (id: string, data: {
    consultores_ids?: string[];
    fecha_rechazo?: string;
    motivo_categoria?: 'Precio' | 'Presupuesto' | 'Competencia' | 'Tiempo' |
    'Alcance' | 'Decisión interna' | 'Sin respuesta' | 'Otro';
    motivo_detalle?: string;
    decision_por?: string;
    recuperable?: 'Sí' | 'No' | 'Posiblemente';
    fecha_recontacto?: string;
    observaciones?: string;
    proximos_pasos?: string;
    estado_id?: string;
  }) =>
    connection_to_backend.put(`/procesos/${id}/rechazado`, data).then(r => r.data),

  listarInteraccionesRechazado: (procesoId: string) =>
    connection_to_backend.get(`/procesos/${procesoId}/rechazado/interacciones`),

  crearInteraccionRechazado: (id: string, data: {
    consultores_ids?: string[]; fecha: string;
    observaciones?: string; proximos_pasos?: string; estado_id?: string;
  }) =>
    connection_to_backend.post(`/procesos/${id}/rechazado/interacciones`, data).then(r => r.data),

  eliminarInteraccionRechazado: (id: string, interaccionId: string) =>
    connection_to_backend.delete(`/procesos/${id}/rechazado/interacciones/${interaccionId}`).then(r => r.data),
  upsertStandBy: (id: string, data: {
    consultores_ids?: string[];
    fecha_inicio_pausa?: string;
    fecha_estimada_retorno?: string;
    motivo_categoria?: 'Presupuesto congelado' | 'Decisión pendiente' |
    'Cambio interno cliente' | 'Espera técnica' |
    'Prioridad baja' | 'Retraso externo' | 'Otro';
    motivo_detalle?: string;
    decision_por?: string;
    condicion_reactivar?: string;
    observaciones?: string;
    proximos_pasos?: string;
    estado_id?: string;
  }) =>
    connection_to_backend.put(`/procesos/${id}/stand-by`, data).then(r => r.data),

  listarInteraccionesStandBy: (procesoId: string) =>
    connection_to_backend.get(`/procesos/${procesoId}/stand-by/interacciones`),

  crearInteraccionStandBy: (id: string, data: {
    consultores_ids?: string[]; fecha: string;
    observaciones?: string; proximos_pasos?: string; estado_id?: string;
  }) =>
    connection_to_backend.post(`/procesos/${id}/stand-by/interacciones`, data).then(r => r.data),

  eliminarInteraccionStandBy: (id: string, interaccionId: string) =>
    connection_to_backend.delete(`/procesos/${id}/stand-by/interacciones/${interaccionId}`).then(r => r.data),
};