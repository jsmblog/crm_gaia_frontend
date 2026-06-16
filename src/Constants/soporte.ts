export const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const parseHorario = (horario?: string) => {
  const match = horario?.match(/^(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/);
  return { inicio: match?.[1] ?? '09:00', fin: match?.[2] ?? '18:00' };
};
export const buildHorario = (inicio: string, fin: string) =>
  inicio && fin ? `${inicio} - ${fin}` : '';
