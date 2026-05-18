import type { SoportePayload } from "../Interfaces/i_soporte";

export const EMPTY_SOPORTE: SoportePayload = {
  cliente_id: '',
  estado: 'En Aprobación',
  propuesta: '',
  horas: 0,
  tarifa: 0,
  valor_paquete: 0,
  fecha_inicio: '',
  fecha_fin: '',
  horario: '09:00 - 18:00',
  dias: [],
  observacion: '',
  responsable_cliente_id: '',
  fecha_aprobacion: '',
  fecha_rechazo: '',
  motivo_rechazo: '',
  fecha_inicio_soporte: '',
};
