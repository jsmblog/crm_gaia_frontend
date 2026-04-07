import { useMemo } from 'react';
import { Check, Loader, Lock, DollarSign, AlertCircle } from 'lucide-react';
import type { WizardPayload } from '../../Interfaces/i_procesos';
import { TODAY, NIVEL_DETALLE, type Setter, type Opt } from '../../Constants/procesos';
import { ConsultorMultiSelect } from './ConsultorMultiSelect';

interface Props {
  d: Partial<WizardPayload>;
  set: Setter;
  consultores: Opt[];
  proyectos: any[];
  onSave: () => Promise<void>;
  saving: boolean;
  saved: boolean;
  locked: boolean;
}

export const Step3 = ({ d, set, consultores, proyectos, onSave, saving, saved, locked }: Props) => {
  const proyectoActual = useMemo(() =>
    proyectos.find(p => p.id === d.proyecto_id), [d.proyecto_id, proyectos]);

  const tarifaAplicable = useMemo(() => {
    const cliente = proyectoActual?.cliente;
    if (!cliente) return 0;
    if (d.tipo === 'Proyecto Nuevo') return Number(cliente.precio_hora_desarrollo) || 0;
    if (d.tipo === 'Solicitud de Cambio') return Number(cliente.precio_hora_cambio) || 0;
    return Number(cliente.precio_hora_soporte) || 0;
  }, [proyectoActual, d.tipo]);

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    set('prop_valor', val);
    if (tarifaAplicable > 0 && val > 0) set('prop_horas', Math.round(val / tarifaAplicable));
  };

  const handleHorasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hrs = Number(e.target.value);
    set('prop_horas', hrs);
    if (tarifaAplicable > 0 && hrs > 0) set('prop_valor', Number((hrs * tarifaAplicable).toFixed(2)));
  };

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
      <p className="step-section-title">PROPUESTA ECONÓMICA</p>

      <ConsultorMultiSelect
        label="CONSULTORES ASIGNADOS"
        selected={d.prop_consultores_ids ?? []}
        onChange={ids => set('prop_consultores_ids', ids)}
        consultores={consultores}
      />

      <div className="wrow">
        <div className="wfield">
          <label className="wfield__label">NIVEL DE DETALLE</label>
          <select className="wfield__input" value={d.prop_nivel_detalle ?? ''} onChange={e => set('prop_nivel_detalle', e.target.value)}>
            <option value="">— Selecciona —</option>
            {NIVEL_DETALLE.map(n => <option key={n}>{n}</option>)}
          </select>
        </div>
        <div className="wfield">
          <label className="wfield__label">FECHA ENTREGA</label>
          <input type="date" className="wfield__input" min={TODAY}
            value={d.prop_fecha_entrega ?? ''} onChange={e => set('prop_fecha_entrega', e.target.value)} />
        </div>
      </div>

      <div className="wrow">
        <div className="wfield">
          <label className="wfield__label">VALOR PRESUPUESTADO ($)</label>
          <input type="number" min="0" className="wfield__input" placeholder="0.00"
            value={d.prop_valor ?? ''} onChange={handleValorChange} />
        </div>
        <div className="wfield">
          <label className="wfield__label">HORAS ESTIMADAS</label>
          <input type="number" min="0" className="wfield__input" placeholder="0"
            value={d.prop_horas ?? ''} onChange={handleHorasChange} />
        </div>
        <div className="wfield">
          <label className="wfield__label">
            TARIFA ({d.tipo === 'Proyecto Nuevo' ? 'DESARROLLO' : 'CAMBIO'})
          </label>
          <div className="wfield__input wfield__input--readonly tarifa-display">
            <DollarSign size={12} />
            {tarifaAplicable > 0 ? `${tarifaAplicable.toFixed(2)} / h` : 'Sin tarifa'}
          </div>
        </div>
      </div>

      {tarifaAplicable === 0 && d.proyecto_id && (
        <div className="step-alert">
          <AlertCircle size={12} />
          <span>El cliente no tiene configurada la tarifa para "{d.tipo || 'esta clasificación'}".</span>
        </div>
      )}

      <div className="wfield">
        <label className="wfield__label">OBSERVACIONES</label>
        <textarea className="wfield__input wfield__textarea" placeholder="Notas sobre la propuesta..."
          value={d.prop_observaciones ?? ''} onChange={e => set('prop_observaciones', e.target.value)} />
      </div>

      <div className="step-save-row">
        <button className="step-save-btn" onClick={onSave} disabled={saving}>
          {saving
            ? <><Loader size={14} className="spin" /> Guardando…</>
            : <><Check size={14} /> {saved ? 'Actualizar propuesta' : 'Guardar Propuesta'}</>
          }
        </button>
        {saved && <span className="step-save-hint">✓ Propuesta guardada</span>}
      </div>
    </div>
  );
};
