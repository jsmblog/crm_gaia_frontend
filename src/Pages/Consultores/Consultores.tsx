import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { consultorService } from '../../Services/consultorService';
import { useToast } from '../../Hooks/useToast';
import './Consultores.css';
import type { Consultor, ConsultorPayload } from '../../Interfaces/i_consultor';

interface ModalProps {
  initial?: Consultor | null;
  onClose:  () => void;
  onSaved:  () => void;
}

const EMPTY: ConsultorPayload = {
  nombre: '', email: '', telefono: '', rol: 'consultor', activo: true,
};

const ConsultorModal = ({ initial, onClose, onSaved }: ModalProps) => {
  const { toast, ToastContainer } = useToast();
  const [form, setForm] = useState<ConsultorPayload>(
    initial ? {
      nombre:   initial.nombre,
      email:    initial.email,
      telefono: initial.telefono ?? '',
      rol:      initial.rol,
      activo:   initial.activo,
    } : { ...EMPTY }
  );
  const [loading, setLoading] = useState(false);

  const set = (k: keyof ConsultorPayload, v: string | boolean) =>
    setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.nombre.trim() || !form.email.trim())
      return toast.warning('Nombre y email son requeridos');

    setLoading(true);
    try {
      const payload = { ...form, telefono: form.telefono?.trim() || null };
      if (initial) {
        await consultorService.update(initial.id, payload);
        toast.success('Consultor actualizado');
      } else {
        await consultorService.create(payload as ConsultorPayload);
        toast.success('Consultor creado. Se envió un correo de verificación.');
      }
      onSaved();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Error al guardar el consultor';
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
              {initial ? 'Modifica la información del consultor' : 'Se enviará un correo de acceso al email registrado'}
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
              <input className="mfield__input" type="email" placeholder="correo@gaia.com"
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
          </div>

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

/* ── Confirm delete ──────────────────────────── */
interface ConfirmProps { nombre: string; onConfirm: () => void; onCancel: () => void; }

const ConfirmDelete = ({ nombre, onConfirm, onCancel }: ConfirmProps) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
      <div className="modal__head">
        <h2 className="modal__title">Eliminar consultor</h2>
        <button className="modal__close" onClick={onCancel}><X size={16} /></button>
      </div>
      <div className="modal__body">
        <p className="confirm__text">
          ¿Estás seguro de eliminar a <strong>{nombre}</strong>? Esta acción eliminará también su acceso al sistema.
        </p>
      </div>
      <div className="modal__foot">
        <button className="modal__btn modal__btn--ghost" onClick={onCancel}>Cancelar</button>
        <button className="modal__btn modal__btn--danger" onClick={onConfirm}>
          <Trash2 size={14} /> Eliminar
        </button>
      </div>
    </div>
  </div>
);

/* ── Page ────────────────────────────────────── */
export const Consultores = () => {
  const { toast, ToastContainer } = useToast();
  const [consultores, setConsultores] = useState<Consultor[]>([]);
  const [loading, setLoading]         = useState(true);
  const [query, setQuery]             = useState('');
  const [modal, setModal]             = useState<'create' | Consultor | null>(null);
  const [toDelete, setToDelete]       = useState<Consultor | null>(null);

  const fetchConsultores = async () => {
    setLoading(true);
    try {
      const data = await consultorService.getAll();
      setConsultores(data);
    } catch {
      toast.error('Error al cargar los consultores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConsultores(); }, []);

  const filtered = useMemo(() =>
    consultores.filter(c =>
      c.nombre.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase())
    ), [consultores, query]);

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await consultorService.remove(toDelete.id);
      toast.success('Consultor eliminado');
      setToDelete(null);
      fetchConsultores();
    } catch {
      toast.error('Error al eliminar el consultor');
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
            <div className="table-search">
              <Search size={13} className="table-search__icon" />
              <input
                className="table-search__input"
                placeholder="Buscar…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <span className="table-card__count">{filtered.length} registros</span>
          </div>

          <div className="table-wrap">
            <table className="ctable">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Activo</th>
                  <th>Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="ctable__empty">Cargando…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="ctable__empty">Sin resultados</td></tr>
                ) : filtered.map((c, i) => (
                  <tr key={c.id}>
                    <td className="ctable__num">#{i + 1}</td>
                    <td className="ctable__name">{c.nombre}</td>
                    <td className="ctable__muted">{c.email}</td>
                    <td>
                      <span className={`badge badge--${c.rol}`}>{c.rol}</span>
                    </td>
                    <td>
                      <span className={`badge ${c.activo ? 'badge--activo' : 'badge--inactivo'}`}>
                        {c.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="ctable__muted">{fmtDate(c.createdAt)}</td>
                    <td>
                      <div className="ctable__actions">
                        <button className="action-btn action-btn--edit" onClick={() => setModal(c)}>
                          <Pencil size={13} /> Editar
                        </button>
                        <button className="action-btn action-btn--del" onClick={() => setToDelete(c)}>
                          <Trash2 size={13} />
                        </button>
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