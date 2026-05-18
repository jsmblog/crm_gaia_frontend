export interface Area {
  id:          string;
  nombre:      string;
  descripcion: string | null;
  activo:      boolean;
  createdAt:   string;
  updatedAt:   string;
}

export interface AreaPayload {
  nombre:       string;
  descripcion?: string;
  activo?:      boolean;
}

export interface AreaListResponse {
  ok:    boolean;
  total: number;
  page:  number;
  pages: number;
  data:  Area[];
}

export interface AreaResponse {
  ok:      boolean;
  mensaje: string;
  data:    Area;
}