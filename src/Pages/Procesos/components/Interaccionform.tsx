import { Check } from 'lucide-react';
import { ConsultorMultiSelect } from '../ConsultorMultiSelect';
import type { Estado } from '../../../Services/estadoService';
import type { Consultor } from '../../../Interfaces/i_consultor';
import { EstadoSelect } from '../Estadoselect';

interface FormState {
  consultores: string[];
  fecha: string;
  estadoId: string;
  obs: string;
  pasos: string;
}

interface Props {
  form: FormState;
  setField: <K extends keyof FormState>(key: K, val: FormState[K]) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  consultores: Consultor[];
  estados: Estado[];
  defaultEstado?: string;
}

export const InteraccionForm = ({
  form, setField, onSave, onCancel, saving, consultores, estados, defaultEstado,
}: Props) => (
  <div className="int-form">
    <p className="int-form__title">Nueva interacción</p>

    <ConsultorMultiSelect
      label="CONSULTORES"
      selected={form.consultores}
      onChange={v => setField('consultores', v)}
      consultores={consultores}
    />

    <div className="wrow">
      <div className="wfield">
        <label className="wfield__label">FECHA <span className="wfield__req">*</span></label>
        <input
          type="date"
          className="wfield__input"
          value={form.fecha}
          onChange={e => setField('fecha', e.target.value)}
        />
      </div>
      {(() => {
        const EstadoComp: any = EstadoSelect;
        return (
          <EstadoComp
            label="ESTADO DEL PROCESO"
            value={form.estadoId || defaultEstado}
            onChange={(id: string) => setField('estadoId', id)}
            estados={estados}
          />
        );
      })()}
    </div>

    <div className="wfield">
      <label className="wfield__label">OBSERVACIONES</label>
      <textarea
        className="wfield__input wfield__textarea"
        rows={3}
        placeholder="Observaciones…"
        value={form.obs}
        onChange={e => setField('obs', e.target.value)}
      />
    </div>

    <div className="wfield">
      <label className="wfield__label">PRÓXIMOS PASOS</label>
      <textarea
        className="wfield__input wfield__textarea"
        rows={2}
        placeholder="¿Qué sigue?…"
        value={form.pasos}
        onChange={e => setField('pasos', e.target.value)}
      />
    </div>

    <div className="int-form__actions">
      <button className="modal__btn modal__btn--ghost modal__btn--sm" onClick={onCancel}>
        Cancelar
      </button>
      <button
        className="modal__btn modal__btn--primary modal__btn--sm"
        onClick={onSave}
        disabled={!form.fecha || saving}
      >
        <Check size={13} />
        {saving ? 'Guardando…' : 'Guardar interacción'}
      </button>
    </div>
  </div>
);