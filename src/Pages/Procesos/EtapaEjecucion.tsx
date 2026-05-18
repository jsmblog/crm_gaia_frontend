import { ConsultorMultiSelect } from './ConsultorMultiSelect';
import { EstadoSelect } from './Estadoselect';
import { InteraccionesSection } from './components/Interaccionessection';
import { StepSaveRow, StepLockedBanner } from './components/Stepshared';
import { useInteracciones } from '../../Hooks/Useinteracciones';
import { ejecucionService } from './service/procesoServiceAdapters';
import type { Props } from '../../Interfaces/i_procesos';
import { useWizardCatalogos } from './WizardContext';

export const EtapaEjecucion = ({
  d, set,
  wizardProcessId, onSave, saving, saved, locked,
}: Props) => {
  const { consultores } = useWizardCatalogos();
  const int = useInteracciones(wizardProcessId ?? undefined, ejecucionService);
 
  if (locked) return <StepLockedBanner />;
 
  return (
    <div className="step-body">
      <div className="etapa-block">
        <p className="step-section-title">EJECUCIÓN</p>
 
        <ConsultorMultiSelect
          label="CONSULTORES"
          selected={(d.ejec_consultores_ids as string[]) ?? []}
          onChange={ids => set('ejec_consultores_ids', ids)}
          consultores={consultores}
        />
 
        <div className="wrow">
          <div className="wfield">
            <label className="wfield__label">FECHA INICIO <span className="wfield__req">*</span></label>
            <input type="date" className="wfield__input"
              value={d.ejec_fecha_inicio ?? ''}
              onChange={e => set('ejec_fecha_inicio', e.target.value)} />
          </div>
          <div className="wfield">
            <label className="wfield__label">FECHA FIN</label>
            <input type="date" className="wfield__input"
              value={d.ejec_fecha_fin ?? ''}
              onChange={e => set('ejec_fecha_fin', e.target.value)} />
          </div>
        </div>
 
        <div className="wrow">
          <div className="wfield">
            <label className="wfield__label">HORAS REALES</label>
            <input type="number" min="0" className="wfield__input" placeholder="0"
              value={d.ejec_horas_reales ?? ''}
              onChange={e => set('ejec_horas_reales', e.target.value)} />
          </div>
          <EstadoSelect
            label="ESTADO DEL PROCESO"
            value={d.ejec_estado_id ?? 'En Ejecución'}
            onChange={id => set('ejec_estado_id', id)}
          />
        </div>
 
        <div className="wfield">
          <label className="wfield__label">OBSERVACIONES</label>
          <textarea className="wfield__input wfield__textarea" rows={3}
            placeholder="Observaciones generales…"
            value={d.ejec_observaciones ?? ''}
            onChange={e => set('ejec_observaciones', e.target.value)} />
        </div>
 
        <div className="wfield">
          <label className="wfield__label">PRÓXIMOS PASOS</label>
          <textarea className="wfield__input wfield__textarea" rows={2}
            placeholder="¿Qué sigue después de esta etapa?…"
            value={d.ejec_proximos_pasos ?? ''}
            onChange={e => set('ejec_proximos_pasos', e.target.value)} />
        </div>
 
        {saved && (
          <InteraccionesSection
            {...int}
            consultores={consultores}
            defaultEstado="En Ejecución"
          />
        )}
      </div>
 
      <StepSaveRow
        onSave={onSave}
        saving={saving}
        saved={saved}
        labels={{ idle: 'Guardar Ejecución', saved: 'Guardado' }}
      />
    </div>
  );
};
 