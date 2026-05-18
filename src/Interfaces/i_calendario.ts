export interface CalEvent {
  id:           string;
  summary:      string;
  description?: string;
  start:        { dateTime?: string; date?: string };
  end:          { dateTime?: string; date?: string };
  colorId?:     string;
  htmlLink?:    string;
}

export interface CreateEventPayload {
  userId:       string;
  titulo:       string;
  descripcion?: string;
  fechaInicio:  string;
  fechaFin:     string;
  color?:       string;
}

export interface CalendarStatusResponse {
  ok:     boolean;
  linked: boolean;
}