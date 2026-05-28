import { TODAY } from '../../Constants/procesos';
import { ConsultorMultiSelect } from './ConsultorMultiSelect';
import { EstadoSelect } from './Estadoselect';
import { InteraccionesSection } from './components/Interaccionessection';
import { StepSaveRow, StepLockedBanner } from './components/Stepshared';
import { useInteracciones } from '../../Hooks/Useinteracciones';
import { cierreService } from './service/procesoServiceAdapters';
import type { Props } from '../../Interfaces/i_procesos';
import { toIds } from '../../Utils/toIds';
import { useAutoConsultores } from '../../Hooks/useAutoConsultores';

export const EtapaCierre = ({
  d, set,
  wizardProcessId, onSave, saving, saved, locked,
}: Props) => {
  const int = useInteracciones(wizardProcessId ?? undefined, cierreService);

  useAutoConsultores(d as any, set);

  if (locked) return <StepLockedBanner />;

  return (
    <div className="step-body">
      <div className="etapa-block">
        <p className="step-section-title">CIERRE</p>

        <ConsultorMultiSelect
          label="CONSULTORES"
          selected={toIds(d.cierre_consultores_ids)}
          onChange={ids => set('cierre_consultores_ids', ids)}
        />

        <div className="wrow">
          <div className="wfield">
            <label className="wfield__label">FECHA DE CIERRE</label>
            <input type="date" className="wfield__input"
              value={d.cierre_fecha ?? TODAY}
              onChange={e => set('cierre_fecha', e.target.value)} />
          </div>
          <EstadoSelect
            label="ESTADO DEL PROCESO"
            value={d.cierre_estado_id ?? 'Cerrado'}
            onChange={id => set('cierre_estado_id', id)}
            defaultValue='Cerrado'
          />
        </div>

        <div className="wrow">
          <div className="wfield">
            <label className="wfield__label">HORAS REALES</label>
            <input type="number" className="wfield__input"
              value={d.horas_reales ?? ''}
              min={0}
              onChange={e => set('horas_reales', e.target.value === '' ? '' : +e.target.value)} />
          </div>
        </div>

        <div className="wfield">
          <label className="wfield__label">OBSERVACIONES</label>
          <textarea className="wfield__input wfield__textarea" rows={3}
            placeholder="Observaciones generales…"
            value={d.cierre_observaciones ?? ''}
            onChange={e => set('cierre_observaciones', e.target.value)} />
        </div>

        <div className="wfield">
          <label className="wfield__label">PRÓXIMOS PASOS</label>
          <textarea className="wfield__input wfield__textarea" rows={2}
            placeholder="¿Qué sigue después de esta etapa?…"
            value={d.cierre_proximos_pasos ?? ''}
            onChange={e => set('cierre_proximos_pasos', e.target.value)} />
        </div>

        {saved && (
          <InteraccionesSection
            {...int}
            defaultValue="Cerrado"
          />
        )}
      </div>

      <StepSaveRow
        onSave={onSave}
        saving={saving}
        saved={saved}
        labels={{ idle: 'Guardar Cierre', saved: 'Guardado' }}
      />
    </div>
  );
};