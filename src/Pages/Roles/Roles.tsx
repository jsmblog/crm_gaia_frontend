import { useState, useMemo } from 'react';
import { Search, Plus, Pencil, Trash2, X, Check, Shield } from 'lucide-react';
import { rolService } from '../../Services/rolService';
import { useToast }   from '../../Hooks/useToast';
import './Roles.css';
import type { Rol, RolPayload } from '../../Interfaces/i_rol';
import { useWizardCatalogos } from '../Procesos/WizardContext';

const RolModal = ({ initial, onClose, onSaved }: {
  initial?: Rol | null; onClose: () => void; onSaved: () => void;
}) => {
  const { toast, ToastContainer } = useToast();
  const [form, setForm] = useState<RolPayload>(
    initial
      ? { nombre: initial.nombre, descripcion: initial.descripcion ?? '', activo: initial.activo }
      : { nombre: '', descripcion: '' }
  );
  const [loading, setLoading] = useState(false);

  const set = (k: keyof RolPayload, v: string | boolean) =>
    setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.nombre.trim()) return toast.warning("'Nombre' es requerido");
    setLoading(true);
    try {
      if (initial) { await rolService.update(initial.id, form); toast.success('Rol actualizado'); }
      else         { await rolService.create(form);             toast.success('Rol creado'); }
      onSaved(); onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje ?? 'Error al guardar');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <ToastContainer />
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__head">
          <div>
            <h2 className="modal__title">{initial ? 'Editar Rol' : 'Nuevo Rol'}</h2>
            <p className="modal__sub">
              {initial ? 'Modifica el nombre o descripción' : 'Los roles definen la función del usuario en un proyecto'}
            </p>
          </div>
          <button className="modal__close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal__body">
          <div className="mfield">
            <label className="mfield__label">Nombre <span className="mfield__req">*</span></label>
            <input
              className="mfield__input"
              placeholder="Ej: Arquitecto , Consultor RPA , etc."
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
            />
          </div>
          <div className="mfield">
            <label className="mfield__label">Descripción</label>
            <textarea
              className="mfield__input mfield__textarea"
              placeholder="Describe las responsabilidades de este rol…"
              rows={3}
              value={form.descripcion ?? ''}
              onChange={e => set('descripcion', e.target.value)}
            />
          </div>

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
            <Check size={15} />{loading ? 'Guardando…' : 'Guardar Rol'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ConfirmDelete = ({ nombre, onConfirm, onCancel }: {
  nombre: string; onConfirm: () => void; onCancel: () => void;
}) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
      <div className="modal__head">
        <h2 className="modal__title">Desactivar rol</h2>
        <button className="modal__close" onClick={onCancel}><X size={16} /></button>
      </div>
      <div className="modal__body">
        <p className="confirm__text">
          ¿Desactivar <strong>{nombre}</strong>? Las asignaciones existentes no se verán afectadas,
          pero no podrá asignarse a nuevos miembros.
        </p>
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

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' });

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
                        ? 'No hay roles. Crea el primero para poder asignar personal a los proyectos.'
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
                          <Pencil size={13} /> Editar
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
        <ConfirmDelete
          nombre={toDelete.nombre}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
};