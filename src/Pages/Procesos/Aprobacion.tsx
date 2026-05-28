import { useCallback } from 'react';
import { Lock } from 'lucide-react';
import { TODAY } from '../../Constants/procesos';
import { EstadoSelect } from './Estadoselect';
import { ConsultorMultiSelect } from './ConsultorMultiSelect';
import { InteraccionesSection } from './components/Interaccionessection';
import { StepLockedBanner, StepSaveRow } from './components/Stepshared';
import { useInteracciones } from '../../Hooks/Useinteracciones';
import { aprobacionService } from './service/procesoServiceAdapters';
import type { Props } from '../../Interfaces/i_procesos';
import { toIds } from '../../Utils/toIds';
import { useAutoConsultores } from '../../Hooks/useAutoConsultores';

export const Aprobacion = ({
  d, set,
  wizardProcessId, onSave, saving, saved, locked,
}: Props) => {
  const int = useInteracciones(wizardProcessId ?? undefined, aprobacionService);
  useAutoConsultores(d as any, set);
  if (locked) return <StepLockedBanner />;

  const aprIds = toIds(d.apr_consultores_ids);

  const handleConsultoresChange = useCallback((ids: string[]) => {
    set('apr_consultores_ids', ids);
  }, [set]);

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

      <p className="step-section-title">ANÁLISIS PRELIMINAR</p>

      <div className="wrow">
        <div className="wfield">
          <label className="wfield__label">FECHA PRELIMINAR</label>
          <input
            type="date"
            className="wfield__input"
            value={d.pre_fecha ?? ''}
            onChange={e => set('pre_fecha', e.target.value)}
          />
        </div>
        <div className="wfield">
          <label className="wfield__label">PROBABILIDAD</label>
          <select
            className="wfield__input"
            value={d.pre_probabilidad ?? ''}
            onChange={e => set('pre_probabilidad', e.target.value)}
          >
            <option value="">— Sin definir —</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>
      </div>

      <div className="wfield">
        <label className="wfield__label">RESULTADO / CONCLUSIONES</label>
        <textarea
          className="wfield__input wfield__textarea"
          placeholder="Conclusiones del análisis preliminar…"
          value={d.pre_resultado ?? ''}
          onChange={e => set('pre_resultado', e.target.value)}
        />
      </div>

      <div className="step-divider" />

      <p className="step-section-title">APROBACIÓN</p>

      <ConsultorMultiSelect
        label="CONSULTORES"
        selected={aprIds}
        onChange={handleConsultoresChange}
      />

      <div className="wrow">
        <div className="wfield">
          <label className="wfield__label">RESULTADO</label>
          <select
            className="wfield__input"
            value={d.apr_aprobado ?? ''}
            onChange={e => set('apr_aprobado', e.target.value)}
          >
            <option value="">— Pendiente —</option>
            <option value="Aprobado">✓ Aprobado</option>
            <option value="Rechazado">✗ Rechazado</option>
          </select>
        </div>
        <div className="wfield">
          <label className="wfield__label">FECHA APROBACIÓN</label>
          <input
            type="date"
            className="wfield__input"
            value={d.apr_fecha ?? TODAY}
            onChange={e => set('apr_fecha', e.target.value)}
          />
        </div>
      </div>

      {d.apr_aprobado === 'Rechazado' && (
        <div className="wfield">
          <label className="wfield__label">
            MOTIVO DE RECHAZO <span className="wfield__req">*</span>
          </label>
          <input
            className="wfield__input"
            placeholder="Indica el motivo del rechazo"
            value={d.apr_motivo_rechazo ?? ''}
            onChange={e => set('apr_motivo_rechazo', e.target.value)}
          />
        </div>
      )}

      <EstadoSelect
        label="ESTADO DEL PROCESO"
        value={d.apr_estado_id ?? ''}
        onChange={id => set('apr_estado_id', id)}
        defaultValue="En Aprobacion"
      />

      {saved && (
        <InteraccionesSection
          {...int}
          defaultValue="En Aprobacion"
        />
      )}

      <StepSaveRow
        onSave={onSave}
        saving={saving}
        saved={saved}
        labels={{ idle: 'Guardar Aprobación', saved: 'Actualizar aprobación' }}
        hint="✓ Etapa guardada"
      />
    </div>
  );
};