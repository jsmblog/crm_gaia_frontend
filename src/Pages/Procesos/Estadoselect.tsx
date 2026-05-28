import type { Estado } from '../../Services/estadoService';
import { useWizardCatalogos } from './WizardContext';

interface Props {
  label?: string;
  value?: string;
  onChange: (id: string) => void;
  placeholder?: string;
  disabled?: boolean;
  defaultValue?: string;
}

function resolveId(value: string | undefined, estados: Estado[]): string {
  if (!value) return '';
  if (estados.some(e => e.id === value)) return value;
  return estados.find(e => e.nombre === value)?.id ?? '';
}

export const EstadoSelect = ({
  label,
  value,
  onChange,
  placeholder = '— Sin cambio —',
  disabled = false,
  defaultValue,
}: Props) => {
  const { estados } = useWizardCatalogos();

  const resolvedDefault = defaultValue
    ? (estados.find(e => e.nombre === defaultValue)?.id ?? '')
    : '';

  const selectedId = resolveId(value, estados) || resolvedDefault;

  return (
    <div className="wfield">
      {label && <label className="wfield__label">{label}</label>}
      <select
        className="wfield__input"
        value={selectedId}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {estados.map(e => (
          <option key={e.id} value={e.id}>{e.nombre}</option>
        ))}
      </select>
    </div>
  );
};