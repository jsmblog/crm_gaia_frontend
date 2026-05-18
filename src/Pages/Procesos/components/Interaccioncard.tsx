import { X } from 'lucide-react';
import type { Interaccion } from '../../../Interfaces/i_procesos';

interface Props {
  interaccion: Interaccion;
  index: number;
  onDelete: (id: string) => void;
}

export const InteraccionCard = ({ interaccion: i, index, onDelete }: Props) => (
  <div className="int-card">
    <div className="int-card__head">
      <span className="int-card__num">Interacción #{index + 1}</span>
      {i.estadoObj && <span className="int-card__estado">{i.estadoObj.nombre}</span>}
      <button className="chip__remove" onClick={() => onDelete(i.id)}>
        <X size={11} />
      </button>
    </div>

    {(i.consultores ?? []).length > 0 && (
      <p className="int-card__row">{i.consultores.map(c => c.nombre).join(', ')}</p>
    )}

    <p className="int-card__row int-card__fecha">
      {new Date(i.fecha).toLocaleDateString('es-EC', {
        day: '2-digit', month: 'short', year: 'numeric',
      })}
    </p>

    {i.observaciones  && <p className="int-card__row">{i.observaciones}</p>}
    {i.proximos_pasos && <p className="int-card__row int-card__pasos">→ {i.proximos_pasos}</p>}
  </div>
);