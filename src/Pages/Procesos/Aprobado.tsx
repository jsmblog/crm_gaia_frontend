import { TODAY } from '../../Constants/procesos';
import { ConsultorMultiSelect } from './ConsultorMultiSelect';
import { EstadoSelect } from './Estadoselect';
import { InteraccionesSection } from './components/Interaccionessection';
import { StepSaveRow, StepLockedBanner } from './components/Stepshared';
import { useInteracciones } from '../../Hooks/Useinteracciones';
import { aprobadoService } from './service/procesoServiceAdapters';
import type { Props } from '../../Interfaces/i_procesos';
import { useWizardCatalogos } from './WizardContext';

export const Aprobado = ({
  d, set,
  wizardProcessId, onSave, saving, saved, locked,
}: Props) => {
  const { consultores } = useWizardCatalogos();
  const int = useInteracciones(wizardProcessId ?? undefined, aprobadoService);

  if (locked) return <StepLockedBanner />;

  return (
    <div className="step-body">
      <div className="etapa-block">
        <p className="step-section-title">APROBADO</p>

        <ConsultorMultiSelect
          label="CONSULTORES"
          selected={(d.aprobado_consultores_ids as string[]) ?? []}
          onChange={ids => set('aprobado_consultores_ids', ids)}
          consultores={consultores}
        />

        <div className="wrow">
          <div className="wfield">
            <label className="wfield__label">FECHA</label>
            <input type="date" className="wfield__input"
              value={d.aprobado_fecha ?? TODAY}
              onChange={e => set('aprobado_fecha', e.target.value)} />
          </div>
          <EstadoSelect
            label="ESTADO DEL PROCESO"
            value={d.aprobado_estado_id ?? 'Aprobado'}
            onChange={id => set('aprobado_estado_id', id)}
          />
        </div>

        <div className="wfield">
          <label className="wfield__label">OBSERVACIONES</label>
          <textarea className="wfield__input wfield__textarea" rows={3}
            placeholder="Observaciones generales…"
            value={d.aprobado_observaciones ?? ''}
            onChange={e => set('aprobado_observaciones', e.target.value)} />
        </div>

        <div className="wfield">
          <label className="wfield__label">PRÓXIMOS PASOS</label>
          <textarea className="wfield__input wfield__textarea" rows={2}
            placeholder="¿Qué sigue después de esta etapa?…"
            value={d.aprobado_proximos_pasos ?? ''}
            onChange={e => set('aprobado_proximos_pasos', e.target.value)} />
        </div>

        {saved && (
          <InteraccionesSection
            {...int}
            consultores={consultores}
            defaultEstado="Aprobado"
          />
        )}
      </div>

      <StepSaveRow
        onSave={onSave}
        saving={saving}
        saved={saved}
        labels={{ idle: 'Guardar Aprobado', saved: 'Guardado' }}
      />
    </div>
  );
};