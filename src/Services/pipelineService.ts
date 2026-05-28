import { connection_to_backend } from "../Connection/connection";

export interface ClienteSummary {
  id:             string;
  empresa:        string;
  nombre:         string;
  email:          string;
  activo:         boolean;
  proyecto_count: number;
  proceso_count:  number;
}

export interface ProyectoSummary {
  id:            string;
  nombre:        string;
  descripcion:   string | null;
  activo:        boolean;
  proceso_count: number;
}

export interface ProcesoLite {
  id:                 string;
  nombre_proceso:     string;
  tipo:               string | null;
  prioridad:          string | null;
  accion_responsable: string | null;
  estadoObj:          { id: string; nombre: string } | null;
  propuesta: {
    valor_presupuestado:  number | null;
    horas_presupuestadas: number | null;
    valor_gerencia:      number | null;
  } | null;
  herramientas: { id: string; nombre: string }[];
  cierre : {
    horas_reales: number | null;
    fecha_cierre: string | null;
  } | null;
}

export const pipelineService = {
  getClientes: () =>
    connection_to_backend
      .get<{ ok: boolean; data: ClienteSummary[] }>("/pipeline/clientes")
      .then((r) => r.data.data),

  getProyectos: (clienteId: string) =>
    connection_to_backend
      .get<{ ok: boolean; data: ProyectoSummary[] }>(
        `/pipeline/clientes/${clienteId}/proyectos`
      )
      .then((r) => r.data.data),

  getProcesos: (proyectoId: string) =>
    connection_to_backend
      .get<{ ok: boolean; data: ProcesoLite[] }>(
        `/pipeline/proyectos/${proyectoId}/procesos`
      )
      .then((r) => r.data.data),
};