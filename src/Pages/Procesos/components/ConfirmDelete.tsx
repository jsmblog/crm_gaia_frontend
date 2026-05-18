import { X, Trash2 } from 'lucide-react';

interface Props {
  nombre: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDelete = ({ nombre, onConfirm, onCancel }: Props) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
      <div className="modal__head">
        <h2 className="modal__title">Eliminar proceso</h2>
        <button className="modal__close" onClick={onCancel}><X size={16} /></button>
      </div>
      <div className="modal__body">
        <p className="confirm__text">
          ¿Eliminar <strong>{nombre}</strong>? Se eliminarán también todas sus etapas e interacciones.
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