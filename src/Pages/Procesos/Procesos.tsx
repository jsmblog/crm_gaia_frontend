import { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, X, ChevronDown, Pencil, Trash2, Folder, DollarSign, ChevronRight, Cpu } from 'lucide-react';
import { procesoService } from '../../Services/procesoService';
import { proyectoService } from '../../Services/proyectoService';
import { consultorService } from '../../Services/consultorService';
import { herramientaService } from '../../Services/herramientaService';
import { useToast } from '../../Hooks/useToast';
import './Procesos.css';
import type { Proceso, WizardPayload, EstatusProceso } from '../../Interfaces/i_procesos';
import type { Proyecto } from '../../Interfaces/i_proyecto';
import type { HerramientaRpa } from '../../Interfaces/i_herramienta';
import {
  EMPTY_WIZARD, ESTATUS_LIST, STEPS,
  estatusClass, fmtMoney, type Opt,
} from '../../Constants/procesos';
import { StepHeader } from './StepHeader';
import { Step1 } from './Step1';
import { Step2 } from './Step2';
import { Step3 } from './Step3';
import { Step4 } from './Step4';
import { Step5 } from './Step5';
import { DetallePanel } from './DetallePanel';
import { ConfirmDelete } from './ConfirmDelete';

// ── Map Proceso → WizardPayload (edit mode pre-fill) ──────────
const TODAY = new Date().toISOString().split('T')[0];

const isoToDate = (s?: string | null) => s ? s.split('T')[0] : '';

const procesoToWizard = (p: Proceso): WizardPayload => ({
  proyecto_id:             p.proyecto_id,
  nombre_proceso:          p.nombre_proceso,
  tipo:                    p.tipo || '',
  tipo_proceso:            p.tipo_proceso || '',
  probabilidad_aprobacion: p.probabilidad_aprobacion || '',
  prioridad:               p.prioridad || '',
  fecha_lead:              isoToDate(p.fecha_lead) || TODAY,
  plazo_inicio:            isoToDate(p.plazo_inicio),
  herramienta_rpa_id:      p.herramienta_rpa_id || '',
  accion_responsable:      p.accion_responsable || '',
  estatus:                 p.estatus,
  // Levantamiento
  lev_consultores_ids:     p.levantamiento?.consultores?.map(c => c.id) || [],
  lev_fecha:               isoToDate(p.levantamiento?.fecha_levantamiento) || TODAY,
  lev_observaciones:       p.levantamiento?.observaciones || '',
  // Estimación
  est_consultores_ids:     p.estimacion?.consultores?.map(c => c.id) || [],
  est_fecha:               isoToDate(p.estimacion?.fecha_estimacion) || TODAY,
  est_observaciones:       p.estimacion?.observaciones || '',
  // Propuesta
  prop_consultores_ids:    p.propuesta?.consultores?.map(c => c.id) || [],
  prop_nivel_detalle:      p.propuesta?.nivel_detalle || '',
  prop_fecha_entrega:      isoToDate(p.propuesta?.fecha_entrega_propuesta),
  prop_valor:              p.propuesta?.valor_presupuestado || '',
  prop_horas:              p.propuesta?.horas_presupuestadas || '',
  prop_observaciones:      p.propuesta?.observaciones || '',
  // Preliminar
  pre_fecha:               isoToDate(p.preliminar?.fecha_preliminar),
  pre_resultado:           p.preliminar?.resultado || '',
  pre_viable:              p.preliminar?.viable ?? null,
  // Aprobación
  apr_aprobado:            p.aprobacion ? (p.aprobacion.aprobado ? 'Aprobado' : 'Rechazado') : '',
  apr_fecha:               isoToDate(p.aprobacion?.fecha_aprobacion) || TODAY,
  apr_motivo_rechazo:      p.aprobacion?.motivo_rechazo || '',
  // Ejecución
  ejec_consultores_ids:         p.ejecucion?.consultores?.map(c => c.id) || [],
  ejec_consultor_responsable_id: p.ejecucion?.consultor_responsable_id || '',
  ejec_fecha_inicio:             isoToDate(p.ejecucion?.fecha_inicio),
  ejec_fecha_fin:                isoToDate(p.ejecucion?.fecha_fin),
  ejec_horas_reales:             p.ejecucion?.horas_reales || '',
  ejec_observaciones:            p.ejecucion?.observaciones || '',
  // Interacción
  int_tipo: '', int_consultor_id: '', int_descripcion: '', int_fecha: TODAY,
});

