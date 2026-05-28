import { useMemo, useEffect, useState } from 'react';
import { DollarSign, AlertCircle } from 'lucide-react';
import { TODAY, NIVEL_DETALLE } from '../../Constants/procesos';
import { ConsultorMultiSelect } from './ConsultorMultiSelect';
import { EstadoSelect } from './Estadoselect';
import { InteraccionesSection } from './components/Interaccionessection';
import { StepLockedBanner, StepSaveRow } from './components/Stepshared';
import { useInteracciones } from '../../Hooks/Useinteracciones';
import { propuestaService } from './service/procesoServiceAdapters';
import type { Props } from '../../Interfaces/i_procesos';
import { useWizardCatalogos } from './WizardContext';
import type { Cliente } from '../../Interfaces/i_cliente';
import { toIds } from '../../Utils/toIds';
import { useAutoConsultores } from '../../Hooks/useAutoConsultores';
import { proyectoService } from '../../Services/proyectoService';

const FORMAS_PAGO = [
  'Año anticipado', 'Semestre Anticipado',
  'Trimestre anticipado', 'Mes anticipado', 'Contra consumo',
];

const COSTOS_RECURRENTES = [
  { key: 'lic',     label: 'Licencias', siempre: true },
  { key: 'ocr',     label: 'OCR',       campo: 'est_requiere_ocr' },
  { key: 'captcha', label: 'Captcha',   campo: 'est_requiere_captcha' },
  { key: 'soporte', label: 'Soporte',   siempre: true },
  { key: 'idp',     label: 'IDP',       campo: 'est_requiere_idp' },
  { key: 'ia',      label: 'IA',        campo: 'est_requiere_ai' },
] as const;

const PCT_GERENCIA = 20;

