import { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Search, Trash2, RotateCcw } from 'lucide-react';
import { licenciaService } from '../../Services/licenciaService';
import { useToast } from '../../Hooks/useToast';
import './GestionLicencias.css';
import type { Licencia, EstadoLicencia } from '../../Interfaces/i_licencia';
import { LicenciaModal } from './LicenciaModal';
import { ConfirmModal } from '../../Components/ConfirmModal';

const EstadoBadge = ({ estado }: { estado: EstadoLicencia }) => (
  <span className={`badge ${estado === 'Activada' ? 'badge--activada' : 'badge--desactivada'}`}>
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
    <div className="soporte-page">
      <ToastContainer />

      <section className="soporte-section">
        <div className="soporte-section__head">
          <h2 className="soporte-section__title">Gestión de Licencias</h2>
          <button className="btn-new" onClick={() => setModal('create')}>
            <Plus size={15} /> Nueva Licencia
          </button>
        </div>

        <div className="table-card">
          <div className="table-card__toolbar">
            <span className="table-card__label">Licencias Registradas</span>
            <div className="table-search">
              <Search size={13} className="table-search__icon" />
              <input
                className="table-search__input"
                placeholder="Buscar por cliente, herramienta o IP…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="table-filter"
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value as typeof filtroEstado)}
            >
              <option value="todos">Todos los estados</option>
              <option value="Activada">Activada</option>
              <option value="Desactivada">Desactivada</option>
            </select>
            <span className="table-card__count">{filtered.length} / {total}</span>
          </div>

          <div className="table-wrap">
            <table className="ctable">
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
                  <tr><td colSpan={8} className="ctable__empty">Cargando…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="ctable__empty">Sin resultados</td></tr>
                ) : (
                  filtered.map(lic => (
                    <tr key={lic.id} className={lic.estado === 'Desactivada' ? 'ctable__row--inactive' : ''}>
                      <td className="ctable__name">{lic.cliente?.empresa || lic.cliente_id}</td>
                      <td>{lic.herramienta?.nombre || <span className="ctable__muted">—</span>}</td>
                      <td>{formatDate(lic.fecha_inicio)}</td>
                      <td>{lic.renovacion || <span className="ctable__muted">—</span>}</td>
                      <td>{formatCurrency(lic.valor_anual)}</td>
                      <td><EstadoBadge estado={lic.estado} /></td>
                      <td>
                        {lic.procesos?.length ? (
                          <span className="ctable__procesos" title={lic.procesos.map(p => p.nombre_proceso).join(', ')}>
                            {lic.procesos.length === 1
                              ? lic.procesos[0].nombre_proceso
                              : `${lic.procesos[0].nombre_proceso} +${lic.procesos.length - 1}`
                            }
                          </span>
                        ) : <span className="ctable__muted">—</span>}
                      </td>
                      <td>
                        <div className="ctable__actions">
                          <button className="action-btn action-btn--edit" onClick={() => setModal(lic)}>
                            <Pencil size={13} />
                          </button>
                          {lic.estado === 'Activada' ? (
                            <button className="action-btn action-btn--del" onClick={() => setToDelete(lic)}>
                              <Trash2 size={13} />
                            </button>
                          ) : (
                            <button className="action-btn action-btn--restore" onClick={() => setToRestore(lic)}>
                              <RotateCcw size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

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