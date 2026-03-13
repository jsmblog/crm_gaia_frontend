import { connection_to_backend } from '../Connection/connection';
import type { LoginPayload, LoginResponse } from '../Interfaces/i_authService';

export const loginService = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await connection_to_backend.post<LoginResponse>('/login', payload);
  return data;
};