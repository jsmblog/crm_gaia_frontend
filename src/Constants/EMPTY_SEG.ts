import type { SeguimientoPayload } from "../Interfaces/i_cliente";

export const EMPTY_SEG: SeguimientoPayload = {
  consultor_id:         '',
  contactos_ids:        [],
  fecha:                new Date().toISOString().slice(0, 10),
  fecha_proxima_accion: null,
  medio:                'telefono',
  tipo:                 'llamada',
  descripcion:          '',
  resultado:            null,
  estado:               'programado',
};