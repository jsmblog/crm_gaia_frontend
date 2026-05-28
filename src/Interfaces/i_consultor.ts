export type RolConsultor = 'consultor' | 'admin';

export interface ConsultorListResponse {
  ok:    boolean;
  total: number;
  page:  number;
  pages: number;
  data:  Consultor[];
}

export interface ConsultorResponse {
  ok:      boolean;
  mensaje: string;
  data:    Consultor;
}

export const VISTAS_DISPONIBLES = [
  { key: "reporteria",          label: "Reportería",           grupo: "Vistas"        },
  { key: "funnel",              label: "Funnel Comercial",     grupo: "Vistas"        },
  { key: "facturacion",         label: "Facturación",          grupo: "Vistas"        },
  { key: "proyectos",           label: "Proyectos",            grupo: "Vistas"        },
  { key: "clientes",            label: "Clientes",             grupo: "Registro"      },
  { key: "gestion_proyectos",   label: "Gestión de proyectos", grupo: "Registro"      },
  { key: "soporte",             label: "Soporte",              grupo: "Registro"      },
  { key: "licencias",           label: "Licencias",            grupo: "Registro"      },
  { key: "areas",               label: "Áreas",                grupo: "Datos Maestros"},
  { key: "calendario",          label: "Calendario",           grupo: "Datos Maestros"},
  { key: "gestionar_estados",   label: "Gestionar Estados",    grupo: "Datos Maestros"},
  { key: "herramientas_rpa",    label: "Herramientas RPA",     grupo: "Datos Maestros"},
  { key: "roles",               label: "Roles",                grupo: "Datos Maestros"},
] as const;

export type VistaKey = typeof VISTAS_DISPONIBLES[number]["key"];

export interface Consultor {
  id:            string;
  nombre:        string;
  email:         string;
  telefono?:     string | null;
  rol:           string;
  activo:        boolean;
  fecha_ingreso?: string | null;
  vistas:        VistaKey[];
}

export interface ConsultorPayload {
  nombre:        string;
  email:         string;
  telefono?:     string | null;
  rol:           string;
  activo:        boolean;
  fecha_ingreso?: string | null;
  vistas:        VistaKey[];
}