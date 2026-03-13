export interface Cliente {
  id:           string;
  nombre:       string;
  email:        string | null;
  telefono:     string | null;
  empresa:      string;
  tipo_cliente: 'Nuevo' | 'Actual';
  createdAt:    string;
  updatedAt:    string;
}

export type ClientePayload = Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>;