// Interfaces/i_consultor.ts

export type RolConsultor = 'consultor' | 'admin';

export interface Consultor {
  id:        string;
  nombre:    string;
  email:     string;
  telefono:  string | null;
  rol:       RolConsultor;
  fecha_ingreso: string | null;
  activo:    boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConsultorPayload {
  nombre:    string;
  email:     string;
  telefono?: string | null;
  rol:       RolConsultor;
  fecha_ingreso?: string | null;
  activo?:   boolean;
}

// Respuesta paginada — GET /consultores
export interface ConsultorListResponse {
  ok:    boolean;
  total: number;
  page:  number;
  pages: number;
  data:  Consultor[];
}

// Respuesta individual — GET /id · POST · PUT
export interface ConsultorResponse {
  ok:      boolean;
  mensaje: string;
  data:    Consultor;
}