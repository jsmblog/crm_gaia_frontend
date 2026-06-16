import { useState } from "react";
import { useToast } from "../../Hooks/useToast";
import type { Rol, RolPayload } from "../../Interfaces/i_rol";
import { rolService } from "../../Services/rolService";
import { Check, X } from "lucide-react";

export const RolModal = ({ initial, onClose, onSaved }: {
  initial?: Rol | null; onClose: () => void; onSaved: () => void;
}) => {
  const { toast, ToastContainer } = useToast();
  const [form, setForm] = useState<RolPayload>(
    initial
      ? { nombre: initial.nombre.toLowerCase(), descripcion: initial.descripcion ?? '', activo: initial.activo }
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
      else { await rolService.create(form);             
      toast.success('Rol creado'); }
      onSaved(); 
      onClose();
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
              onChange={e => set('nombre', e.target.value.toLowerCase())}
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