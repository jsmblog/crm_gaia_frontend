import { Check, X } from "lucide-react";
import { herramientaService } from "../../Services/herramientaService";
import { useState } from "react";
import type { HerramientaPayload, HerramientaRpa } from "../../Interfaces/i_herramienta";
import { useToast } from "../../Hooks/useToast";

interface ModalProps {
  initial?: HerramientaRpa | null;
  onClose: () => void;
  onSaved: () => void;
}

const EMPTY: HerramientaPayload = {
  nombre: '', fabricante: ''
};

export const HerramientaModal = ({ initial, onClose, onSaved }: ModalProps) => {
  const { toast, ToastContainer } = useToast();
  const [form, setForm] = useState<HerramientaPayload>(
    initial
      ? { nombre: initial.nombre, fabricante: initial.fabricante ?? '', activo: initial.activo }
      : { ...EMPTY }
  );
  const [loading, setLoading] = useState(false);

  const set = (k: keyof HerramientaPayload, v: string | boolean) =>
    setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.nombre.trim()) return toast.warning("'Nombre' es requerido");
    setLoading(true);
    try {
      const payload = { ...form, fabricante: form.fabricante?.trim() || undefined };
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