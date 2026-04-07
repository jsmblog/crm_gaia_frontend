// Services/proyectoService.ts

import { connection_to_backend } from "../Connection/connection";
import type {
  Proyecto,
  ProyectoPayload,
  ProyectoUpdatePayload,
  ProyectoListResponse,
  ProyectoResponse,
  MiembroPayload,
  AsignarHerramientaPayload,
  EstadoHerramienta,
  EstadoProyectoPayload,
  EstadoProyectoEntry,
  EstadoProyectoEnum,
} from "../Interfaces/i_proyecto";

export const proyectoService = {

  // ── Proyectos ─────────────────────────────────────────────

  getAll: (params?: { clienteId?: string; activo?: boolean; search?: string; page?: number; limit?: number }) =>
    connection_to_backend
      .get<ProyectoListResponse>("/proyectos", { params })
      .then(r => r.data),                       // { ok, total, page, pages, data[] }

  getById: (id: string) =>
    connection_to_backend
      .get<ProyectoResponse>(`/proyectos/${id}`)
      .then(r => r.data.data),

  create: (payload: ProyectoPayload) =>
    connection_to_backend
      .post<ProyectoResponse>("/proyectos", payload)
      .then(r => r.data.data),

  update: (id: string, payload: ProyectoUpdatePayload) =>
    connection_to_backend
      .put<ProyectoResponse>(`/proyectos/${id}`, payload)
      .then(r => r.data.data),

  /** Soft delete — activo = false */
  remove: (id: string) =>
    connection_to_backend
      .delete<{ ok: boolean; mensaje: string }>(`/proyectos/${id}`)
      .then(r => r.data),

  // ── Áreas ─────────────────────────────────────────────────

  agregarAreas: (id: string, areas: string[]) =>
    connection_to_backend
      .post<ProyectoResponse>(`/proyectos/${id}/areas`, { areas })
      .then(r => r.data.data),

  quitarArea: (id: string, areaId: string) =>
    connection_to_backend
      .delete<{ ok: boolean; mensaje: string }>(`/proyectos/${id}/areas/${areaId}`)
      .then(r => r.data),

  // ── Miembros ──────────────────────────────────────────────

  agregarMiembro: (id: string, payload: MiembroPayload) =>
    connection_to_backend
      .post<{ ok: boolean; mensaje: string; data: any }>(`/proyectos/${id}/miembros`, payload)
      .then(r => r.data),

  quitarMiembro: (id: string, usuarioClienteId: string) =>
    connection_to_backend
      .delete<{ ok: boolean; mensaje: string }>(`/proyectos/${id}/miembros/${usuarioClienteId}`)
      .then(r => r.data),

  // ── Herramientas ──────────────────────────────────────────

  asignarHerramienta: (id: string, payload: AsignarHerramientaPayload) =>
    connection_to_backend
      .post<{ ok: boolean; mensaje: string; data: any }>(`/proyectos/${id}/herramientas`, payload)
      .then(r => r.data),

  cambiarEstadoHerramienta: (id: string, asignacionId: string, estado: EstadoHerramienta, motivo_cambio?: string) =>
    connection_to_backend
      .patch<{ ok: boolean; mensaje: string; data: any }>(`/proyectos/${id}/herramientas/${asignacionId}/estado`, { estado, motivo_cambio })
      .then(r => r.data),

  // ── Línea de tiempo de estados ────────────────────────────

  getEstados: (id: string) =>
    connection_to_backend
      .get<{ ok: boolean; data: EstadoProyectoEntry[]; estado_actual: EstadoProyectoEnum }>(`/proyectos/${id}/estados`)
      .then(r => r.data),

  registrarEstado: (id: string, payload: EstadoProyectoPayload) =>
    connection_to_backend
      .post<{ ok: boolean; mensaje: string; data: EstadoProyectoEntry; estado_actual: EstadoProyectoEnum }>(
        `/proyectos/${id}/estados`, payload
      )
      .then(r => r.data),

  eliminarUltimoEstado: (id: string, estadoId: string) =>
    connection_to_backend
      .delete<{ ok: boolean; mensaje: string; estado_actual: EstadoProyectoEnum }>(`/proyectos/${id}/estados/${estadoId}`)
      .then(r => r.data),

};