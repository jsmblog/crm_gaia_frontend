import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { clienteService } from '../../Services/clienteService';
import { useToast }       from '../../Hooks/useToast';
import './Clientes.css';
import type { Cliente, ClientePayload } from '../../Interfaces/i_cliente';

interface ModalProps { initial?: Cliente | null; onClose: () => void; onSaved: () => void; }

const EMPTY: ClientePayload = {
  nombre: '', email: '', telefono: '', empresa: '', tipo_cliente: 'Actual',
};

const ClienteModal = ({ initial, onClose, onSaved }: ModalProps) => {
  const { toast, ToastContainer } = useToast();
  const [form, setForm] = useState<ClientePayload>(
    initial ? {
      nombre:       initial.nombre,
      email:        initial.email    ?? '',
      telefono:     initial.telefono ?? '',
      empresa:      initial.empresa,
      tipo_cliente: initial.tipo_cliente,
    } : { ...EMPTY }
  );
  const [loading, setLoading] = useState(false);

  const set = (k: keyof ClientePayload, v: string) =>
    setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.nombre.trim() || !form.empresa.trim())
      return toast.warning('Nombre y empresa son requeridos');
    setLoading(true);
    try {
      if (initial) { await clienteService.update(initial.id, form); toast.success('Cliente actualizado'); }
      else         { await clienteService.create(form);             toast.success('Cliente creado');      }
      onSaved(); onClose();
    } catch { toast.error('Error al guardar el cliente'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <ToastContainer />
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__head">
          <div>
            <h2 className="modal__title">{initial ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
            <p className="modal__sub">Complete la información del cliente</p>
          </div>
          <button className="modal__close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal__body">
          <div className="mfield">
            <label className="mfield__label">Nombre del cliente <span className="mfield__req">*</span></label>
            <input className="mfield__input" placeholder="Ej: Empresa ABC S.A."
              value={form.nombre} onChange={e => set('nombre', e.target.value)} />
          </div>
          <div className="mfield">
            <label className="mfield__label">Empresa <span className="mfield__req">*</span></label>
            <input className="mfield__input" placeholder="Ej: ABC Corp."
              value={form.empresa} onChange={e => set('empresa', e.target.value)} />
          </div>
          <div className="modal__row">
            <div className="mfield">
              <label className="mfield__label">Email</label>
              <input className="mfield__input" type="email" placeholder="correo@empresa.com"
                value={form.email ?? ''} onChange={e => set('email', e.target.value)} />
            </div>
            <div className="mfield">
              <label className="mfield__label">Teléfono</label>
              <input className="mfield__input" placeholder="+593 99 000 0000"
                value={form.telefono ?? ''} onChange={e => set('telefono', e.target.value)} />
            </div>
          </div>
          <div className="mfield">
            <label className="mfield__label">Tipo de cliente</label>
            <select className="mfield__input mfield__select"
              value={form.tipo_cliente} onChange={e => set('tipo_cliente', e.target.value as any)}>
              <option value="Actual">Actual</option>
              <option value="Nuevo">Nuevo</option>
            </select>
          </div>
        </div>

        <div className="modal__foot">
          <button className="modal__btn modal__btn--ghost" onClick={onClose}>Cancelar</button>
          <button className="modal__btn modal__btn--primary" onClick={handleSubmit} disabled={loading}>
            <Check size={15} />{loading ? 'Guardando…' : 'Guardar Cliente'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Confirm delete ──────────────────────────── */
const ConfirmDelete = ({ nombre, onConfirm, onCancel }: { nombre: string; onConfirm: () => void; onCancel: () => void }) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
      <div className="modal__head">
        <h2 className="modal__title">Eliminar cliente</h2>
        <button className="modal__close" onClick={onCancel}><X size={16} /></button>
      </div>
      <div className="modal__body">
        <p className="confirm__text">
          ¿Estás seguro de eliminar a <strong>{nombre}</strong>? Esta acción no se puede deshacer.
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
export const Clientes = () => {
  const { toast, ToastContainer } = useToast();
  const [clientes, setClientes]   = useState<(Cliente & { oportunidades?: number })[]>([]);
  const [loading, setLoading]     = useState(true);
  const [query, setQuery]         = useState('');
  const [modal, setModal]         = useState<'create' | Cliente | null>(null);
  const [toDelete, setToDelete]   = useState<Cliente | null>(null);

  const fetchClientes = async () => {
    setLoading(true);
    try { setClientes(await clienteService.getAll()); }
    catch { toast.error('Error al cargar los clientes'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchClientes(); }, []);

  const filtered = useMemo(() =>
    clientes.filter(c =>
      c.nombre.toLowerCase().includes(query.toLowerCase()) ||
      c.empresa.toLowerCase().includes(query.toLowerCase())
    ), [clientes, query]);

  const handleDelete = async () => {
    if (!toDelete) return;
    try { await clienteService.remove(toDelete.id); toast.success('Cliente eliminado'); setToDelete(null); fetchClientes(); }
    catch { toast.error('Error al eliminar el cliente'); }
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-EC', { day:'2-digit', month:'2-digit', year:'numeric' });

  return (
    <div className="clientes-page">
      <ToastContainer />

      <section className="clientes-section">
        <div className="clientes-section__head">
          <h2 className="clientes-section__title">Gestión de Clientes</h2>
          <button className="btn-new" onClick={() => setModal('create')}>
            <Plus size={15} /> Nuevo Cliente
          </button>
        </div>

        <div className="table-card">
          <div className="table-card__toolbar">
            <span className="table-card__label">Clientes Registrados</span>
            <div className="table-search">
              <Search size={13} className="table-search__icon" />
              <input className="table-search__input" placeholder="Buscar…"
                value={query} onChange={e => setQuery(e.target.value)} />
            </div>
            <span className="table-card__count">{filtered.length} registros</span>
          </div>

          <div className="table-wrap">
            <table className="ctable">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Empresa</th>
                  <th>Tipo</th>
                  <th>Oportunidades</th>
                  <th>Email</th>
                  <th>Contacto</th>
                  <th>Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="ctable__empty">Cargando…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="ctable__empty">Sin resultados</td></tr>
                ) : filtered.map((c, i) => (
                  <tr key={c.id}>
                    <td className="ctable__num">#{i + 1}</td>
                    <td className="ctable__name">{c.nombre}</td>
                    <td>{c.empresa}</td>
                    <td>
                      <span className={`badge badge--${c.tipo_cliente.toLowerCase()}`}>
                        {c.tipo_cliente}
                      </span>
                    </td>
                    <td>
                      <span className={`opp-badge ${(c.oportunidades ?? 0) > 0 ? 'opp-badge--active' : 'opp-badge--zero'}`}>
                        {c.oportunidades ?? 0}
                      </span>
                    </td>
                    <td className="ctable__muted">{c.email    ?? '—'}</td>
                    <td className="ctable__muted">{c.telefono ?? '—'}</td>
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
        <ClienteModal
          initial={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchClientes}
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