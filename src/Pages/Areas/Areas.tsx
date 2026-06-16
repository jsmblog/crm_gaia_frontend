import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Pencil, Trash2, LayoutGrid } from 'lucide-react';
import { areaService }  from '../../Services/areaService';
import { useToast }     from '../../Hooks/useToast';
import './Areas.css';
import type { Area } from '../../Interfaces/i_area';
import { AreaModal } from './AreaModal';
import { ConfirmModal } from '../../Components/ConfirmModal';

export const Areas = () => {
  const { toast, ToastContainer } = useToast();
  const [areas, setAreas]           = useState<Area[]>([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [query, setQuery]           = useState('');
  const [filtroActivo, setFiltroActivo] = useState<'todos' | 'activo' | 'inactivo'>('activo');
  const [modal, setModal]           = useState<'create' | Area | null>(null);
  const [toDelete, setToDelete]     = useState<Area | null>(null);

  const fetchAreas = async () => {
    setLoading(true);
    try {
      const res = await areaService.getAll({ limit: 100 });
      setAreas(res.data);
      setTotal(res.total);
    } catch { toast.error('Error al cargar las áreas'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAreas(); }, []);

  const filtered = useMemo(() =>
    areas.filter(a => {
      const matchQ = a.nombre.toLowerCase().includes(query.toLowerCase()) ||
                     (a.descripcion ?? '').toLowerCase().includes(query.toLowerCase());
      const matchA = filtroActivo === 'todos'
        || (filtroActivo === 'activo'   &&  a.activo)
        || (filtroActivo === 'inactivo' && !a.activo);
      return matchQ && matchA;
    }), [areas, query, filtroActivo]);

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await areaService.remove(toDelete.id);
      toast.success('Área desactivada');
      setToDelete(null);
      fetchAreas();
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje ?? 'Error al desactivar');
    }
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="areas-page">
      <ToastContainer />

      <section className="areas-section">
        <div className="areas-section__head">
          <h2 className="areas-section__title">Áreas</h2>
          <button className="btn-new" onClick={() => setModal('create')}>
            <Plus size={15} /> Nueva Área
          </button>
        </div>

        {!loading && filtered.length > 0 && filtered.length <= 20 && (
          <div className="areas-chips">
            {filtered.map(a => (
              <div
                key={a.id}
                className={`area-chip ${!a.activo ? 'area-chip--inactive' : ''}`}
                onClick={() => setModal(a)}
                title="Clic para editar"
              >
                <LayoutGrid size={12} />
                <span>{a.nombre}</span>
                {!a.activo && <span className="area-chip__tag">Inactiva</span>}
              </div>
            ))}
          </div>
        )}

        <div className="table-card">
          <div className="table-card__toolbar">
            <span className="table-card__label">Catálogo de Áreas</span>

            <div className="table-search">
              <Search size={13} className="table-search__icon" />
              <input
                className="table-search__input"
                placeholder="Buscar…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>

            <select
              className="table-filter"
              value={filtroActivo}
              onChange={e => setFiltroActivo(e.target.value as typeof filtroActivo)}
            >
              <option value="todos">Todas</option>
              <option value="activo">Activas</option>
              <option value="inactivo">Inactivas</option>
            </select>

            <span className="table-card__count">{filtered.length} / {total}</span>
          </div>

          <div className="table-wrap">
            <table className="ctable">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th>Creada</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="ctable__empty">Cargando…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="ctable__empty">Sin resultados</td></tr>
                ) : filtered.map((a, i) => (
                  <tr key={a.id} className={!a.activo ? 'ctable__row--inactive' : ''}>
                    <td className="ctable__num">#{i + 1}</td>

                    <td>
                      <div className="area-name">
                        <span className="area-name__dot" />
                        <span className="area-name__label">{a.nombre}</span>
                      </div>
                    </td>

                    <td className="ctable__desc ctable__muted">
                      {a.descripcion ?? '—'}
                    </td>

                    <td>
                      <span className={`badge ${a.activo ? 'badge--activo' : 'badge--inactivo'}`}>
                        {a.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>

                    <td className="ctable__muted">{fmtDate(a.createdAt)}</td>

                    <td>
                      <div className="ctable__actions">
                        <button className="action-btn action-btn--edit" onClick={() => setModal(a)}>
                          <Pencil size={13} /> Editar
                        </button>
                        {a.activo && (
                          <button className="action-btn action-btn--del" onClick={() => setToDelete(a)}>
                            <Trash2 size={13} />
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
      </section>

      {modal && (
        <AreaModal
          initial={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchAreas}
        />
      )}

      {toDelete && (
        <ConfirmModal
          title="Desactivar Área"
          message={`¿Desactivar el área "${toDelete.nombre}"? El historial se conservará.`}
          confirmLabel="Desactivar"
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
         />
      )}
    </div>
  );
};