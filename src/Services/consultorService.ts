import { connection_to_backend } from "../Connection/connection";
import type { Consultor, ConsultorPayload } from "../Interfaces/i_consultor";

export const consultorService = {
  getAll:  ()                                               =>
    connection_to_backend.get<Consultor[]>('/consultores').then(r => r.data),

  getById: (id: string)                                     =>
    connection_to_backend.get<Consultor>(`/consultores/${id}`).then(r => r.data),

  create:  (payload: ConsultorPayload)                      =>
    connection_to_backend.post<Consultor>('/consultores', payload).then(r => r.data),

  update:  (id: string, payload: Partial<ConsultorPayload>) =>
    connection_to_backend.put<Consultor>(`/consultores/${id}`, payload).then(r => r.data),

  remove:  (id: string)                                     =>
    connection_to_backend.delete(`/consultores/${id}`).then(r => r.data),
};