import { Check, Loader, Lock } from 'lucide-react';
import type { WizardPayload } from '../../Interfaces/i_procesos';
import { TODAY, type Setter, type Opt } from '../../Constants/procesos';
import { ConsultorMultiSelect } from './ConsultorMultiSelect';

interface Props {
  d: Partial<WizardPayload>;
  set: Setter;
  consultores: Opt[];
  onSave: () => Promise<void>;
  saving: boolean;
  saved: boolean;
  locked: boolean;
}

export const Step2 = ({ d, set, consultores, onSave, saving, saved, locked }: Props) => {
  if (locked) {
    return (
      <div className="step-body step-locked">
        <Lock size={32} strokeWidth={1.2} />
        <p>Primero completa y guarda la información del <strong>Lead</strong> en el paso 1.</p>
      </div>
    );
  }

  return (
    <div className="step-body">
      <p className="step-section-title">LEVANTAMIENTO</p>

      <ConsultorMultiSelect
        label="CONSULTORES ASIGNADOS"
        selected={d.lev_consultores_ids ?? []}
        onChange={ids => set('lev_consultores_ids', ids)}
        consultores={consultores}
      />

      <div className="wrow">
        <div className="wfield">
          <label className="wfield__label">FECHA</label>
          <input type="date" className="wfield__input" min={TODAY}
            value={d.lev_fecha ?? TODAY} onChange={e => set('lev_fecha', e.target.value)} />
        </div>
      </div>

      <div className="wfield">
        <label className="wfield__label">OBSERVACIONES</label>
        <textarea className="wfield__input wfield__textarea" placeholder="Notas del levantamiento…"
          value={d.lev_observaciones ?? ''} onChange={e => set('lev_observaciones', e.target.value)} />
      </div>

      <div className="step-divider" />
      <p className="step-section-title">ESTIMACIÓN</p>

      <ConsultorMultiSelect
        label="CONSULTORES ASIGNADOS"
        selected={d.est_consultores_ids ?? []}
        onChange={ids => set('est_consultores_ids', ids)}
        consultores={consultores}
      />

      <div className="wrow">
        <div className="wfield">
          <label className="wfield__label">FECHA</label>
          <input type="date" className="wfield__input" min={TODAY}
            value={d.est_fecha ?? TODAY} onChange={e => set('est_fecha', e.target.value)} />
        </div>
      </div>

      <div className="wfield">
        <label className="wfield__label">OBSERVACIONES</label>
        <textarea className="wfield__input wfield__textarea" placeholder="Notas de la estimación…"
          value={d.est_observaciones ?? ''} onChange={e => set('est_observaciones', e.target.value)} />
      </div>

      <div className="step-save-row">
        <button className="step-save-btn" onClick={onSave} disabled={saving}>
          {saving
            ? <><Loader size={14} className="spin" /> Guardando…</>
            : <><Check size={14} /> {saved ? 'Actualizar etapa' : 'Guardar Levantamiento y Estimación'}</>
          }
        </button>
        {saved && <span className="step-save-hint">✓ Etapa guardada</span>}
      </div>
    </div>
  );
};
