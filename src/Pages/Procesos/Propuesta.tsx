import { useMemo } from 'react';
import { Lock, DollarSign, AlertCircle } from 'lucide-react';
import { TODAY, NIVEL_DETALLE } from '../../Constants/procesos';
import { ConsultorMultiSelect } from './ConsultorMultiSelect';
import { EstadoSelect } from './Estadoselect';
import { InteraccionesSection } from './components/Interaccionessection';
import { StepSaveRow } from './components/Stepshared';
import { useInteracciones } from '../../Hooks/Useinteracciones';
import { propuestaService } from './service/procesoServiceAdapters';
import type { Props } from '../../Interfaces/i_procesos';
import { useWizardCatalogos } from './WizardContext';
import type { Cliente } from '../../Interfaces/i_cliente';

export const Propuesta = ({
  d, set,
  wizardProcessId, onSave, saving, saved, locked,
}: Props) => {
  const { consultores, proyectos, clientes } = useWizardCatalogos(); 
  const int = useInteracciones(wizardProcessId ?? undefined, propuestaService);

  const proyectoActual = useMemo(
    () => proyectos?.find(p => p.id === d.proyecto_id),
    [d.proyecto_id, proyectos],
  );


  const clienteCompleto: Cliente | undefined = useMemo(() => {
    const clienteId = proyectoActual?.cliente?.id ?? proyectoActual?.cliente_id; 
    if (!clienteId) return undefined;
    return clientes?.find(c => c.id === clienteId);
  }, [proyectoActual, clientes]);

  const tarifaDesarrollo = useMemo(() => {
    if (!clienteCompleto) return 0;
    if (d.tipo === 'Proyecto Nuevo')      return Number(clienteCompleto.precio_hora_desarrollo) || 0;
    if (d.tipo === 'Solicitud de Cambio') return Number(clienteCompleto.precio_hora_cambio)     || 0;
    return Number(clienteCompleto.precio_hora_soporte) || 0;
  }, [clienteCompleto, d.tipo]);

  const pctGobierno = useMemo(
    () => Number(clienteCompleto?.porcentaje_gobierno) || 0,
    [clienteCompleto],
  );

  const handleHorasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hrs = Number(e.target.value);
    set('prop_horas', hrs);
    if (tarifaDesarrollo > 0 && hrs > 0)
      set('prop_valor', Number((hrs * tarifaDesarrollo).toFixed(2)));
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    set('prop_valor', val);
    if (tarifaDesarrollo > 0 && val > 0)
      set('prop_horas', Math.round(val / tarifaDesarrollo));
  };

  const handleHorasGerenciaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hrs = Number(e.target.value);
    set('prop_horas_gerencia', hrs);
    if (pctGobierno > 0 && hrs > 0)
      set('prop_valor_gerencia', Number((hrs * (tarifaDesarrollo * pctGobierno / 100)).toFixed(2)));
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
          <select className="wfield__input"
            value={d.prop_nivel_detalle ?? ''}
            onChange={e => set('prop_nivel_detalle', e.target.value)}>
            <option value="">— Selecciona —</option>
            {NIVEL_DETALLE.map(n => <option key={n}>{n}</option>)}
          </select>
        </div>
        <div className="wfield">
          <label className="wfield__label">FECHA ENTREGA</label>
          <input type="date" className="wfield__input" min={TODAY}
            value={d.prop_fecha_entrega ?? ''}
            onChange={e => set('prop_fecha_entrega', e.target.value)} />
        </div>
      </div>

      {/* ── DESARROLLO ── */}
      <p className="step-section-subtitle">Desarrollo</p>
      <div className="wrow">
        <div className="wfield">
          <label className="wfield__label">HORAS ESTIMADAS</label>
          <input type="number" min="0" className="wfield__input" placeholder="0"
            value={d.prop_horas ?? ''} onChange={handleHorasChange} />
        </div>
        <div className="wfield">
          <label className="wfield__label">VALOR PRESUPUESTADO ($)</label>
          <input type="number" min="0" className="wfield__input" placeholder="0.00"
            value={d.prop_valor ?? ''} onChange={handleValorChange} />
        </div>
        <div className="wfield">
          <label className="wfield__label">
            TARIFA ({d.tipo === 'Proyecto Nuevo' ? 'DESARROLLO' : 'CAMBIO'})
          </label>
          <div className="wfield__input wfield__input--readonly tarifa-display">
            <DollarSign size={12} />
            {tarifaDesarrollo > 0 ? `${tarifaDesarrollo.toFixed(2)} / h` : 'Sin tarifa'}
          </div>
        </div>
      </div>

      {tarifaDesarrollo === 0 && d.proyecto_id && (
        <div className="step-alert">
          <AlertCircle size={12} />
          <span>El cliente no tiene configurada la tarifa para "{d.tipo || 'esta clasificación'}".</span>
        </div>
      )}

      <p className="step-section-subtitle">Gerencia / Gobierno</p>
      <div className="wrow">
        <div className="wfield">
          <label className="wfield__label">HORAS GERENCIA</label>
          <input type="number" min="0" className="wfield__input" placeholder="0"
            value={d.prop_horas_gerencia ?? ''} onChange={handleHorasGerenciaChange} />
        </div>
        <div className="wfield">
          <label className="wfield__label">VALOR GERENCIA ($)</label>
          <input type="number" min="0" className="wfield__input" placeholder="0.00"
            value={d.prop_valor_gerencia ?? ''}
            onChange={e => set('prop_valor_gerencia', Number(e.target.value))} />
        </div>
        <div className="wfield">
          <label className="wfield__label">% GOBIERNO</label>
          <div className="wfield__input wfield__input--readonly tarifa-display">
            {pctGobierno > 0 ? `${pctGobierno.toFixed(2)} %` : 'Sin % gobierno'}
          </div>
        </div>
      </div>

      <EstadoSelect
        label="ESTADO DEL PROCESO"
        value={d.prop_estado_id ?? 'Propuesta'}
        onChange={id => set('prop_estado_id', id)}
      />

      <div className="wfield">
        <label className="wfield__label">OBSERVACIONES</label>
        <textarea className="wfield__input wfield__textarea"
          placeholder="Notas sobre la propuesta..."
          value={d.prop_observaciones ?? ''}
          onChange={e => set('prop_observaciones', e.target.value)} />
      </div>

      {saved && (
        <InteraccionesSection
          {...int}
          consultores={consultores}
          defaultEstado="Propuesta"
        />
      )}

      <StepSaveRow
        onSave={onSave}
        saving={saving}
        saved={saved}
        labels={{ idle: 'Guardar Propuesta', saved: 'Actualizar propuesta' }}
        hint="✓ Propuesta guardada"
      />
    </div>
  );
};