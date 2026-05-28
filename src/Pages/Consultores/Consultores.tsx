import { useState, useMemo } from 'react';
import { Search, Plus, Pencil, X, Check, UserX, Monitor } from 'lucide-react';
import { consultorService } from '../../Services/consultorService';
import { useToast } from '../../Hooks/useToast';
import './Consultores.css';
import { VISTAS_DISPONIBLES, type Consultor, type ConsultorPayload, type VistaKey } from '../../Interfaces/i_consultor';
import { useWizardCatalogos } from '../Procesos/WizardContext';
  const parseVistas = (v: any): VistaKey[] => {
    if (!v) return [];
  if (Array.isArray(v)) return v;
  try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; }
  catch { return []; }
};
interface VistaSelectorProps {
  selected: VistaKey[];
  onChange: (vistas: VistaKey[]) => void;
}

const grupos = Array.from(new Set(VISTAS_DISPONIBLES.map(v => v.grupo)));

const VistaSelector = ({ selected, onChange }: VistaSelectorProps) => {
  const toggle = (key: VistaKey) =>
    onChange(selected.includes(key) ? selected.filter(k => k !== key) : [...selected, key]);

  const toggleGrupo = (grupo: string) => {
    const keys = VISTAS_DISPONIBLES.filter(v => v.grupo === grupo).map(v => v.key) as VistaKey[];
    const allOn = keys.every(k => selected.includes(k));
    if (allOn) onChange(selected.filter(k => !keys.includes(k)));
    else       onChange(Array.from(new Set([...selected, ...keys])));
  };

  return (
    <div className="vs__wrap">
      {grupos.map(grupo => {
        const items  = VISTAS_DISPONIBLES.filter(v => v.grupo === grupo);
        const allOn  = items.every(v => selected.includes(v.key as VistaKey));
        const someOn = items.some(v => selected.includes(v.key as VistaKey));
        return (
          <div key={grupo} className="vs__grupo">
            <div className="vs__grupo-head">
              <span className="vs__grupo-label">{grupo}</span>
              <button
                type="button"
                className={`vs__grupo-toggle ${allOn ? 'vs__grupo-toggle--on' : someOn ? 'vs__grupo-toggle--partial' : ''}`}
                onClick={() => toggleGrupo(grupo)}
              >
                {allOn ? 'Desmarcar todo' : 'Marcar todo'}
              </button>
            </div>
            <div className="vs__items">
              {items.map(v => {
                const on = selected.includes(v.key as VistaKey);
                return (
                  <button
                    key={v.key}
                    type="button"
                    className={`vs__pill ${on ? 'vs__pill--on' : ''}`}
                    onClick={() => toggle(v.key as VistaKey)}
                  >
                    <span className="vs__dot" />
                    {v.label}
                    {on && <Check size={10} className="vs__check" />}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface ModalProps { initial?: Consultor | null; onClose: () => void; onSaved: () => void; }

const EMPTY: ConsultorPayload = {
  nombre: '', email: '', telefono: '', rol: 'consultor', activo: true, vistas: [],
};

const ConsultorModal = ({ initial, onClose, onSaved }: ModalProps) => {
  const { toast, ToastContainer } = useToast();
  const { roles } = useWizardCatalogos();
  const [tab, setTab] = useState<'info' | 'vistas'>('info');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ConsultorPayload>(
    initial
      ? {
          nombre:        initial.nombre,
          email:         initial.email,
          telefono:      initial.telefono ?? '',
          rol:           initial.rol,
          activo:        initial.activo,
          fecha_ingreso: initial.fecha_ingreso?.split('T')[0] ?? null,
          vistas:        parseVistas(initial.vistas),
        }
      : { ...EMPTY }
  );

  const set = (k: keyof ConsultorPayload, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.nombre.trim() || !form.email.trim())
      return toast.warning('Nombre y email son requeridos');
    if (form.fecha_ingreso && form.fecha_ingreso > new Date().toISOString().slice(0, 10))
      return toast.error('La fecha de ingreso no puede ser futura.');
    setLoading(true);
    try {
      const payload = { ...form, telefono: form.telefono?.trim() || null };
      if (initial) await consultorService.update(initial.id, payload);
      else         await consultorService.create(payload);
      toast.success(initial ? 'Consultor actualizado' : 'Consultor creado');
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje ?? 'Error al guardar el consultor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <ToastContainer />
      <div className="modal modal--lg" onClick={e => e.stopPropagation()}>

        {/* head */}
        <div className="modal__head">
          <div>
            <h2 className="modal__title">{initial ? 'Editar Consultor' : 'Nuevo Consultor'}</h2>
            <p className="modal__sub">
              {initial ? 'Modifica información y accesos del consultor' : 'Completa los datos del nuevo consultor'}
            </p>
          </div>
          <button className="modal__close" onClick={onClose}><X size={16} /></button>
        </div>

        {/* tabs */}
        <div className="modal__tabs">
          <button className={`modal__tab ${tab === 'info'   ? 'modal__tab--active' : ''}`} onClick={() => setTab('info')}>
            Información general
          </button>
          <button className={`modal__tab ${tab === 'vistas' ? 'modal__tab--active' : ''}`} onClick={() => setTab('vistas')}>
            <Monitor size={13} />
            Acceso a vistas
            {form.vistas.length > 0 && (
              <span className="modal__tab-badge">{form.vistas.length}</span>
            )}
          </button>
        </div>

        {/* body */}
        <div className="modal__body">

          {/* ── tab info ── */}
          {tab === 'info' && (
            <>
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
                    <option value="">— Selecciona un rol —</option>
                    {roles?.map(r => <option key={r.id} value={r.nombre}>{r.nombre}</option>)}
                  </select>
                </div>
                <div className="mfield">
                  <label className="mfield__label">Fecha de ingreso</label>
                  <input className="mfield__input" type="date"
                    max={new Date().toISOString().slice(0, 10)}
                    value={form.fecha_ingreso ?? ''}
                    onChange={e => set('fecha_ingreso', e.target.value)} />
                </div>
              </div>
              {initial && (
                <div className="mfield">
                  <label className="mfield__label">Estado</label>
                  <div className="toggle-wrap">
                    <button type="button"
                      className={`toggle ${form.activo ? 'toggle--on' : ''}`}
                      onClick={() => set('activo', !form.activo)}>
                      <span className="toggle__thumb" />
                    </button>
                    <span className="toggle__label">{form.activo ? 'Activo' : 'Inactivo'}</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── tab vistas ── */}
          {tab === 'vistas' && (
            <div className="vs__section">
              <div className="vs__topbar">
                <div>
                  <p className="vs__main-title">Control de acceso a vistas</p>
                  <p className="vs__main-hint">
                    Define qué secciones del sistema puede ver.
                  </p>
                </div>
                <div className="vs__summary">
                  <span className="vs__count">{form.vistas.length}</span>
                  <span className="vs__count-label">/ {VISTAS_DISPONIBLES.length} vistas</span>
                  {form.vistas.length > 0 && (
                    <button className="vs__clear" onClick={() => set('vistas', [])}>
                      Limpiar
                    </button>
                  )}
                </div>
              </div>
              <VistaSelector
                selected={form.vistas}
                onChange={v => set('vistas', v)}
              />
            </div>
          )}
        </div>

        {/* foot */}
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
  const { consultores: consultoresOpt, reloadConsultores } = useWizardCatalogos();

  const [query,        setQuery]        = useState('');
  const [filtroRol,    setFiltroRol]    = useState('todos');
  const [filtroActivo, setFiltroActivo] = useState<'todos' | 'activo' | 'inactivo'>('todos');
  const [modal,    setModal]    = useState<'create' | Consultor | null>(null);
  const [toDelete, setToDelete] = useState<Consultor | null>(null);


  const consultores = useMemo<Consultor[]>(
    () => (consultoresOpt ?? []).map((c: any) => ({
      ...c,
      vistas: parseVistas(c.vistas),
    })),
    [consultoresOpt]
  );
  
  const rolesUnicos = useMemo(() =>
    Array.from(new Set(consultores.map(c => c.rol).filter(Boolean))),
    [consultores]
  );
  const filtered = useMemo(() => consultores.filter(c => {
    const q = query.toLowerCase();
    return (
      (c.nombre.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)) &&
      (filtroRol    === 'todos' || c.rol === filtroRol) &&
      (filtroActivo === 'todos'
        || (filtroActivo === 'activo'   && c.activo)
        || (filtroActivo === 'inactivo' && !c.activo))
    );
  }), [consultores, query, filtroRol, filtroActivo]);

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await consultorService.remove(toDelete.id);
      toast.success('Consultor desactivado');
      setToDelete(null);
      await reloadConsultores();
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje ?? 'Error al desactivar');
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
              <input className="table-search__input" placeholder="Buscar…"
                value={query} onChange={e => setQuery(e.target.value)} />
            </div>
            <select className="table-filter" value={filtroRol}
              onChange={e => setFiltroRol(e.target.value)}>
              <option value="todos">Todos los roles</option>
              {rolesUnicos.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select className="table-filter" value={filtroActivo}
              onChange={e => setFiltroActivo(e.target.value as any)}>
              <option value="todos">Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
            <span className="table-card__count">{filtered.length} / {consultores.length}</span>
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
                  <th>Acceso</th>
                  <th>Ingreso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="ctable__empty">Sin resultados</td></tr>
                ) : filtered.map((c, i) => (
                  <tr key={c.id} className={!c.activo ? 'ctable__row--inactive' : ''}>
                    <td className="ctable__num">#{i + 1}</td>
                    <td className="ctable__name">{c.nombre}</td>
                    <td className="ctable__muted">{c.email}</td>
                    <td className="ctable__muted">{c.telefono ?? '—'}</td>
                    <td><span className="badge badge--rol">{c.rol || '—'}</span></td>

                    <td>
                      {!c.vistas?.length ? (
                        <span className="ctable__muted">Sin acceso</span>
                      ) : c.vistas.length === VISTAS_DISPONIBLES.length ? (
                        <span className="vchip vchip--all">Acceso total</span>
                      ) : (
                        <div className="vchips">
                          {c.vistas?.slice(0,3).map(k => {
                            const v = VISTAS_DISPONIBLES.find(x => x.key === k);
                            return <span key={k} className="vchip">{v?.label ?? k}</span>;
                          })}
                          {c.vistas.length > 2 && (
                            <span className="vchip vchip--more">+{c.vistas.length - 3}</span>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="ctable__muted">{c.fecha_ingreso ? fmtDate(c.fecha_ingreso) : '—'}</td>
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
          onSaved={reloadConsultores}
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