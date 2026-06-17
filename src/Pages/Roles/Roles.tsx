import { useState, useMemo } from 'react';
import { Search, Plus, Pencil, Trash2, Shield } from 'lucide-react';
import { rolService } from '../../Services/rolService';
import { useToast }   from '../../Hooks/useToast';
import './Roles.css';
import type { Rol } from '../../Interfaces/i_rol';
import { useWizardCatalogos } from '../Procesos/WizardContext';
import { RolModal } from './RolModal';
import { fmtDate } from '../../Utils/fmtDate';
import { ConfirmModal } from '../../Components/ConfirmModal';

export const Roles = () => {
  const { toast, ToastContainer } = useToast();
  const {reloadRoles,roles} = useWizardCatalogos();
  const total = roles?.length || 0;
  const [query, setQuery]           = useState('');
  const [filtroActivo, setFiltroActivo] = useState<'todos' | 'activo' | 'inactivo'>('activo');
  const [modal, setModal]           = useState<'create' | Rol | null>(null);
  const [toDelete, setToDelete]     = useState<Rol | null>(null);

  const filtered = useMemo(() =>
    roles?.filter(r => {
      const matchQ = r.nombre.toLowerCase().includes(query.toLowerCase()) ||
                     (r.descripcion ?? '').toLowerCase().includes(query.toLowerCase());
      const matchA = filtroActivo === 'todos'
        || (filtroActivo === 'activo'   &&  r.activo)
        || (filtroActivo === 'inactivo' && !r.activo);
      return matchQ && matchA;
    }), [roles, query, filtroActivo]);

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await rolService.remove(toDelete.id);
      toast.success('Rol desactivado');
      setToDelete(null);
      reloadRoles();
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje ?? 'Error al desactivar');
    }
  };

  return (
    <div className="roles-page">
      <ToastContainer />

      <section className="roles-section">
        <div className="roles-section__head">
          <h2 className="roles-section__title">Gestión de Roles</h2>
          <button className="btn-new" onClick={() => setModal('create')}>
            <Plus size={15} /> Nuevo Rol
          </button>
        </div>

        <div className="table-card">
          <div className="table-card__toolbar">
            <span className="table-card__label">Catálogo de Roles</span>

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
              <option value="todos">Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
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
                  <th>Creado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {!roles ? (
                  <tr><td colSpan={6} className="ctable__empty">Cargando…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="ctable__empty">
                      {roles?.length === 0
                        ? 'No hay roles. ¡Crea el primero!'
                        : 'Sin resultados'}
                    </td>
                  </tr>
                ) : filtered.map((r, i) => (
                  <tr key={r.id} className={!r.activo ? 'ctable__row--inactive' : ''}>
                    <td className="ctable__num">#{i + 1}</td>

                    <td>
                      <div className="role-name">
                        <span className="role-name__icon"><Shield size={12} /></span>
                        <span className="role-name__label">{r.nombre}</span>
                      </div>
                    </td>

                    <td className="ctable__desc ctable__muted">
                      {r.descripcion ?? '—'}
                    </td>

                    <td>
                      <span className={`badge ${r.activo ? 'badge--activo' : 'badge--inactivo'}`}>
                        {r.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    <td className="ctable__muted">{fmtDate(r.createdAt)}</td>

                    <td>
                      <div className="ctable__actions">
                        <button className="action-btn action-btn--edit" onClick={() => setModal(r)}>
                          <Pencil size={13} />
                        </button>
                        {r.activo && (
                          <button className="action-btn action-btn--del" onClick={() => setToDelete(r)}>
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
        <RolModal
          initial={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={reloadRoles}
        />
      )}

      {toDelete && (
        <ConfirmModal
          title="Eliminar rol"
          message={`¿Estás seguro de que quieres eliminar el rol "${toDelete.nombre}"?`}
          confirmLabel="Eliminar"
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
};