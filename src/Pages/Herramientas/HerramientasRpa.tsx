import { useState, useEffect, useMemo } from 'react';
import {
  Search, Plus, Pencil, Trash2, X, Check,
  Cpu, Building2,
} from 'lucide-react';
import { herramientaService }  from '../../Services/herramientaService';
import { useToast }             from '../../Hooks/useToast';
import './HerramientasRpa.css';
import type { HerramientaRpa, HerramientaPayload } from '../../Interfaces/i_herramienta';

interface ModalProps {
  initial?: HerramientaRpa | null;
  onClose:  () => void;
  onSaved:  () => void;
}

const EMPTY: HerramientaPayload = {
  nombre: '', fabricante: ''
};

const HerramientaModal = ({ initial, onClose, onSaved }: ModalProps) => {
  const { toast, ToastContainer } = useToast();
  const [form, setForm] = useState<HerramientaPayload>(
    initial
      ? {
          nombre:      initial.nombre,
          fabricante:  initial.fabricante  ?? '',
          activo:      initial.activo,
        }
      : { ...EMPTY }
  );
  const [loading, setLoading] = useState(false);

  const set = (k: keyof HerramientaPayload, v: string | boolean) =>
    setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.nombre.trim())
      return toast.warning("'Nombre' es requerido");

    setLoading(true);
    try {
      const payload = {
        ...form,
        fabricante:  form.fabricante?.trim()  || undefined,
      };

      if (initial) {
        await herramientaService.update(initial.id, payload);
        toast.success('Herramienta actualizada');
      } else {
        await herramientaService.create(payload);
        toast.success('Herramienta creada');
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje ?? 'Error al guardar');
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
            <h2 className="modal__title">
              {initial ? 'Editar Herramienta' : 'Nueva Herramienta RPA'}
            </h2>
            <p className="modal__sub">
              {initial ? 'Modifica los datos de la herramienta' : 'Registra una nueva herramienta de automatización'}
            </p>
          </div>
          <button className="modal__close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal__body">
          <div className="mfield">
            <label className="mfield__label">Nombre <span className="mfield__req">*</span></label>
            <input
              className="mfield__input"
              placeholder="Ej: UiPath, Power Automate…"
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
            />
          </div>

          <div className="modal__row">
            <div className="mfield">
              <label className="mfield__label">Fabricante</label>
              <input
                className="mfield__input"
                placeholder="Ej: UiPath Inc."
                value={form.fabricante ?? ''}
                onChange={e => set('fabricante', e.target.value)}
              />
            </div>
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
            {loading ? 'Guardando…' : 'Guardar'}
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
        <h2 className="modal__title">Desactivar herramienta</h2>
        <button className="modal__close" onClick={onCancel}><X size={16} /></button>
      </div>
      <div className="modal__body">
        <p className="confirm__text">
          ¿Desactivar <strong>{nombre}</strong>?
          No podrá asignarse a nuevos proyectos, pero las asignaciones existentes se conservan.
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

export const HerramientasRpa = () => {
  const { toast, ToastContainer } = useToast();
  const [herramientas, setHerramientas] = useState<HerramientaRpa[]>([]);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(true);
  const [query, setQuery]               = useState('');
  const [filtroActivo, setFiltroActivo] = useState<'todos' | 'activo' | 'inactivo'>('activo');
  const [modal, setModal]               = useState<'create' | HerramientaRpa | null>(null);
  const [toDelete, setToDelete]         = useState<HerramientaRpa | null>(null);

  const fetchHerramientas = async () => {
    setLoading(true);
    try {
      const res = await herramientaService.getAll({ limit: 100 });
      setHerramientas(res.data);
      setTotal(res.total);
    } catch {
      toast.error('Error al cargar las herramientas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHerramientas(); }, []);

  const filtered = useMemo(() =>
    herramientas.filter(h => {
      const matchQ = h.nombre.toLowerCase().includes(query.toLowerCase()) ||
                     (h.fabricante ?? '').toLowerCase().includes(query.toLowerCase());
      const matchA = filtroActivo === 'todos'
        || (filtroActivo === 'activo'   &&  h.activo)
        || (filtroActivo === 'inactivo' && !h.activo);
      return matchQ && matchA;
    }), [herramientas, query, filtroActivo]);

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await herramientaService.remove(toDelete.id);
      toast.success('Herramienta desactivada');
      setToDelete(null);
      fetchHerramientas();
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje ?? 'Error al desactivar');
    }
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="herramientas-page">
      <ToastContainer />

      <section className="herramientas-section">
        <div className="herramientas-section__head">
          <h2 className="herramientas-section__title">Herramientas RPA</h2>
          <button className="btn-new" onClick={() => setModal('create')}>
            <Plus size={15} /> Nueva Herramienta
          </button>
        </div>

        <div className="table-card">
          <div className="table-card__toolbar">
            <span className="table-card__label">Catálogo de Herramientas</span>

            <div className="table-search">
              <Search size={13} className="table-search__icon" />
              <input
                className="table-search__input"
                placeholder="Buscar por nombre o fabricante…"
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
                  <th>Herramienta</th>
                  <th>Fabricante</th>
                  <th>Estado</th>
                  <th>Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="ctable__empty">Cargando…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="ctable__empty">Sin resultados</td></tr>
                ) : filtered.map((h, i) => (
                  <tr key={h.id} className={!h.activo ? 'ctable__row--inactive' : ''}>
                    <td className="ctable__num">#{i + 1}</td>

                    <td>
                      <div className="herra-name">
                        <span className="herra-name__icon"><Cpu size={14} /></span>
                        <span className="herra-name__label">{h.nombre}</span>
                      </div>
                    </td>

                    <td>
                      {h.fabricante
                        ? <div className="ctable__meta"><Building2 size={11} />{h.fabricante}</div>
                        : <span className="ctable__muted">—</span>
                      }
                    </td>

                    <td>
                      <span className={`badge ${h.activo ? 'badge--activo' : 'badge--inactivo'}`}>
                        {h.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>

                    <td className="ctable__muted">{fmtDate(h.createdAt)}</td>

                    <td>
                      <div className="ctable__actions">
                        <button className="action-btn action-btn--edit" onClick={() => setModal(h)}>
                          <Pencil size={13} /> Editar
                        </button>
                        {h.activo && (
                          <button className="action-btn action-btn--del" onClick={() => setToDelete(h)}>
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
        <HerramientaModal
          initial={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchHerramientas}
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