export const Propuesta = ({
  d, set,
  wizardProcessId, onSave, saving, saved, locked,
}: Props) => {
  const { clientes } = useWizardCatalogos();
  const int = useInteracciones(wizardProcessId ?? undefined, propuestaService);

  const [clienteId, setClienteId] = useState<string | null>(null);

  useEffect(() => {
    if (!d.proyecto_id) { setClienteId(null); return; }
    proyectoService.getById(d.proyecto_id)
      .then(p => setClienteId((p as any).cliente_id ?? p.cliente?.id ?? null))
      .catch(() => setClienteId(null));
  }, [d.proyecto_id]);

  const clienteCompleto: Cliente | undefined = useMemo(
    () => clienteId ? clientes.find(c => c.id === clienteId) : undefined,
    [clienteId, clientes],
  );

  useAutoConsultores(d as any, set);
  if (locked) return <StepLockedBanner />;

  const tarifaDesarrollo = useMemo(() => {
    if (!clienteCompleto) return 0;
    if (d.tipo === 'Proyecto Nuevo')      return Number(clienteCompleto.precio_hora_desarrollo) || 0;
    if (d.tipo === 'Solicitud de Cambio') return Number(clienteCompleto.precio_hora_cambio)     || 0;
    return Number(clienteCompleto.precio_hora_soporte) || 0;
  }, [clienteCompleto, d.tipo]);

  const valorPresupuestado    = Number(d.prop_valor)                  || 0;
  const hitoInicioPct         = Number(d.prop_hito_inicio_pct)        || 30;
  const hitoPruebasPct        = Number(d.prop_hito_pruebas_pct)       || 50;
  const hitoEstabilizacionPct = Number(d.prop_hito_estabilizacion_pct)|| 20;

  const valorGerencia    = Number((valorPresupuestado * PCT_GERENCIA / 100).toFixed(2));
  const horasGerencia    = tarifaDesarrollo > 0 ? Math.round(valorGerencia / tarifaDesarrollo) : 0;
  const valorTotal       = valorPresupuestado + valorGerencia;
  const hitoInicio       = Number((valorTotal * hitoInicioPct         / 100).toFixed(2));
  const hitoPruebas      = Number((valorTotal * hitoPruebasPct        / 100).toFixed(2));
  const hitoEstabilizacion = Number((valorTotal * hitoEstabilizacionPct / 100).toFixed(2));

  const handleHorasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hrs = Number(e.target.value);
    set('prop_horas', hrs);
    if (tarifaDesarrollo > 0 && hrs > 0) {
      const val  = Number((hrs * tarifaDesarrollo).toFixed(2));
      const vGer = Number((val * PCT_GERENCIA / 100).toFixed(2));
      set('prop_valor',          val);
      set('prop_valor_gerencia', vGer);
      set('prop_horas_gerencia', tarifaDesarrollo > 0 ? Math.round(vGer / tarifaDesarrollo) : 0);
    }
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val  = Number(e.target.value);
    const vGer = Number((val * PCT_GERENCIA / 100).toFixed(2));
    set('prop_valor', val);
    if (tarifaDesarrollo > 0 && val > 0)
      set('prop_horas', Math.round(val / tarifaDesarrollo));
    set('prop_valor_gerencia', vGer);
    set('prop_horas_gerencia', tarifaDesarrollo > 0 ? Math.round(vGer / tarifaDesarrollo) : 0);
  };

  const handleHitoPct = (
    campo: 'prop_hito_inicio_pct' | 'prop_hito_pruebas_pct' | 'prop_hito_estabilizacion_pct',
    val: number,
  ) => set(campo, val);

  const tieneEstimacion = !!(
    d.est_requiere_ocr || d.est_requiere_ai ||
    d.est_requiere_captcha || d.est_requiere_idp
  );

  const costosVisibles = COSTOS_RECURRENTES.filter(c =>
    ('siempre' in c && c.siempre) ||
    !tieneEstimacion ||
    ('campo' in c && (d as any)[c.campo])
  );

  return (
    <div className="step-body">
      <p className="step-section-title">PROPUESTA ECONÓMICA</p>

      <ConsultorMultiSelect
        label="CONSULTORES ASIGNADOS"
        selected={toIds(d.prop_consultores_ids)}
        onChange={ids => set('prop_consultores_ids', ids)}
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
          <div className="wfield__input wfield__input--readonly tarifa-display">
            {horasGerencia > 0 ? `${horasGerencia} h` : '—'}
          </div>
        </div>
        <div className="wfield">
          <label className="wfield__label">VALOR GERENCIA ($)</label>
          <div className="wfield__input wfield__input--readonly tarifa-display">
            <DollarSign size={12} />
            {valorGerencia > 0 ? valorGerencia.toFixed(2) : '—'}
          </div>
        </div>
        <div className="wfield">
          <label className="wfield__label">VALOR TOTAL PROPUESTA ($)</label>
          <div className="wfield__input wfield__input--readonly tarifa-display tarifa-display--total">
            <DollarSign size={12} />
            <strong>{valorTotal > 0 ? valorTotal.toFixed(2) : '—'}</strong>
          </div>
        </div>
      </div>

      {valorTotal > 0 && (
        <>
          <p className="step-section-subtitle">Hitos de Pago</p>
          <div className="prop-hitos-table">
            <div className="prop-hitos-table__head">
              <span>Hito</span><span>% Pago</span><span>Valor</span>
            </div>
            {[
              { label: 'Inicio del proyecto',    campo: 'prop_hito_inicio_pct',         pct: hitoInicioPct,         valor: hitoInicio },
              { label: 'Fin de pruebas',         campo: 'prop_hito_pruebas_pct',        pct: hitoPruebasPct,        valor: hitoPruebas },
              { label: 'Fin de estabilización',  campo: 'prop_hito_estabilizacion_pct', pct: hitoEstabilizacionPct, valor: hitoEstabilizacion },
            ].map(h => (
              <div key={h.campo} className="prop-hitos-table__row">
                <span>{h.label}</span>
                <div className="prop-hito-pct">
                  <input
                    type="number" min="0" max="100"
                    className="wfield__input prop-hito-pct__input"
                    value={h.pct}
                    onChange={e => handleHitoPct(h.campo as any, Number(e.target.value))}
                  />
                  <span>%</span>
                </div>
                <span className="prop-hito-valor">
                  $ {h.valor.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
            <div className="prop-hitos-table__row prop-hitos-table__row--total">
              <span>Cierre del proyecto</span>
              <span>
                {hitoInicioPct + hitoPruebasPct + hitoEstabilizacionPct !== 100
                  ? <span className="prop-hito-warn">≠ 100%</span>
                  : '100%'}
              </span>
              <span className="prop-hito-valor">
                $ {valorTotal.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </>
      )}

      <p className="step-section-subtitle">Costos Recurrentes</p>
      <div className="prop-recurrentes-table">
        <div className="prop-recurrentes-table__head">
          <span>Categoría</span>
          {FORMAS_PAGO.map(f => <span key={f}>{f}</span>)}
        </div>
        {costosVisibles.map(c => (
          <div key={c.key} className="prop-recurrentes-table__row">
            <span className="prop-recurrentes-table__label">{c.label}</span>
            {FORMAS_PAGO.map(forma => (
              <label key={forma} className="prop-recurrentes-radio">
                <input
                  type="radio"
                  name={`recurrente_${c.key}`}
                  value={forma}
                  checked={(d as any)[`prop_${c.key}_forma_pago`] === forma}
                  onChange={() => set(`prop_${c.key}_forma_pago` as any, forma)}
                />
              </label>
            ))}
          </div>
        ))}
      </div>

      <EstadoSelect
        label="ESTADO DEL PROCESO"
        value={d.prop_estado_id ?? ''}
        onChange={id => set('prop_estado_id', id)}
        defaultValue="Propuesta"
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
          defaultValue="Propuesta"
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