export interface Rol {
  id:          string;
  nombre:      string;
  descripcion: string | null;
  activo:      boolean;
  createdAt:   string;
  updatedAt:   string;
}

export interface RolPayload {
  nombre:       string;
  descripcion?: string;
  activo?:      boolean;
}

export interface RolListResponse {
  ok:    boolean;
  total: number;
  page:  number;
  pages: number;
  data:  Rol[];
}

export interface RolResponse {
  ok:      boolean;
  mensaje: string;
  data:    Rol;
}