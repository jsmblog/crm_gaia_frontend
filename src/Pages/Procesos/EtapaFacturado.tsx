import { ESTADOS_COBRO } from '../../Constants/procesos';
import { ConsultorMultiSelect } from './ConsultorMultiSelect';
import { EstadoSelect } from './Estadoselect';
import { InteraccionesSection } from './components/Interaccionessection';
import { StepSaveRow, StepLockedBanner } from './components/Stepshared';
import { useInteracciones } from '../../Hooks/Useinteracciones';
import { facturadoService } from './service/procesoServiceAdapters';
import type { Props } from '../../Interfaces/i_procesos';
import { useWizardCatalogos } from './WizardContext';

export const EtapaFacturado = ({
  d, set,
  wizardProcessId, onSave, saving, saved, locked,
}: Props) => {
  const { consultores } = useWizardCatalogos();
  const int = useInteracciones(wizardProcessId ?? undefined, facturadoService);

  if (locked) return <StepLockedBanner />;

  return (
    <div className="step-body">
      <div className="etapa-block">
        <p className="step-section-title">FACTURADO</p>

        <ConsultorMultiSelect
          label="CONSULTORES"
          selected={(d.facturado_consultores_ids as string[]) ?? []}
          onChange={ids => set('facturado_consultores_ids', ids)}
          consultores={consultores}
        />

        <div className="wrow">
          <div className="wfield">
            <label className="wfield__label">N° FACTURA</label>
            <input type="text" className="wfield__input" placeholder="Ej: FAC-2024-001"
              value={d.facturado_numero_factura ?? ''}
              onChange={e => set('facturado_numero_factura', e.target.value)} />
          </div>
          <div className="wfield">
            <label className="wfield__label">FECHA FACTURA</label>
            <input type="date" className="wfield__input"
              value={d.facturado_fecha_factura ?? ''}
              onChange={e => set('facturado_fecha_factura', e.target.value)} />
          </div>
        </div>

        <div className="wrow">
          <div className="wfield">
            <label className="wfield__label">VALOR FACTURADO ($)</label>
            <div className="wfield__input-icon-wrap">
              <input type="number" min="0" className="wfield__input wfield__input--icon"
                placeholder="0.00"
                value={d.facturado_valor ?? ''}
                onChange={e => set('facturado_valor', e.target.value)} />
            </div>
          </div>
          <div className="wfield">
            <label className="wfield__label">FECHA VENCIMIENTO</label>
            <input type="date" className="wfield__input"
              value={d.facturado_fecha_vencimiento ?? ''}
              onChange={e => set('facturado_fecha_vencimiento', e.target.value)} />
          </div>
        </div>

        <div className="wrow">
          <div className="wfield">
            <label className="wfield__label">ESTADO DE COBRO</label>
            <select className="wfield__input"
              value={d.facturado_estado_cobro ?? ''}
              onChange={e => set('facturado_estado_cobro', e.target.value)}>
              <option value="">— Selecciona —</option>
              {ESTADOS_COBRO.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <EstadoSelect
            label="ESTADO DEL PROCESO"
            value={d.facturado_estado_id ?? 'Facturada'}
            onChange={id => set('facturado_estado_id', id)}
          />
        </div>

        <div className="wfield">
          <label className="wfield__label">OBSERVACIONES</label>
          <textarea className="wfield__input wfield__textarea" rows={3}
            placeholder="Observaciones generales…"
            value={d.facturado_observaciones ?? ''}
            onChange={e => set('facturado_observaciones', e.target.value)} />
        </div>

        <div className="wfield">
          <label className="wfield__label">PRÓXIMOS PASOS</label>
          <textarea className="wfield__input wfield__textarea" rows={2}
            placeholder="¿Qué sigue después de esta etapa?…"
            value={d.facturado_proximos_pasos ?? ''}
            onChange={e => set('facturado_proximos_pasos', e.target.value)} />
        </div>

        {saved && (
          <InteraccionesSection
            {...int}
            consultores={consultores}
            defaultEstado="Facturada"
          />
        )}
      </div>

      <StepSaveRow
        onSave={onSave}
        saving={saving}
        saved={saved}
        labels={{ idle: 'Guardar Facturado', saved: 'Guardado' }}
      />
    </div>
  );
};