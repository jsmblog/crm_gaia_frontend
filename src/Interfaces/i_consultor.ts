export interface Consultor {
  id:         string;
  nombre:     string;
  email:      string;
  telefono:   string | null;
  rol:        'consultor' | 'admin';
  activo:     boolean;
  
  createdAt:  string;
  updatedAt:  string;
}

export type ConsultorPayload = Omit<Consultor, 'id' | 'createdAt' | 'updatedAt'>;