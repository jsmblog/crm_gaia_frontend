import { Check, Loader, Lock } from 'lucide-react';
import type { WizardPayload, EstatusProceso, TipoInteraccion } from '../../Interfaces/i_procesos';
import { TODAY, ESTATUS_LIST, TIPOS_INTERACCION, type Setter, type Opt } from '../../Constants/procesos';
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

export const Step5 = ({ d, set, consultores, onSave, saving, saved, locked }: Props) => {
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
      <p className="step-section-title">EJECUCIÓN</p>

      <div className="wrow">
        <div className="wfield">
          <label className="wfield__label">CONSULTOR RESPONSABLE</label>
          <select className="wfield__input" value={d.ejec_consultor_responsable_id ?? ''}
            onChange={e => set('ejec_consultor_responsable_id', e.target.value)}>
            <option value="">— Sin asignar —</option>
            {consultores.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
        <div className="wfield">
          <label className="wfield__label">FECHA INICIO</label>
          <input type="date" className="wfield__input"
            value={d.ejec_fecha_inicio ?? ''} onChange={e => set('ejec_fecha_inicio', e.target.value)} />
        </div>
      </div>

      <ConsultorMultiSelect
        label="EQUIPO ADICIONAL"
        selected={d.ejec_consultores_ids ?? []}
        onChange={ids => set('ejec_consultores_ids', ids)}
        consultores={consultores}
        placeholder="— Añadir consultor al equipo —"
      />

      <div className="wrow">
        <div className="wfield">
          <label className="wfield__label">FECHA CIERRE</label>
          <input type="date" className="wfield__input"
            min={d.ejec_fecha_inicio || TODAY}
            value={d.ejec_fecha_fin ?? ''} onChange={e => set('ejec_fecha_fin', e.target.value)} />
        </div>
        <div className="wfield">
          <label className="wfield__label">HORAS REALES</label>
          <input type="number" min="0" className="wfield__input" placeholder="0"
            value={d.ejec_horas_reales ?? ''} onChange={e => set('ejec_horas_reales', Number(e.target.value))} />
        </div>
      </div>

      <div className="wfield">
        <label className="wfield__label">OBSERVACIONES</label>
        <textarea className="wfield__input wfield__textarea" placeholder="Notas de la ejecución…"
          value={d.ejec_observaciones ?? ''} onChange={e => set('ejec_observaciones', e.target.value)} />
      </div>

      <div className="step-divider" />
      <p className="step-section-title">ESTATUS FINAL</p>

      <div className="wfield">
        <label className="wfield__label">ESTATUS ACTUAL <span className="wfield__req">*</span></label>
        <select className="wfield__input" value={d.estatus ?? 'Lead'}
          onChange={e => set('estatus', e.target.value as EstatusProceso)}>
          {ESTATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="step-divider" />
      <p className="step-section-title">INTERACCIÓN <span className="step-optional">(opcional)</span></p>

      <div className="wrow">
        <div className="wfield">
          <label className="wfield__label">TIPO</label>
          <select className="wfield__input" value={d.int_tipo ?? ''} onChange={e => set('int_tipo', e.target.value)}>
            <option value="">— Omitir —</option>
            {TIPOS_INTERACCION.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="wfield">
          <label className="wfield__label">CONSULTOR</label>
          <select className="wfield__input" value={d.int_consultor_id ?? ''} onChange={e => set('int_consultor_id', e.target.value)}>
            <option value="">— Sin asignar —</option>
            {consultores.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
        <div className="wfield">
          <label className="wfield__label">FECHA</label>
          <input type="date" className="wfield__input"
            value={d.int_fecha ?? TODAY} onChange={e => set('int_fecha', e.target.value)} />
        </div>
      </div>

      <div className="wfield">
        <label className="wfield__label">DESCRIPCIÓN</label>
        <textarea className="wfield__input wfield__textarea" placeholder="Notas de la interacción…"
          value={d.int_descripcion ?? ''} onChange={e => set('int_descripcion', e.target.value)} />
      </div>

      <div className="step-save-row">
        <button className="step-save-btn step-save-btn--finish" onClick={onSave} disabled={saving}>
          {saving
            ? <><Loader size={14} className="spin" /> Guardando…</>
            : <><Check size={14} /> {saved ? 'Actualizar ejecución' : 'Guardar Ejecución y finalizar'}</>
          }
        </button>
        {saved && <span className="step-save-hint">✓ Todo guardado</span>}
      </div>
    </div>
  );
};
