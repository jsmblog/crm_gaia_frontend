import { connection_to_backend } from '../Connection/connection';

export interface CambiarPasswordPayload {
  passwordActual: string;
  passwordNueva:  string;
}

export interface CambiarPasswordResponse {
  ok:      boolean;
  mensaje: string;
}

export const perfilService = {

  changePass: (payload: CambiarPasswordPayload) =>
    connection_to_backend
      .put<CambiarPasswordResponse>('/password', payload)
      .then(r => r.data),

};