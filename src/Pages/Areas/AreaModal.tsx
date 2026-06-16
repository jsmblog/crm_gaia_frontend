import { Check, X } from "lucide-react";
import { areaService } from "../../Services/areaService";
import { useState } from "react";
import type { AreaPayload, ModalProps } from "../../Interfaces/i_area";
import { useToast } from "../../Hooks/useToast";

const EMPTY: AreaPayload = { nombre: '', descripcion: '' };

export const AreaModal = ({ initial, onClose, onSaved }: ModalProps) => {
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