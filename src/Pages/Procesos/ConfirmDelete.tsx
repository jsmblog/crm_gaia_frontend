import { X, Trash2 } from 'lucide-react';

interface Props {
  nombre: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDelete = ({ nombre, onConfirm, onCancel }: Props) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="opp-modal opp-modal--sm" onClick={e => e.stopPropagation()}>
      <div className="opp-modal__head">
        <h2 className="opp-modal__title">Eliminar proceso</h2>
        <button className="opp-modal__close" onClick={onCancel}><X size={16} /></button>
      </div>
      <div className="opp-modal__body">
        <p className="confirm-text">
          ¿Eliminar <strong>{nombre}</strong>? Se eliminarán también todas sus etapas e interacciones.
        </p>
      </div>
      <div className="opp-modal__foot">
        <button className="opp-btn opp-btn--ghost" onClick={onCancel}>Cancelar</button>
        <button className="opp-btn opp-btn--danger" onClick={onConfirm}>
          <Trash2 size={14} /> Eliminar
        </button>
      </div>
    </div>
  </div>
);
