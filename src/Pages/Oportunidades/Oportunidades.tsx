import { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Pencil, Trash2, X, ChevronDown, Check } from 'lucide-react';
import { clienteService }   from '../../Services/clienteService';
import { consultorService } from '../../Services/consultorService';
import { useToast }         from '../../Hooks/useToast';
import './Oportunidades.css';
import { oportunidadService, type Oportunidad, type WizardPayload } from '../../Services/oportunidadService';
import { EMPTY, ESTATUS_LIST, INTERACCION_TIPOS, lbl, NIVEL_DETALLE, PRIORIDADES, PROB_LIST, STEPS, TIPO_PROCESO, TODAY } from '../../Constants/oportunidad';
import { TARIFA_HORA } from '../../Constants/TARIFA_HORA';

/* ── Local types ────────────────────────────────── */
interface ClienteOpt   { id: string; nombre: string; empresa: string }
interface ConsultorOpt { id: string; nombre: string }

/* ════════════════════════════════════════════════
   STEP COMPONENTS
════════════════════════════════════════════════ */
type Setter = (k: keyof WizardPayload, v: any) => void;

const Step1 = ({ d, set, clientes }: { d: Partial<WizardPayload>; set: Setter; clientes: ClienteOpt[] }) => (
  <div className="step-body">
    <p className="step-section-title">INFORMACIÓN DEL LEAD</p>
    <div className="wfield">
      <label className="wfield__label">CLIENTE <span className="wfield__req">*</span></label>
      <select className="wfield__input" value={d.cliente_id ?? ''} onChange={e => set('cliente_id', e.target.value)}>
        <option value="">— Selecciona un cliente —</option>
        {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} — {c.empresa}</option>)}
      </select>
    </div>
    <div className="wfield">
      <label className="wfield__label">NOMBRE DEL PROCESO / PROYECTO <span className="wfield__req">*</span></label>
      <input className="wfield__input" placeholder="Ej: Automatización de facturación"
        value={d.nombre_proceso ?? ''} onChange={e => set('nombre_proceso', e.target.value)} />
    </div>
    <div className="wrow">
      <div className="wfield">
        <label className="wfield__label">TIPO DE PROCESO</label>
        <select className="wfield__input" value={d.tipo_proceso ?? ''} onChange={e => set('tipo_proceso', e.target.value)}>
          <option value="">— Selecciona —</option>
          {TIPO_PROCESO.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div className="wfield">
        <label className="wfield__label">PROBABILIDAD</label>
        <select className="wfield__input" value={d.probabilidad_aprobacion ?? ''} onChange={e => set('probabilidad_aprobacion', e.target.value)}>
          <option value="">— Selecciona —</option>
          {PROB_LIST.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>
      <div className="wfield">
        <label className="wfield__label">PRIORIDAD</label>
        <select className="wfield__input" value={d.prioridad ?? ''} onChange={e => set('prioridad', e.target.value)}>
          <option value="">— Selecciona —</option>
          {PRIORIDADES.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>
    </div>
    <div className="wrow">
      <div className="wfield">
        <label className="wfield__label">FECHA LEAD</label>
        <input type="date" className="wfield__input" value={d.fecha_lead ?? TODAY} onChange={e => set('fecha_lead', e.target.value)} />
      </div>
      <div className="wfield">
        <label className="wfield__label">PLAZO DE INICIO</label>
        <input type="date" className="wfield__input" value={d.plazo_inicio ?? ''} onChange={e => set('plazo_inicio', e.target.value)} />
      </div>
    </div>
    <div className="wfield">
      <label className="wfield__label">ACCIÓN / RESPONSABLE</label>
      <input className="wfield__input" placeholder="Ej: FU Consultor — pendiente respuesta"
        value={d.accion_responsable ?? ''} onChange={e => set('accion_responsable', e.target.value)} />
    </div>
  </div>
);

const Step2 = ({ d, set, consultores }: { d: Partial<WizardPayload>; set: Setter; consultores: ConsultorOpt[] }) => (
  <div className="step-body">
    <p className="step-section-title">ETAPA DE LEVANTAMIENTO</p>
    <div className="wrow">
      <div className="wfield">
        <label className="wfield__label">CONSULTOR LEVANTAMIENTO</label>
        <select className="wfield__input" value={d.consultor_levantamiento_id ?? ''} onChange={e => set('consultor_levantamiento_id', e.target.value)}>
          <option value="">— Sin asignar —</option>
          {consultores.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>
      <div className="wfield">
        <label className="wfield__label">FECHA LEVANTAMIENTO</label>
        <input type="date" className="wfield__input" value={d.fecha_levantamiento ?? TODAY} onChange={e => set('fecha_levantamiento', e.target.value)} />
      </div>
    </div>
    <p className="step-section-title" style={{ marginTop: 8 }}>ETAPA DE ESTIMACIÓN</p>
    <div className="wrow">
      <div className="wfield">
        <label className="wfield__label">CONSULTOR ESTIMACIÓN</label>
        <select className="wfield__input" value={d.consultor_estimacion_id ?? ''} onChange={e => set('consultor_estimacion_id', e.target.value)}>
          <option value="">— Sin asignar —</option>
          {consultores.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>
      <div className="wfield">
        <label className="wfield__label">FECHA ESTIMACIÓN</label>
        <input type="date" className="wfield__input" value={d.fecha_estimacion ?? TODAY} onChange={e => set('fecha_estimacion', e.target.value)} />
      </div>
    </div>
  </div>
);

const Step3 = ({ d, set, consultores }: { d: Partial<WizardPayload>; set: Setter; consultores: ConsultorOpt[] }) => {
  const valor = Number(d.valor_presupuestado) || 0;
  const horas = Number(d.horas_presupuestadas) || 0;
  const tarifa = horas > 0 ? (valor / horas).toFixed(2) : TARIFA_HORA.toFixed(2);
  return (
    <div className="step-body">
      <p className="step-section-title">ETAPA DE PROPUESTA</p>
      <div className="wrow">
        <div className="wfield">
          <label className="wfield__label">CONSULTOR PROPUESTA</label>
          <select className="wfield__input" value={d.consultor_propuesta_id ?? ''} onChange={e => set('consultor_propuesta_id', e.target.value)}>
            <option value="">— Sin asignar —</option>
            {consultores.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
        <div className="wfield">
          <label className="wfield__label">NIVEL DE DETALLE</label>
          <select className="wfield__input" value={d.nivel_detalle ?? ''} onChange={e => set('nivel_detalle', e.target.value)}>
            <option value="">— Selecciona —</option>
            {NIVEL_DETALLE.map(n => <option key={n}>{n}</option>)}
          </select>
        </div>
      </div>
      <div className="wfield">
        <label className="wfield__label">FECHA ENTREGA PROPUESTA</label>
        <input type="date" className="wfield__input" value={d.fecha_entrega_propuesta ?? ''} onChange={e => set('fecha_entrega_propuesta', e.target.value)} />
      </div>
      <div className="wrow">
        <div className="wfield">
          <label className="wfield__label">VALOR PRESUPUESTADO ($) <span className="wfield__req">*</span></label>
          <input type="number" min="0" className="wfield__input" placeholder="0"
            value={d.valor_presupuestado ?? ''}
            onChange={e => {
              const v = Number(e.target.value);
              set('valor_presupuestado', v);
              set('horas_presupuestadas', Math.round(v / TARIFA_HORA));
            }} />
        </div>
        <div className="wfield">
          <label className="wfield__label">HORAS PRESUPUESTADAS</label>
          <input type="number" min="0" className="wfield__input" placeholder="0"
            value={d.horas_presupuestadas ?? ''}
            onChange={e => set('horas_presupuestadas', Number(e.target.value))} />
        </div>
        <div className="wfield">
          <label className="wfield__label">$/HORA (CALCULADO)</label>
          <input className="wfield__input wfield__input--readonly" readOnly value={`$${tarifa}/h`} />
        </div>
      </div>
    </div>
  );
};

const Step4 = ({ d, set }: { d: Partial<WizardPayload>; set: Setter }) => (
  <div className="step-body">
    <p className="step-section-title">RESULTADO DE APROBACIÓN</p>
    <div className="wrow">
      <div className="wfield">
        <label className="wfield__label">RESULTADO <span className="wfield__req">*</span></label>
        <select className="wfield__input" value={d.resultado_aprobacion ?? 'Pendiente'} onChange={e => set('resultado_aprobacion', e.target.value)}>
          <option value="Pendiente">— Pendiente —</option>
          <option value="Aprobado">Aprobado</option>
          <option value="Rechazado">Rechazado</option>
        </select>
      </div>
      <div className="wfield">
        <label className="wfield__label">FECHA APROBACIÓN / RECHAZO</label>
        <input type="date" className="wfield__input" value={d.fecha_aprobacion ?? TODAY} onChange={e => set('fecha_aprobacion', e.target.value)} />
      </div>
    </div>
  </div>
);

const Step5 = ({ d, set, consultores }: { d: Partial<WizardPayload>; set: Setter; consultores: ConsultorOpt[] }) => (
  <div className="step-body">
    <p className="step-section-title">EJECUCIÓN DEL PROYECTO</p>
    <div className="wrow">
      <div className="wfield">
        <label className="wfield__label">CONSULTOR RESPONSABLE</label>
        <select className="wfield__input" value={d.consultor_responsable_id ?? ''} onChange={e => set('consultor_responsable_id', e.target.value)}>
          <option value="">— Sin asignar —</option>
          {consultores.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>
      <div className="wfield">
        <label className="wfield__label">FECHA INICIO PROYECTO</label>
        <input type="date" className="wfield__input" value={d.fecha_inicio_proyecto ?? ''} onChange={e => set('fecha_inicio_proyecto', e.target.value)} />
      </div>
    </div>
    <div className="wrow">
      <div className="wfield">
        <label className="wfield__label">FECHA CIERRE Y FACTURACIÓN</label>
        <input type="date" className="wfield__input" value={d.fecha_cierre_facturacion ?? ''} onChange={e => set('fecha_cierre_facturacion', e.target.value)} />
      </div>
      <div className="wfield">
        <label className="wfield__label">HORAS REALES</label>
        <input type="number" min="0" className="wfield__input" value={d.horas_reales ?? 0} onChange={e => set('horas_reales', Number(e.target.value))} />
      </div>
    </div>
    <p className="step-section-title" style={{ marginTop: 8 }}>ESTATUS FINAL</p>
    <div className="wfield">
      <label className="wfield__label">ESTATUS ACTUAL <span className="wfield__req">*</span></label>
      <select className="wfield__input" value={d.estatus ?? 'Lead'} onChange={e => set('estatus', e.target.value)}>
        {ESTATUS_LIST.map(s => <option key={s} value={s}>{lbl(s)}</option>)}
      </select>
    </div>
    <p className="step-section-title" style={{ marginTop: 8 }}>AGREGAR INTERACCIÓN (OPCIONAL)</p>
    <div className="wrow">
      <div className="wfield">
        <label className="wfield__label">TIPO DE INTERACCIÓN</label>
        <select className="wfield__input" value={d.interaccion_tipo ?? 'Llamada'} onChange={e => set('interaccion_tipo', e.target.value)}>
          {INTERACCION_TIPOS.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div className="wfield">
        <label className="wfield__label">CONSULTOR</label>
        <select className="wfield__input" value={d.interaccion_consultor_id ?? ''} onChange={e => set('interaccion_consultor_id', e.target.value)}>
          <option value="">— Sin asignar —</option>
          {consultores.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>
    </div>
    <div className="wfield">
      <label className="wfield__label">DESCRIPCIÓN</label>
      <textarea className="wfield__input wfield__textarea" placeholder="Notas de la interacción…"
        value={d.interaccion_descripcion ?? ''}
        onChange={e => set('interaccion_descripcion', e.target.value)} />
    </div>
  </div>
);

/* ── Stepper header ──────────────────────────────── */
const StepHeader = ({ current }: { current: number }) => (
  <div className="stepper">
    {STEPS.map((label, i) => {
      const idx    = i + 1;
      const done   = idx < current;
      const active = idx === current;
      return (
        <div key={label} className="stepper__item">
          {i > 0 && <div className={`stepper__line ${done ? 'stepper__line--done' : ''}`} />}
          <div className={`stepper__dot ${done ? 'stepper__dot--done' : ''} ${active ? 'stepper__dot--active' : ''}`}>
            {done ? <Check size={13} /> : idx}
          </div>
          <span className={`stepper__label ${active ? 'stepper__label--active' : ''}`}>{label}</span>
        </div>
      );
    })}
  </div>
);

/* ── Confirm delete ──────────────────────────────── */
const ConfirmDelete = ({ nombre, onConfirm, onCancel }: { nombre: string; onConfirm: () => void; onCancel: () => void }) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="opp-modal opp-modal--sm" onClick={e => e.stopPropagation()}>
      <div className="opp-modal__head">
        <h2 className="opp-modal__title">Eliminar oportunidad</h2>
        <button className="opp-modal__close" onClick={onCancel}><X size={16} /></button>
      </div>
      <div className="opp-modal__body">
        <p className="confirm-text">
          ¿Seguro que deseas eliminar <strong>{nombre}</strong>? Se eliminarán también todas las etapas e interacciones.
        </p>
      </div>
      <div className="opp-modal__foot">
        <button className="opp-btn opp-btn--ghost" onClick={onCancel}>Cancelar</button>
        <button className="opp-btn opp-btn--danger" onClick={onConfirm}>
          <Trash2 size={14} /> Eliminar
        </button>
      </div>
    </div>
  </div>
);

/* ════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════ */
export const Oportunidades = () => {
  const { toast, ToastContainer }     = useToast();
  const [oportunidades, setOps]       = useState<Oportunidad[]>([]);
  const [clientes, setClientes]       = useState<ClienteOpt[]>([]);
  const [consultores, setConsultores] = useState<ConsultorOpt[]>([]);
  const [loading, setLoading]         = useState(true);
  const [view, setView]               = useState<'list' | 'wizard'>('list');
  const [step, setStep]               = useState(1);
  const [wizard, setWizard]           = useState<Partial<WizardPayload>>(EMPTY);
  const [saving, setSaving]           = useState(false);
  const [toDelete, setToDelete]       = useState<Oportunidad | null>(null);
  const [filterEstatus, setFE]        = useState('');
  const [filterCliente, setFC]        = useState('');
  const [openEDD, setOpenEDD]         = useState(false);
  const [openCDD, setOpenCDD]         = useState(false);

  /* ── Guard: evita doble-disparo por StrictMode ─── */
  const isSaving = useRef(false);

  const setField = (k: keyof WizardPayload, v: any) =>
    setWizard(p => ({ ...p, [k]: v }));

  /* Load */
  const fetchOps = async () => {
    setLoading(true);
    try { setOps(await oportunidadService.getAll()); }
    catch { toast.error('Error al cargar oportunidades'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchOps();
    clienteService.getAll()
      .then(d => setClientes(d.map((c: any) => ({ id: c.id, nombre: c.nombre, empresa: c.empresa }))))
      .catch(() => {});
    consultorService.getAll()
      .then(d => setConsultores(d.map((c: any) => ({ id: c.id, nombre: c.nombre }))))
      .catch(() => {});
  }, []);

  /* Filtered list */
  const filtered = useMemo(() =>
    oportunidades.filter(o =>
      (!filterEstatus || o.estatus === filterEstatus) &&
      (!filterCliente || o.cliente_id === filterCliente)
    ), [oportunidades, filterEstatus, filterCliente]);

  const resetWizard = () => { setView('list'); setStep(1); setWizard(EMPTY); };

  /* Next step */
  const handleNext = () => {
    if (step === 1 && (!wizard.cliente_id || !wizard.nombre_proceso))
      return toast.warning('Cliente y nombre del proceso son requeridos');
    if (step < 5) setStep(s => s + 1);
  };

  /* Save — guard con useRef para evitar doble POST */
  const handleSave = async () => {
    if (isSaving.current) return;
    isSaving.current = true;
    setSaving(true);
    try {
      await oportunidadService.createFull(wizard);
      toast.success('¡Oportunidad guardada correctamente!');
      resetWizard();
      fetchOps();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? err?.response?.data?.message ?? 'Error al guardar');
    } finally {
      setSaving(false);
      isSaving.current = false;
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await oportunidadService.remove(toDelete.id);
      toast.success('Oportunidad eliminada');
      setToDelete(null);
      fetchOps();
    } catch { toast.error('Error al eliminar'); }
  };

  const empresaNombre = (id: string) => clientes.find(c => c.id === id)?.empresa ?? '—';

  /* ── Render ─────────────────────────────────────── */
  return (
    <div className="opp-page">
      <ToastContainer />

      {/* Tabs */}
      <div className="opp-tabs">
        <button className={`opp-tab ${view === 'list' ? 'opp-tab--active' : ''}`}
          onClick={resetWizard}>Pipeline</button>
        <button className={`opp-tab opp-tab--new ${view === 'wizard' ? 'opp-tab--new-active' : ''}`}
          onClick={() => setView('wizard')}>
          <Plus size={14} /> Nueva Oportunidad
        </button>
      </div>

      {/* ── LIST ── */}
      {view === 'list' && (
        <div className="opp-section">
          <div className="opp-section__head">
            <h2 className="opp-section__title">Oportunidades Activas</h2>
            <div className="opp-filters">
              {/* Estatus dropdown */}
              <div className="opp-dropdown" onBlur={() => setOpenEDD(false)} tabIndex={0}>
                <button className="opp-dropdown__btn" onClick={() => setOpenEDD(p => !p)}>
                  {filterEstatus ? lbl(filterEstatus) : 'Todos los estatus'} <ChevronDown size={13} />
                </button>
                {openEDD && (
                  <div className="opp-dropdown__menu">
                    <div className="opp-dropdown__item opp-dropdown__item--active"
                      onMouseDown={() => { setFE(''); setOpenEDD(false); }}>Todos los estatus</div>
                    {ESTATUS_LIST.map(s => (
                      <div key={s} className={`opp-dropdown__item ${filterEstatus === s ? 'opp-dropdown__item--active' : ''}`}
                        onMouseDown={() => { setFE(s); setOpenEDD(false); }}>{lbl(s)}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cliente dropdown */}
              <div className="opp-dropdown" onBlur={() => setOpenCDD(false)} tabIndex={0}>
                <button className="opp-dropdown__btn" onClick={() => setOpenCDD(p => !p)}>
                  {filterCliente ? empresaNombre(filterCliente) : 'Todos los clientes'} <ChevronDown size={13} />
                </button>
                {openCDD && (
                  <div className="opp-dropdown__menu">
                    <div className="opp-dropdown__item opp-dropdown__item--active"
                      onMouseDown={() => { setFC(''); setOpenCDD(false); }}>Todos los clientes</div>
                    {clientes.map(c => (
                      <div key={c.id} className={`opp-dropdown__item ${filterCliente === c.id ? 'opp-dropdown__item--active' : ''}`}
                        onMouseDown={() => { setFC(c.id); setOpenCDD(false); }}>{c.empresa}</div>
                    ))}
                  </div>
                )}
              </div>

              <button className="opp-btn-new" onClick={() => setView('wizard')}>
                <Plus size={14} /> Nueva Oportunidad
              </button>
            </div>
          </div>

          <div className="opp-list">
            {loading ? (
              <div className="opp-empty">Cargando…</div>
            ) : filtered.length === 0 ? (
              <div className="opp-empty">No hay oportunidades con estos filtros</div>
            ) : filtered.map(o => (
              <div key={o.id} className="opp-row">
                <div className="opp-row__dot" />
                <div className="opp-row__info">
                  <span className="opp-row__name">{o.nombre_proceso}</span>
                  <span className="opp-row__meta">
                    {o.accion_responsable}
                  </span>
                  <span className='opp-row__priority'>
                    prioridad: {o.prioridad}
                  </span>

                </div>
                <div className="opp-row__right">
                  <span className='estatus-badge'>{o.tipo_proceso}</span>
                  <span className={`estatus-badge estatus--${o.estatus.toLowerCase().replace(/\s/g,'-').replace(/á/g,'a').replace(/ó/g,'o')}`}>
                    {lbl(o.estatus)}
                  </span>
                </div>
                <div className="opp-row__actions">
                  <button className="action-btn action-btn--edit" onClick={() => toast.info('Edición próximamente')}>
                    <Pencil size={13} /> Editar
                  </button>
                  <button className="action-btn action-btn--del" onClick={() => setToDelete(o)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── WIZARD ── */}
      {view === 'wizard' && (
        <div className="opp-wizard-wrap">
          <div className="opp-wizard">
            <div className="opp-wizard__head">
              <div>
                <h2 className="opp-wizard__title">Nueva Oportunidad</h2>
                <p className="opp-wizard__sub">Complete las etapas del proceso.</p>
              </div>
              <button className="opp-wizard__cancel" onClick={resetWizard}>
                <X size={14} /> Cancelar
              </button>
            </div>

            <StepHeader current={step} />

            {step === 1 && <Step1 d={wizard} set={setField} clientes={clientes} />}
            {step === 2 && <Step2 d={wizard} set={setField} consultores={consultores} />}
            {step === 3 && <Step3 d={wizard} set={setField} consultores={consultores} />}
            {step === 4 && <Step4 d={wizard} set={setField} />}
            {step === 5 && <Step5 d={wizard} set={setField} consultores={consultores} />}

            <div className="opp-wizard__nav">
              {step > 1
                ? <button className="opp-btn opp-btn--ghost" onClick={() => setStep(s => s - 1)}>← Anterior</button>
                : <span />
              }
              {step < 5
                ? <button className="opp-btn opp-btn--primary" onClick={handleNext}>Siguiente →</button>
                : <button className="opp-btn opp-btn--save" onClick={handleSave} disabled={saving}>
                    <Check size={15} />
                    {saving ? 'Guardando…' : '✓ Guardar Oportunidad'}
                  </button>
              }
            </div>
          </div>
        </div>
      )}

      {toDelete && (
        <ConfirmDelete
          nombre={toDelete.nombre_proceso}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
};