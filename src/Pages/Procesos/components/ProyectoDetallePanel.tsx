import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "../../../Hooks/useToast";
import type { AsignarHerramientaPayload, EstadoHerramienta, Proyecto } from "../../../Interfaces/i_proyecto";
import type { HerramientaRpa } from "../../../Interfaces/i_herramienta";
import type { Consultor } from "../../../Interfaces/i_consultor";
import type { Proceso as ProcModel } from '../../../Interfaces/i_procesos';
import { estadoService, type Estado } from "../../../Services/estadoService";
import { procesoService } from "../../../Services/procesoService";
import { areaService } from "../../../Services/areaService";
import { herramientaService } from "../../../Services/herramientaService";
import { consultorService } from "../../../Services/consultorService";
import { rolService } from "../../../Services/rolService";
import { clienteService } from "../../../Services/clienteService";
import { proyectoService } from "../../../Services/proyectoService";
import { Activity, AlertCircle, Check, Clock, Cpu, DollarSign, GitBranch, Lock, Pencil, PlusCircle, Shield, Tag, Target, User, UserPlus, Users, Wrench, X } from "lucide-react";
type PanelTab = 'estado' | 'areas' | 'personal' | 'herramientas' | 'procesos';
interface ItemBasico { id: string; nombre: string; }
const PANEL_MIN_WIDTH = 340;
const PANEL_MAX_WIDTH = 780;
const PANEL_DEFAULT_WIDTH = 400;
const EMPTY_HERRA: AsignarHerramientaPayload = {
  herramienta_rpa_id: '', asignado_por: '', cod_licencia: '', fecha_expiracion: '',
};
export const ProyectoDetallePanel = ({ proyecto, onClose, onProyectoRefresh }: {
  proyecto: Proyecto; onClose: () => void;
  onProyectoRefresh: (updated: Proyecto) => void;
}) => {
  const { toast, ToastContainer } = useToast();
  const [tab, setTab] = useState<PanelTab>('estado');
  const [data, setData] = useState<Proyecto>(proyecto);

  const [panelWidth, setPanelWidth] = useState(PANEL_DEFAULT_WIDTH);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(PANEL_DEFAULT_WIDTH);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = panelWidth;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  }, [panelWidth]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const delta = startX.current - e.clientX;
      setPanelWidth(Math.min(PANEL_MAX_WIDTH, Math.max(PANEL_MIN_WIDTH, startWidth.current + delta)));
    };
    const onMouseUp = () => {
      if (!isResizing.current) return;
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    isResizing.current = true;
    startX.current = e.touches[0].clientX;
    startWidth.current = panelWidth;
  }, [panelWidth]);

  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (!isResizing.current) return;
      const delta = startX.current - e.touches[0].clientX;
      setPanelWidth(Math.min(PANEL_MAX_WIDTH, Math.max(PANEL_MIN_WIDTH, startWidth.current + delta)));
    };
    const onTouchEnd = () => { isResizing.current = false; };
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  const [catAreas, setCatAreas] = useState<ItemBasico[]>([]);
  const [catHerras, setCatHerras] = useState<HerramientaRpa[]>([]);
  const [catConsultores, setCatConsultores] = useState<Consultor[]>([]);
  const [catRoles, setCatRoles] = useState<ItemBasico[]>([]);
  const [personal, setPersonal] = useState<ItemBasico[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [procesos, setProcesos] = useState<ProcModel[]>([]);
  const [loadingProcesos, setLoadingProcesos] = useState(false);

  const [nuevoEstado, setNuevoEstado] = useState<Estado | ''>('');
  const [nuevoConsultor, setNuevoConsultor] = useState('');
  const [nuevoObs, setNuevoObs] = useState('');
  const [savingEstado, setSavingEstado] = useState(false);

  const [newAreaId, setNewAreaId] = useState('');
  const [nuevoPersonalId, setNuevoPersonalId] = useState('');
  const [nuevoRolId, setNuevoRolId] = useState('');

  const [showFormHerra, setShowFormHerra] = useState(false);
  const [formHerra, setFormHerra] = useState<AsignarHerramientaPayload>({ ...EMPTY_HERRA });
  const [loadingHerra, setLoadingHerra] = useState(false);
  const [editingHerraId, setEditingHerraId] = useState<string | null>(null);
  const [estadoEdit, setEstadoEdit] = useState<EstadoHerramienta>('Activa');
  const [motivoEdit, setMotivoEdit] = useState('');

  const fetchProcesos = async () => {
    setLoadingProcesos(true);
    try {
      const res = await procesoService.getAll({ proyectoId: proyecto.id, limit: 100 });
      setProcesos(res.data);
    } catch { } finally { setLoadingProcesos(false); }
  };

  useEffect(() => {
    areaService.getAll({ activo: true, limit: 100 }).then(r => setCatAreas(r.data)).catch(() => { });
    herramientaService.getAll({ activo: true, limit: 100 }).then(r => setCatHerras(r.data)).catch(() => { });
    consultorService.getAll({ activo: true, limit: 100 }).then(r => setCatConsultores(r.data)).catch(() => { });
    rolService.getAll({ activo: true, limit: 100 }).then(r => setCatRoles(r.data)).catch(() => { });
    clienteService.getUsuarios(proyecto.cliente_id)
      .then(u => setPersonal(
        u.filter((x: any) => x.activo).map((x: any) => ({
          id: x.id,
          nombre: `${x.nombre}${x.cargo ? ` · ${x.cargo}` : ''}`,
        }))
      )).catch(() => { });
    estadoService.getAll().then(r => setEstados(r.map((e: any) => e.nombre as unknown as Estado))).catch(() => { });
    fetchProcesos();
  }, [proyecto.cliente_id]);

  const refrescar = async () => {
    const updated = await proyectoService.getById(data.id);
    setData(updated); onProyectoRefresh(updated);
  };

  const horasProcesos = useMemo(() =>
    procesos.reduce((acc, p) => acc + (Number(p.propuesta?.horas_presupuestadas) || 0), 0), [procesos]);
  const costoProcesos = useMemo(() =>
    procesos.reduce((acc, p) => acc + (Number(p.propuesta?.valor_presupuestado) || 0), 0), [procesos]);

  const areasDisponibles = catAreas.filter(a => !data.areas.some(da => da.id === a.id));

  const handleAgregarArea = async () => {
    if (!newAreaId) return toast.warning('Selecciona un área');
    try { await proyectoService.agregarAreas(data.id, [newAreaId]); setNewAreaId(''); await refrescar(); toast.success('Área agregada'); }
    catch (err: any) { toast.error(err?.response?.data?.mensaje ?? 'Error'); }
  };
  const handleQuitarArea = async (areaId: string) => {
    try { await proyectoService.quitarArea(data.id, areaId); await refrescar(); toast.success('Área removida'); }
    catch (err: any) { toast.error(err?.response?.data?.mensaje ?? 'Error'); }
  };
  const handleAgregarPersonal = async () => {
    if (!nuevoPersonalId) return toast.warning('Selecciona una persona');
    if (!nuevoRolId) return toast.warning('Selecciona un rol');
    try {
      await proyectoService.agregarMiembro(data.id, { usuario_cliente_id: nuevoPersonalId, rol_id: nuevoRolId });
      setNuevoPersonalId(''); setNuevoRolId(''); await refrescar(); toast.success('Personal agregado');
    } catch (err: any) { toast.error(err?.response?.data?.mensaje ?? 'Error'); }
  };
  const handleQuitarPersonal = async (id: string) => {
    try { await proyectoService.quitarMiembro(data.id, id); await refrescar(); toast.success('Personal removido'); }
    catch (err: any) { toast.error(err?.response?.data?.mensaje ?? 'Error'); }
  };

  const setH = (k: keyof AsignarHerramientaPayload, v: string) =>
    setFormHerra(p => ({ ...p, [k]: v }));
  const herrasYaAsignadas = new Set(data.herramientas.map(h => h.herramienta_rpa_id));
  const herrasDisponibles = catHerras.filter(h => !herrasYaAsignadas.has(h.id));

  const handleAsignar = async () => {
    if (!formHerra.herramienta_rpa_id) return toast.warning('Selecciona una herramienta');
    if (!formHerra.asignado_por) return toast.warning('Selecciona el consultor responsable');
    setLoadingHerra(true);
    try {
      await proyectoService.asignarHerramienta(data.id, {
        ...formHerra,
        cod_licencia: formHerra.cod_licencia || undefined,
        fecha_expiracion: formHerra.fecha_expiracion || undefined,
      });
      setFormHerra({ ...EMPTY_HERRA }); setShowFormHerra(false);
      await refrescar(); toast.success('Herramienta asignada');
    } catch (err: any) { toast.error(err?.response?.data?.mensaje ?? 'Error al asignar'); }
    finally { setLoadingHerra(false); }
  };

  const handleCambiarEstadoHerramienta = async (asignacionId: string) => {
    try {
      await proyectoService.cambiarEstadoHerramienta(data.id, asignacionId, estadoEdit, motivoEdit.trim() || undefined);
      setEditingHerraId(null); setMotivoEdit(''); await refrescar(); toast.success('Estado actualizado');
    } catch (err: any) { toast.error(err?.response?.data?.mensaje ?? 'Error'); }
  };

  const tarifasProyecto = [
    { label: 'Hora desarrollo', value: data.precio_hora_desarrollo, pct: false },
    { label: 'Hora soporte', value: data.precio_hora_soporte, pct: false },
    { label: 'Hora cambio', value: data.precio_hora_cambio, pct: false },
    { label: '% Gobierno', value: data.porcentaje_gobierno, pct: true },
  ].filter(t => t.value != null);

  return (
    <>
      <ToastContainer />
      <div className="panel-backdrop" onClick={onClose} />
      <aside className="detalle-panel" style={{ width: panelWidth }}>

        <div
          className="dpanel__resize-handle"
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          title="Arrastra para ajustar el ancho"
        >
          <div className="dpanel__resize-grip" />
        </div>

        <div className="dpanel__head">
          <div className="dpanel__info">
            <span className={`dpanel__estado-badge dpanel__estado-badge--${data.estado_actual?.nombre?.toLowerCase().replace(/\s+/g, '')}`}>
              <Activity size={10} /> {data.estado_actual?.nombre ?? (data.activo ? 'Activo' : 'Pendiente')}
            </span>
            <h3 className="dpanel__title">{data.nombre}</h3>
            <p className="dpanel__sub">{data.cliente.nombre} · <span>{data.cliente.empresa}</span></p>
            {data.descripcion && <p className="dpanel__desc">{data.descripcion}</p>}
            {tarifasProyecto.length > 0 && (
              <div className="dpanel__tarifas-snap">
                {tarifasProyecto.map(t => (
                  <span key={t.label} className={`dpanel__tarifa-chip${t.label === 'Hora desarrollo' ? ' dpanel__tarifa-chip--dev' : ''}`}>
                    {t.label}: {t.pct
                      ? `${Number(t.value).toFixed(2)}%`
                      : `$${Number(t.value).toLocaleString('es-EC', { minimumFractionDigits: 2 })}/h`}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button className="modal__close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="dpanel__tabs">
          {([
            { key: 'estado' as PanelTab, icon: <GitBranch size={12} />, label: 'Estado', count: null },
            { key: 'procesos' as PanelTab, icon: <Target size={12} />, label: 'Procesos', count: procesos.length },
            { key: 'areas' as PanelTab, icon: <Tag size={12} />, label: 'Áreas', count: data.areas.length },
            { key: 'personal' as PanelTab, icon: <Users size={12} />, label: 'Usuarios', count: data.miembros.length },
            { key: 'herramientas' as PanelTab, icon: <Wrench size={12} />, label: 'Herramientas', count: data.herramientas.length },
          ]).map(t => (
            <button key={t.key}
              className={`dpanel__tab ${tab === t.key ? 'dpanel__tab--active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.icon} {t.label}
              {t.count !== null && <span className="dpanel__tab-count">{t.count}</span>}
            </button>
          ))}
        </div>

        <div className="dpanel__body">
          {/* ══ ESTADO ══ */}
          {tab === 'estado' && (
            <div className="dpanel__section">
              {(() => {
                const esTerminal = ['Cerrado', 'Cancelado'].includes(data.estado_actual?.nombre ?? '');
                return (
                  <div className={`timeline-form ${esTerminal ? 'timeline-form--locked' : ''}`}>
                    <p className="step-section-title" style={{ margin: 0 }}>
                      {esTerminal
                        ? `PROYECTO ${(data.estado_actual?.nombre ?? '').toUpperCase()} — SIN MÁS CAMBIOS`
                        : 'REGISTRAR NUEVO ESTADO'}
                    </p>
                    {esTerminal ? (
                      <p className="timeline-locked-msg">
                        <Lock size={12} /> Estado terminal. Usa <strong>"Deshacer"</strong> si fue un error.
                      </p>
                    ) : (
                      <>
                        <div className="timeline-form__row">
                          <select className="mfield__input mfield__select" value={String(nuevoEstado)}
                            onChange={e => setNuevoEstado(e.target.value as unknown as Estado)}>
                            <option value="">— Selecciona estado —</option>
                            {estados.filter(s => s !== data.estado_actual).map(s => (
                              <option key={String(s)} value={String(s)}>{String(s)}</option>
                            ))}
                          </select>
                          <select className="mfield__input mfield__select" value={nuevoConsultor}
                            onChange={e => setNuevoConsultor(e.target.value)}>
                            <option value="">— Consultor —</option>
                            {catConsultores.map(c => (
                              <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
                          </select>
                        </div>
                        <textarea
                          className="mfield__input mfield__textarea timeline-form__obs"
                          placeholder="Observación (opcional)…" rows={2}
                          value={nuevoObs} onChange={e => setNuevoObs(e.target.value)}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            className="btn-dpanel-add"
                            disabled={!nuevoEstado || savingEstado}
                            onClick={async () => {
                              if (!nuevoEstado) return;
                              setSavingEstado(true);
                              try {
                                await proyectoService.registrarEstado(data.id, {
                                  estado: nuevoEstado,
                                  consultor_id: nuevoConsultor || undefined,
                                  observacion: nuevoObs.trim() || undefined,
                                });
                                setNuevoEstado(''); setNuevoConsultor(''); setNuevoObs('');
                                await refrescar(); toast.success(`Estado → ${nuevoEstado}`);
                              } catch (err: any) {
                                toast.error(err?.response?.data?.mensaje ?? 'Error');
                              } finally { setSavingEstado(false); }
                            }}
                          >
                            <Check size={13} /> {savingEstado ? 'Guardando…' : 'Registrar'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}

              {(data.historial_estados ?? []).length === 0 ? (
                <div className="dpanel__empty"><GitBranch size={28} strokeWidth={1.2} /><p>Sin historial de estados</p></div>
              ) : (
                <ul className="timeline">
                  {[...(data.historial_estados ?? [])].reverse().map((e, idx, arr) => {
                    const esFinal = idx === 0;
                    return (
                      <li key={e.id} className={`tl-item ${esFinal ? 'tl-item--current' : ''}`}>
                        <div className="tl-connector">
                          <div className={`tl-dot tl-dot--${e.estado?.nombre}`}>
                            {esFinal ? <Activity size={10} /> : <Check size={9} />}
                          </div>
                          {idx < arr.length - 1 && <div className="tl-line" />}
                        </div>
                        <div className="tl-content">
                          <div className="tl-content__head">
                            <span className={`tl-badge tl-badge--${e.estado?.nombre}`}>{e.estado?.nombre}</span>
                            <span className="tl-fecha">
                              {new Date(e.fecha).toLocaleDateString('es-EC', {
                                day: '2-digit', month: 'short', year: 'numeric',
                              })}
                            </span>
                            {esFinal && (data.historial_estados ?? []).length > 1 && (
                              <button className="tl-del" title="Deshacer último cambio"
                                onClick={async () => {
                                  try {
                                    await proyectoService.eliminarUltimoEstado(data.id, e.id);
                                    await refrescar(); toast.success('Último estado eliminado');
                                  } catch (err: any) {
                                    toast.error(err?.response?.data?.mensaje ?? 'Error');
                                  }
                                }}><X size={11} /></button>
                            )}
                          </div>
                          {e.consultor && <p className="tl-consultor"><User size={10} /> {e.consultor.nombre}</p>}
                          {e.observacion && <p className="tl-obs">{e.observacion}</p>}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {/* ══ PROCESOS ══ */}
          {tab === 'procesos' && (
            <div className="dpanel__section">
              <div className="proc-resumen">
                <div className="proc-resumen__col">
                  <span className="proc-resumen__label">Procesos</span>
                  <span className="proc-resumen__val">{procesos.length}</span>
                </div>
                <div className="proc-resumen__sep" />
                <div className="proc-resumen__col">
                  <span className="proc-resumen__label">Horas extra</span>
                  <span className="proc-resumen__val proc-resumen__val--accent">+{horasProcesos} h</span>
                </div>
                <div className="proc-resumen__sep" />
                <div className="proc-resumen__col">
                  <span className="proc-resumen__label">Costo extra</span>
                  <span className="proc-resumen__val proc-resumen__val--money">
                    +${costoProcesos.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              {loadingProcesos ? (
                <div className="dpanel__empty"><Target size={24} strokeWidth={1.2} /><p>Cargando…</p></div>
              ) : procesos.length === 0 ? (
                <div className="dpanel__empty"><Target size={28} strokeWidth={1.2} /><p>Sin procesos registrados</p></div>
              ) : (
                <ul className="proc-list">
                  {procesos.map(p => {
                    const horas = Number(p.propuesta?.horas_presupuestadas) || 0;
                    const valor = Number(p.propuesta?.valor_presupuestado) || 0;
                    const sk = (p.estatus ?? '').toLowerCase().replace(/\s+/g, '-')
                      .replace(/[áéíóú]/g, (c: string) => ({ á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' }[c] ?? c));
                    return (
                      <li key={p.id} className="proc-item">
                        <div className="proc-item__head">
                          <div className="proc-item__name-wrap">
                            <span className="proc-item__name">{p.nombre_proceso}</span>
                            {p.tipo && <span className="proc-item__tipo">{p.tipo}</span>}
                          </div>
                          <span className={`estatus-badge estatus--${sk}`}>{p.estatus}</span>
                        </div>
                        <div className="proc-item__meta">
                          {p.prioridad && (
                            <span className={`proc-item__chip proc-item__chip--prio proc-item__chip--prio-${(p.prioridad ?? '').toLowerCase().replace(/\s+/g, '')}`}>
                              {p.prioridad}
                            </span>
                          )}
                          {p.herramienta && <span className="proc-item__chip"><Cpu size={9} /> {p.herramienta.nombre}</span>}
                        </div>
                        {(horas > 0 || valor > 0) && (
                          <div className="proc-item__horas">
                            {horas > 0 && <span className="proc-item__horas-badge"><Clock size={10} /> {horas} h</span>}
                            {valor > 0 && (
                              <span className="proc-item__horas-badge proc-item__horas-badge--money">
                                <DollarSign size={10} /> ${valor.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                              </span>
                            )}
                          </div>
                        )}
                        {p.accion_responsable && <p className="proc-item__accion"><User size={10} /> {p.accion_responsable}</p>}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {/* ══ ÁREAS ══ */}
          {tab === 'areas' && (
            <div className="dpanel__section">
              {!data.activo ? (
                <div className="dpanel__notice dpanel__notice--locked">
                  <Lock size={13} /><span>Proyecto <strong>inactivo</strong>. Actívalo para gestionar áreas.</span>
                </div>
              ) : areasDisponibles.length > 0 ? (
                <div className="dpanel__add-row">
                  <select className="mfield__input mfield__select dpanel__select" value={newAreaId} onChange={e => setNewAreaId(e.target.value)}>
                    <option value="">Selecciona un área…</option>
                    {areasDisponibles.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                  </select>
                  <button className="btn-dpanel-add" onClick={handleAgregarArea}><PlusCircle size={14} /> Agregar</button>
                </div>
              ) : null}
              {data.areas.length === 0
                ? <div className="dpanel__empty"><Tag size={28} strokeWidth={1.2} /><p>Sin áreas asignadas</p></div>
                : <ul className="chip-list">
                  {data.areas.map(a => (
                    <li key={a.id} className="chip">
                      <Tag size={11} /> {a.nombre}
                      {data.activo && (
                        <button className="chip__remove" onClick={() => handleQuitarArea(a.id)}><X size={10} /></button>
                      )}
                    </li>
                  ))}
                </ul>
              }
            </div>
          )}

          {/* ══ PERSONAL ══ */}
          {tab === 'personal' && (
            <div className="dpanel__section">
              <p className="dpanel__hint"><User size={11} /> Personal del cliente en este proyecto</p>
              {!data.activo ? (
                <div className="dpanel__notice dpanel__notice--locked">
                  <Lock size={13} /><span>Proyecto <strong>inactivo</strong>. Actívalo para asignar personal.</span>
                </div>
              ) : personal.length === 0 ? (
                <div className="dpanel__notice dpanel__notice--warn">
                  <AlertCircle size={13} />
                  <span>El cliente <strong>{data.cliente.nombre}</strong> no tiene usuarios.</span>
                </div>
              ) : catRoles.length === 0 ? (
                <div className="dpanel__notice dpanel__notice--warn">
                  <AlertCircle size={13} /><span>No hay roles configurados.</span>
                </div>
              ) : (
                <div className="dpanel__add-col">
                  <div className="dpanel__add-row">
                    <select className="mfield__input mfield__select dpanel__select" value={nuevoPersonalId} onChange={e => setNuevoPersonalId(e.target.value)}>
                      <option value="">— Persona del cliente —</option>
                      {personal.map(u => {
                        const ya = data.miembros.some(m => m.id === u.id);
                        return <option key={u.id} value={u.id} disabled={ya}>{u.nombre}{ya ? ' (ya asignado)' : ''}</option>;
                      })}
                    </select>
                    <select className="mfield__input mfield__select dpanel__select" value={nuevoRolId} onChange={e => setNuevoRolId(e.target.value)}>
                      <option value="">— Rol en el proyecto —</option>
                      {catRoles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                    </select>
                  </div>
                  <button
                    className="btn-dpanel-add"
                    onClick={handleAgregarPersonal}
                    disabled={!nuevoPersonalId || !nuevoRolId}
                  >
                 <UserPlus size={14} /> Agregar personal
                  </button>
                </div>
              )}
              {data.miembros.length === 0 ? (
                <div className="dpanel__empty" style={{ minHeight: 100 }}>
                  <Users size={24} strokeWidth={1.2} /><p>Sin personal asignado</p>
                </div>
              ) : (
                <ul className="ulist">
                  {data.miembros.map(m => {
                    const rolNombre = m.proyecto_usuario_rol?.rol_id
                      ? catRoles.find(r => r.id === m.proyecto_usuario_rol.rol_id)?.nombre : null;
                    return (
                      <li key={m.id} className="ulist__item">
                        <div className="ulist__avatar">{m.nombre.charAt(0).toUpperCase()}</div>
                        <div className="ulist__data">
                          <span className="ulist__name">{m.nombre}</span>
                          {rolNombre && <span className="ulist__rol"><Shield size={10} /> {rolNombre}</span>}
                          {m.cargo && <span className="ulist__meta">{m.cargo}</span>}
                          {m.email && <span className="ulist__meta">{m.email}</span>}
                        </div>
                        <button
                          className="action-btn action-btn--del"
                          onClick={() => handleQuitarPersonal(m.id)}
                          style={{ visibility: data.activo ? 'visible' : 'hidden' }}
                        ><X size={12} /></button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {/* ══ HERRAMIENTAS ══ */}
          {tab === 'herramientas' && (
            <div className="dpanel__section">
              {!data.activo ? (
                <div className="dpanel__notice dpanel__notice--locked">
                  <Lock size={13} /><span>Proyecto <strong>inactivo</strong>. Actívalo para asignar herramientas.</span>
                </div>
              ) : !showFormHerra ? (
                <button className="btn-dpanel-add btn-dpanel-add--outline" onClick={() => setShowFormHerra(true)}>
                  <PlusCircle size={14} /> Asignar herramienta RPA
                </button>
              ) : (
                <div className="herra-form">
                  <div className="herra-form__head">
                    <span className="herra-form__title">Nueva asignación</span>
                    <button className="chip__remove" onClick={() => { setShowFormHerra(false); setFormHerra({ ...EMPTY_HERRA }); }}><X size={11} /></button>
                  </div>
                  <div className="mfield">
                    <label className="mfield__label">Herramienta <span className="mfield__req">*</span></label>
                    <select className="mfield__input mfield__select" value={formHerra.herramienta_rpa_id} onChange={e => setH('herramienta_rpa_id', e.target.value)}>
                      <option value="">— Selecciona —</option>
                      {herrasDisponibles.map(h => (
                        <option key={h.id} value={h.id}>
                          {h.nombre}{h.fabricante ? ` · ${h.fabricante}` : ''}{h.version ? ` v${h.version}` : ''}
                        </option>
                      ))}
                      {herrasDisponibles.length === 0 && <option disabled>— Todas ya asignadas —</option>}
                    </select>
                  </div>
                  <div className="mfield">
                    <label className="mfield__label">Asignado por <span className="mfield__req">*</span></label>
                    <select className="mfield__input mfield__select" value={formHerra.asignado_por} onChange={e => setH('asignado_por', e.target.value)}>
                      <option value="">— Consultor responsable —</option>
                      {catConsultores.map(c => <option key={c.id} value={c.id}>{c.nombre} · {c.rol}</option>)}
                    </select>
                  </div>
                  <div className="modal__row">
                    <div className="mfield">
                      <label className="mfield__label">Código de licencia</label>
                      <input className="mfield__input" placeholder="Ej: LIC-2024-001" value={formHerra.cod_licencia ?? ''} onChange={e => setH('cod_licencia', e.target.value)} />
                    </div>
                    <div className="mfield">
                      <label className="mfield__label">Fecha de expiración</label>
                      <input className="mfield__input" type="date" value={formHerra.fecha_expiracion ?? ''} onChange={e => setH('fecha_expiracion', e.target.value)} />
                    </div>
                  </div>
                  <div className="herra-form__actions">
                    <button className="modal__btn modal__btn--ghost modal__btn--sm" onClick={() => { setShowFormHerra(false); setFormHerra({ ...EMPTY_HERRA }); }}>Cancelar</button>
                    <button className="modal__btn modal__btn--primary modal__btn--sm" onClick={handleAsignar} disabled={loadingHerra}>
                      <Check size={13} />{loadingHerra ? 'Asignando…' : 'Asignar'}
                    </button>
                  </div>
                </div>
              )}

              {data.herramientas.length === 0 ? (
                <div className="dpanel__empty"><Wrench size={28} strokeWidth={1.2} /><p>Sin herramientas asignadas</p></div>
              ) : (
                <ul className="tool-list">
                  {data.herramientas.map(h => {
                    const editing = editingHerraId === h.id;
                    const hoy = new Date();
                    const diasTotales = h.fecha_expiracion
                      ? Math.ceil((new Date(h.fecha_expiracion).getTime() - hoy.getTime()) / 86400000) : null;
                    const diasClass = diasTotales === null ? '' : diasTotales <= 0 ? 'dias--critico' : diasTotales <= 7 ? 'dias--critico' : diasTotales <= 30 ? 'dias--alerta' : 'dias--ok';
                    return (
                      <li key={h.id} className="tool-item">
                        <div className="tool-item__head">
                          <div className="tool-item__icon"><Cpu size={14} /></div>
                          <div className="tool-item__info">
                            <span className="tool-item__name">{h.herramienta.nombre}</span>
                            {h.herramienta.fabricante && <span className="tool-item__fab">{h.herramienta.fabricante}</span>}
                            {h.cod_licencia && <span className="tool-item__lic">Lic: {h.cod_licencia}</span>}
                            <span className="tool-item__date">Desde: {new Date(h.fecha_asignacion).toLocaleDateString('es-EC')}</span>
                            {h.fecha_expiracion && <span className="tool-item__exp">Expira: {new Date(h.fecha_expiracion).toLocaleDateString('es-EC')}</span>}
                          </div>
                          <div className="tool-item__right">
                            <span className={`badge ${h.estado === 'Activa' ? 'badge--activo' : h.estado === 'Suspendida' ? 'badge--warn' : 'badge--inactivo'}`}>{h.estado}</span>
                            {data.activo && (
                              <button
                                className={`tool-edit-btn ${editing ? 'tool-edit-btn--active' : ''}`}
                                onClick={() => {
                                  if (editing) { setEditingHerraId(null); setMotivoEdit(''); }
                                  else { setEditingHerraId(h.id); setEstadoEdit(h.estado); setMotivoEdit(''); }
                                }}
                              >
                                {editing ? <X size={12} /> : <Pencil size={12} />}
                              </button>
                            )}
                          </div>
                        </div>
                        {diasTotales !== null && (
                          <div className={`dias-restantes ${diasClass}`}>
                            {diasTotales > 0
                              ? <><Clock size={11} /> {diasTotales} día{diasTotales !== 1 ? 's' : ''} restante{diasTotales !== 1 ? 's' : ''}</>
                              : <><AlertCircle size={11} /> Expirada hace {Math.abs(diasTotales)} día{Math.abs(diasTotales) !== 1 ? 's' : ''}</>}
                          </div>
                        )}
                        {editing && (
                          <div className="tool-item__edit">
                            <div className="tool-item__edit-fields">
                              <select
                                className="mfield__input mfield__select dpanel__select--sm"
                                value={estadoEdit}
                                onChange={e => setEstadoEdit(e.target.value as EstadoHerramienta)}
                              >
                                {(['Activa', 'Suspendida', 'Expirada', 'Revocada'] as EstadoHerramienta[]).map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                              {estadoEdit !== 'Activa' && (
                                <textarea
                                  className="mfield__input mfield__textarea tool-motivo"
                                  placeholder="Motivo (opcional)…" rows={2}
                                  value={motivoEdit} onChange={e => setMotivoEdit(e.target.value)}
                                />
                              )}
                            </div>
                            <button className="btn-dpanel-add btn-dpanel-add--sm" onClick={() => handleCambiarEstadoHerramienta(h.id)}>
                              <Check size={12} /> Guardar
                            </button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};