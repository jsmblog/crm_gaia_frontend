import { Check } from "lucide-react";
import { VISTAS_DISPONIBLES, type VistaKey } from "../../Interfaces/i_consultor";

interface VistaSelectorProps {
  selected: VistaKey[];
  onChange: (vistas: VistaKey[]) => void;
}

const grupos = Array.from(new Set(VISTAS_DISPONIBLES.map(v => v.grupo)));

export const VistaSelector = ({ selected, onChange }: VistaSelectorProps) => {
  const toggle = (key: VistaKey) =>
    onChange(selected.includes(key) ? selected.filter(k => k !== key) : [...selected, key]);

  const toggleGrupo = (grupo: string) => {
    const keys = VISTAS_DISPONIBLES.filter(v => v.grupo === grupo).map(v => v.key) as VistaKey[];
    const allOn = keys.every(k => selected.includes(k));
    if (allOn) onChange(selected.filter(k => !keys.includes(k)));
    else       onChange(Array.from(new Set([...selected, ...keys])));
  };

  return (
    <div className="vs__wrap">
      {grupos.map(grupo => {
        const items  = VISTAS_DISPONIBLES.filter(v => v.grupo === grupo);
        const allOn  = items.every(v => selected.includes(v.key as VistaKey));
        const someOn = items.some(v => selected.includes(v.key as VistaKey));
        return (
          <div key={grupo} className="vs__grupo">
            <div className="vs__grupo-head">
              <span className="vs__grupo-label">{grupo}</span>
              <button
                type="button"
                className={`vs__grupo-toggle ${allOn ? 'vs__grupo-toggle--on' : someOn ? 'vs__grupo-toggle--partial' : ''}`}
                onClick={() => toggleGrupo(grupo)}
              >
                {allOn ? 'Desmarcar todo' : 'Marcar todo'}
              </button>
            </div>
            <div className="vs__items">
              {items.map(v => {
                const on = selected.includes(v.key as VistaKey);
                return (
                  <button
                    key={v.key}
                    type="button"
                    className={`vs__pill ${on ? 'vs__pill--on' : ''}`}
                    onClick={() => toggle(v.key as VistaKey)}
                  >
                    <span className="vs__dot" />
                    {v.label}
                    {on && <Check size={10} className="vs__check" />}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};