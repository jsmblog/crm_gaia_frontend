import { connection_to_backend } from "../Connection/connection";

export interface PeriodoFiltro {
  desde?: string;
  hasta?: string;
}

export interface KpiClientes    { total: number; nuevos: number }
export interface KpiConsultores { total: number; activos: number; inactivos: number }
export interface KpiProyectos   { total: number; activos: number; porEstado: { estado: string; total: number }[] }
export interface KpiPipeline    { total: number; aprobados: number; rechazados: number; tasaConversion: string; tasaRechazo: string; porEstatus: { estatus: string; total: number; pct: number }[] }
export interface KpiFinanzas    { valorPresupuestadoTotal: number; valorPresupuestadoPromedio: number; horasPresupuestadasTotal: number; valorAprobadoTotal: number; horasAprobadasTotal: number; horasRealesTotal: number; horasRealesPromedio: number }
export interface KpiHerramientas{ asignacionesActivas: number }

export interface DashboardResponse {
  ok: boolean;
  periodo: { desde: string | null; hasta: string | null };
  kpis: {
    clientes:     KpiClientes;
    consultores:  KpiConsultores;
    proyectos:    KpiProyectos;
    pipeline:     KpiPipeline;
    finanzas:     KpiFinanzas;
    herramientas: KpiHerramientas;
  };
}

export interface ReporteProyectosResponse {
  ok: boolean;
  resumen: {
    total: number;
    porEstado: { estado: string; total: number }[];
    porArea:   { area: string; total: number }[];
  };
  tendenciaMensual: { mes: string; total: number }[];
  proyectos: {
    id: string; nombre: string; estado_actual: string;
    horas_estimadas: number | null; activo: boolean;
    createdAt: string; cliente_nombre: string; empresa: string;
  }[];
}

export interface ReportePipelineResponse {
  ok: boolean;
  resumen: {
    totalProcesos: number;
    tasaConversion: number;
    funnel: { estatus: string; total: number; pct: number }[];
    porTipo: { tipo: string; total: number }[];
    porClasificacion: { clasificacion: string; total: number }[];
    tiempoPromedioEtapas: { diasHastaLevantamiento: string; diasHastaEstimacion: string; diasHastaPropuesta: string; diasHastaAprobacion: string };
    probabilidadAprobacion: { tipo: string; promedio: string; totalProcesos: number }[];
  };
  tendenciaMensual: { mes: string; estatus: string; total: number }[];
  topProcesos: any[];
}

export interface ReporteFinancieroResponse {
  ok: boolean;
  resumen: {
    valorTotal: number; horasTotal: number;
    valorAprobado: number; horasAprobadas: number;
    valorEnPipeline: number;
    preciosHoraClientes: { promedioDesarrollo: number; promedioSoporte: number; promedioCambio: number; promedioGobierno: number; maxDesarrollo: number; minDesarrollo: number };
  };
  valorPorEstatus: { estatus: string; valorTotal: number; horasTotal: number; totalProcesos: number }[];
  topClientesPorValor: { cliente: string; empresa: string; valor_aprobado: number; horas_aprobadas: number; procesos_aprobados: number }[];
  eficienciaHoras: { nombre_proceso: string; estatus: string; tipo_proceso: string; horas_presupuestadas: number; horas_reales: number; pct_desviacion: number }[];
  tendenciaValorMensual: { mes: string; valorAprobado: number; procesosAprobados: number }[];
}

export interface ReporteConsultoresResponse {
  ok: boolean;
  horasPorConsultor: { id: string; nombre: string; rol: string; proyectos_ejecutados: number; horas_ejecutadas: number }[];
  participacionPorEtapa: { id: string; nombre: string; levantamientos: number; estimaciones: number; propuestas: number; preliminares: number; aprobaciones: number; ejecuciones: number }[];
  interaccionesUltimos30Dias: any[];
  tasaAprobacionPorConsultor: { nombre: string; total_procesos: number; aprobados: number; tasa_aprobacion: number }[];
}

export interface ReporteClientesResponse {
  ok: boolean;
  topClientesPorActividad: { id: string; nombre: string; empresa: string; total_proyectos: number; proyectos_activos: number; total_procesos: number; procesos_aprobados: number; valor_total_aprobado: number }[];
  tendenciaClientesNuevos: { mes: string; total: number }[];
  resumen: { totalClientes: number; clientesSinProyectos: number };
  clientesSinProyectos: { id: string; nombre: string; empresa: string; email: string; created_at: string }[];
}

export interface ReporteHerramientasResponse {
  ok: boolean;
  usoPorHerramienta: any[];
  herramientasEnProcesos: any[];
  proximasAExpirar: any[];
  resumen: { totalHerramientas: number; asignacionesActivas: number; proximasExpirar: number };
}

export interface ActividadRecienteResponse {
  ok: boolean;
  ultimosCambiosEstadoProyecto: any[];
  ultimasPropuestasRegistradas: any[];
  ultimasDecisionesAprobacion:  any[];
  ultimasInteracciones:         any[];
}

export interface ReporteAreasResponse {
  ok: boolean;
  areasPorActividad: { area: string; total_proyectos: number; total_procesos: number; procesos_aprobados: number; valor_aprobado: number }[];
}

export interface AbandonoEtapa {
  etapa: string;
  conEtapa: number;
  sinSiguiente: number;
  pctAbandono: number;
}

