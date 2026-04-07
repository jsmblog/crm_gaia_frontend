// Interfaces/i_herramienta.ts

export interface HerramientaRpa {
  id:          string;
  nombre:      string;
  fabricante:  string | null;
  version:     string | null;
  descripcion: string | null;
  activo:      boolean;
  createdAt:   string;
  updatedAt:   string;
}

export interface HerramientaPayload {
  nombre:       string;
  fabricante?:  string;
  version?:     string;
  descripcion?: string;
  activo?:      boolean;
}

export interface HerramientaListResponse {
  ok:    boolean;
  total: number;
  page:  number;
  pages: number;
  data:  HerramientaRpa[];
}

export interface HerramientaResponse {
  ok:      boolean;
  mensaje: string;
  data:    HerramientaRpa;
}