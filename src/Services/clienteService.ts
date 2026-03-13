import { connection_to_backend } from "../Connection/connection";
import type { Cliente, ClientePayload } from "../Interfaces/i_cliente";

export const clienteService = {
  getAll:  ()                                        =>
    connection_to_backend.get<Cliente[]>('/clientes').then(r => r.data),

  getById: (id: string)                              =>
    connection_to_backend.get<Cliente>(`/clientes/${id}`).then(r => r.data),

  create:  (payload: ClientePayload)                 =>
    connection_to_backend.post<Cliente>('/clientes', payload).then(r => r.data),

  update:  (id: string, payload: Partial<ClientePayload>) =>
    connection_to_backend.put<Cliente>(`/clientes/${id}`, payload).then(r => r.data),

  remove:  (id: string)                              =>
    connection_to_backend.delete(`/clientes/${id}`).then(r => r.data),
};