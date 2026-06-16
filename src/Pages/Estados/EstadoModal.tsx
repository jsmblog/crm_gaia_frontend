import { Check, X } from "lucide-react";
import { useToast } from "../../Hooks/useToast";
import { useState } from "react";
import { estadoService, type Estado } from "../../Services/estadoService";

interface ModalProps {
  initial?: Estado | null;
  onClose: () => void;
  onSaved: () => void;
}

export const EstadoModal = ({ initial, onClose, onSaved }: ModalProps) => {
  const { toast, ToastContainer } = useToast();
  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!nombre.trim()) return toast.warning("'Nombre' es requerido");
    setLoading(true);
    try {
      if (initial) {
        await estadoService.update(initial.id, { nombre: nombre.trim() });
        toast.success("Estado actualizado");
      } else {
        await estadoService.create({ nombre: nombre.trim() });
        toast.success("Estado creado");
      }
      onSaved();
      onClose();
    } catch {
      toast.error("Error al guardar el estado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <ToastContainer />
      <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
        <div className="modal__head">
          <div>
            <h2 className="modal__title">{initial ? "Editar Estado" : "Nuevo Estado"}</h2>
            <p className="modal__sub">Define un estado para clientes, proyectos o procesos</p>
          </div>
          <button className="modal__close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal__body">
          <div className="mfield">
            <label className="mfield__label">Nombre <span className="mfield__req">*</span></label>
            <input
              className="mfield__input"
              placeholder="Ej: En Negociación"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              autoFocus
            />
          </div>
        </div>
        <div className="modal__foot">
          <button className="modal__btn modal__btn--ghost" onClick={onClose}>Cancelar</button>
          <button className="modal__btn modal__btn--primary" onClick={handleSubmit} disabled={loading}>
            <Check size={14} />{loading ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};