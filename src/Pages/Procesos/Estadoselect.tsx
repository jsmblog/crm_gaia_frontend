import type { Estado } from '../../Services/estadoService';
import { useWizardCatalogos } from './WizardContext';

interface Props {
  label?: string;
  value?: string;
  onChange: (id: string) => void;
  placeholder?: string;
  disabled?: boolean;
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
}: Props) => {
  const { estados } = useWizardCatalogos();
  const selectedId = resolveId(value, estados);

  return (
    <div className="wfield">
      {label && <label className="wfield__label">{label}</label>}
      <select
        className="wfield__input"
        value={selectedId}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {estados.map(est => (
          <option key={est.id} value={est.id}>
            {est.nombre}
          </option>
        ))}
      </select>
    </div>
  );
};