
export interface User {
  id:         string;
  nombre:     string;
  email:      string;
  rol:        string;
  verificado: boolean;
  activo:     boolean;
  vistas:     string[];   
  tokens: number;
  renovacion_tokens: Date | null;
}