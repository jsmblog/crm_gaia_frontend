import { useState, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import { procesoService } from '../../Services/procesoService';
import { proyectoService } from '../../Services/proyectoService';
import { useToast } from '../../Hooks/useToast';
import './Procesos.css';
import type { Proceso, WizardPayload } from '../../Interfaces/i_procesos';
import type { Proyecto } from '../../Interfaces/i_proyecto';
import { EMPTY_WIZARD, STEPS, type Setter } from '../../Constants/procesos';
import { StepHeader } from './StepHeader';
import { DetallePanel } from './DetallePanel';
import { ConfirmDelete } from './components/ConfirmDelete';
import { Creacion } from './Creacion';
import { Levantamiento } from './Levantamiento';
import { EtapaEstimacion } from './EtapaEstimacion';
import { Propuesta } from './Propuesta';
import { Aprobacion } from './Aprobacion';
import { Aprobado } from './Aprobado';
import { EtapaEjecucion } from './EtapaEjecucion';
import { EtapaCierre } from './EtapaCierre';
import { EtapaFacturado } from './EtapaFacturado';
import { EtapaRechazado } from './EtapaRechazado';
import { EtapaStandBy } from './EtapaStandBy';
import { PipelineView } from './PipelineView';
import type { ProyectoSummary, ProcesoLite } from '../../Services/pipelineService';
import { ProyectoDetallePanel } from './components/ProyectoDetallePanel';
import { ProyectoModal } from './components/ProyectoModal';
import { ConfirmDeactivateProyecto } from './components/ConfirmDeactivateProyecto';
import { procesoToWizard, resolveInitialSavedSteps } from './service/procesoToWizard';
import { useWizardCatalogos } from './WizardContext';

export const Procesos = () => {
  const { toast, ToastContainer } = useToast();
  const { reloadProyectos, reloadClientes } = useWizardCatalogos(); // ← nuevas funciones

  const [view, setView] = useState<'list' | 'wizard'>('list');
  const [panel, setPanel] = useState<Proceso | null>(null);
  const [toDelete, setToDelete] = useState<Proceso | null>(null);
  const [panelProyecto, setPanelProyecto] = useState<Proyecto | null>(null);
  const [modalProyecto, setModalProyecto] = useState<'create' | { proyecto: Proyecto; clientePreselect?: string } | null>(null);
  const [toDeleteProyecto, setToDeleteProyecto] = useState<Proyecto | null>(null);

  const [pipelineRefresh, setPipelineRefresh] = useState(0);
  const [step, setStep] = useState(1);
  const [wizard, setWizard] = useState<WizardPayload>({ ...EMPTY_WIZARD });
  const [wizardProcessId, setWizardProcessId] = useState<string | null>(null);
  const [savedSteps, setSavedSteps] = useState<Set<number>>(new Set());
  const [stepSaving, setStepSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const isSaving = useRef(false);
  const setField: Setter = (k, v) => setWizard(p => ({ ...p, [k]: v }));

  // ── Wizard helpers ────────────────────────────────────────
  const resetWizard = () => {
    setView('list'); setStep(1);
    setWizard({ ...EMPTY_WIZARD }); setWizardProcessId(null);
    setSavedSteps(new Set()); setIsEditing(false);
    isSaving.current = false;
  };

  const openEdit = async (p: Proceso) => {
    try {
      const procesoCompleto = await procesoService.getById(p.id);
      setWizard(procesoToWizard(procesoCompleto));
      setWizardProcessId(procesoCompleto.id);
      setSavedSteps(resolveInitialSavedSteps(procesoCompleto));
    } catch {
      setWizard(procesoToWizard(p));
      setWizardProcessId(p.id);
      setSavedSteps(resolveInitialSavedSteps(p));
      toast.warning('No se pudieron cargar todos los datos del proceso');
    }
    setIsEditing(true);
    setStep(1);
    setView('wizard');
    setPanel(null);
  };

  const markSaved = (n: number) => setSavedSteps(prev => new Set([...prev, n]));
  const processCreated = !!wizardProcessId;

  const handleSaveStep1 = async () => {
    if (!wizard.proyecto_id) return toast.warning('Selecciona un proyecto');
    if (!wizard.nombre_proceso) return toast.warning('Nombre del proceso requerido');
    if (!wizard.tipo) return toast.warning('Selecciona la clasificación');
    if (isSaving.current) return;
    isSaving.current = true; setStepSaving(true);
    try {
      const payload = {
        nombre_proceso: wizard.nombre_proceso,
        tipo: wizard.tipo || undefined,
        estatus: wizard.estatus || 'Levantamiento',
        prioridad: wizard.prioridad || undefined,
        herramientas_ids: (wizard.herramientas_ids as string[])?.length ? wizard.herramientas_ids : [],
      };
      if (isEditing && wizardProcessId) {
        await procesoService.update(wizardProcessId, payload);
        toast.success('Proceso actualizado');
      } else {
        const proceso = await procesoService.create(wizard.proyecto_id, payload);
        setWizardProcessId(proceso.id);
        toast.success('¡Proceso creado!');
      }
      markSaved(1); setStep(2);
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje ?? 'Error al guardar');
    } finally { setStepSaving(false); isSaving.current = false; }
  };

  const handleSaveStep2 = async () => {
    if (!wizardProcessId) return toast.warning('Primero guarda el proceso (paso 1)');
    setStepSaving(true);
    try {
      const calls: Promise<any>[] = [];

      if (wizard.lev_consultores_ids.length || wizard.lev_fecha || wizard.lev_observaciones || wizard.lev_proximos_pasos)
        calls.push(procesoService.upsertLevantamiento(wizardProcessId, {
          consultores_ids: wizard.lev_consultores_ids.length ? wizard.lev_consultores_ids : undefined,
          fecha_levantamiento: wizard.lev_fecha || undefined,
          observaciones: wizard.lev_observaciones || undefined,
          proximos_pasos: wizard.lev_proximos_pasos || undefined,
          estado_id: wizard.lev_estado_id || undefined,
        }));

      if (wizard.est_consultores_ids.length || wizard.est_fecha || wizard.est_observaciones || wizard.est_proximos_pasos)
        calls.push(procesoService.upsertEstimacion(wizardProcessId, {
          consultores_ids: wizard.est_consultores_ids.length ? wizard.est_consultores_ids : undefined,
          fecha_estimacion: wizard.est_fecha || undefined,
          observaciones: wizard.est_observaciones || undefined,
          estado_id: wizard.est_estado_id || undefined,
        }));

      if (calls.length === 0) { toast.info('Completa algún campo antes de guardar'); return; }
      await Promise.all(calls);
      markSaved(2); toast.success('Levantamiento guardado'); setStep(3);
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje ?? 'Error');
    } finally { setStepSaving(false); }
  };

  const handleSaveStep3 = async () => {
    if (!wizardProcessId) return toast.warning('Primero guarda el proceso (paso 1)');
    setStepSaving(true);
    try {
      const calls: Promise<any>[] = [];

      if (wizard.est_consultores_ids.length || wizard.est_fecha || wizard.est_observaciones || wizard.est_proximos_pasos)
        calls.push(procesoService.upsertEstimacion(wizardProcessId, {
          consultores_ids: wizard.est_consultores_ids.length ? wizard.est_consultores_ids : undefined,
          fecha_estimacion: wizard.est_fecha || undefined,
          observaciones: wizard.est_observaciones || undefined,
          proximos_pasos: wizard.est_proximos_pasos || undefined,
          estado_id: wizard.est_estado_id || undefined,
        }));

      if (calls.length === 0) { toast.info('Completa algún campo antes de guardar'); return; }
      await Promise.all(calls);
      markSaved(3); toast.success('Estimación guardada'); setStep(4);
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje ?? 'Error');
    } finally { setStepSaving(false); }
  };

  const handleSaveStep4 = async () => {
    if (!wizardProcessId) return toast.warning('Primero guarda (paso 1)');
    setStepSaving(true);
    try {
      await procesoService.upsertPropuesta(wizardProcessId, {
        consultores_ids: wizard.prop_consultores_ids.length ? wizard.prop_consultores_ids : undefined,
        nivel_detalle: wizard.prop_nivel_detalle || undefined,
        fecha_entrega_propuesta: wizard.prop_fecha_entrega || undefined,
        valor_presupuestado: wizard.prop_valor ? +wizard.prop_valor : undefined,
        horas_presupuestadas: wizard.prop_horas ? +wizard.prop_horas : undefined,
        observaciones: wizard.prop_observaciones || undefined,
        horas_gerencia: wizard.prop_horas_gerencia ? +wizard.prop_horas_gerencia : undefined,
        valor_gerencia: wizard.prop_valor_gerencia ? +wizard.prop_valor_gerencia : undefined,
        estado_id: wizard.prop_estado_id || undefined,
      });
      markSaved(4); toast.success('Propuesta guardada'); setStep(5);
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje ?? 'Error');
    } finally { setStepSaving(false); }
  };

  const handleSaveStep5 = async () => {
    if (!wizardProcessId) return toast.warning('Primero guarda el Lead (paso 1)');
    if (wizard.apr_aprobado === 'Rechazado' && !wizard.apr_motivo_rechazo)
      return toast.warning('Motivo de rechazo requerido');
    setStepSaving(true);
    try {
      const calls: Promise<any>[] = [];

      if (wizard.pre_fecha || wizard.pre_resultado)
        calls.push(procesoService.upsertPreliminar(wizardProcessId, {
          fecha_preliminar: wizard.pre_fecha || undefined,
          resultado: wizard.pre_resultado || undefined,
          viable: wizard.pre_viable ?? undefined,
        }));

      if (wizard.apr_aprobado === 'Aprobado' || wizard.apr_aprobado === 'Rechazado')
        calls.push(procesoService.upsertAprobacion(wizardProcessId, {
          aprobado: wizard.apr_aprobado === 'Aprobado',
          fecha_aprobacion: wizard.apr_fecha || undefined,
          motivo_rechazo: wizard.apr_motivo_rechazo || undefined,
          estado_id: wizard.apr_estado_id || undefined,
        }));

      if (calls.length === 0) { toast.info('Completa algún campo antes de guardar'); return; }
      await Promise.all(calls);
      markSaved(5); toast.success('Aprobación guardada'); setStep(6);
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje ?? 'Error');
    } finally { setStepSaving(false); }
  };

  const handleSaveStep6 = async () => {
    if (!wizardProcessId) return toast.warning('Primero guarda el proceso (paso 1)');
    setStepSaving(true);
    try {
      await procesoService.upsertAprobado(wizardProcessId, {
        consultores_ids: wizard.aprobado_consultores_ids?.length ? wizard.aprobado_consultores_ids : undefined,
        fecha_aprobado: wizard.aprobado_fecha || undefined,
        observaciones: wizard.aprobado_observaciones || undefined,
        proximos_pasos: wizard.aprobado_proximos_pasos || undefined,
        estado_id: wizard.aprobado_estado_id || undefined,
      });
      markSaved(6);
      setStep(7);
      toast.success('Aprobado guardado');
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje ?? 'Error');
    } finally { setStepSaving(false); }
  };

  const handleSaveStep7 = async () => {
    if (!wizardProcessId) return toast.warning('Primero guarda el Lead (paso 1)');
    setStepSaving(true);
    try {
      const calls: Promise<any>[] = [];

      if ((wizard as any).neg_consultores_ids?.length || (wizard as any).neg_fecha || (wizard as any).neg_observaciones)
        calls.push(procesoService.upsertEjecucion(wizardProcessId, {
          consultores_ids: wizard.ejec_consultores_ids.length ? wizard.ejec_consultores_ids : undefined,
          fecha_inicio: wizard.ejec_fecha_inicio,
          fecha_fin: wizard.ejec_fecha_fin || undefined,
          horas_reales: wizard.ejec_horas_reales ? +wizard.ejec_horas_reales : undefined,
          observaciones: wizard.ejec_observaciones || undefined,
          proximos_pasos: wizard.ejec_proximos_pasos || undefined,
          estado_id: wizard.ejec_estado_id || undefined,
        }));

      await Promise.all(calls);
      markSaved(7);
      setStep(8);
      toast.success(isEditing ? 'Proceso actualizado' : '¡Proceso completado!');
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje ?? 'Error');
    } finally { setStepSaving(false); }
  };

  const handleSaveStep8 = async () => {
    if (!wizardProcessId) return toast.warning('Primero guarda el proceso (paso 1)');
    setStepSaving(true);
    try {
      await procesoService.upsertCierre(wizardProcessId, {
        consultores_ids: wizard.cierre_consultores_ids?.length ? wizard.cierre_consultores_ids : undefined,
        fecha_cierre: wizard.cierre_fecha || undefined,
        observaciones: wizard.cierre_observaciones || undefined,
        proximos_pasos: wizard.cierre_proximos_pasos || undefined,
        estado_id: wizard.cierre_estado_id || undefined,
      });
      markSaved(8);
      setStep(9);
      toast.success('Cierre guardado');
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje ?? 'Error');
    } finally { setStepSaving(false); }
  };

  const handleSaveStep9 = async () => {
    if (!wizardProcessId) return toast.warning('Primero guarda el proceso (paso 1)');
    setStepSaving(true);
    try {
      await procesoService.upsertFacturado(wizardProcessId, {
        consultores_ids: wizard.facturado_consultores_ids?.length ? wizard.facturado_consultores_ids : undefined,
        numero_factura: wizard.facturado_numero_factura || undefined,
        fecha_factura: wizard.facturado_fecha_factura || undefined,
        valor_facturado: wizard.facturado_valor ? +wizard.facturado_valor : undefined,
        fecha_vencimiento: wizard.facturado_fecha_vencimiento || undefined,
        estado_cobro: wizard.facturado_estado_cobro || undefined,
        observaciones: wizard.facturado_observaciones || undefined,
        proximos_pasos: wizard.facturado_proximos_pasos || undefined,
        estado_id: wizard.facturado_estado_id || undefined,
      });
      markSaved(9);
      setStep(10);
      toast.success('Facturado guardado');
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje ?? 'Error');
    } finally { setStepSaving(false); }
  };

  const handleSaveStep10 = async () => {
    if (!wizardProcessId) return toast.warning('Primero guarda el proceso (paso 1)');
    setStepSaving(true);
    try {
      await procesoService.upsertRechazado(wizardProcessId, {
        consultores_ids: wizard.rechazado_consultores_ids?.length ? wizard.rechazado_consultores_ids : undefined,
        fecha_rechazo: wizard.rechazado_fecha || undefined,
        motivo_categoria: wizard.rechazado_motivo_categoria || undefined,
        motivo_detalle: wizard.rechazado_motivo_detalle || undefined,
        decision_por: wizard.rechazado_decision_por || undefined,
        recuperable: wizard.rechazado_recuperable || undefined,
        fecha_recontacto: wizard.rechazado_fecha_recontacto || undefined,
        observaciones: wizard.rechazado_observaciones || undefined,
        proximos_pasos: wizard.rechazado_proximos_pasos || undefined,
        estado_id: wizard.rechazado_estado_id || undefined,
      });
      markSaved(10);
      toast.success('Rechazado guardado');
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje ?? 'Error');
    } finally { setStepSaving(false); }
  };

  const handleSaveStep11 = async () => {
    if (!wizardProcessId) return toast.warning('Primero guarda el proceso (paso 1)');
    setStepSaving(true);
    try {
      await procesoService.upsertStandBy(wizardProcessId, {
        consultores_ids: wizard.standby_consultores_ids?.length ? wizard.standby_consultores_ids : undefined,
        fecha_inicio_pausa: wizard.standby_fecha_inicio || undefined,
        fecha_estimada_retorno: wizard.standby_fecha_retorno || undefined,
        motivo_categoria: wizard.standby_motivo_categoria || undefined,
        motivo_detalle: wizard.standby_motivo_detalle || undefined,
        decision_por: wizard.standby_decision_por || undefined,
        condicion_reactivar: wizard.standby_condicion_reactivar || undefined,
        observaciones: wizard.standby_observaciones || undefined,
        proximos_pasos: wizard.standby_proximos_pasos || undefined,
        estado_id: wizard.standby_estado_id || undefined,
      });
      markSaved(11);
      toast.success('Stand By guardado');
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje ?? 'Error');
    } finally { setStepSaving(false); }
  };

  const handleFinish = () => {
    setPipelineRefresh(prev => prev + 1);
    toast.success('Proceso guardado.');
    resetWizard();
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await procesoService.remove(toDelete.id);
      toast.success('Proceso eliminado');
      setToDelete(null);
      if (panel?.id === toDelete.id) setPanel(null);
      setPipelineRefresh(prev => prev + 1);
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const handleRefresh = (updated: Proceso) => {
    setPanel(updated);
    setPipelineRefresh(prev => prev + 1);
  };

  const handleDeleteProyecto = async () => {
    if (!toDeleteProyecto) return;
    try {
      await proyectoService.remove(toDeleteProyecto.id);
      toast.success('Proyecto desactivado');
      setToDeleteProyecto(null);
      if (panelProyecto?.id === toDeleteProyecto.id) setPanelProyecto(null);
      // Recargar proyectos y clientes después de eliminar
      await Promise.all([reloadProyectos(), reloadClientes()]);
      setPipelineRefresh(prev => prev + 1);
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje ?? 'Error');
    }
  };

  const handleProyectoRefresh = (updated: Proyecto) => {
    setPanelProyecto(updated);
    setPipelineRefresh(prev => prev + 1);
  };

  const handleNuevoProyecto = (clienteId?: string) => {
    setModalProyecto(clienteId ? { clientePreselect: clienteId } as any : 'create');
  };

  const handleOpenPanelProyecto = async (proyectoSummary: ProyectoSummary) => {
    try {
      const fullProyecto = await proyectoService.getById(proyectoSummary.id);
      setPanel(null);
      setPanelProyecto(fullProyecto);
    } catch (err) {
      toast.error('Error al cargar el proyecto');
    }
  };

  const handleEditProyecto = async (proyectoSummary: ProyectoSummary) => {
    try {
      const fullProyecto = await proyectoService.getById(proyectoSummary.id);
      setModalProyecto({ proyecto: fullProyecto });
    } catch (err) {
      toast.error('Error al cargar el proyecto para editar');
    }
  };

  const handleSelectProceso = async (procesoLite: ProcesoLite) => {
    try {
      const fullProceso = await procesoService.getById(procesoLite.id);
      setPanelProyecto(null);
      setPanel(fullProceso);
    } catch (err) {
      toast.error('Error al cargar el proceso');
    }
  };

  const handleEditProceso = async (procesoId: string) => {
    try {
      const fullProceso = await procesoService.getById(procesoId);
      await openEdit(fullProceso);
    } catch (err) {
      toast.error('Error al cargar el proceso para editar');
    }
  };

  const handleDelProceso = (procesoLite: ProcesoLite) => {
    setToDelete({ id: procesoLite.id, nombre_proceso: procesoLite.nombre_proceso } as Proceso);
  };

  const handleDelProyecto = (proyectoSummary: ProyectoSummary) => {
    setToDeleteProyecto({ id: proyectoSummary.id, nombre: proyectoSummary.nombre } as Proyecto);
  };

  const handleNuevoProceso = (proyectoId?: string) => {
  setIsEditing(false);
  setWizard({
    ...EMPTY_WIZARD,
    proyecto_id: proyectoId || '',
  });
  setWizardProcessId(null);
  setSavedSteps(new Set());
  setStep(1);
  setView('wizard');
};

  return (
    <div className="opp-page">
      <ToastContainer />

      <div className="opp-tabs">
        <button className={`opp-tab ${view === 'list' ? 'opp-tab--active' : ''}`} onClick={resetWizard}>
          Pipeline
        </button>
        <button
          className={`opp-tab opp-tab--new ${view === 'wizard' ? 'opp-tab--new-active' : ''}`}
          onClick={() => { setIsEditing(false); setView('wizard'); }}
        >
          <Plus size={14} /> Nuevo Proceso
        </button>
      </div>

      {view === 'list' && (
        <PipelineView
          activePanelProcesoId={panel?.id ?? null}
          onNuevoProyecto={handleNuevoProyecto}
          onEditProyecto={handleEditProyecto}
          onDelProyecto={handleDelProyecto}
          onDetProyecto={handleOpenPanelProyecto}
          onSelectProceso={handleSelectProceso}
          onEditProceso={handleEditProceso}
          onDelProceso={handleDelProceso}
          onNuevoProceso={handleNuevoProceso}
          refreshSignal={pipelineRefresh}
        />
      )}

      {view === 'wizard' && (
        <div className="opp-wizard-wrap">
          <div className="opp-wizard">
            <div className="opp-wizard__head">
              <div>
                <h2 className="opp-wizard__title">
                  {isEditing ? 'Editar Proceso' : 'Nuevo Proceso'}
                </h2>
                <p className="opp-wizard__sub">
                  {isEditing ? `Editando: ${wizard.nombre_proceso || '…'}` : 'Guarda cada etapa conforme avances.'}
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
            <div className="wizard-step-nav">
              {STEPS.map((label, i) => {
                const idx = i + 1;
                const canNav = idx === 1 || processCreated || isEditing;
                return (
                  <button key={label}
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
              <Creacion
                d={wizard} set={setField}
                onSave={handleSaveStep1} saving={stepSaving}
                saved={savedSteps.has(1)} isEditing={isEditing}
              />
            )}
            {step === 2 && (
              <Levantamiento
                d={wizard}
                set={setField}
                wizardProcessId={wizardProcessId}
                onSave={handleSaveStep2}
                saving={stepSaving}
                saved={savedSteps.has(2)}
                locked={!processCreated && !isEditing}
              />
            )}

            {step === 3 && (
              <EtapaEstimacion
                d={wizard}
                set={setField}
                wizardProcessId={wizardProcessId}
                onSave={handleSaveStep3}
                saving={stepSaving}
                saved={savedSteps.has(3)}
                locked={!processCreated && !isEditing}
              />
            )}
            {step === 4 && (
              <Propuesta
                d={wizard} set={setField}
                wizardProcessId={wizardProcessId}
                onSave={handleSaveStep4} saving={stepSaving}
                saved={savedSteps.has(4)} locked={!processCreated && !isEditing}
              />
            )}
            {step === 5 && (
              <Aprobacion
                d={wizard} set={setField}
                wizardProcessId={wizardProcessId}
                onSave={handleSaveStep5} saving={stepSaving}
                saved={savedSteps.has(5)} locked={!processCreated && !isEditing}
              />
            )}
            {step === 6 && (
              <Aprobado
                d={wizard} set={setField}
                wizardProcessId={wizardProcessId}
                onSave={handleSaveStep6} saving={stepSaving}
                saved={savedSteps.has(6)} locked={!processCreated && !isEditing}
              />
            )}
            {
              step === 7 && (
                <EtapaEjecucion
                  d={wizard} set={setField}
                  wizardProcessId={wizardProcessId}
                  onSave={handleSaveStep7} saving={stepSaving}
                  saved={savedSteps.has(7)} locked={!processCreated && !isEditing}
                />
              )
            }
            {
              step === 8 && (
                <EtapaCierre
                  d={wizard} set={setField}
                  wizardProcessId={wizardProcessId}
                  onSave={handleSaveStep8} saving={stepSaving}
                  saved={savedSteps.has(8)} locked={!processCreated && !isEditing}
                />
              )
            }
            {
              step === 9 && (
                <EtapaFacturado
                  d={wizard} set={setField}
                  wizardProcessId={wizardProcessId}
                  onSave={handleSaveStep9} saving={stepSaving}
                  saved={savedSteps.has(9)} locked={!processCreated && !isEditing}
                />
              )
            }
            {
              step === 10 && (
                <EtapaRechazado
                  d={wizard} set={setField}
                  wizardProcessId={wizardProcessId}
                  onSave={handleSaveStep10} saving={stepSaving}
                  saved={savedSteps.has(10)} locked={!processCreated && !isEditing}
                />
              )
            }
            {
              step === 11 && (
                <EtapaStandBy
                  d={wizard} set={setField}
                  wizardProcessId={wizardProcessId}
                  onSave={handleSaveStep11} saving={stepSaving}
                  saved={savedSteps.has(11)} locked={!processCreated && !isEditing}
                />
              )
            }

            <div className="opp-wizard__nav">
              {step > 1 && <button className="opp-btn opp-btn--ghost" onClick={() => setStep(s => s - 1)}>← Anterior</button>}
              {step < 11
                ? <button className="opp-btn opp-btn--primary" disabled={step > 1 ? (!processCreated && !isEditing) : false}
                  onClick={() => { if (step === 1 && !processCreated && !isEditing) toast.info('Guarda el Lead antes de continuar'); else setStep(s => s + 1); }}>
                  Siguiente →
                </button>
                : <button className="opp-btn opp-btn--save" onClick={handleFinish}>Guardar y cerrar</button>
              }
            </div>
          </div>
        </div>
      )}

      {panel && (
        <DetallePanel
          proceso={panel}
          onClose={() => setPanel(null)}
          onRefresh={handleRefresh}
          onEdit={openEdit}
        />
      )}
      {panelProyecto && (
        <ProyectoDetallePanel
          proyecto={panelProyecto}
          onClose={() => setPanelProyecto(null)}
          onProyectoRefresh={handleProyectoRefresh}
        />
      )}
      {modalProyecto && (
        <ProyectoModal
          initial={modalProyecto === 'create' ? null
            : ('proyecto' in modalProyecto ? modalProyecto.proyecto : null)}
          clientePreselect={
            modalProyecto !== 'create' && 'clientePreselect' in modalProyecto
              ? (modalProyecto as any).clientePreselect
              : undefined
          }
          onClose={() => setModalProyecto(null)}
          onSaved={async () => {
            await Promise.all([reloadProyectos(), reloadClientes()]);
            setPipelineRefresh(prev => prev + 1);
          }}
        />
      )}
      {toDelete && (
        <ConfirmDelete
          nombre={toDelete.nombre_proceso}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
      {toDeleteProyecto && (
        <ConfirmDeactivateProyecto
          nombre={toDeleteProyecto.nombre}
          onConfirm={handleDeleteProyecto}
          onCancel={() => setToDeleteProyecto(null)}
        />
      )}
    </div>
  );
};