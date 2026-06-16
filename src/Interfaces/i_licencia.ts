export type EstadoLicencia = 'Activada' | 'Desactivada';
export type Renovacion = 'mensual' | 'anual' | '2 años' | '3 años';

export interface Licencia {
  id: string;
  cliente_id: string;
  cliente?: { id: string; empresa: string };
  estado: EstadoLicencia;
  fecha_inicio?: string;
  renovacion?: Renovacion;
  herramienta_id?: string;  
  herramienta?: { id: string; nombre: string };
  valor_anual?: number;
  ip_maquina?: string;
  procesos?: { id: string; nombre_proceso: string }[];
  fecha_estado?: string;
  motivo_desactivacion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LicenciaPayload {
  cliente_id: string;
  estado: EstadoLicencia;
  fecha_inicio?: string;
  renovacion?: Renovacion;
  plataforma?: string;
  herramienta_id?: string;
  valor_anual?: number;
  ip_maquina?: string;
  procesos_ids?: string[];
  fecha_estado?: string;
  motivo_desactivacion?: string;
}

export interface LicenciaListResponse {
  ok: boolean;
  total: number;
  page: number;
  pages: number;
  data: Licencia[];
}

export interface LicenciaResponse {
  ok: boolean;
  mensaje: string;
  data: Licencia;
}
export interface LicenciaModalProps {
  initial?: Licencia | null;
  onClose: () => void;
  onSaved: () => void;
}