export interface ReporteForecastResponse {
  ok: boolean;
  pipelinePonderado: {
    valorPonderado: number;
    valorBruto: number;
    totalProcesos: number;
    probPromedio: number;
  };
  forecastDias: { dias30: number; dias60: number; dias90: number };
  procesosEstancadosAltoRiesgo: {
    id: string; nombre_proceso: string; estatus: string;
    probabilidad_aprobacion: number; dias_sin_movimiento: number;
    valor_presupuestado: number; proyecto_nombre: string; cliente_nombre: string;
  }[];
  comparativaMensual: {
    valorMesActual: number; valorMesAnterior: number; valorMismoMesAnioAnt: number;
    crecimientoMoM: number | null; crecimientoYoY: number | null;
    procesosActual: number; procesosAnterior: number;
    aprobadosActual: number; aprobadosAnterior: number;
    clientesActual: number; clientesAnterior: number;
  };
  tiempoCierrePorConsultor: { nombre: string; dias_promedio_cierre: number; procesos_cerrados: number; aprobados: number; win_rate: number }[];
  tiempoCierrePorTipo: { tipo_proceso: string; dias_promedio_cierre: number; total: number; aprobados: number; win_rate: number }[];
  abandonoPorEtapa: AbandonoEtapa[];
}

export interface ReporteSaludClientesResponse {
  ok: boolean;
  churnSilencioso: {
    id: string; nombre: string; empresa: string; email: string;
    ultima_interaccion: string | null; dias_sin_contacto: number;
    total_proyectos: number; proyectos_activos: number;
  }[];
  activosSinInteraccion: {
    id: string; nombre: string; empresa: string;
    ultima_interaccion: string | null; dias_sin_contacto: number; proyectos_activos: number;
  }[];
  frecuenciaInteraccion: {
    id: string; nombre: string; empresa: string;
    total_interacciones: number; interacciones_por_mes: number; ultima_interaccion: string | null;
  }[];
  ltvPorCliente: {
    id: string; nombre: string; empresa: string;
    ltv: number; horas_aprobadas: number; procesos_aprobados: number;
    total_proyectos: number; primer_proceso: string | null; ultimo_proceso_aprobado: string | null;
  }[];
  resumen: {
    totalClientes: number;
    clientesEnRiesgoChurn: number;
    activosSinContactoReciente: number;
    ltvTotalPortafolio: number;
    ltvPromedio: number;
  };
}

export interface ReporteCapacidadResponse {
  ok: boolean;
  cargaPorConsultor: {
    id: string; nombre: string; rol: string; activo: boolean;
    procesos_activos: number; horas_comprometidas: number; horas_ejecutadas_total: number;
  }[];
  procesosEstancados: {
    id: string; nombre_proceso: string; estatus: string; tipo_proceso: string;
    dias_estancado: number; valor_presupuestado: number;
    proyecto_nombre: string; cliente_nombre: string;
  }[];
  winRatePorTipo: { tipo_proceso: string; total: number; aprobados: number; win_rate: number }[];
  winRatePorCliente: { cliente: string; empresa: string; total_procesos: number; aprobados: number; win_rate: number; valor_ganado: number }[];
  razonesRechazo: { motivo_rechazo: string; total: number }[];
  margenRealPorProceso: { nombre_proceso: string; tipo_proceso: string; valor_presupuestado: number; horas_presupuestadas: number; horas_reales: number; precio_hora: number; margen_real: number }[];
  resumen: {
    totalConsultores: number;
    consultoresSobrecargados: number;
    consultoresSinAsignacion: number;
    procesosEstancadosTotal: number;
  };
}

export const reporteService = {

  getDashboard: (filtro?: PeriodoFiltro) =>
    connection_to_backend
      .get<DashboardResponse>("/reportes/dashboard", { params: filtro })
      .then(r => r.data),

  getProyectos: (filtro?: PeriodoFiltro & { clienteId?: string }) =>
    connection_to_backend
      .get<ReporteProyectosResponse>("/reportes/proyectos", { params: filtro })
      .then(r => r.data),

  getPipeline: (filtro?: PeriodoFiltro & { proyectoId?: string }) =>
    connection_to_backend
      .get<ReportePipelineResponse>("/reportes/pipeline", { params: filtro })
      .then(r => r.data),

  getFinanciero: (filtro?: PeriodoFiltro) =>
    connection_to_backend
      .get<ReporteFinancieroResponse>("/reportes/financiero", { params: filtro })
      .then(r => r.data),

  getConsultores: (filtro?: PeriodoFiltro) =>
    connection_to_backend
      .get<ReporteConsultoresResponse>("/reportes/consultores", { params: filtro })
      .then(r => r.data),

  getClientes: () =>
    connection_to_backend
      .get<ReporteClientesResponse>("/reportes/clientes")
      .then(r => r.data),

  getHerramientas: () =>
    connection_to_backend
      .get<ReporteHerramientasResponse>("/reportes/herramientas")
      .then(r => r.data),

  getActividadReciente: (limit = 15) =>
    connection_to_backend
      .get<ActividadRecienteResponse>("/reportes/actividad-reciente", { params: { limit } })
      .then(r => r.data),

  getAreas: () =>
    connection_to_backend
      .get<ReporteAreasResponse>("/reportes/areas")
      .then(r => r.data),

  getForecast: (filtro?: PeriodoFiltro) =>
    connection_to_backend
      .get<ReporteForecastResponse>("/reportes/forecast", { params: filtro })
      .then(r => r.data),

  getSaludClientes: () =>
    connection_to_backend
      .get<ReporteSaludClientesResponse>("/reportes/salud-clientes")
      .then(r => r.data),

  getCapacidad: () =>
    connection_to_backend
      .get<ReporteCapacidadResponse>("/reportes/capacidad")
      .then(r => r.data),
};