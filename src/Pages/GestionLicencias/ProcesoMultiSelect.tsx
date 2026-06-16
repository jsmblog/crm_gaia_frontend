import { useEffect, useRef, useState } from "react";
import type {ProcesoMultiSelectProps } from "../../Interfaces/i_procesos";
import { ChevronDown, Tag, X } from "lucide-react";

export const ProcesoMultiSelect = ({
  label,
  selected,
  onChange,
  procesos,
  placeholder = '— Seleccionar procesos —',
  disabled = false,
}: ProcesoMultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (id: string) => {
    if (disabled) return;
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);
  };

  const disponibles = procesos.filter(p => !selected.includes(p.id));
  const seleccionados = procesos.filter(p => selected.includes(p.id));

  return (
    <div className="gl-multiselect" ref={ref}>
      {label && <label className="gl-field__label">{label}</label>}
      {seleccionados.length > 0 && (
        <div className="gl-chips">
          {seleccionados.map(p => (
            <span key={p.id} className={`gl-chip ${disabled ? 'gl-chip--disabled' : ''}`}>
              <Tag size={9} />
              {p.nombre_proceso}
              {!disabled && (
                <button type="button" className="gl-chip__remove" onClick={() => toggle(p.id)}>
                  <X size={9} />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
      <div
        className={`gl-multiselect__trigger ${disabled ? 'gl-multiselect__trigger--disabled' : ''}`}
        onClick={() => { if (!disabled) setOpen(p => !p); }}
      >
        <span className="gl-multiselect__placeholder">{placeholder}</span>
        <ChevronDown size={13} className={`gl-multiselect__chevron ${open ? 'open' : ''}`} />
      </div>
      {open && !disabled && disponibles.length > 0 && (
        <div className="gl-multiselect__menu">
          {disponibles.map(p => (
            <div
              key={p.id}
              className="gl-multiselect__option"
              onMouseDown={() => { toggle(p.id); setOpen(false); }}
            >
              <Tag size={11} />
              {p.nombre_proceso}
            </div>
          ))}
        </div>
      )}
      {open && !disabled && disponibles.length === 0 && (
        <div className="gl-multiselect__menu">
          <div className="gl-multiselect__empty">Todos los procesos asignados</div>
        </div>
      )}
    </div>
  );
};