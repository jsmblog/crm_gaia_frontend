
export const ESTATUS_LIST : string[] = [
  'Lead','Contactado','Levantamiento','Estimacion','Propuesta',
  'En Aprobacion','Aprobado','Rechazado','En Ejecución','Cerrado','Stand BY','Facturada',
];

export const ESTATUS_LABEL: Record<string, string> = {
  Levantamiento:'En Levantamiento', Estimacion:'En Estimación',
  Propuesta:'En Propuesta', 'En Aprobacion':'En Aprobación',
};
export const lbl = (s: string) => ESTATUS_LABEL[s] ?? s;


export const PRIORIDADES: string[] = ['Bajo','Medio','Alto','Muy Alto'];
export const PROB_LIST = ['1. Muy Bajo','2. Bajo','3. Medio','4. Alto','5. Muy Alto'];
export const NIVEL_DETALLE = ['CPD','Básico','Intermedio','Detallado'];
export const TIPO_PROCESO = ['Automatización','Consultoría','Implementación' , 'Desarrollo','Integración'];
export const INTERACCION_TIPOS = ['Llamada','Email','Reunión','Demo','Otro'];
export const TODAY = new Date().toISOString().split('T')[0];

export const STEPS = ['Lead','Levantamiento','Propuesta','Aprobación','Ejecución'];

export const EMPTY: Partial<any> = {
  fecha_lead: TODAY, resultado_aprobacion: 'Pendiente',
  estatus: 'Lead', interaccion_tipo: 'Llamada', horas_reales: 0,
};