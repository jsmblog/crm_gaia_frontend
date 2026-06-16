import type { LicenciaPayload } from "../Interfaces/i_licencia";

export const EMPTY_LICENCIA: LicenciaPayload = {
  cliente_id: '',
  estado: 'Activada',
  fecha_inicio: '',
  renovacion: undefined,
  herramienta_id: undefined,
  valor_anual: undefined,
  ip_maquina: '',
  procesos_ids: [],
  fecha_estado: '',
  motivo_desactivacion: '',
};