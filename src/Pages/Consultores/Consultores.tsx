import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Pencil, X, Check, UserX } from 'lucide-react';
import { consultorService } from '../../Services/consultorService';
import { useToast } from '../../Hooks/useToast';
import './Consultores.css';
import type { Consultor, ConsultorPayload } from '../../Interfaces/i_consultor';

interface ModalProps {
  initial?: Consultor | null;
  onClose: () => void;
  onSaved: () => void;
}

const EMPTY: ConsultorPayload = {
  nombre: '', email: '', telefono: '', rol: 'consultor', activo: true,
};

const ConsultorModal = ({ initial, onClose, onSaved }: ModalProps) => {
  const { toast, ToastContainer } = useToast();
  const [form, setForm] = useState<ConsultorPayload>(
    initial
      ? { nombre: initial.nombre, email: initial.email, telefono: initial.telefono ?? '', rol: initial.rol, activo: initial.activo, fecha_ingreso: initial.fecha_ingreso ? initial.fecha_ingreso.split('T')[0] : null }
      : { ...EMPTY }
  );
  const [loading, setLoading] = useState(false);

  const set = (k: keyof ConsultorPayload, v: string | boolean) =>
    setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.nombre.trim() || !form.email.trim())
      return toast.warning('Nombre y email son requeridos');
    if (form.fecha_ingreso && form.fecha_ingreso > new Date().toISOString().slice(0, 10)) {
      return toast.error("La fecha de ingreso no puede ser futura.");
    }
    setLoading(true);
    try {
      const payload = { ...form, telefono: form.telefono?.trim() || null };
      if (initial) {
        await consultorService.update(initial.id, payload);
        toast.success('Consultor actualizado');
      } else {
        await consultorService.create(payload);
        toast.success('Consultor creado');
      }
      onSaved();
      onClose();
    } catch (err: any) {
      // El backend usa "mensaje", no "message"
      const msg = err?.response?.data?.mensaje ?? 'Error al guardar el consultor';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <ToastContainer />
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__head">
          <div>
            <h2 className="modal__title">{initial ? 'Editar Consultor' : 'Nuevo Consultor'}</h2>
            <p className="modal__sub">
              {initial ? 'Modifica la información del consultor' : 'Complete los datos del nuevo consultor'}
            </p>
          </div>
          <button className="modal__close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal__body">
          <div className="modal__row">
            <div className="mfield">
              <label className="mfield__label">Nombre <span className="mfield__req">*</span></label>
              <input className="mfield__input" placeholder="Nombre completo"
                value={form.nombre} onChange={e => set('nombre', e.target.value)} />
            </div>
            <div className="mfield">
              <label className="mfield__label">Email <span className="mfield__req">*</span></label>
              <input className="mfield__input" type="email" placeholder="correo@empresa.com"
                value={form.email} onChange={e => set('email', e.target.value)}
                disabled={!!initial} />
            </div>
          </div>

          <div className="modal__row">
            <div className="mfield">
              <label className="mfield__label">Teléfono</label>
              <input className="mfield__input" placeholder="+593 99 000 0000"
                value={form.telefono ?? ''} onChange={e => set('telefono', e.target.value)} />
            </div>
            <div className="mfield">
              <label className="mfield__label">Rol</label>
              <select className="mfield__input mfield__select"
                value={form.rol} onChange={e => set('rol', e.target.value)}>
                <option value="consultor">Consultor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="mfield">
              <label className="mfield__label">Fecha de ingreso</label>
              <input
                className="mfield__input"
                type="date"
                max={new Date().toISOString().slice(0, 10)} value={form.fecha_ingreso ?? ''}
                onChange={e => set('fecha_ingreso', e.target.value)}
              />
            </div>
          </div>

          {/* Estado solo visible al editar */}
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
            <Check size={15} />
            {loading ? 'Guardando…' : 'Guardar Consultor'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface ConfirmProps { nombre: string; onConfirm: () => void; onCancel: () => void; }

const ConfirmDelete = ({ nombre, onConfirm, onCancel }: ConfirmProps) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
      <div className="modal__head">
        <h2 className="modal__title">Desactivar consultor</h2>
        <button className="modal__close" onClick={onCancel}><X size={16} /></button>
      </div>
      <div className="modal__body">
        <p className="confirm__text">
          ¿Desactivar a <strong>{nombre}</strong>? Su cuenta quedará inactiva
          pero el historial se conservará. Puedes reactivarlo editándolo.
        </p>
      </div>
      <div className="modal__foot">
        <button className="modal__btn modal__btn--ghost" onClick={onCancel}>Cancelar</button>
        <button className="modal__btn modal__btn--danger" onClick={onConfirm}>
          <UserX size={14} /> Desactivar
        </button>
      </div>
    </div>
  </div>
);

export const Consultores = () => {
  const { toast, ToastContainer } = useToast();
  const [consultores, setConsultores] = useState<Consultor[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filtroRol, setFiltroRol] = useState<'todos' | 'consultor' | 'admin'>('todos');
  const [filtroActivo, setFiltroActivo] = useState<'todos' | 'activo' | 'inactivo'>('todos');
  const [modal, setModal] = useState<'create' | Consultor | null>(null);
  const [toDelete, setToDelete] = useState<Consultor | null>(null);

  const fetchConsultores = async () => {
    setLoading(true);
    try {
      // El backend devuelve { ok, total, page, pages, data[] }
      const res = await consultorService.getAll({ limit: 100 });
      setConsultores(res.data);
      setTotal(res.total);
    } catch {
      toast.error('Error al cargar los consultores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConsultores(); }, []);

  // Filtrado local (búsqueda + rol + estado)
  const filtered = useMemo(() => {
    return consultores.filter(c => {
      const matchQuery = c.nombre.toLowerCase().includes(query.toLowerCase()) ||
        c.email.toLowerCase().includes(query.toLowerCase());
      const matchRol = filtroRol === 'todos' || c.rol === filtroRol;
      const matchActivo = filtroActivo === 'todos'
        || (filtroActivo === 'activo' && c.activo)
        || (filtroActivo === 'inactivo' && !c.activo);
      return matchQuery && matchRol && matchActivo;
    });
  }, [consultores, query, filtroRol, filtroActivo]);

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await consultorService.remove(toDelete.id);
      toast.success('Consultor desactivado');   // es soft delete
      setToDelete(null);
      fetchConsultores();
    } catch (err: any) {
      const msg = err?.response?.data?.mensaje ?? 'Error al desactivar el consultor';
      toast.error(msg);
    }
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="consultores-page">
      <ToastContainer />

      <section className="consultores-section">
        <div className="consultores-section__head">
          <h2 className="consultores-section__title">Gestión de Consultores</h2>
          <button className="btn-new" onClick={() => setModal('create')}>
            <Plus size={15} /> Nuevo Consultor
          </button>
        </div>

        <div className="table-card">
          <div className="table-card__toolbar">
            <span className="table-card__label">Consultores Registrados</span>

            {/* Búsqueda */}
            <div className="table-search">
              <Search size={13} className="table-search__icon" />
              <input
                className="table-search__input"
                placeholder="Buscar…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>

            {/* Filtro rol */}
            <select
              className="table-filter"
              value={filtroRol}
              onChange={e => setFiltroRol(e.target.value as typeof filtroRol)}
            >
              <option value="todos">Todos los roles</option>
              <option value="consultor">Consultor</option>
              <option value="admin">Admin</option>
            </select>

            {/* Filtro estado */}
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
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Fecha de ingreso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="ctable__empty">Cargando…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="ctable__empty">Sin resultados</td></tr>
                ) : filtered.map((c, i) => (
                  <tr key={c.id} className={!c.activo ? 'ctable__row--inactive' : ''}>
                    <td className="ctable__num">#{i + 1}</td>
                    <td className="ctable__name">{c.nombre}</td>
                    <td className="ctable__muted">{c.email}</td>
                    <td className="ctable__muted">{c.telefono ?? '—'}</td>
                    <td>
                      <span className={`badge badge--${c.rol}`}>{c.rol}</span>
                    </td>
                    <td>
                      <span className={`badge ${c.activo ? 'badge--activo' : 'badge--inactivo'}`}>
                        {c.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="ctable__muted">
                      {c.fecha_ingreso ? fmtDate(c.fecha_ingreso) : '—'}
                    </td>
                    <td>
                      <div className="ctable__actions">
                        <button className="action-btn action-btn--edit" onClick={() => setModal(c)}>
                          <Pencil size={13} /> Editar
                        </button>
                        {c.activo && (
                          <button className="action-btn action-btn--del" onClick={() => setToDelete(c)}>
                            <UserX size={13} />
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
        <ConsultorModal
          initial={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchConsultores}
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