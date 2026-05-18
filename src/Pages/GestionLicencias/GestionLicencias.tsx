import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plus, Pencil, X, Check, Search, Trash2,
  RotateCcw, ChevronDown, AlertCircle, Shield,
  Calendar, DollarSign, Monitor, Cpu, Tag,
} from 'lucide-react';
import { licenciaService } from '../../Services/licenciaService';
import { clienteService } from '../../Services/clienteService';
import { procesoService } from '../../Services/procesoService';
import { herramientaService } from '../../Services/herramientaService';
import { useToast } from '../../Hooks/useToast';
import './GestionLicencias.css';
import type { Licencia, LicenciaPayload, EstadoLicencia } from '../../Interfaces/i_licencia';
import type { Cliente } from '../../Interfaces/i_cliente';
import type { Proceso } from '../../Interfaces/i_procesos';

// ─────────────────────────────────────────────────────────────
// ProcesoMultiSelect
// ─────────────────────────────────────────────────────────────
interface ProcesoMultiSelectProps {
  label?: string;
  selected: string[];
  onChange: (ids: string[]) => void;
  procesos: Proceso[];
  placeholder?: string;
  disabled?: boolean;
}

const ProcesoMultiSelect = ({
  label,
  selected,
  onChange,
  procesos,
  placeholder = '— Seleccionar procesos —',
  disabled = false,
}: ProcesoMultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (id: string) => {
    if (disabled) return;
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);
  };

  const disponibles = procesos.filter(p => !selected.includes(p.id));
  const seleccionados = procesos.filter(p => selected.includes(p.id));

  return (
    <div className="gl-multiselect" ref={ref}>
      {label && <label className="gl-field__label">{label}</label>}
      {seleccionados.length > 0 && (
        <div className="gl-chips">
          {seleccionados.map(p => (
            <span key={p.id} className={`gl-chip ${disabled ? 'gl-chip--disabled' : ''}`}>
              <Tag size={9} />
              {p.nombre_proceso}
              {!disabled && (
                <button type="button" className="gl-chip__remove" onClick={() => toggle(p.id)}>
                  <X size={9} />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
      <div
        className={`gl-multiselect__trigger ${disabled ? 'gl-multiselect__trigger--disabled' : ''}`}
        onClick={() => { if (!disabled) setOpen(p => !p); }}
      >
        <span className="gl-multiselect__placeholder">{placeholder}</span>
        <ChevronDown size={13} className={`gl-multiselect__chevron ${open ? 'open' : ''}`} />
      </div>
      {open && !disabled && disponibles.length > 0 && (
        <div className="gl-multiselect__menu">
          {disponibles.map(p => (
            <div
              key={p.id}
              className="gl-multiselect__option"
              onMouseDown={() => { toggle(p.id); setOpen(false); }}
            >
              <Tag size={11} />
              {p.nombre_proceso}
            </div>
          ))}
        </div>
      )}
      {open && !disabled && disponibles.length === 0 && (
        <div className="gl-multiselect__menu">
          <div className="gl-multiselect__empty">Todos los procesos asignados</div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Modal de Licencia
// ─────────────────────────────────────────────────────────────
interface LicenciaModalProps {
  initial?: Licencia | null;
  onClose: () => void;
  onSaved: () => void;
}

const EMPTY_LICENCIA: LicenciaPayload = {
  cliente_id: '',
  estado: 'Activada',
  fecha_inicio: '',
  renovacion: undefined,
  herramienta_id: undefined,
  valor_anual: undefined,
  ip_maquina: '',
  procesos_ids: [],
  fecha_estado: '',
  motivo_desactivacion: '',
};

const LicenciaModal = ({ initial, onClose, onSaved }: LicenciaModalProps) => {
  const { toast, ToastContainer } = useToast();
  const [form, setForm] = useState<LicenciaPayload>(
    initial ? {
      cliente_id: initial.cliente_id,
      estado: initial.estado,
      fecha_inicio: initial.fecha_inicio || '',
      renovacion: initial.renovacion,
      herramienta_id: initial.herramienta_id,
      valor_anual: initial.valor_anual,
      ip_maquina: initial.ip_maquina || '',
      procesos_ids: initial.procesos?.map(p => p.id) || [],
      fecha_estado: initial.fecha_estado || '',
      motivo_desactivacion: initial.motivo_desactivacion || '',
    } : { ...EMPTY_LICENCIA }
  );
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [procesos, setProcesos] = useState<Proceso[]>([]);
  const [herramientas, setHerramientas] = useState([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);

  useEffect(() => {
    const fetchCatalogos = async () => {
      setLoadingCatalogos(true);
      try {
        const [clientesRes, procesosRes, herramientasRes] = await Promise.all([
          clienteService.getAll({ limit: 500 }),
          procesoService.getAll({ limit: 500 }),
          herramientaService.getAll({ limit: 500, activo: true }),
        ]);
        setClientes(clientesRes.data);
        setProcesos(procesosRes.data);
        setHerramientas(herramientasRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCatalogos(false);
      }
    };
    fetchCatalogos();
  }, []);

  const setField = (k: keyof LicenciaPayload, v: any) =>
    setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.cliente_id) return toast.warning('Selecciona un cliente');
    if (!form.fecha_inicio) return toast.warning('La fecha de inicio es requerida');
    if (form.estado === 'Desactivada' && !form.motivo_desactivacion?.trim()) {
      return toast.warning('Motivo de desactivación requerido');
    }
    setLoading(true);
    try {
      // Sanitize: convert empty strings to null/undefined for date fields
      const payload: LicenciaPayload = {
        ...form,
        fecha_estado: form.fecha_estado?.trim() || undefined,
        motivo_desactivacion: form.motivo_desactivacion?.trim() || undefined,
        herramienta_id: form.herramienta_id || undefined,
      };

      if (initial) {
        await licenciaService.update(initial.id, payload);
        toast.success('Licencia actualizada correctamente');
      } else {
        await licenciaService.create(payload);
        toast.success('Licencia creada correctamente');
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje ?? 'Error al guardar la licencia');
    } finally {
      setLoading(false);
    }
  };

  const isDesactivada = form.estado === 'Desactivada';

  return (
    <div className="gl-overlay" onClick={onClose}>
      <ToastContainer />
      <div className="gl-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="gl-modal__header">
          <div className="gl-modal__header-icon">
            <Shield size={18} />
          </div>
          <div className="gl-modal__header-text">
            <h2 className="gl-modal__title">{initial ? 'Editar Licencia' : 'Nueva Licencia'}</h2>
            <p className="gl-modal__subtitle">Gestión de licencias RPA y software</p>
          </div>
          <button className="gl-modal__close" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="gl-modal__body">
          {/* Row: Cliente + Estado */}
          <div className="gl-modal__row">
            <div className="gl-field">
              <label className="gl-field__label">
                Cliente <span className="gl-field__req">*</span>
              </label>
              <select
                className="gl-field__input"
                value={form.cliente_id}
                onChange={e => setField('cliente_id', e.target.value)}
                disabled={loadingCatalogos}
              >
                <option value="">— Seleccionar cliente —</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.empresa}</option>
                ))}
              </select>
            </div>
            <div className="gl-field">
              <label className="gl-field__label">Estado</label>
              <select
                className={`gl-field__input gl-field__input--estado ${isDesactivada ? 'gl-field__input--desactivada' : 'gl-field__input--activada'}`}
                value={form.estado}
                onChange={e => setField('estado', e.target.value as EstadoLicencia)}
              >
                <option value="Activada">✓ Activada</option>
                <option value="Desactivada">✗ Desactivada</option>
              </select>
            </div>
          </div>

          {/* Row: Fecha inicio + Renovación */}
          <div className="gl-modal__row">
            <div className="gl-field">
              <label className="gl-field__label">
                <Calendar size={11} /> Fecha Inicio <span className="gl-field__req">*</span>
              </label>
              <input
                type="date"
                className="gl-field__input"
                value={form.fecha_inicio}
                onChange={e => setField('fecha_inicio', e.target.value)}
              />
            </div>
            <div className="gl-field">
              <label className="gl-field__label">
                <RotateCcw size={11} /> Renovación
              </label>
              <select
                className="gl-field__input"
                value={form.renovacion || ''}
                onChange={e => setField('renovacion', e.target.value || undefined)}
              >
                <option value="">— Sin renovación —</option>
                <option value="mensual">Mensual</option>
                <option value="anual">Anual</option>
                <option value="2 años">2 años</option>
                <option value="3 años">3 años</option>
              </select>
            </div>
          </div>

          {/* Row: Herramienta + Valor Anual */}
          <div className="gl-modal__row">
            <div className="gl-field">
              <label className="gl-field__label">
                <Cpu size={11} /> Herramienta RPA
              </label>
              <select
                className="gl-field__input"
                value={form.herramienta_id || ''}
                onChange={e => setField('herramienta_id', e.target.value || undefined)}
                disabled={loadingCatalogos}
              >
                <option value="">— Seleccionar herramienta —</option>
                {herramientas.map(h => (
                  <option key={h.id} value={h.id}>{h.nombre}</option>
                ))}
              </select>
            </div>
            <div className="gl-field">
              <label className="gl-field__label">
                <DollarSign size={11} /> Valor Anual (USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="gl-field__input"
                placeholder="0.00"
                value={form.valor_anual ?? ''}
                onChange={e => setField('valor_anual', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
          </div>

          {/* Row: IP Máquina */}
          <div className="gl-modal__row gl-modal__row--single">
            <div className="gl-field">
              <label className="gl-field__label">
                <Monitor size={11} /> IP Máquina
              </label>
              <input
                className="gl-field__input"
                placeholder="Ej: 192.168.1.100"
                value={form.ip_maquina}
                onChange={e => setField('ip_maquina', e.target.value)}
              />
            </div>
          </div>

          {/* Procesos Asociados */}
          <ProcesoMultiSelect
            label="Procesos Asociados"
            selected={form.procesos_ids || []}
            onChange={ids => setField('procesos_ids', ids)}
            procesos={procesos}
            disabled={loadingCatalogos}
          />

          {/* Desactivación fields */}
          {isDesactivada && (
            <div className="gl-deactivation-block">
              <div className="gl-deactivation-block__header">
                <AlertCircle size={13} />
                <span>Información de desactivación</span>
              </div>
              <div className="gl-modal__row">
                <div className="gl-field">
                  <label className="gl-field__label">
                    <Calendar size={11} /> Fecha de desactivación
                  </label>
                  <input
                    type="date"
                    className="gl-field__input"
                    value={form.fecha_estado || ''}
                    onChange={e => setField('fecha_estado', e.target.value || '')}
                  />
                </div>
              </div>
              <div className="gl-field">
                <label className="gl-field__label">
                  Motivo de desactivación <span className="gl-field__req">*</span>
                </label>
                <textarea
                  className="gl-field__input gl-field__textarea"
                  rows={3}
                  placeholder="Ej: Migración a nueva versión, no renovación del contrato…"
                  value={form.motivo_desactivacion}
                  onChange={e => setField('motivo_desactivacion', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="gl-modal__footer">
          <button className="gl-btn gl-btn--ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button className="gl-btn gl-btn--primary" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <span className="gl-spinner" />
                Guardando…
              </>
            ) : (
              <>
                <Check size={14} />
                {initial ? 'Actualizar Licencia' : 'Guardar Licencia'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// ConfirmAction dialog
// ─────────────────────────────────────────────────────────────
interface ConfirmActionProps {
  title: string;
  message: string;
  confirmText: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmAction = ({
  title, message, confirmText, variant = 'danger', onConfirm, onCancel,
}: ConfirmActionProps) => (
  <div className="gl-overlay" onClick={onCancel}>
    <div className="gl-modal gl-modal--sm" onClick={e => e.stopPropagation()}>
      <div className="gl-modal__header">
        <div className={`gl-modal__header-icon gl-modal__header-icon--${variant}`}>
          <AlertCircle size={18} />
        </div>
        <div className="gl-modal__header-text">
          <h2 className="gl-modal__title">{title}</h2>
        </div>
        <button className="gl-modal__close" onClick={onCancel}><X size={15} /></button>
      </div>
      <div className="gl-modal__body">
        <p className="gl-confirm__message">{message}</p>
      </div>
      <div className="gl-modal__footer">
        <button className="gl-btn gl-btn--ghost" onClick={onCancel}>Cancelar</button>
        <button className={`gl-btn gl-btn--${variant}`} onClick={onConfirm}>{confirmText}</button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Badge de estado
// ─────────────────────────────────────────────────────────────
const EstadoBadge = ({ estado }: { estado: EstadoLicencia }) => (
  <span className={`gl-badge ${estado === 'Activada' ? 'gl-badge--active' : 'gl-badge--inactive'}`}>
    <span className="gl-badge__dot" />
    {estado}
  </span>
);

// ─────────────────────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────────────────────
export const GestionLicencias = () => {
  const { toast, ToastContainer } = useToast();
  const [licencias, setLicencias] = useState<Licencia[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'Activada' | 'Desactivada'>('todos');
  const [modal, setModal] = useState<'create' | Licencia | null>(null);
  const [toDelete, setToDelete] = useState<Licencia | null>(null);
  const [toRestore, setToRestore] = useState<Licencia | null>(null);

  const fetchLicencias = async () => {
    setLoading(true);
    try {
      const res = await licenciaService.getAll({ limit: 200 });
      setLicencias(res.data);
      setTotal(res.total);
    } catch {
      toast.error('Error al cargar licencias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLicencias(); }, []);

  const filtered = useMemo(() => licencias.filter(l => {
    const matchSearch =
      l.cliente?.empresa?.toLowerCase().includes(search.toLowerCase()) ||
      l.herramienta?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      l.ip_maquina?.toLowerCase().includes(search.toLowerCase());
    const matchEstado = filtroEstado === 'todos' || l.estado === filtroEstado;
    return matchSearch && matchEstado;
  }), [licencias, search, filtroEstado]);

  const stats = useMemo(() => ({
    total: licencias.length,
    activas: licencias.filter(l => l.estado === 'Activada').length,
    desactivadas: licencias.filter(l => l.estado === 'Desactivada').length,
  }), [licencias]);

  const handleDesactivar = async () => {
    if (!toDelete) return;
    try {
      await licenciaService.remove(toDelete.id);
      toast.success('Licencia desactivada');
      setToDelete(null);
      fetchLicencias();
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje ?? 'Error al desactivar');
    }
  };

  const handleRestaurar = async () => {
    if (!toRestore) return;
    try {
      await licenciaService.restaurar(toRestore.id);
      toast.success('Licencia reactivada');
      setToRestore(null);
      fetchLicencias();
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje ?? 'Error al reactivar');
    }
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '—';
    return new Intl.NumberFormat('es-EC', {
      style: 'currency', currency: 'USD', minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="gl-page">
      <ToastContainer />

      {/* Page Header */}
      <div className="gl-page__header">
        <div className="gl-page__title-group">
          <h1 className="gl-page__title">Gestión de Licencias</h1>
          <p className="gl-page__subtitle">Administración de licencias RPA y software por cliente</p>
        </div>
        <button className="gl-btn gl-btn--primary gl-btn--lg" onClick={() => setModal('create')}>
          <Plus size={15} />
          Nueva Licencia
        </button>
      </div>

      {/* Stats Row */}
      <div className="gl-stats">
        <div className="gl-stat">
          <span className="gl-stat__value">{stats.total}</span>
          <span className="gl-stat__label">Total</span>
        </div>
        <div className="gl-stat gl-stat--active">
          <span className="gl-stat__value">{stats.activas}</span>
          <span className="gl-stat__label">Activas</span>
        </div>
        <div className="gl-stat gl-stat--inactive">
          <span className="gl-stat__value">{stats.desactivadas}</span>
          <span className="gl-stat__label">Desactivadas</span>
        </div>
      </div>

      {/* Table Card */}
      <div className="gl-card">
        {/* Toolbar */}
        <div className="gl-card__toolbar">
          <div className="gl-search">
            <Search size={13} className="gl-search__icon" />
            <input
              className="gl-search__input"
              placeholder="Buscar por cliente, herramienta o IP…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="gl-search__clear" onClick={() => setSearch('')}>
                <X size={11} />
              </button>
            )}
          </div>

          <div className="gl-filter-tabs">
            {(['todos', 'Activada', 'Desactivada'] as const).map(opt => (
              <button
                key={opt}
                className={`gl-filter-tab ${filtroEstado === opt ? 'gl-filter-tab--active' : ''}`}
                onClick={() => setFiltroEstado(opt)}
              >
                {opt === 'todos' ? 'Todos' : opt === 'Activada' ? '✓ Activas' : '✗ Inactivas'}
              </button>
            ))}
          </div>

          <span className="gl-card__count">
            {filtered.length} <span>/ {total}</span>
          </span>
        </div>

        {/* Table */}
        <div className="gl-table-wrap">
          <table className="gl-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Herramienta</th>
                <th>Fecha Inicio</th>
                <th>Renovación</th>
                <th>Valor Anual</th>
                <th>Estado</th>
                <th>Procesos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="gl-table__empty">
                    <div className="gl-loading">
                      <span className="gl-spinner gl-spinner--lg" />
                      <span>Cargando licencias…</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="gl-table__empty">
                    <Shield size={28} strokeWidth={1.2} />
                    <span>No se encontraron licencias</span>
                  </td>
                </tr>
              ) : filtered.map(lic => (
                <tr
                  key={lic.id}
                  className={`gl-table__row ${lic.estado === 'Desactivada' ? 'gl-table__row--inactive' : ''}`}
                >
                  <td>
                    <span className="gl-table__name">{lic.cliente?.empresa || lic.cliente_id}</span>
                  </td>
                  <td>
                    {lic.herramienta?.nombre
                      ? <span className="gl-table__tag"><Cpu size={11} />{lic.herramienta.nombre}</span>
                      : <span className="gl-table__muted">—</span>
                    }
                  </td>
                  <td>
                    <span className="gl-table__date">
                      {formatDate(lic.fecha_inicio)}
                    </span>
                  </td>
                  <td>
                    {lic.renovacion
                      ? <span className="gl-table__pill">{lic.renovacion}</span>
                      : <span className="gl-table__muted">—</span>
                    }
                  </td>
                  <td>
                    <span className="gl-table__currency">{formatCurrency(lic.valor_anual)}</span>
                  </td>
                  <td>
                    <EstadoBadge estado={lic.estado} />
                  </td>
                  <td>
                    {lic.procesos?.length ? (
                      <span className="gl-table__procesos" title={lic.procesos.map(p => p.nombre_proceso).join(', ')}>
                        {lic.procesos.length === 1
                          ? lic.procesos[0].nombre_proceso
                          : `${lic.procesos[0].nombre_proceso} +${lic.procesos.length - 1}`
                        }
                      </span>
                    ) : (
                      <span className="gl-table__muted">—</span>
                    )}
                  </td>
                  <td>
                    <div className="gl-table__actions">
                      <button
                        className="gl-action-btn gl-action-btn--edit"
                        onClick={() => setModal(lic)}
                        title="Editar"
                      >
                        <Pencil size={12} />
                        <span>Editar</span>
                      </button>
                      {lic.estado === 'Activada' ? (
                        <button
                          className="gl-action-btn gl-action-btn--delete"
                          onClick={() => setToDelete(lic)}
                          title="Desactivar"
                        >
                          <Trash2 size={12} />
                        </button>
                      ) : (
                        <button
                          className="gl-action-btn gl-action-btn--restore"
                          onClick={() => setToRestore(lic)}
                          title="Reactivar"
                        >
                          <RotateCcw size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal nueva/editar */}
      {modal && (
        <LicenciaModal
          initial={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchLicencias}
        />
      )}

      {/* Confirm desactivar */}
      {toDelete && (
        <ConfirmAction
          title="Desactivar Licencia"
          message={`¿Desactivar la licencia de "${toDelete.cliente?.empresa || 'este cliente'}"? El historial se conservará.`}
          confirmText="Desactivar"
          variant="danger"
          onConfirm={handleDesactivar}
          onCancel={() => setToDelete(null)}
        />
      )}

      {/* Confirm restaurar */}
      {toRestore && (
        <ConfirmAction
          title="Reactivar Licencia"
          message={`¿Reactivar la licencia de "${toRestore.cliente?.empresa || 'este cliente'}"?`}
          confirmText="Reactivar"
          variant="warning"
          onConfirm={handleRestaurar}
          onCancel={() => setToRestore(null)}
        />
      )}
    </div>
  );
};