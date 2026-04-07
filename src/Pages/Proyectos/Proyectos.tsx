import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Search, Plus, Pencil, Trash2, X, Check,
  FolderOpen, ChevronRight, Tag, Users, Wrench,
  UserPlus, PlusCircle, Cpu, User, AlertCircle,
  Clock, Shield, Lock, Activity, GitBranch,
  Target, TrendingUp, DollarSign, ArrowRight,
} from 'lucide-react';
import { proyectoService } from '../../Services/proyectoService';
import { clienteService } from '../../Services/clienteService';
import { herramientaService } from '../../Services/herramientaService';
import { consultorService } from '../../Services/consultorService';
import { areaService } from '../../Services/areaService';
import { rolService } from '../../Services/rolService';
import { procesoService } from '../../Services/procesoService';
import { useToast } from '../../Hooks/useToast';
import './Proyectos.css';
import type {
  Proyecto, ProyectoPayload, ProyectoUpdatePayload,
  EstadoHerramienta, AsignarHerramientaPayload,
  EstadoProyectoEnum,
} from '../../Interfaces/i_proyecto';
import type { Cliente } from '../../Interfaces/i_cliente';
import type { HerramientaRpa } from '../../Interfaces/i_herramienta';
import type { Consultor } from '../../Interfaces/i_consultor';
import type { Proceso } from '../../Interfaces/i_procesos';

interface ItemBasico { id: string; nombre: string; }

const PANEL_MIN_WIDTH = 340;
const PANEL_MAX_WIDTH = 780;
const PANEL_DEFAULT_WIDTH = 400;
const TARIFA_HORA_FALLBACK = 10; // tarifa por defecto si el cliente no tiene precio_hora_desarrollo

