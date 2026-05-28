import { ESTADOS_COBRO } from '../../Constants/procesos';
import { ConsultorMultiSelect } from './ConsultorMultiSelect';
import { EstadoSelect } from './Estadoselect';
import { InteraccionesSection } from './components/Interaccionessection';
import { StepSaveRow, StepLockedBanner } from './components/Stepshared';
import { useInteracciones } from '../../Hooks/Useinteracciones';
import { facturadoService } from './service/procesoServiceAdapters';
import type { Props, FacturadoItem } from '../../Interfaces/i_procesos';
import { toIds } from '../../Utils/toIds';
import { PlusCircle, Trash2, DollarSign } from 'lucide-react';
import { useAutoConsultores } from '../../Hooks/useAutoConsultores';

const EMPTY_ITEM = (): FacturadoItem => ({
  nombre: '', numero_factura: '', fecha_factura: '',
  dias_credito: '', fecha_vencimiento: '',
  valor_facturado: '', estado_cobro: 'Pendiente',
});

const calcVencimiento = (fecha: string, dias: number | ''): string => {
  if (!fecha || !dias) return '';
  const d = new Date(fecha);
  d.setDate(d.getDate() + Number(dias));
  return d.toISOString().split('T')[0];
};

export const EtapaFacturado = ({
  d, set,
  wizardProcessId, onSave, saving, saved, locked,
}: Props) => {
  const int = useInteracciones(wizardProcessId ?? undefined, facturadoService);

  useAutoConsultores(d as any, set);
  if (locked) return <StepLockedBanner />;

  const items: FacturadoItem[] = d.facturado_items ?? [];

  const setItem = (idx: number, campo: keyof FacturadoItem, valor: any) => {
    const next = items.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [campo]: valor };
      // Recalcular fecha vencimiento si cambia fecha o días
      if (campo === 'fecha_factura' || campo === 'dias_credito') {
        updated.fecha_vencimiento = calcVencimiento(
          campo === 'fecha_factura' ? valor : updated.fecha_factura,
          campo === 'dias_credito'  ? valor : updated.dias_credito,
        );
      }
      return updated;
    });
    set('facturado_items', next);
  };

  const addItem = () => set('facturado_items', [...items, EMPTY_ITEM()]);

  const removeItem = (idx: number) =>
    set('facturado_items', items.filter((_, i) => i !== idx));

  const totalFacturado = items.reduce((a, f) => a + (Number(f.valor_facturado) || 0), 0);

  return (
    <div className="step-body">
      <div className="etapa-block">
        <p className="step-section-title">FACTURADO</p>

        <ConsultorMultiSelect
          label="CONSULTORES"
          selected={toIds(d.facturado_consultores_ids)}
          onChange={ids => set('facturado_consultores_ids', ids)}
        />

        <div className="fact-list">
          {items.length === 0 && (
            <div className="fact-empty">
              Sin facturas ¡ Agrega la primera !.
            </div>
          )}

          {items.map((f, idx) => (
            <div key={idx} className="fact-item">
              <div className="fact-item__header">
                <span className="fact-item__num">Factura #{idx + 1}</span>
                <button
                  type="button"
                  className="fact-item__del"
                  onClick={() => removeItem(idx)}
                  title="Eliminar factura"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Nombre identificador */}
              <div className="wfield">
                <label className="wfield__label">NOMBRE / IDENTIFICADOR</label>
                <input type="text" className="wfield__input"
                  placeholder="Ej: Primer pago, Anticipo, Hito 1…"
                  value={f.nombre}
                  onChange={e => setItem(idx, 'nombre', e.target.value)} />
              </div>

              <div className="wrow">
                <div className="wfield">
                  <label className="wfield__label">N° FACTURA</label>
                  <input type="text" className="wfield__input"
                    placeholder="FAC-2024-001"
                    value={f.numero_factura}
                    onChange={e => setItem(idx, 'numero_factura', e.target.value)} />
                </div>
                <div className="wfield">
                  <label className="wfield__label">VALOR ($)</label>
                  <input type="number" min="0" className="wfield__input"
                    placeholder="0.00"
                    value={f.valor_facturado}
                    onChange={e => setItem(idx, 'valor_facturado', e.target.value)} />
                </div>
              </div>

              <div className="wrow">
                <div className="wfield">
                  <label className="wfield__label">FECHA FACTURA</label>
                  <input type="date" className="wfield__input"
                    value={f.fecha_factura}
                    onChange={e => setItem(idx, 'fecha_factura', e.target.value)} />
                </div>
                <div className="wfield">
                  <label className="wfield__label">DÍAS DE CRÉDITO</label>
                  <input type="number" min="0" className="wfield__input"
                    placeholder="0"
                    value={f.dias_credito}
                    onChange={e => setItem(idx, 'dias_credito', e.target.value === '' ? '' : +e.target.value)} />
                </div>
                <div className="wfield">
                  <label className="wfield__label">FECHA VENCIMIENTO</label>
                  <div className="wfield__input wfield__input--readonly">
                    {f.fecha_vencimiento
                      ? new Date(f.fecha_vencimiento + 'T00:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' })
                      : '—'}
                  </div>
                </div>
              </div>

              <div className="wrow">
                <div className="wfield">
                  <label className="wfield__label">ESTADO DE COBRO</label>
                  <select className="wfield__input"
                    value={f.estado_cobro}
                    onChange={e => setItem(idx, 'estado_cobro', e.target.value)}>
                    <option value="">— Selecciona —</option>
                    {ESTADOS_COBRO.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}

          <button type="button" className="fact-add-btn" onClick={addItem}>
            <PlusCircle size={14} /> Agregar factura
          </button>
        </div>

        {/* ── Total ── */}
        {items.length > 1 && (
          <div className="fact-total">
            <DollarSign size={13} />
            <span>Total facturado:</span>
            <strong>$ {totalFacturado.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</strong>
          </div>
        )}

        <EstadoSelect
          label="ESTADO DEL PROCESO"
          value={d.facturado_estado_id ?? 'Facturada'}
          onChange={id => set('facturado_estado_id', id)}
          defaultValue='Facturada'
        />

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
            defaultValue="Facturada"
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