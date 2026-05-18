import { Trash2, X } from "lucide-react";

export const ConfirmDeactivateProyecto = ({ nombre, onConfirm, onCancel }: {
  nombre: string; onConfirm: () => void; onCancel: () => void;
}) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
      <div className="modal__head">
        <h2 className="modal__title">Desactivar proyecto</h2>
        <button className="modal__close" onClick={onCancel}><X size={16} /></button>
      </div>
      <div className="modal__body">
        <p className="confirm__text">¿Desactivar <strong>{nombre}</strong>? El historial se conservará.</p>
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