// Calcula qué steps ya tienen datos (para edit mode)
const resolveInitialSavedSteps = (p: Proceso): Set<number> => {
  const s = new Set<number>();
  s.add(1); // el proceso base ya existe
  if (p.levantamiento || p.estimacion) s.add(2);
  if (p.propuesta) s.add(3);
  if (p.preliminar || p.aprobacion) s.add(4);
  if (p.ejecucion) s.add(5);
  return s;
};

// ─────────────────────────────────────────────────────────────
// Project Card — muestra un proyecto con sus procesos
// ─────────────────────────────────────────────────────────────
interface ProjectCardProps {
  proyecto: Proyecto;
  procesos: Proceso[];
  activePanel: string | null;
  onSelect: (p: Proceso) => void;
  onEdit: (p: Proceso) => void;
  onDelete: (p: Proceso) => void;
}

const ProjectCard = ({ proyecto, procesos, activePanel, onSelect, onEdit, onDelete }: ProjectCardProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const totalValor = procesos.reduce((acc, p) => acc + (p.propuesta?.valor_presupuestado ?? 0), 0);

  return (
    <div className="proj-card">
      <div className="proj-card__head" onClick={() => setCollapsed(c => !c)}>
        <div className="proj-card__head-left">
          <Folder size={16} className="proj-card__icon" />
          <div>
            <span className="proj-card__name">{proyecto.nombre}</span>
            <span className="proj-card__client">{proyecto.cliente?.nombre}</span>
          </div>
        </div>
        <div className="proj-card__head-right">
          {totalValor > 0 && (
            <span className="proj-card__valor">
              <DollarSign size={11} />
              {fmtMoney(totalValor)}
            </span>
          )}
          <span className="proj-card__count">{procesos.length} proceso{procesos.length !== 1 ? 's' : ''}</span>
          <ChevronRight size={14} className={`proj-card__chevron ${collapsed ? '' : 'proj-card__chevron--open'}`} />
        </div>
      </div>

      {!collapsed && (
        <div className="proj-card__body">
          {procesos.map(p => (
            <div
              key={p.id}
              className={`proc-row ${activePanel === p.id ? 'proc-row--active' : ''}`}
              onClick={() => onSelect(p)}
            >
              <div className={`proc-row__dot proc-dot--${estatusClass(p.estatus)}`} />
              <div className="proc-row__info">
                <span className="proc-row__name">{p.nombre_proceso}</span>
                <div className="proc-row__meta">
                  <span className={`estatus-badge estatus--${estatusClass(p.tipo_proceso)}`}>{p.tipo_proceso}</span>
                  <span className={`estatus-badge estatus--${estatusClass(p.estatus)}`}>{p.estatus}</span>
                  {p.herramienta && (
                    <span className="proc-row__hw"><Cpu size={10} />{p.herramienta.nombre}</span>
                  )}
                </div>
                {p.accion_responsable && (
                  <span className="proc-row__action">{p.accion_responsable}</span>
                )}
              </div>
              <div className="proc-row__right">
                {p.propuesta?.valor_presupuestado && (
                  <span className="opp-row__value-pill">
                    <DollarSign size={10} />{fmtMoney(p.propuesta.valor_presupuestado)}
                  </span>
                )}
                <div className="proc-row__actions" onClick={e => e.stopPropagation()}>
                  <button className="action-btn action-btn--edit" title="Editar" onClick={() => onEdit(p)}>
                    <Pencil size={12} />
                  </button>
                  <button className="action-btn action-btn--del" title="Eliminar" onClick={() => onDelete(p)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────────────────────
export const Procesos = () => {
  const { toast, ToastContainer } = useToast();
  const [procesos, setProcesos]       = useState<Proceso[]>([]);
  const [proyectos, setProyectos]     = useState<Proyecto[]>([]);
  const [consultores, setConsultores] = useState<Opt[]>([]);
  const [herramientas, setHerramientas] = useState<HerramientaRpa[]>([]);
  const [loading, setLoading]         = useState(true);

  // Vista
  const [view, setView]               = useState<'list' | 'wizard'>('list');
  const [panel, setPanel]             = useState<Proceso | null>(null);
  const [toDelete, setToDelete]       = useState<Proceso | null>(null);

  // Filtros
  const [filterEstatus, setFE]        = useState('');
  const [filterProyecto, setFP]       = useState('');
  const [openEDD, setOpenEDD]         = useState(false);
  const [openPDD, setOpenPDD]         = useState(false);

  // Wizard state
  const [step, setStep]               = useState(1);
  const [wizard, setWizard]           = useState<WizardPayload>({ ...EMPTY_WIZARD });
  const [wizardProcessId, setWizardProcessId] = useState<string | null>(null);
  const [savedSteps, setSavedSteps]   = useState<Set<number>>(new Set());
  const [stepSaving, setStepSaving]   = useState(false);
  const [isEditing, setIsEditing]     = useState(false);
  const isSaving = useRef(false);

  const setField = (k: keyof WizardPayload, v: any): void =>
    setWizard(p => ({ ...p, [k]: v }));

  const fetchProcesos = async () => {
    setLoading(true);
    try {
      const res = await procesoService.getAll({ limit: 200 });
      setProcesos(res.data);
    } catch { toast.error('Error al cargar procesos'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchProcesos();
    proyectoService.getAll({ activo: true, limit: 200 }).then(r => setProyectos(r.data)).catch(() => {});
    consultorService.getAll({ activo: true, limit: 100 }).then(r => setConsultores(r.data)).catch(() => {});
    herramientaService.getAll({ activo: true, limit: 100 }).then(r => setHerramientas(r.data)).catch(() => {});
  }, []);

  // Filtrar y agrupar por proyecto
  const filtered = useMemo(() =>
    procesos.filter(p =>
      (!filterEstatus || p.estatus === filterEstatus) &&
      (!filterProyecto || p.proyecto_id === filterProyecto)
    ), [procesos, filterEstatus, filterProyecto]);

  const groupedByProject = useMemo(() => {
    const map = new Map<string, { proyecto: Proyecto; procesos: Proceso[] }>();
    filtered.forEach(p => {
      if (!map.has(p.proyecto_id)) {
        const proy = proyectos.find(pr => pr.id === p.proyecto_id) ?? ({ id: p.proyecto_id, nombre: p.proyecto.nombre, cliente: { nombre: '' } } as any);
        map.set(p.proyecto_id, { proyecto: proy, procesos: [] });
      }
      map.get(p.proyecto_id)!.procesos.push(p);
    });
    return Array.from(map.values());
  }, [filtered, proyectos]);

  // ── Wizard helpers ──────────────────────────────────────────

  const resetWizard = () => {
    setView('list'); setStep(1);
    setWizard({ ...EMPTY_WIZARD });
    setWizardProcessId(null);
    setSavedSteps(new Set());
    setIsEditing(false);
    isSaving.current = false;
  };

  const openEdit = (p: Proceso) => {
    setWizard(procesoToWizard(p));
    setWizardProcessId(p.id);
    setSavedSteps(resolveInitialSavedSteps(p));
    setIsEditing(true);
    setStep(1);
    setView('wizard');
    setPanel(null);
  };

  const markSaved = (n: number) => setSavedSteps(prev => new Set([...prev, n]));
  const processCreated = !!wizardProcessId;

  // ── Step save handlers ──────────────────────────────────────

  const handleSaveStep1 = async () => {
    if (!wizard.proyecto_id) return toast.warning('Selecciona un proyecto');
    if (!wizard.nombre_proceso) return toast.warning('Nombre del proceso requerido');
    if (!wizard.tipo) return toast.warning('Selecciona la clasificación');
    if (!wizard.tipo_proceso) return toast.warning('Tipo de proceso requerido');
    if (isSaving.current) return;
    isSaving.current = true; setStepSaving(true);
    try {
      const payload = {
        nombre_proceso:          wizard.nombre_proceso,
        tipo:                    wizard.tipo           || undefined,
        tipo_proceso:            wizard.tipo_proceso   as any,
        estatus:                 wizard.estatus        || 'Lead',
        prioridad:               wizard.prioridad      || undefined,
        probabilidad_aprobacion: wizard.probabilidad_aprobacion || undefined,
        plazo_inicio:            wizard.plazo_inicio   || undefined,
        herramienta_rpa_id:      wizard.herramienta_rpa_id || undefined,
        accion_responsable:      wizard.accion_responsable  || undefined,
      };
      if (isEditing && wizardProcessId) {
        await procesoService.update(wizardProcessId, payload);
        toast.success('Lead actualizado');
      } else {
        const proceso = await procesoService.create(wizard.proyecto_id, payload);
        setWizardProcessId(proceso.id);
        toast.success('¡Proceso creado! Continúa completando las etapas');
      }
      markSaved(1);
      setStep(2);
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje ?? 'Error al guardar');
    } finally { setStepSaving(false); isSaving.current = false; }
  };

  const handleSaveStep2 = async () => {
    if (!wizardProcessId) return toast.warning('Primero guarda el Lead (paso 1)');
    setStepSaving(true);
    try {
      const calls: Promise<any>[] = [];
      if (wizard.lev_consultores_ids.length || wizard.lev_fecha)
        calls.push(procesoService.upsertLevantamiento(wizardProcessId, {
          consultores_ids:     wizard.lev_consultores_ids.length ? wizard.lev_consultores_ids : undefined,
          fecha_levantamiento: wizard.lev_fecha || undefined,
          observaciones:       wizard.lev_observaciones || undefined,
        }));
      if (wizard.est_consultores_ids.length || wizard.est_fecha)
        calls.push(procesoService.upsertEstimacion(wizardProcessId, {
          consultores_ids:  wizard.est_consultores_ids.length ? wizard.est_consultores_ids : undefined,
          fecha_estimacion: wizard.est_fecha || undefined,
          observaciones:    wizard.est_observaciones || undefined,
        }));
      if (calls.length === 0) { toast.info('Completa algún campo antes de guardar'); return; }
      await Promise.all(calls);
      markSaved(2); toast.success('Levantamiento y Estimación guardados');
      setStep(3);
    } catch (err: any) { toast.error(err?.response?.data?.mensaje ?? 'Error'); }
    finally { setStepSaving(false); }
  };

  const handleSaveStep3 = async () => {
    if (!wizardProcessId) return toast.warning('Primero guarda el Lead (paso 1)');
    setStepSaving(true);
    try {
      await procesoService.upsertPropuesta(wizardProcessId, {
        consultores_ids:         wizard.prop_consultores_ids.length ? wizard.prop_consultores_ids : undefined,
        nivel_detalle:           wizard.prop_nivel_detalle || undefined,
        fecha_entrega_propuesta: wizard.prop_fecha_entrega || undefined,
        valor_presupuestado:     wizard.prop_valor ? +wizard.prop_valor : undefined,
        horas_presupuestadas:    wizard.prop_horas ? +wizard.prop_horas : undefined,
        observaciones:           wizard.prop_observaciones || undefined,
      });
      markSaved(3); toast.success('Propuesta guardada');
      setStep(4);
    } catch (err: any) { toast.error(err?.response?.data?.mensaje ?? 'Error'); }
    finally { setStepSaving(false); }
  };

  const handleSaveStep4 = async () => {
    if (!wizardProcessId) return toast.warning('Primero guarda el Lead (paso 1)');
    if (wizard.apr_aprobado === 'Rechazado' && !wizard.apr_motivo_rechazo)
      return toast.warning('Motivo de rechazo requerido');
    setStepSaving(true);
    try {
      const calls: Promise<any>[] = [];
      if (wizard.pre_fecha || wizard.pre_resultado)
        calls.push(procesoService.upsertPreliminar(wizardProcessId, {
          fecha_preliminar: wizard.pre_fecha || undefined,
          resultado:        wizard.pre_resultado || undefined,
          viable:           wizard.pre_viable ?? undefined,
        }));
      if (wizard.apr_aprobado === 'Aprobado' || wizard.apr_aprobado === 'Rechazado')
        calls.push(procesoService.upsertAprobacion(wizardProcessId, {
          aprobado:         wizard.apr_aprobado === 'Aprobado',
          fecha_aprobacion: wizard.apr_fecha || undefined,
          motivo_rechazo:   wizard.apr_motivo_rechazo || undefined,
        }));
      if (calls.length === 0) { toast.info('Completa algún campo antes de guardar'); return; }
      await Promise.all(calls);
      markSaved(4); toast.success('Preliminar y Aprobación guardados');
      setStep(5);
    } catch (err: any) { toast.error(err?.response?.data?.mensaje ?? 'Error'); }
    finally { setStepSaving(false); }
  };

  const handleSaveStep5 = async () => {
    if (!wizardProcessId) return toast.warning('Primero guarda el Lead (paso 1)');
    setStepSaving(true);
    try {
      const calls: Promise<any>[] = [];
      if (wizard.ejec_fecha_inicio)
        calls.push(procesoService.upsertEjecucion(wizardProcessId, {
          consultores_ids:          wizard.ejec_consultores_ids.length ? wizard.ejec_consultores_ids : undefined,
          consultor_responsable_id: wizard.ejec_consultor_responsable_id || undefined,
          fecha_inicio:             wizard.ejec_fecha_inicio,
          fecha_fin:                wizard.ejec_fecha_fin || undefined,
          horas_reales:             wizard.ejec_horas_reales ? +wizard.ejec_horas_reales : undefined,
          observaciones:            wizard.ejec_observaciones || undefined,
        }));
      if (wizard.int_consultor_id && wizard.int_fecha)
        calls.push(procesoService.crearInteraccion(wizardProcessId, {
          consultor_id: wizard.int_consultor_id,
          tipo:         wizard.int_tipo || undefined,
          descripcion:  wizard.int_descripcion || undefined,
          fecha:        wizard.int_fecha,
        }));
      if (calls.length === 0) { toast.info('Completa algún campo antes de guardar'); return; }
      await Promise.allSettled(calls);
      markSaved(5);
      toast.success(isEditing ? 'Proceso actualizado exitosamente' : '¡Proceso completado!');
      fetchProcesos();
      resetWizard();
    } catch (err: any) { toast.error(err?.response?.data?.mensaje ?? 'Error'); }
    finally { setStepSaving(false); }
  };

  const handleFinish = () => {
    fetchProcesos();
    toast.success('Proceso guardado. Puedes seguir completando etapas cuando tengas la información.');
    resetWizard();
  };

  const stepSaveHandlers = [handleSaveStep1, handleSaveStep2, handleSaveStep3, handleSaveStep4, handleSaveStep5];

  // ── Delete ──────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await procesoService.remove(toDelete.id);
      toast.success('Proceso eliminado');
      setToDelete(null);
      if (panel?.id === toDelete.id) setPanel(null);
      fetchProcesos();
    } catch { toast.error('Error al eliminar'); }
  };

  const handleRefresh = (updated: Proceso) => {
    setProcesos(prev => prev.map(p => p.id === updated.id ? updated : p));
    setPanel(updated);
  };

  // ────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────

  return (
    <div className="opp-page">
      <ToastContainer />

      {/* Tabs */}
      <div className="opp-tabs">
        <button className={`opp-tab ${view === 'list' ? 'opp-tab--active' : ''}`} onClick={resetWizard}>
          Pipeline
        </button>
        <button className={`opp-tab opp-tab--new ${view === 'wizard' ? 'opp-tab--new-active' : ''}`}
          onClick={() => { setIsEditing(false); setView('wizard'); }}>
          <Plus size={14} /> Nuevo Proceso
        </button>
      </div>

      {/* ── LIST (Project Cards) ── */}
      {view === 'list' && (
        <div className="opp-section">
          <div className="opp-section__head">
            <div>
              <h2 className="opp-section__title">Pipeline de Procesos</h2>
              <p className="opp-section__sub">{filtered.length} proceso{filtered.length !== 1 ? 's' : ''} · {groupedByProject.length} proyecto{groupedByProject.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="opp-filters">
              {/* Filtro estatus */}
              <div className="opp-dropdown" onBlur={() => setOpenEDD(false)} tabIndex={0}>
                <button className="opp-dropdown__btn" onClick={() => setOpenEDD(p => !p)}>
                  {filterEstatus || 'Todos los estatus'} <ChevronDown size={13} />
                </button>
                {openEDD && (
                  <div className="opp-dropdown__menu">
                    <div className="opp-dropdown__item opp-dropdown__item--active"
                      onMouseDown={() => { setFE(''); setOpenEDD(false); }}>Todos</div>
                    {ESTATUS_LIST.map(s => (
                      <div key={s} className={`opp-dropdown__item ${filterEstatus === s ? 'opp-dropdown__item--active' : ''}`}
                        onMouseDown={() => { setFE(s); setOpenEDD(false); }}>{s}</div>
                    ))}
                  </div>
                )}
              </div>
              {/* Filtro proyecto */}
              <div className="opp-dropdown" onBlur={() => setOpenPDD(false)} tabIndex={0}>
                <button className="opp-dropdown__btn" onClick={() => setOpenPDD(p => !p)}>
                  {filterProyecto ? proyectos.find(p => p.id === filterProyecto)?.nombre ?? 'Proyecto' : 'Todos los proyectos'}
                  <ChevronDown size={13} />
                </button>
                {openPDD && (
                  <div className="opp-dropdown__menu">
                    <div className="opp-dropdown__item opp-dropdown__item--active"
                      onMouseDown={() => { setFP(''); setOpenPDD(false); }}>Todos</div>
                    {proyectos.map(p => (
                      <div key={p.id} className={`opp-dropdown__item ${filterProyecto === p.id ? 'opp-dropdown__item--active' : ''}`}
                        onMouseDown={() => { setFP(p.id); setOpenPDD(false); }}>{p.nombre}</div>
                    ))}
                  </div>
                )}
              </div>
              <button className="opp-btn-new" onClick={() => setView('wizard')}>
                <Plus size={14} /> Nuevo Proceso
              </button>
            </div>
          </div>

          {loading ? (
            <div className="opp-empty">Cargando…</div>
          ) : groupedByProject.length === 0 ? (
            <div className="opp-empty">No hay procesos con estos filtros</div>
          ) : (
            <div className="proj-list">
              {groupedByProject.map(({ proyecto, procesos: ps }) => (
                <ProjectCard
                  key={proyecto.id}
                  proyecto={proyecto}
                  procesos={ps}
                  activePanel={panel?.id ?? null}
                  onSelect={p => setPanel(panel?.id === p.id ? null : p)}
                  onEdit={openEdit}
                  onDelete={setToDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── WIZARD ── */}
      {view === 'wizard' && (
        <div className="opp-wizard-wrap">
          <div className="opp-wizard">
            <div className="opp-wizard__head">
              <div>
                <h2 className="opp-wizard__title">
                  {isEditing ? 'Editar Proceso' : 'Nuevo Proceso'}
                </h2>
                <p className="opp-wizard__sub">
                  {isEditing
                    ? `Editando: ${wizard.nombre_proceso || '…'}`
                    : 'Guarda cada etapa conforme avances.'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {processCreated && (
                  <button className="opp-wizard__finish-btn" onClick={handleFinish}>
                    Cerrar y guardar avance
                  </button>
                )}
                <button className="opp-wizard__cancel" onClick={resetWizard}>
                  <X size={14} /> Cancelar
                </button>
              </div>
            </div>

            <StepHeader current={step} savedSteps={savedSteps} processCreated={processCreated || isEditing} />

            {/* Step navigation tabs */}
            <div className="wizard-step-nav">
              {STEPS.map((label, i) => {
                const idx = i + 1;
                const canNav = idx === 1 || processCreated || isEditing;
                return (
                  <button
                    key={label}
                    className={[
                      'wizard-step-tab',
                      step === idx ? 'wizard-step-tab--active' : '',
                      savedSteps.has(idx) ? 'wizard-step-tab--saved' : '',
                      !canNav ? 'wizard-step-tab--disabled' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => canNav && setStep(idx)}
                    disabled={!canNav}
                  >
                    {label}
                    {savedSteps.has(idx) && <span className="wizard-step-tab__dot" />}
                  </button>
                );
              })}
            </div>

            {step === 1 && (
              <Step1 d={wizard} set={setField} proyectos={proyectos} herramientas={herramientas}
                onSave={handleSaveStep1} saving={stepSaving} saved={savedSteps.has(1)} isEditing={isEditing} />
            )}
            {step === 2 && (
              <Step2 d={wizard} set={setField} consultores={consultores}
                onSave={handleSaveStep2} saving={stepSaving} saved={savedSteps.has(2)}
                locked={!processCreated && !isEditing} />
            )}
            {step === 3 && (
              <Step3 d={wizard} set={setField} consultores={consultores} proyectos={proyectos}
                onSave={handleSaveStep3} saving={stepSaving} saved={savedSteps.has(3)}
                locked={!processCreated && !isEditing} />
            )}
            {step === 4 && (
              <Step4 d={wizard} set={setField}
                onSave={handleSaveStep4} saving={stepSaving} saved={savedSteps.has(4)}
                locked={!processCreated && !isEditing} />
            )}
            {step === 5 && (
              <Step5 d={wizard} set={setField} consultores={consultores}
                onSave={handleSaveStep5} saving={stepSaving} saved={savedSteps.has(5)}
                locked={!processCreated && !isEditing} />
            )}

            {/* Footer nav */}
            <div className="opp-wizard__nav">
              {step > 1
                ? <button className="opp-btn opp-btn--ghost" onClick={() => setStep(s => s - 1)}>← Anterior</button>
                : <span />
              }
              {step < 5
                ? <button
                    className="opp-btn opp-btn--primary"
                    disabled={step > 1 ? (!processCreated && !isEditing) : false}
                    onClick={() => {
                      if (step === 1 && !processCreated && !isEditing) {
                        toast.info('Guarda el Lead antes de continuar');
                      } else {
                        setStep(s => s + 1);
                      }
                    }}>
                    Siguiente →
                  </button>
                : <button className="opp-btn opp-btn--save" onClick={handleFinish}>
                    Guardar y cerrar
                  </button>
              }
            </div>
          </div>
        </div>
      )}

      {panel && (
        <DetallePanel
          proceso={panel}
          consultores={consultores}
          onClose={() => setPanel(null)}
          onRefresh={handleRefresh}
          onEdit={openEdit}
        />
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