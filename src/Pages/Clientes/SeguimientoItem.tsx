import { useState } from "react";
import type { ContextoSeguimientoIA, SeguimientoCliente } from "../../Interfaces/i_cliente";
import { AlertCircle, Brain, CheckCircle2, ChevronDown, Clock, MessageCircle, Pencil, Trash2, TrendingUp, UserCheck, Users, Video } from "lucide-react";
import { MEDIOS, TIPOS } from "../../Constants/i_clientes";
import { RELACION_CFG } from "./Clientes";

// ── SeguimientoItem ────────────────────────────────────────────
interface SeguimientoItemProps {
  s: SeguimientoCliente;
  onEdit: (s: SeguimientoCliente) => void;
  onDelete: (s: SeguimientoCliente) => void;
}
const parseContextoIA = (raw: string | null): ContextoSeguimientoIA | null => {
  if (!raw) return null;
  try { return JSON.parse(raw); }
  catch { return null; }
};
const ESTADO_SEG_CLS: Record<string, string> = {
  programado: 'seg-estado--programado',
  completado:  'seg-estado--completado',
  cancelado:   'seg-estado--cancelado',
};
const fmtDate = (iso?: string | null) => iso
  ? new Date(iso).toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' })
  : '—';
  const ContextoIACard = ({ ctx }: { ctx: ContextoSeguimientoIA }) => {
    const rel = RELACION_CFG[ctx.estado_relacion] ?? { label: ctx.estado_relacion, cls: '', icon: null };
  
    return (
      <div className="ctx-card">
        <div className="ctx-card__head">
          <span className="ctx-card__label"><Brain size={11} /> Análisis IA</span>
          <span className={`ctx-relacion ${rel.cls}`}>{rel.icon} {rel.label}</span>
        </div>
  
        <p className="ctx-card__contexto">{ctx.contexto}</p>
  
        {ctx.compromisos_pendientes.length > 0 && (
          <div className="ctx-section">
            <p className="ctx-section__title"><CheckCircle2 size={10} /> Compromisos pendientes</p>
            <ul className="ctx-list">
              {ctx.compromisos_pendientes.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>
        )}
  
        {ctx.temas_recurrentes.length > 0 && (
          <div className="ctx-section">
            <p className="ctx-section__title"><TrendingUp size={10} /> Temas recurrentes</p>
            <div className="ctx-tags">
              {ctx.temas_recurrentes.map((t, i) => <span key={i} className="ctx-tag-pill">{t}</span>)}
            </div>
          </div>
        )}
  
        {ctx.proxima_accion_sugerida && (
          <div className="ctx-proxima">
            <p className="ctx-section__title"><AlertCircle size={10} /> Próxima acción sugerida</p>
            <p className="ctx-proxima__text">{ctx.proxima_accion_sugerida}</p>
          </div>
        )}
      </div>
    );
  };
export const SeguimientoItem = ({ s, onEdit, onDelete }: SeguimientoItemProps) => {
  const [showIA, setShowIA] = useState(false);
  const ctxIA = parseContextoIA(s.contexto_seguimiento);

  return (
    <li className="ulist__item seg-item">
      <div className="seg-item__left">
        <span className={`seg-estado ${ESTADO_SEG_CLS[s.estado] ?? ''}`}>
          {s.estado} - {fmtDate(s.fecha)}
        </span>
      </div>

      <div className="ulist__data seg-item__data">
        <div className="seg-item__tags">
          <span className="seg-tag"><Video size={9} /> {MEDIOS.find(m => m.value === s.medio)?.label}</span>
          <span className="seg-tag"><MessageCircle size={9} /> {TIPOS.find(t => t.value === s.tipo)?.label}</span>
        </div>

        <p className="seg-descripcion">{s.descripcion}</p>
        {s.resultado && <p className="seg-resultado">↳ {s.resultado}</p>}

        <div className="seg-meta-row">
          {s.consultor && (
            <span className="ulist__meta"><UserCheck size={10} /> {s.consultor.nombre}</span>
          )}
          {s.contacto_cliente && (
            <span className="ulist__meta"><Users size={10} /> {s.contacto_cliente.nombre}</span>
          )}
          {s.fecha_proxima_accion && (
            <span className="ulist__meta seg-proxima">
              <Clock size={10} /> Próxima: {fmtDate(s.fecha_proxima_accion)}
            </span>
          )}
        </div>

        {ctxIA ? (
          <>
            <button
              className="btn-ver-analisis"
              onClick={() => setShowIA(v => !v)}
            >
              {showIA ? 'Ocultar análisis' : 'Ver análisis'}
              <ChevronDown size={11} className={showIA ? 'chevron--open' : ''} />
            </button>
            {showIA && <ContextoIACard ctx={ctxIA} />}
          </>
        ) : s.contexto_seguimiento === null && (
          <p className="ctx-generando"><Brain size={10} /> Generando análisis IA…</p>
        )}
      </div>

      <div className="ulist__actions">
        <button className="action-btn action-btn--edit" onClick={() => onEdit(s)}><Pencil size={12} /></button>
        <button className="action-btn action-btn--del" onClick={() => onDelete(s)}><Trash2 size={12} /></button>
      </div>
    </li>
  );
};