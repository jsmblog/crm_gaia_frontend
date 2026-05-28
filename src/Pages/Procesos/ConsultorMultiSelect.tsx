import { useState, useEffect, useRef } from 'react';
import { Users, User, X, ChevronDown } from 'lucide-react';
import { useWizardCatalogos } from './WizardContext';

interface Props {
  label?: string;
  selected: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ConsultorMultiSelect = ({
  label,
  selected,
  onChange,
  placeholder = '— Añadir consultor —',
  disabled = false,
}: Props) => {
  const { consultores } = useWizardCatalogos();
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

  const disponibles = consultores.filter(c => !selected.includes(c.id));
  const seleccionados = consultores.filter(c => selected.includes(c.id));

  return (
    <div className="wfield" ref={ref}>
      {label && (
        <label className="wfield__label">
          <Users size={10} style={{ display: 'inline', marginRight: 4 }} />
          {label}
        </label>
      )}

      {seleccionados.length > 0 && (
        <div className="cms__chips">
          {seleccionados.map(c => (
            <span key={c.id} className={`cms__chip ${disabled ? 'cms__chip--disabled' : ''}`}>
              <User size={10} />
              {c.nombre}
              {!disabled && (
                <button type="button" className="cms__chip-remove" onClick={() => toggle(c.id)}>
                  <X size={9} />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      <div
        className={`cms__trigger ${disabled ? 'cms__trigger--disabled' : ''}`}
        onClick={() => { if (!disabled) setOpen(p => !p); }}
      >
        <span className="cms__trigger-text">
          {disponibles.length === 0 && seleccionados.length > 0
            ? 'Todos los consultores asignados'
            : placeholder}
        </span>
        <ChevronDown size={13} className={`cms__chevron ${open ? 'cms__chevron--open' : ''}`} />
      </div>

      {open && !disabled && disponibles.length > 0 && (
        <div className="cms__menu">
          {disponibles.map(c => (
            <div
              key={c.id}
              className="cms__option"
              onMouseDown={() => { toggle(c.id); setOpen(false); }}
            >
              <User size={11} className="cms__option-icon" />
              {c.nombre}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};