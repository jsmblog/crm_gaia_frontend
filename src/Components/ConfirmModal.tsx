import type { ReactNode, MouseEvent } from "react";
import { X } from "lucide-react";

interface ConfirmModalProps {
  title: string;
  message: ReactNode;
  confirmLabel: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal = ({
  title, message, confirmLabel, onConfirm, onCancel,
}: ConfirmModalProps) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal modal--sm" onClick={(e: MouseEvent) => e.stopPropagation()}>
      <div className="modal__head">
        <h2 className="modal__title">{title}</h2>
        <button className="modal__close" onClick={onCancel}><X size={16} /></button>
      </div>
      <div className="modal__body">
        <p className="confirm__text">{message}</p>
      </div>
      <div className="modal__foot">
        <button className="modal__btn modal__btn--ghost" onClick={onCancel}>Cancelar</button>
        <button className="modal__btn modal__btn--danger" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);
