import { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Search, Trash2 } from 'lucide-react';
import { soporteService } from '../../Services/soporteService';
import { useToast } from '../../Hooks/useToast';
import './GestionSoporte.css';
import type { Soporte} from '../../Interfaces/i_soporte';
import { SoporteModal } from './SoporteModal';
import { ConfirmModal } from '../../Components/ConfirmModal';

export const GestionSoporte = () => {
  const { toast, ToastContainer } = useToast();
  const [soportes, setSoportes] = useState<Soporte[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'En Aprobación' | 'Aprobado' | 'Rechazado'>('todos');
  const [modal, setModal] = useState<'create' | Soporte | null>(null);
  const [toDelete, setToDelete] = useState<Soporte | null>(null);

  const fetchSoportes = async () => {
    setLoading(true);
    try {
      const res = await soporteService.getAll({ limit: 200 });
      setSoportes(res.data);
      setTotal(res.total);
    } catch (err) {
      toast.error('Error al cargar soportes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSoportes();
  }, []);

  const filtered = useMemo(() => {
    return soportes.filter(s => {
      const matchSearch =
        s.cliente?.empresa?.toLowerCase().includes(search.toLowerCase()) ||
        s.propuesta?.toLowerCase().includes(search.toLowerCase());
      const matchEstado = filtroEstado === 'todos' || s.estado === filtroEstado;
      return matchSearch && matchEstado;
    });
  }, [soportes, search, filtroEstado]);

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await soporteService.remove(toDelete.id);
      toast.success('Soporte eliminado');
      setToDelete(null);
      fetchSoportes();
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje ?? 'Error al eliminar');
    }
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '—';
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value);
  };

  return (
    <div className="soporte-page">
      <ToastContainer />

      <section className="soporte-section">
        <div className="soporte-section__head">
          <h2 className="soporte-section__title">Gestión de Soporte</h2>
          <button className="btn-new" onClick={() => setModal('create')}>
            <Plus size={15} /> Nuevo Soporte
          </button>
        </div>

        <div className="table-card">
          <div className="table-card__toolbar">
            <span className="table-card__label">Soportes Registrados</span>
            <div className="table-search">
              <Search size={13} className="table-search__icon" />
              <input
                className="table-search__input"
                placeholder="Buscar por cliente o propuesta…"
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
              <option value="En Aprobación">En Aprobación</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Rechazado">Rechazado</option>
            </select>
            <span className="table-card__count">{filtered.length} / {total}</span>
          </div>

          <div className="table-wrap">
            <table className="ctable">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Estado</th>
                  <th>Horas</th>
                  <th>Valor Paquete</th>
                  <th>Fecha Inicio</th>
                  <th>Fecha Fin</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="ctable__empty">Cargando…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="ctable__empty">Sin resultados</td></tr>
                ) : (
                  filtered.map(s => (
                    <tr key={s.id}>
                      <td className="ctable__name">{s.cliente?.empresa || s.cliente_id}</td>
                      <td>
                        <span
                          className={`badge ${
                            s.estado === 'Aprobado'
                              ? 'badge--aprobado'
                              : s.estado === 'Rechazado'
                              ? 'badge--rechazado'
                              : 'badge--en_aprobacion'
                          }`}
                        >
                          {s.estado}
                        </span>
                      </td>
                      <td>{s.horas ?? '-'}</td>
                      <td>{formatCurrency(s.valor_paquete)}</td>
                      <td>{s.fecha_inicio ? new Date(s.fecha_inicio).toLocaleDateString('es-EC') : '—'}</td>
                      <td>{s.fecha_fin ? new Date(s.fecha_fin).toLocaleDateString('es-EC') : '—'}</td>
                      <td>
                        <div className="ctable__actions">
                          <button className="action-btn action-btn--edit" onClick={() => setModal(s)}>
                            <Pencil size={13} />
                          </button>
                          <button className="action-btn action-btn--del" onClick={() => setToDelete(s)}>
                            <Trash2 size={13} />
                          </button>
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
        <SoporteModal
          initial={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchSoportes}
        />
      )}

      {toDelete && (
        <ConfirmModal
          title="Eliminar Soporte"
          message={`¿Eliminar el soporte de ${toDelete.cliente?.empresa || 'este cliente'}? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
};