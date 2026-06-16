export const ESTATUS_LABEL: Record<string, string> = {
  lead: 'Lead', levantamiento: 'Levantamiento', estimacion: 'Estimación',
  propuesta: 'Propuesta', aprobacion: 'En aprobación', aprobado: 'Aprobado',
  ejecucion: 'En ejecución', cierre: 'Cierre', rechazado: 'Rechazado',
  facturado: 'Facturada', standby: 'Stand-by',
};

export const ETAPA_PROGRESO: Record<string, number> = {
  lead: 5, levantamiento: 15, estimacion: 30, propuesta: 45,
  aprobacion: 55, aprobado: 65, ejecucion: 80, cierre: 92,
  facturado: 100, rechazado: 0, standby: 0,
};