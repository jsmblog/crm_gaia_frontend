import { Check, Monitor, X } from "lucide-react";
import { VistaSelector } from "./VistaSelector";
import { VISTAS_DISPONIBLES, type Consultor, type ConsultorPayload } from "../../Interfaces/i_consultor";
import { consultorService } from "../../Services/consultorService";
import { useToast } from "../../Hooks/useToast";
import { useWizardCatalogos } from "../Procesos/WizardContext";
import { useState } from "react";
import { parseVistas } from "../../Constants/parseVistas";

const EMPTY: ConsultorPayload = {
  nombre: '', email: '', telefono: '', rol: 'consultor', activo: true, vistas: [],
};
interface ModalProps { initial?: Consultor | null; onClose: () => void; onSaved: () => void; }
export const ConsultorModal = ({ initial, onClose, onSaved }: ModalProps) => {
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