// ─────────────────────────────────────────────────────────────
// Modal — Crear / Editar proyecto
// ─────────────────────────────────────────────────────────────
const ProyectoModal = ({ initial, clientes, onClose, onSaved }: {
  initial?: Proyecto | null; clientes: Cliente[];
  onClose: () => void; onSaved: () => void;
}) => {
  const { toast, ToastContainer } = useToast();
  const [form, setForm] = useState<any>(
    initial
      ? { nombre: initial.nombre, descripcion: initial.descripcion ?? '', activo: initial.activo, horas_estimadas: initial.horas_estimadas ?? '' }
      : { cliente_id: '', nombre: '', descripcion: '', horas_estimadas: '' }
  );
  const [loading, setLoading] = useState(false);
  const [clienteInfo, setClienteInfo] = useState<Cliente | null>(null);
  const [loadingCliente, setLoadingCliente] = useState(false);

  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const horas = Number(form.horas_estimadas) || 0;

  // ── Tarifa efectiva: precio_hora_desarrollo del cliente, o fallback ──
  const tarifaHora: number = clienteInfo?.precio_hora_desarrollo != null
    ? Number(clienteInfo.precio_hora_desarrollo)
    : TARIFA_HORA_FALLBACK;

  const costo = horas > 0 ? horas * tarifaHora : 0;

  const handleClienteChange = async (id: string) => {
    set('cliente_id', id);
    if (!id) { setClienteInfo(null); return; }
    setLoadingCliente(true);
    try {
      const c = await clienteService.getById(id);
      setClienteInfo(c);
    } catch { setClienteInfo(null); }
    finally { setLoadingCliente(false); }
  };

  const handleSubmit = async () => {
    if (!form.nombre?.trim()) return toast.warning("'Nombre' es requerido");
    if (!initial && !form.cliente_id) return toast.warning('Selecciona un cliente');
    if (form.horas_estimadas !== '' && Number(form.horas_estimadas) < 0)
      return toast.warning("Las horas estimadas no pueden ser negativas");
    setLoading(true);
    try {
      const payload = {
        ...form,
        horas_estimadas: form.horas_estimadas !== '' ? Number(form.horas_estimadas) : null,
      };
      initial
        ? await proyectoService.update(initial.id, payload as ProyectoUpdatePayload)
        : await proyectoService.create(payload as ProyectoPayload);
      toast.success(initial ? 'Proyecto actualizado' : 'Proyecto creado');
      onSaved(); onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje ?? 'Error al guardar');
    } finally { setLoading(false); }
  };

  // ── Tarifas a mostrar (solo valores no nulos) ──
  const tarifas = clienteInfo
    ? [
      { label: 'Hora desarrollo', value: clienteInfo.precio_hora_desarrollo, pct: false },
      { label: 'Hora soporte',    value: clienteInfo.precio_hora_soporte,    pct: false },
      { label: 'Hora cambio',     value: clienteInfo.precio_hora_cambio,     pct: false },
      { label: '% de Gerencia',      value: clienteInfo.porcentaje_gobierno,    pct: true  },
    ].filter(t => t.value != null)
    : [];

  const hintTarifa = clienteInfo?.precio_hora_desarrollo != null
    ? `$${Number(clienteInfo.precio_hora_desarrollo).toFixed(2)}/h`
    : `$${TARIFA_HORA_FALLBACK}/h (tarifa base)`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <ToastContainer />
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__head">
          <div>
            <h2 className="modal__title">{initial ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h2>
            <p className="modal__sub">{initial ? 'Modifica los datos del proyecto' : 'Asocia el proyecto a un cliente'}</p>
          </div>
          <button className="modal__close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal__body">

          {!initial && (
            <div className="mfield">
              <label className="mfield__label">Cliente <span className="mfield__req">*</span></label>
              <select
                className="mfield__input mfield__select"
                value={form.cliente_id}
                onChange={e => handleClienteChange(e.target.value)}
              >
                <option value="">— Selecciona un cliente —</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre} · {c.empresa}</option>
                ))}
              </select>
            </div>
          )}

          <div className="mfield">
            <label className="mfield__label">Nombre del Proceso <span className="mfield__req">*</span></label>
            <input
              className="mfield__input"
              placeholder="Ej: Automatización de Nómina"
              value={form.nombre ?? ''}
              onChange={e => set('nombre', e.target.value)}
            />
          </div>

          <div className="mfield">
            <label className="mfield__label">Descripción</label>
            <textarea
              className="mfield__input mfield__textarea"
              rows={3}
              placeholder="Descripción general del proyecto…"
              value={form.descripcion ?? ''}
              onChange={e => set('descripcion', e.target.value)}
            />
          </div>

          <div className="modal__row">
            <div className="mfield">
              <label className="mfield__label">Horas estimadas</label>
              <input
                type="number" min="0" className="mfield__input"
                placeholder="Ej: 120"
                value={form.horas_estimadas}
                onChange={e => set('horas_estimadas', e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
            <div className="mfield">
              <label className="mfield__label">
                Costo estimado{' '}
                {!initial && (
                  <span className="mfield__hint-label">({hintTarifa})</span>
                )}
              </label>
              <input
                className="mfield__input mfield__input--readonly"
                readOnly
                value={costo > 0 ? `$${costo.toLocaleString('es-EC', { minimumFractionDigits: 2 })}` : '—'}
              />
            </div>
          </div>

          {/* ── Tarifas del cliente seleccionado ── */}
          {!initial && loadingCliente && (
            <p className="cliente-tarifas__loading">Cargando tarifas del cliente…</p>
          )}
          {!initial && !loadingCliente && tarifas.length > 0 && (
            <div className="cliente-tarifas">
              <p className="cliente-tarifas__title">Tarifas del cliente</p>
              <table className="cliente-tarifas__table">
                <thead>
                  <tr>
                    <th>Concepto</th>
                    <th>Valor</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {tarifas.map(t => (
                    <tr key={t.label} className={t.label === 'Hora desarrollo' ? 'cliente-tarifas__row--highlight' : ''}>
                      <td>{t.label}</td>
                      <td>
                        {t.pct
                          ? `${Number(t.value).toFixed(2)} %`
                          : `$${Number(t.value).toLocaleString('es-EC', { minimumFractionDigits: 2 })} / h`}
                      </td>
                      <td>
                        {t.label === 'Hora desarrollo' && (
                          <span className="cliente-tarifas__used-badge">usado para costo</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {clienteInfo?.precio_hora_desarrollo == null && (
                <p className="cliente-tarifas__warning">
                  Este cliente no tiene tarifa de desarrollo configurada. Se usará la tarifa base de ${TARIFA_HORA_FALLBACK}/h.
                </p>
              )}
            </div>
          )}

          {initial && (
            <div className="mfield">
              <label className="mfield__label">Estado</label>
              <div className="toggle-wrap">
                <button
                  type="button"
                  className={`toggle ${form.activo ? 'toggle--on' : ''}`}
                  onClick={() => set('activo', !form.activo)}
                >
                  <span className="toggle__thumb" />
                </button>
                <span className="toggle__label">{form.activo ? 'Activo' : 'Inactivo'}</span>
              </div>
            </div>
          )}
        </div>

        <div className="modal__foot">
          <button className="modal__btn modal__btn--ghost" onClick={onClose}>Cancelar</button>
          <button className="modal__btn modal__btn--primary" onClick={handleSubmit} disabled={loading}>
            <Check size={15} />{loading ? 'Guardando…' : 'Guardar Proyecto'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Confirm desactivar
// ─────────────────────────────────────────────────────────────
const ConfirmDelete = ({ nombre, onConfirm, onCancel }: {
  nombre: string; onConfirm: () => void; onCancel: () => void;
}) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
      <div className="modal__head">
        <h2 className="modal__title">Desactivar proyecto</h2>
        <button className="modal__close" onClick={onCancel}><X size={16} /></button>
      </div>
      <div className="modal__body">
        <p className="confirm__text">¿Desactivar <strong>{nombre}</strong>? El historial se conservará.</p>
      </div>
      <div className="modal__foot">
        <button className="modal__btn modal__btn--ghost" onClick={onCancel}>Cancelar</button>
        <button className="modal__btn modal__btn--danger" onClick={onConfirm}>
          <Trash2 size={14} /> Desactivar
        </button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Panel lateral con resize drag
// ─────────────────────────────────────────────────────────────
type PanelTab = 'estado' | 'areas' | 'personal' | 'herramientas' | 'procesos';

const EMPTY_HERRA: AsignarHerramientaPayload = {
  herramienta_rpa_id: '', asignado_por: '', cod_licencia: '', fecha_expiracion: '',
};

const DetallePanel = ({ proyecto, onClose, onProyectoRefresh }: {
  proyecto: Proyecto; onClose: () => void;
  onProyectoRefresh: (updated: Proyecto) => void;
}) => {
  const { toast, ToastContainer } = useToast();
  const [tab, setTab] = useState<PanelTab>('estado');
  const [data, setData] = useState<Proyecto>(proyecto);

  // ── Resize ────────────────────────────────────────────────
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
      const newWidth = Math.min(PANEL_MAX_WIDTH, Math.max(PANEL_MIN_WIDTH, startWidth.current + delta));
      setPanelWidth(newWidth);
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
      const newWidth = Math.min(PANEL_MAX_WIDTH, Math.max(PANEL_MIN_WIDTH, startWidth.current + delta));
      setPanelWidth(newWidth);
    };
    const onTouchEnd = () => { isResizing.current = false; };
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  // Catálogos
  const [catAreas, setCatAreas] = useState<ItemBasico[]>([]);
  const [catHerras, setCatHerras] = useState<HerramientaRpa[]>([]);
  const [catConsultores, setCatConsultores] = useState<Consultor[]>([]);
  const [catRoles, setCatRoles] = useState<ItemBasico[]>([]);
  const [personal, setPersonal] = useState<ItemBasico[]>([]);

  // Estado timeline
  const [nuevoEstado, setNuevoEstado] = useState<EstadoProyectoEnum | ''>('');
  const [nuevoConsultor, setNuevoConsultor] = useState('');
  const [nuevoObs, setNuevoObs] = useState('');
  const [savingEstado, setSavingEstado] = useState(false);

  // Procesos
  const [procesos, setProcesos] = useState<Proceso[]>([]);
  const [loadingProcesos, setLoadingProcesos] = useState(false);

  // Forms
  const [newAreaId, setNewAreaId] = useState('');
  const [nuevoPersonalId, setNuevoPersonalId] = useState('');
  const [nuevoRolId, setNuevoRolId] = useState('');
  const [showFormHerra, setShowFormHerra] = useState(false);
  const [formHerra, setFormHerra] = useState<AsignarHerramientaPayload>({ ...EMPTY_HERRA });
  const [loadingHerra, setLoadingHerra] = useState(false);
  const [editingHerraId, setEditingHerraId] = useState<string | null>(null);
  const [estadoEdit, setEstadoEdit] = useState<EstadoHerramienta>('Activa');
  const [motivoEdit, setMotivoEdit] = useState('');

  useEffect(() => {
    areaService.getAll({ activo: true, limit: 100 }).then(r => setCatAreas(r.data)).catch(() => { });
    herramientaService.getAll({ activo: true, limit: 100 }).then(r => setCatHerras(r.data)).catch(() => { });
    consultorService.getAll({ activo: true, limit: 100 }).then(r => setCatConsultores(r.data)).catch(() => { });
    rolService.getAll({ activo: true, limit: 100 }).then(r => setCatRoles(r.data)).catch(() => { });
    clienteService.getUsuarios(proyecto.cliente_id)
      .then(u => setPersonal(
        u.filter(x => x.activo).map(x => ({ id: x.id, nombre: `${x.nombre}${x.cargo ? ` · ${x.cargo}` : ''}` }))
      )).catch(() => { });
    fetchProcesos();
  }, [proyecto.cliente_id]);

  const fetchProcesos = async () => {
    setLoadingProcesos(true);
    try {
      const res = await procesoService.getAll({ proyectoId: proyecto.id, limit: 100 });
      setProcesos(res.data);
    } catch { } finally { setLoadingProcesos(false); }
  };

  const refrescar = async () => {
    const updated = await proyectoService.getById(data.id);
    setData(updated); onProyectoRefresh(updated);
  };

  // Cálculos
  const horasProcesos = useMemo(() =>
    procesos.reduce((acc, p) => acc + (Number(p.propuesta?.horas_presupuestadas) || 0), 0), [procesos]);
  const costoProcesos = useMemo(() =>
    procesos.reduce((acc, p) => acc + (Number(p.propuesta?.valor_presupuestado) || 0), 0), [procesos]);
  const horasTotal = (data.horas_estimadas ?? 0) + horasProcesos;
  const costoTotal = (Number(data.costo_estimado) ?? 0) + costoProcesos;

  // ── Tarifa que el proyecto guardó al crearse ──
  const tarifaProyecto = data.precio_hora_desarrollo != null
    ? Number(data.precio_hora_desarrollo)
    : TARIFA_HORA_FALLBACK;

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

  const setH = (k: keyof AsignarHerramientaPayload, v: string) => setFormHerra(p => ({ ...p, [k]: v }));
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

  const handleCambiarEstado = async (asignacionId: string) => {
    try {
      await proyectoService.cambiarEstadoHerramienta(data.id, asignacionId, estadoEdit, motivoEdit.trim() || undefined);
      setEditingHerraId(null); setMotivoEdit(''); await refrescar(); toast.success('Estado actualizado');
    } catch (err: any) { toast.error(err?.response?.data?.mensaje ?? 'Error'); }
  };

  // ── Tarifas guardadas en el proyecto (snapshot del cliente al crearlo) ──
  const tarifasProyecto = [
    { label: 'Hora desarrollo', value: data.precio_hora_desarrollo, pct: false },
    { label: 'Hora soporte',    value: data.precio_hora_soporte,    pct: false },
    { label: 'Hora cambio',     value: data.precio_hora_cambio,     pct: false },
    { label: '% Gobierno',      value: data.porcentaje_gobierno,    pct: true  },
  ].filter(t => t.value != null);

  return (
    <>
      <ToastContainer />
      <div className="panel-backdrop" onClick={onClose} />

      <aside className="detalle-panel" style={{ width: panelWidth }}>

        {/* ── Resize handle ── */}
        <div
          className="dpanel__resize-handle"
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          title="Arrastra para ajustar el ancho"
        >
          <div className="dpanel__resize-grip" />
        </div>

        {/* ── Header ── */}
        <div className="dpanel__head">
          <div className="dpanel__info">
            <span className={`dpanel__estado-badge dpanel__estado-badge--${data.estado_actual?.toLowerCase().replace(/\s+/g, '')}`}>
              <Activity size={10} /> {data.estado_actual ?? (data.activo ? 'Activo' : 'Pendiente')}
            </span>
            <h3 className="dpanel__title">{data.nombre}</h3>
            <p className="dpanel__sub">{data.cliente.nombre} · <span>{data.cliente.empresa}</span></p>
            {data.descripcion && <p className="dpanel__desc">{data.descripcion}</p>}

            {/* ── Tarifas snapshot del cliente (guardadas en el proyecto) ── */}
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

            {(data.horas_estimadas != null || horasProcesos > 0) && (
              <div className="dpanel__presupuesto-wrap">
                {data.horas_estimadas != null && (
                  <div className="dpanel__presupuesto">
                    <span><Clock size={11} /> {data.horas_estimadas} h base</span>
                    <span className="dpanel__presupuesto-costo">
                      ${Number(data.costo_estimado ?? 0).toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                      <span className="dpanel__presupuesto-tarifa">
                        &nbsp;@ ${tarifaProyecto}/h
                      </span>
                    </span>
                  </div>
                )}
                {horasProcesos > 0 && (
                  <div className="dpanel__presupuesto dpanel__presupuesto--extra">
                    <span><Target size={11} /> +{horasProcesos} h procesos</span>
                    <span className="dpanel__presupuesto-costo">
                      +${costoProcesos.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                {data.horas_estimadas != null && horasProcesos > 0 && (
                  <div className="dpanel__presupuesto dpanel__presupuesto--total">
                    <span><TrendingUp size={11} /> {horasTotal} h total</span>
                    <span className="dpanel__presupuesto-costo">
                      ${costoTotal.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          <button className="modal__close" onClick={onClose}><X size={16} /></button>
        </div>

        {/* ── Tabs ── */}
        <div className="dpanel__tabs">
          {([
            { key: 'estado'       as PanelTab, icon: <GitBranch size={12} />, label: 'Estado',      count: null },
            { key: 'procesos'     as PanelTab, icon: <Target size={12} />,    label: 'Procesos',    count: procesos.length },
            { key: 'areas'        as PanelTab, icon: <Tag size={12} />,       label: 'Áreas',       count: data.areas.length },
            { key: 'personal'     as PanelTab, icon: <Users size={12} />,     label: 'Usuarios',    count: data.miembros.length },
            { key: 'herramientas' as PanelTab, icon: <Wrench size={12} />,    label: 'Herramientas',count: data.herramientas.length },
          ]).map(t => (
            <button key={t.key}
              className={`dpanel__tab ${tab === t.key ? 'dpanel__tab--active' : ''}`}
              onClick={() => setTab(t.key)}>
              {t.icon} {t.label}
              {t.count !== null && <span className="dpanel__tab-count">{t.count}</span>}
            </button>
          ))}
        </div>

        <div className="dpanel__body">
          {tab === 'estado' && (
            <div className="dpanel__section">
              {(() => {
                const esTerminal = ['Cerrado', 'Cancelado'].includes(data.estado_actual ?? '');
                return (
                  <div className={`timeline-form ${esTerminal ? 'timeline-form--locked' : ''}`}>
                    <p className="step-section-title" style={{ margin: 0 }}>
                      {esTerminal ? `PROYECTO ${(data.estado_actual ?? '').toUpperCase()} — SIN MÁS CAMBIOS` : 'REGISTRAR NUEVO ESTADO'}
                    </p>
                    {esTerminal ? (
                      <p className="timeline-locked-msg">
                        <Lock size={12} /> Este proyecto está en un estado terminal.
                        Usa <strong>"Deshacer"</strong> en el último estado si fue un error.
                      </p>
                    ) : (
                      <>
                        <div className="timeline-form__row">
                          <select className="mfield__input mfield__select" value={nuevoEstado}
                            onChange={e => setNuevoEstado(e.target.value as EstadoProyectoEnum)}>
                            <option value="">— Selecciona estado —</option>
                            {(["Lead","Pendiente","Contactado","Levantamiento","Estimacion","Propuesta",
                               "En Aprobacion","Aprobado","Rechazado","En Ejecución","Cerrado","Stand BY","Facturada"] as EstadoProyectoEnum[])
                              .filter(s => s !== data.estado_actual)
                              .map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <select className="mfield__input mfield__select" value={nuevoConsultor}
                            onChange={e => setNuevoConsultor(e.target.value)}>
                            <option value="">— Consultor —</option>
                            {catConsultores.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                          </select>
                        </div>
                        <textarea className="mfield__input mfield__textarea timeline-form__obs"
                          placeholder="Observación o motivo del cambio (opcional)…" rows={2}
                          value={nuevoObs} onChange={e => setNuevoObs(e.target.value)} />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button className="btn-dpanel-add" disabled={!nuevoEstado || savingEstado}
                            onClick={async () => {
                              if (!nuevoEstado) return;
                              setSavingEstado(true);
                              try {
                                await proyectoService.registrarEstado(data.id, {
                                  estado: nuevoEstado, consultor_id: nuevoConsultor || undefined,
                                  observacion: nuevoObs.trim() || undefined,
                                });
                                setNuevoEstado(''); setNuevoConsultor(''); setNuevoObs('');
                                await refrescar(); toast.success(`Estado → ${nuevoEstado}`);
                              } catch (err: any) { toast.error(err?.response?.data?.mensaje ?? 'Error'); }
                              finally { setSavingEstado(false); }
                            }}>
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
                          <div className={`tl-dot tl-dot--${e.estado.toLowerCase().replace(/\s+/g, '')}`}>
                            {esFinal ? <Activity size={10} /> : <Check size={9} />}
                          </div>
                          {idx < arr.length - 1 && <div className="tl-line" />}
                        </div>
                        <div className="tl-content">
                          <div className="tl-content__head">
                            <span className={`tl-badge tl-badge--${e.estado.toLowerCase().replace(/\s+/g, '')}`}>{e.estado}</span>
                            <span className="tl-fecha">
                              {new Date(e.fecha).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            {esFinal && (data.historial_estados ?? []).length > 1 && (
                              <button className="tl-del" title="Deshacer último cambio"
                                onClick={async () => {
                                  try { await proyectoService.eliminarUltimoEstado(data.id, e.id); await refrescar(); toast.success('Último estado eliminado'); }
                                  catch (err: any) { toast.error(err?.response?.data?.mensaje ?? 'Error'); }
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
                  <span className="proc-resumen__label">Procesos registrados</span>
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

              {data.horas_estimadas != null && horasProcesos > 0 && (
                <div className="proc-total-bar">
                  <div className="proc-total-bar__row">
                    <span className="proc-total-bar__label">Base del proyecto</span>
                    <span>{data.horas_estimadas} h</span>
                    <span>${Number(data.costo_estimado ?? 0).toLocaleString('es-EC', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="proc-total-bar__row proc-total-bar__row--extra">
                    <span className="proc-total-bar__label">Horas extra (procesos)</span>
                    <span>+{horasProcesos} h</span>
                    <span>+${costoProcesos.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="proc-total-bar__row proc-total-bar__row--total">
                    <span className="proc-total-bar__label"><TrendingUp size={11} /> TOTAL</span>
                    <span>{horasTotal} h</span>
                    <span>${costoTotal.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )}

              {loadingProcesos ? (
                <div className="dpanel__empty"><Target size={24} strokeWidth={1.2} /><p>Cargando…</p></div>
              ) : procesos.length === 0 ? (
                <div className="dpanel__empty"><Target size={28} strokeWidth={1.2} /><p>Sin procesos registrados para este proyecto</p></div>
              ) : (
                <ul className="proc-list">
                  {procesos.map(p => {
                    const horas = Number(p.propuesta?.horas_presupuestadas) || 0;
                    const valor = Number(p.propuesta?.valor_presupuestado) || 0;
                    const statusKey = (p.estatus ?? '').toLowerCase().replace(/\s+/g, '-').replace(/[áéíóú]/g, (c: string) => ({ á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' }[c] ?? c));
                    return (
                      <li key={p.id} className="proc-item">
                        <div className="proc-item__head">
                          <div className="proc-item__name-wrap">
                            <span className="proc-item__name">{p.nombre_proceso}</span>
                            {p.tipo && <span className="proc-item__tipo">{p.tipo}</span>}
                          </div>
                          <span className={`estatus-badge estatus--${statusKey}`}>{p.estatus}</span>
                        </div>
                        <div className="proc-item__meta">
                          {p.tipo_proceso && <span className="proc-item__chip"><ArrowRight size={9} /> {p.tipo_proceso}</span>}
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
                  <Lock size={13} /><span>El proyecto está <strong>inactivo</strong>. Actívalo para agregar o quitar áreas.</span>
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
                      {data.activo && <button className="chip__remove" onClick={() => handleQuitarArea(a.id)}><X size={10} /></button>}
                    </li>
                  ))}
                </ul>
              }
            </div>
          )}

          {/* ══ PERSONAL ══ */}
          {tab === 'personal' && (
            <div className="dpanel__section">
              <p className="dpanel__hint"><User size={11} /> Personal del cliente asignado a este proyecto</p>
              {!data.activo ? (
                <div className="dpanel__notice dpanel__notice--locked">
                  <Lock size={13} /><span>El proyecto está <strong>inactivo</strong>. Actívalo para asignar personal.</span>
                </div>
              ) : personal.length === 0 ? (
                <div className="dpanel__notice dpanel__notice--warn">
                  <AlertCircle size={13} />
                  <span>El cliente <strong>{data.cliente.nombre}</strong> no tiene usuarios. Agrégalos desde <em>Clientes → Personal</em>.</span>
                </div>
              ) : catRoles.length === 0 ? (
                <div className="dpanel__notice dpanel__notice--warn">
                  <AlertCircle size={13} /><span>No hay roles configurados. Crea uno desde <em>Catálogos → Roles</em>.</span>
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
                  <button className="btn-dpanel-add" onClick={handleAgregarPersonal} disabled={!nuevoPersonalId || !nuevoRolId}>
                    <UserPlus size={14} /> Agregar personal
                  </button>
                </div>
              )}
              {data.miembros.length === 0 ? (
                <div className="dpanel__empty" style={{ minHeight: 100 }}><Users size={24} strokeWidth={1.2} /><p>Sin personal asignado</p></div>
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
                        <button className="action-btn action-btn--del" onClick={() => handleQuitarPersonal(m.id)}
                          style={{ visibility: data.activo ? 'visible' : 'hidden' }}><X size={12} /></button>
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
                  <Lock size={13} /><span>El proyecto está <strong>inactivo</strong>. Actívalo para asignar herramientas.</span>
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
                      {herrasDisponibles.map(h => <option key={h.id} value={h.id}>{h.nombre}{h.fabricante ? ` · ${h.fabricante}` : ''}{h.version ? ` v${h.version}` : ''}</option>)}
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
                              <button className={`tool-edit-btn ${editing ? 'tool-edit-btn--active' : ''}`}
                                onClick={() => { if (editing) { setEditingHerraId(null); setMotivoEdit(''); } else { setEditingHerraId(h.id); setEstadoEdit(h.estado); setMotivoEdit(''); } }}>
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
                              <select className="mfield__input mfield__select dpanel__select--sm" value={estadoEdit} onChange={e => setEstadoEdit(e.target.value as EstadoHerramienta)}>
                                {(['Activa', 'Suspendida', 'Expirada', 'Revocada'] as EstadoHerramienta[]).map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                              {estadoEdit !== 'Activa' && (
                                <textarea className="mfield__input mfield__textarea tool-motivo" placeholder="Motivo del cambio (opcional)…" rows={2} value={motivoEdit} onChange={e => setMotivoEdit(e.target.value)} />
                              )}
                            </div>
                            <button className="btn-dpanel-add btn-dpanel-add--sm" onClick={() => handleCambiarEstado(h.id)}><Check size={12} /> Guardar</button>
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

// ─────────────────────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────────────────────
export const Proyectos = () => {
  const { toast, ToastContainer } = useToast();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [total, setTotal] = useState(0);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filtroActivo, setFiltroActivo] = useState<'todos' | 'activo' | 'inactivo'>('todos');
  const [modal, setModal] = useState<'create' | Proyecto | null>(null);
  const [toDelete, setToDelete] = useState<Proyecto | null>(null);
  const [panel, setPanel] = useState<Proyecto | null>(null);

  const fetchProyectos = async () => {
    setLoading(true);
    try {
      const res = await proyectoService.getAll({ limit: 100 });
      setProyectos(res.data); setTotal(res.total);
    } catch { toast.error('Error al cargar proyectos'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchProyectos();
    clienteService.getAll({ limit: 200 }).then(r => setClientes(r.data)).catch(() => { });
  }, []);

  const filtered = useMemo(() =>
    proyectos.filter(p => {
      const matchQ = p.nombre.toLowerCase().includes(query.toLowerCase()) || p.cliente.nombre.toLowerCase().includes(query.toLowerCase());
      const matchA = filtroActivo === 'todos' || (filtroActivo === 'activo' && p.estado_actual === 'Lead') || (filtroActivo === 'inactivo' && !['Activo'].includes(p.estado_actual ?? ''));
      return matchQ && matchA;
    }), [proyectos, query, filtroActivo]);

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await proyectoService.remove(toDelete.id);
      toast.success('Proyecto desactivado'); setToDelete(null);
      if (panel?.id === toDelete.id) setPanel(null);
      fetchProyectos();
    } catch (err: any) { toast.error(err?.response?.data?.mensaje ?? 'Error'); }
  };

  const handleProyectoRefresh = (updated: Proyecto) => {
    setProyectos(prev => prev.map(p => p.id === updated.id ? updated : p));
    setPanel(updated);
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="proyectos-page">
      <ToastContainer />
      <section className="proyectos-section">
        <div className="proyectos-section__head">
          <h2 className="proyectos-section__title">Gestión de Proyectos</h2>
          <button className="btn-new" onClick={() => setModal('create')}><Plus size={15} /> Nuevo Proyecto</button>
        </div>
        <div className="table-card">
          <div className="table-card__toolbar">
            <span className="table-card__label">Proyectos Registrados</span>
            <div className="table-search">
              <Search size={13} className="table-search__icon" />
              <input className="table-search__input" placeholder="Buscar por proyecto o cliente…" value={query} onChange={e => setQuery(e.target.value)} />
            </div>
            <select className="table-filter" value={filtroActivo} onChange={e => setFiltroActivo(e.target.value as typeof filtroActivo)}>
              <option value="todos">Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
            <span className="table-card__count">{filtered.length} / {total}</span>
          </div>
          <div className="table-wrap">
            <table className="ctable">
              <thead>
                <tr><th>#</th><th>Proyecto</th><th>Cliente</th><th>Áreas</th><th>Personal</th><th>Herramientas</th><th>Estado</th><th>Creado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="ctable__empty">Cargando…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={9} className="ctable__empty">Sin resultados</td></tr>
                ) : filtered.map((p, i) => (
                  <tr key={p.id} className={[!p.activo ? 'ctable__row--inactive' : '', panel?.id === p.id ? 'ctable__row--active' : ''].filter(Boolean).join(' ')}>
                    <td className="ctable__num">#{i + 1}</td>
                    <td className="ctable__name">
                      <button className="project-name-btn" onClick={() => setPanel(panel?.id === p.id ? null : p)}>
                        <FolderOpen size={13} /> {p.nombre}
                        <ChevronRight size={12} className={panel?.id === p.id ? 'chevron--open' : ''} />
                      </button>
                    </td>
                    <td>
                      <div className="ctable__client">
                        <span className="ctable__client-name">{p.cliente.nombre}</span>
                        <span className="ctable__client-empresa">{p.cliente.empresa}</span>
                      </div>
                    </td>
                    <td><span className={`count-badge ${p.areas.length > 0 ? 'count-badge--active' : 'count-badge--zero'}`}><Tag size={10} />{p.areas.length}</span></td>
                    <td><span className={`count-badge ${p.miembros.length > 0 ? 'count-badge--active' : 'count-badge--zero'}`}><Users size={10} />{p.miembros.length}</span></td>
                    <td><span className={`count-badge ${p.herramientas.length > 0 ? 'count-badge--active' : 'count-badge--zero'}`}><Wrench size={10} />{p.herramientas.length}</span></td>
                    <td>
                      <span className={`estado-pill estado-pill--${(p.estado_actual ?? '').toLowerCase().replace(/\s+/g, '')}`}>
                        {p.estado_actual ?? (p.activo ? 'Activo' : 'Pendiente')}
                      </span>
                    </td>
                    <td className="ctable__muted">{fmtDate(p.createdAt)}</td>
                    <td>
                      <div className="ctable__actions">
                        <button className="action-btn action-btn--edit" onClick={() => setModal(p)}><Pencil size={13} /> Editar</button>
                        {p.activo && <button className="action-btn action-btn--del" onClick={() => setToDelete(p)}><Trash2 size={13} /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {panel && <DetallePanel proyecto={panel} onClose={() => setPanel(null)} onProyectoRefresh={handleProyectoRefresh} />}
      {modal && <ProyectoModal initial={modal === 'create' ? null : modal} clientes={clientes} onClose={() => setModal(null)} onSaved={fetchProyectos} />}
      {toDelete && <ConfirmDelete nombre={toDelete.nombre} onConfirm={handleDelete} onCancel={() => setToDelete(null)} />}
    </div>
  );
};