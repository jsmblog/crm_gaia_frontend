import { Check, Phone, PhoneOff, Share2, X } from "lucide-react";
import { useToast } from "../../Hooks/useToast";
import { useState } from "react";
import type { Cliente, UsuarioCliente } from "../../Interfaces/i_cliente";
import type { Consultor } from "../../Interfaces/i_consultor";

export const CompartirModal = ({ usuario, cliente, consultores, onClose }: {
  usuario: UsuarioCliente; cliente: Cliente; consultores: Consultor[]; onClose: () => void;
}) => {
  const { toast, ToastContainer } = useToast();
  const [selectedId, setSelectedId] = useState('');
  const seleccionado = consultores.find(c => c.id === selectedId) ?? null;
  const tieneTelefono = !!seleccionado?.telefono;

  const handleEnviar = () => {
    if (!seleccionado)  return toast.warning('Selecciona un consultor');
    if (!tieneTelefono) return;
    const lineas = [
      `📋 *Contacto — ${cliente.empresa}*`, ``,
      `👤 *Nombre:* ${usuario.nombre}`,
      ...(usuario.cargo    ? [`💼 *Cargo:* ${usuario.cargo}`]  : []),
      ...(usuario.email    ? [`✉️ *Email:* ${usuario.email}`]  : []),
      ...(usuario.telefono ? [`📞 *Tel:* ${usuario.telefono}`] : []),
      ``, `_Compartido desde CRM GAIA_`,
    ];
    const msg = encodeURIComponent(lineas.join('\n'));
    const tel = seleccionado.telefono!.replace(/[\s\-\(\)\+]/g, '');
    window.open(`https://wa.me/${tel}?text=${msg}`, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <ToastContainer />
      <div className="modal modal--compartir" onClick={e => e.stopPropagation()}>
        <div className="modal__head">
          <div>
            <h2 className="modal__title">Compartir contacto</h2>
            <p className="modal__sub">Enviar datos de <strong>{usuario.nombre}</strong> por WhatsApp</p>
          </div>
          <button className="modal__close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal__body">
          <div className="compartir-preview">
            <div className="compartir-preview__avatar">{usuario.nombre.charAt(0).toUpperCase()}</div>
            <div>
              <p className="compartir-preview__nombre">{usuario.nombre}</p>
              <p className="compartir-preview__meta">{[usuario.cargo].filter(Boolean).join(' · ')}</p>
            </div>
          </div>
          <p className="compartir-label">Selecciona el consultor destinatario:</p>
          {consultores.filter(c => c.activo).length === 0 ? (
            <p className="compartir-empty">No hay consultores activos.</p>
          ) : (
            <ul className="consultor-pick-list">
              {consultores.filter(c => c.activo).map(c => {
                const sinTel  = !c.telefono;
                const selected = selectedId === c.id;
                return (
                  <li key={c.id}
                    className={`consultor-pick-item ${selected ? 'consultor-pick-item--selected' : ''} ${sinTel ? 'consultor-pick-item--disabled' : ''}`}
                    onClick={() => !sinTel && setSelectedId(c.id)}>
                    <div className="consultor-pick-avatar">{c.nombre.charAt(0).toUpperCase()}</div>
                    <div className="consultor-pick-info">
                      <span className="consultor-pick-nombre">{c.nombre}</span>
                      <span className="consultor-pick-rol">{c.rol}</span>
                    </div>
                    <div className="consultor-pick-tel">
                      {sinTel
                        ? <span className="consultor-notel"><PhoneOff size={11} /> Sin teléfono</span>
                        : <span className="consultor-telnum"><Phone size={11} /> {c.telefono}</span>}
                    </div>
                    {selected && <Check size={14} className="consultor-pick-check" />}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="modal__foot">
          <button className="modal__btn modal__btn--ghost" onClick={onClose}>Cancelar</button>
          <button className="modal__btn modal__btn--wa" onClick={handleEnviar}
            disabled={!selectedId || !tieneTelefono}>
            <Share2 size={14} />
            {selectedId && tieneTelefono
              ? `Enviar a ${seleccionado!.nombre.split(' ')[0]}`
              : 'Selecciona un consultor'}
          </button>
        </div>
      </div>
    </div>
  );
};