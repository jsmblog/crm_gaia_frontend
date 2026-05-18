import { AlertTriangle } from 'lucide-react';
import { TODAY, MOTIVOS, RECUPERABLE } from '../../Constants/procesos';
import { ConsultorMultiSelect } from './ConsultorMultiSelect';
import { EstadoSelect } from './Estadoselect';
import { InteraccionesSection } from './components/Interaccionessection';
import { StepSaveRow, StepLockedBanner } from './components/Stepshared';
import { useInteracciones } from '../../Hooks/Useinteracciones';
import { rechazadoService } from './service/procesoServiceAdapters';
import type { Props } from '../../Interfaces/i_procesos';
import { useWizardCatalogos } from './WizardContext';

export const EtapaRechazado = ({
  d, set,
  wizardProcessId, onSave, saving, saved, locked,
}: Props) => {
  const { consultores } = useWizardCatalogos();
  const int = useInteracciones(wizardProcessId ?? undefined, rechazadoService);

  const esRecuperable =
    d.rechazado_recuperable === 'Sí' || d.rechazado_recuperable === 'Posiblemente';

  if (locked) return <StepLockedBanner />;

  return (
    <div className="step-body">
      <div className="etapa-block">
        <p className="step-section-title">RECHAZADO</p>

        <ConsultorMultiSelect
          label="CONSULTORES"
          selected={(d.rechazado_consultores_ids as string[]) ?? []}
          onChange={ids => set('rechazado_consultores_ids', ids)}
          consultores={consultores}
        />

        <div className="wrow">
          <div className="wfield">
            <label className="wfield__label">FECHA DE RECHAZO</label>
            <input type="date" className="wfield__input"
              value={d.rechazado_fecha ?? TODAY}
              onChange={e => set('rechazado_fecha', e.target.value)} />
          </div>
          <div className="wfield">
            <label className="wfield__label">CATEGORÍA DEL MOTIVO</label>
            <select className="wfield__input"
              value={d.rechazado_motivo_categoria ?? ''}
              onChange={e => set('rechazado_motivo_categoria', e.target.value)}>
              <option value="">— Selecciona —</option>
              {MOTIVOS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="wfield">
          <label className="wfield__label">MOTIVO DETALLADO</label>
          <textarea className="wfield__input wfield__textarea" rows={3}
            placeholder="Describe con detalle por qué fue rechazado…"
            value={d.rechazado_motivo_detalle ?? ''}
            onChange={e => set('rechazado_motivo_detalle', e.target.value)} />
        </div>

        <div className="wfield">
          <label className="wfield__label">RESPONSABLE DE LA DECISIÓN (CLIENTE)</label>
          <input type="text" className="wfield__input"
            placeholder="Nombre del contacto que rechazó"
            value={d.rechazado_decision_por ?? ''}
            onChange={e => set('rechazado_decision_por', e.target.value)} />
        </div>

        <div className="wrow">
          <div className="wfield">
            <label className="wfield__label">¿ES RECUPERABLE?</label>
            <select className="wfield__input"
              value={d.rechazado_recuperable ?? ''}
              onChange={e => set('rechazado_recuperable', e.target.value)}>
              <option value="">— Sin definir —</option>
              {RECUPERABLE.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {esRecuperable && (
            <div className="wfield">
              <label className="wfield__label">FECHA DE RECONTACTO</label>
              <input type="date" className="wfield__input"
                value={d.rechazado_fecha_recontacto ?? ''}
                onChange={e => set('rechazado_fecha_recontacto', e.target.value)} />
            </div>
          )}
        </div>

        <EstadoSelect
          label="ESTADO DEL PROCESO"
          value={d.rechazado_estado_id ?? 'Rechazado'}
          onChange={id => set('rechazado_estado_id', id)}
        />

        <div className="wfield">
          <label className="wfield__label">OBSERVACIONES</label>
          <textarea className="wfield__input wfield__textarea" rows={3}
            placeholder="Observaciones generales…"
            value={d.rechazado_observaciones ?? ''}
            onChange={e => set('rechazado_observaciones', e.target.value)} />
        </div>

        <div className="wfield">
          <label className="wfield__label">PRÓXIMOS PASOS</label>
          <textarea className="wfield__input wfield__textarea" rows={2}
            placeholder="¿Qué sigue? (recontacto, lecciones aprendidas…)"
            value={d.rechazado_proximos_pasos ?? ''}
            onChange={e => set('rechazado_proximos_pasos', e.target.value)} />
        </div>

        {saved && (
          <InteraccionesSection
            {...int}
            consultores={consultores}
            defaultEstado="Rechazado"
          />
        )}
      </div>

      <StepSaveRow
        onSave={onSave}
        saving={saving}
        saved={saved}
        labels={{ idle: 'Guardar Rechazado', saved: 'Guardado' }}
        icon={<AlertTriangle size={14} />}
      />
    </div>
  );
};