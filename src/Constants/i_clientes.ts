import type { EstadoCliente, MedioSeguimiento, TipoSeguimiento } from "../Interfaces/i_cliente";

export const ESTADO_CFG: Record<EstadoCliente, { label: string; cls: string }> = {
  Lead: { label: "Lead", cls: "estado--lead" },
  Contactado: { label: "Contactado", cls: "estado--prospecto" },
  Activo: { label: "Activo", cls: "estado--activo" },
  Inactivo: { label: "Inactivo", cls: "estado--inactivo" },
};

export const MEDIOS: { value: MedioSeguimiento; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'telefono', label: 'Teléfono' },
  { value: 'videollamada', label: 'Videollamada' },
  { value: 'presencial', label: 'Presencial' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'otro', label: 'Otro' },
];

export const TIPOS: { value: TipoSeguimiento; label: string }[] = [
  { value: 'llamada', label: 'Llamada' },
  { value: 'reunion', label: 'Reunión' },
  { value: 'negociacion', label: 'Negociación' },
  { value: 'contacto',     label: 'Contacto' },
  { value: 'demo', label: 'Demo' },
  { value: 'propuesta', label: 'Propuesta' },
  { value: 'seguimiento', label: 'Seguimiento' },
  { value: 'otro', label: 'Otro' },
];
