import { PauseCircle } from 'lucide-react';
import { TODAY, MOTIVOS_STANDBY } from '../../Constants/procesos';
import { ConsultorMultiSelect } from './ConsultorMultiSelect';
import { EstadoSelect } from './Estadoselect';
import { InteraccionesSection } from './components/Interaccionessection';
import { StepSaveRow, StepLockedBanner } from './components/Stepshared';
import { useInteracciones } from '../../Hooks/Useinteracciones';
import { standByService } from './service/procesoServiceAdapters';
import type { Props } from '../../Interfaces/i_procesos';
import { useWizardCatalogos } from './WizardContext';

export const EtapaStandBy = ({
  d, set,
  wizardProcessId, onSave, saving, saved, locked,
}: Props) => {
  const { consultores } = useWizardCatalogos();
  const int = useInteracciones(wizardProcessId ?? undefined, standByService);

  if (locked) return <StepLockedBanner />;

  return (
    <div className="step-body">
      <div className="etapa-block">
        <p className="step-section-title">STAND BY</p>

        <ConsultorMultiSelect
          label="CONSULTORES"
          selected={(d.standby_consultores_ids as string[]) ?? []}
          onChange={ids => set('standby_consultores_ids', ids)}
          consultores={consultores}
        />

        <div className="wrow">
          <div className="wfield">
            <label className="wfield__label">FECHA DE PAUSA</label>
            <input type="date" className="wfield__input"
              value={d.standby_fecha_inicio ?? TODAY}
              onChange={e => set('standby_fecha_inicio', e.target.value)} />
          </div>
          <div className="wfield">
            <label className="wfield__label">FECHA ESTIMADA DE RETORNO</label>
            <input type="date" className="wfield__input"
              value={d.standby_fecha_retorno ?? ''}
              onChange={e => set('standby_fecha_retorno', e.target.value)} />
          </div>
        </div>

        <div className="wrow">
          <div className="wfield">
            <label className="wfield__label">MOTIVO DE PAUSA</label>
            <select className="wfield__input"
              value={d.standby_motivo_categoria ?? ''}
              onChange={e => set('standby_motivo_categoria', e.target.value)}>
              <option value="">— Selecciona —</option>
              {MOTIVOS_STANDBY.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="wfield">
            <label className="wfield__label">RESPONSABLE DE LA DECISIÓN</label>
            <input type="text" className="wfield__input"
              placeholder="Contacto del cliente"
              value={d.standby_decision_por ?? ''}
              onChange={e => set('standby_decision_por', e.target.value)} />
          </div>
        </div>

        <div className="wfield">
          <label className="wfield__label">DETALLE DEL MOTIVO</label>
          <textarea className="wfield__input wfield__textarea" rows={3}
            placeholder="Explica por qué el proceso está en pausa…"
            value={d.standby_motivo_detalle ?? ''}
            onChange={e => set('standby_motivo_detalle', e.target.value)} />
        </div>

        <div className="wfield">
          <label className="wfield__label">CONDICIÓN PARA REACTIVAR</label>
          <textarea className="wfield__input wfield__textarea" rows={2}
            placeholder="¿Qué debe ocurrir para que el proceso avance de nuevo?…"
            value={d.standby_condicion_reactivar ?? ''}
            onChange={e => set('standby_condicion_reactivar', e.target.value)} />
        </div>

        <EstadoSelect
          label="ESTADO DEL PROCESO"
          value={d.standby_estado_id ?? 'Stand BY'}
          onChange={id => set('standby_estado_id', id)}
        />

        <div className="wfield">
          <label className="wfield__label">OBSERVACIONES</label>
          <textarea className="wfield__input wfield__textarea" rows={3}
            placeholder="Observaciones generales…"
            value={d.standby_observaciones ?? ''}
            onChange={e => set('standby_observaciones', e.target.value)} />
        </div>

        <div className="wfield">
          <label className="wfield__label">PRÓXIMOS PASOS</label>
          <textarea className="wfield__input wfield__textarea" rows={2}
            placeholder="¿Qué seguimiento se hará durante la pausa?…"
            value={d.standby_proximos_pasos ?? ''}
            onChange={e => set('standby_proximos_pasos', e.target.value)} />
        </div>

        {saved && (
          <InteraccionesSection
            {...int}
            consultores={consultores}
            defaultEstado="Stand BY"
          />
        )}
      </div>

      <StepSaveRow
        onSave={onSave}
        saving={saving}
        saved={saved}
        labels={{ idle: 'Guardar Stand By', saved: 'Guardado' }}
        icon={<PauseCircle size={14} />}
      />
    </div>
  );
};