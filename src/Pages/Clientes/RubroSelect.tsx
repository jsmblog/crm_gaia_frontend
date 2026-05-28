import { ChevronDown } from 'lucide-react';
import type { Rubro } from '../../Interfaces/i_cliente';

interface Props {
  rubros:   Rubro[];
  value:    number | null;
  onChange: (v: number | null) => void;
}

export const RubroSelect = ({ rubros, value, onChange }: Props) => {
  const grouped = rubros.reduce<Record<string, Rubro[]>>((acc, r) => {
    const cat = (r as any).categoria ?? 'Otro';
    (acc[cat] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div className="mfield__select-wrap">
      <select
        className="mfield__input mfield__select"
        value={value ?? ''}
        onChange={e => onChange(e.target.value ? +e.target.value : null)}
      >
        <option value="">— Sin rubro —</option>
        {Object.entries(grouped).map(([cat, items]) => (
          <optgroup key={cat} label={cat}>
            {items.map(r => (
              <option key={r.id} value={r.id}>{r.nombre}</option>
            ))}
          </optgroup>
        ))}
      </select>
      <ChevronDown size={13} className="mfield__select-icon" />
    </div>
  );
};