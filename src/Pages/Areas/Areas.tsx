import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Pencil, Trash2, X, Check, LayoutGrid } from 'lucide-react';
import { areaService }  from '../../Services/areaService';
import { useToast }     from '../../Hooks/useToast';
import './Areas.css';
import type { Area, AreaPayload } from '../../Interfaces/i_area';

interface ModalProps {
  initial?: Area | null;
  onClose:  () => void;
  onSaved:  () => void;
}

const EMPTY: AreaPayload = { nombre: '', descripcion: '' };

const AreaModal = ({ initial, onClose, onSaved }: ModalProps) => {
  const { toast, ToastContainer } = useToast();
  const [form, setForm]   = useState<AreaPayload>(
    initial
      ? { nombre: initial.nombre, descripcion: initial.descripcion ?? '', activo: initial.activo }
      : { ...EMPTY }
  );
  const [loading, setLoading] = useState(false);

  const set = (k: keyof AreaPayload, v: string | boolean) =>
    setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.nombre.trim()) return toast.warning("'Nombre' es requerido");
    setLoading(true);
    try {
      if (initial) {
        await areaService.update(initial.id, form);
        toast.success('Área actualizada');
      } else {
        await areaService.create(form);
        toast.success('Área creada');
      }
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
            <h2 className="modal__title">{initial ? 'Editar Área' : 'Nueva Área'}</h2>
            <p className="modal__sub">
              {initial ? 'Modifica el nombre o descripción' : 'Las áreas se usan para clasificar proyectos'}
            </p>
          </div>
          <button className="modal__close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal__body">
          <div className="mfield">
            <label className="mfield__label">Nombre <span className="mfield__req">*</span></label>
            <input
              className="mfield__input"
              placeholder="Ej: Automatización, Contabilidad, RRHH…"
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
            />
          </div>
          <div className="mfield">
            <label className="mfield__label">Descripción</label>
            <textarea
              className="mfield__input mfield__textarea"
              placeholder="Describe brevemente el área…"
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
                <span className="toggle__label">{form.activo ? 'Activa' : 'Inactiva'}</span>
              </div>
            </div>
          )}
        </div>

        <div className="modal__foot">
          <button className="modal__btn modal__btn--ghost" onClick={onClose}>Cancelar</button>
          <button className="modal__btn modal__btn--primary" onClick={handleSubmit} disabled={loading}>
            <Check size={15} />
            {loading ? 'Guardando…' : 'Guardar Área'}
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
        <h2 className="modal__title">Desactivar área</h2>
        <button className="modal__close" onClick={onCancel}><X size={16} /></button>
      </div>
      <div className="modal__body">
        <p className="confirm__text">
          ¿Desactivar <strong>{nombre}</strong>?
          Los proyectos que la usan no se verán afectados, pero no podrá asignarse a nuevos proyectos.
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
        <ConfirmDelete
          nombre={toDelete.nombre}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
};