import { connection_to_backend } from "../Connection/connection";
import type {
  ClientePayload,
  ClienteListResponse,
  ClienteResponse,
  UsuarioClientePayload,
  UsuarioClienteResponse,
  UsuarioListResponse,
  SeguimientoPayload,
  SeguimientoResponse,
  SeguimientoListResponse,
  CatalogoResponse,
  Pais,
  Ciudad,
  Rubro,
  EstadoCliente,
} from "../Interfaces/i_cliente";

export const clienteService = {

  // ── Clientes ────────────────────────────────────────────────
  getAll: (params?: {
    search?:   string;
    estado?:   EstadoCliente;
    rubro_id?: number;
    pais_id?:  number;
    page?:     number;
    limit?:    number;
  }) =>
    connection_to_backend
      .get<ClienteListResponse>("/clientes", { params })
      .then(r => r.data),

  getById: (id: string) =>
    connection_to_backend
      .get<ClienteResponse>(`/clientes/${id}`)
      .then(r => r.data.data),

  create: (payload: ClientePayload) =>
    connection_to_backend
      .post<ClienteResponse>("/clientes", payload)
      .then(r => r.data.data),

  update: (id: string, payload: Partial<ClientePayload>) =>
    connection_to_backend
      .put<ClienteResponse>(`/clientes/${id}`, payload)
      .then(r => r.data.data),

  remove: (id: string) =>
    connection_to_backend
      .delete<{ ok: boolean; mensaje: string }>(`/clientes/${id}`)
      .then(r => r.data),

  restaurar: (id: string) =>
    connection_to_backend
      .patch<ClienteResponse>(`/clientes/${id}/restaurar`)
      .then(r => r.data.data),

  getUsuarios: (clienteId: string) =>
    connection_to_backend
      .get<UsuarioListResponse>(`/clientes/${clienteId}/usuarios`)
      .then(r => r.data.data),

  createUsuario: (clienteId: string, payload: UsuarioClientePayload) =>
    connection_to_backend
      .post<UsuarioClienteResponse>(`/clientes/${clienteId}/usuarios`, payload)
      .then(r => r.data.data),

  updateUsuario: (clienteId: string, usuarioId: string, payload: Partial<UsuarioClientePayload>) =>
    connection_to_backend
      .put<UsuarioClienteResponse>(`/clientes/${clienteId}/usuarios/${usuarioId}`, payload)
      .then(r => r.data.data),

  removeUsuario: (clienteId: string, usuarioId: string) =>
    connection_to_backend
      .delete<{ ok: boolean; mensaje: string }>(`/clientes/${clienteId}/usuarios/${usuarioId}`)
      .then(r => r.data),

  // ── Seguimientos ─────────────────────────────────────────────
  getSeguimientos: (
    clienteId: string,
    params?: { estado?: string; medio?: string; tipo?: string; page?: number; limit?: number }
  ) =>
    connection_to_backend
      .get<SeguimientoListResponse>(`/clientes/${clienteId}/seguimientos`, { params })
      .then(r => r.data),

  createSeguimiento: (clienteId: string, payload: SeguimientoPayload) =>
    connection_to_backend
      .post<SeguimientoResponse>(`/clientes/${clienteId}/seguimientos`, payload)
      .then(r => r.data.data),

  updateSeguimiento: (clienteId: string, seguimientoId: string, payload: Partial<SeguimientoPayload>) =>
    connection_to_backend
      .put<SeguimientoResponse>(`/clientes/${clienteId}/seguimientos/${seguimientoId}`, payload)
      .then(r => r.data.data),

  removeSeguimiento: (clienteId: string, seguimientoId: string) =>
    connection_to_backend
      .delete<{ ok: boolean; mensaje: string }>(`/clientes/${clienteId}/seguimientos/${seguimientoId}`)
      .then(r => r.data),

  // ── Catálogos ─────────────────────────────────────────────────
  getPaises: () =>
    connection_to_backend
      .get<CatalogoResponse<Pais>>("/catalogos/paises")
      .then(r => r.data.data),

  getCiudadesByPais: (paisId: number) =>
    connection_to_backend
      .get<CatalogoResponse<Ciudad>>(`/catalogos/paises/${paisId}/ciudades`)
      .then(r => r.data.data),

  getRubros: () =>
    connection_to_backend
      .get<CatalogoResponse<Rubro>>("/catalogos/rubros")
      .then(r => r.data.data),
};