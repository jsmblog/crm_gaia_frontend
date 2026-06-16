import type { VistaKey } from "../Interfaces/i_consultor";

export   const parseVistas = (v: any): VistaKey[] => {
    if (!v) return [];
  if (Array.isArray(v)) return v;
  try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; }
  catch { return []; }
};