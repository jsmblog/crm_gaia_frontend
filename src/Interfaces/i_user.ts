export interface User {
  id: string | number;
  email: string;
  rol: string;
  [key: string]: unknown;
}