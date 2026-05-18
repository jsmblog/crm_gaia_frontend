import { Plus } from 'lucide-react';
import type { useInteracciones } from '../../../Hooks/Useinteracciones';
import { InteraccionCard } from './Interaccioncard';
import { InteraccionForm } from './Interaccionform';
import { useWizardCatalogos } from '../WizardContext';

type Hook = ReturnType<typeof useInteracciones>;

interface Props extends Pick<Hook,
  'interacciones' | 'showForm' | 'setShowForm' | 'form' | 'setField' | 'saving' | 'add' | 'remove' | 'resetForm'
> {
  consultores: any[];
  defaultEstado?: string;
}

export const InteraccionesSection = ({
  interacciones,
  showForm, setShowForm,
  form, setField,
  saving, add, remove, resetForm,
  consultores, defaultEstado,
}: Props) => {
  const { estados } = useWizardCatalogos();
  return (
  <div className="wfield">
    <div className="int-section-head">
      <label className="wfield__label">INTERACCIONES ({interacciones.length})</label>
      {!showForm && (
        <button className="btn-add-int" onClick={() => setShowForm(true)}>
          <Plus size={12} /> Nueva interacción
        </button>
      )}
    </div>

    {interacciones.length === 0 && !showForm && (
      <p className="wfield__hint">Sin interacciones aún.</p>
    )}

    {interacciones.map((i, idx) => (
      <InteraccionCard key={i.id} interaccion={i} index={idx} onDelete={remove} />
    ))}

    {showForm && (
      <InteraccionForm
        form={form}
        setField={setField}
        onSave={add}
        onCancel={resetForm}
        saving={saving}
        consultores={consultores}
        estados={estados}
        defaultEstado={defaultEstado}
      />
    )}
  </div>
);
}