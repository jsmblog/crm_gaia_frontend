import { useState, useEffect, useMemo } from 'react';
import {
  Plus, Pencil, X, Search, Trash2,
  RotateCcw, Shield, Cpu,
} from 'lucide-react';
import { licenciaService } from '../../Services/licenciaService';
import { useToast } from '../../Hooks/useToast';
import './GestionLicencias.css';
import type { Licencia, EstadoLicencia } from '../../Interfaces/i_licencia';
import { LicenciaModal } from './LicenciaModal';
import { ConfirmModal } from '../../Components/ConfirmModal';

const EstadoBadge = ({ estado }: { estado: EstadoLicencia }) => (
  <span className={`gl-badge ${estado === 'Activada' ? 'gl-badge--active' : 'gl-badge--inactive'}`}>
    <span className="gl-badge__dot" />
    {estado}
  </span>
);

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

      {modal && (
        <LicenciaModal
          initial={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchLicencias}
        />
      )}

      {toDelete && (
        <ConfirmModal
          title="Desactivar Licencia"
          message={`¿Desactivar la licencia de "${toDelete.cliente?.empresa || 'este cliente'}"? El historial se conservará.`}
          confirmLabel="Desactivar"
          onConfirm={handleDesactivar}
          onCancel={() => setToDelete(null)}
        />
      )}

      {toRestore && (
        <ConfirmModal
          title="Reactivar Licencia"
          message={`¿Reactivar la licencia de "${toRestore.cliente?.empresa || 'este cliente'}"?`}
          confirmLabel="Reactivar"
          onConfirm={handleRestaurar}
          onCancel={() => setToRestore(null)}
        />
      )}
    </div>
  );
};