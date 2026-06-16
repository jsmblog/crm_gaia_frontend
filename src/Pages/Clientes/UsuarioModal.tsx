import { useState } from "react";
import type { UsuarioClientePayload, UsuarioModalProps } from "../../Interfaces/i_cliente";
import { useToast } from "../../Hooks/useToast";
import { clienteService } from "../../Services/clienteService";
import { Check, Linkedin, Mail, Phone, X } from "lucide-react";

const EMPTY_USUARIO: UsuarioClientePayload = {
  nombre: '', cargo: '', email: '', telefono: '', linkedin: '',
};

export const UsuarioModal = ({ clienteId, initial, onClose, onSaved }: UsuarioModalProps) => {
  const { toast, ToastContainer } = useToast();
  const [form, setForm] = useState<UsuarioClientePayload>(
    initial
      ? { nombre: initial.nombre ?? '', cargo: initial.cargo ?? '', email: initial.email ?? '', telefono: initial.telefono ?? '', linkedin: initial.linkedin ?? '' }
      : { ...EMPTY_USUARIO }
  );
  const [loading, setLoading] = useState(false);
  const set = (k: keyof UsuarioClientePayload, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.nombre?.trim()) return toast.warning("'Nombre' es requerido");
    if (form.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      return toast.warning('El email no tiene un formato válido');
    setLoading(true);
    try {
      if (initial) { await clienteService.updateUsuario(clienteId, initial.id, form); toast.success('Usuario actualizado'); }
      else         { await clienteService.createUsuario(clienteId, form);              toast.success('Usuario creado'); }
      onSaved(); onClose();
    } catch { toast.error('Error al guardar el usuario'); }
    finally  { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <ToastContainer />
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__head">
          <div>
            <h2 className="modal__title">{initial ? 'Editar Usuario' : 'Agregar Usuario'}</h2>
            <p className="modal__sub">Contacto o usuario del cliente</p>
          </div>
          <button className="modal__close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal__body">
          <p className="mfield__section-title">DATOS PERSONALES</p>
          <div className="mfield">
            <label className="mfield__label">Nombre completo <span className="mfield__req">*</span></label>
            <input className="mfield__input" placeholder="Ej: Juan Pérez"
              value={form.nombre} onChange={e => set('nombre', e.target.value)} />
          </div>
          <div className="mfield">
            <label className="mfield__label">Cargo</label>
            <input className="mfield__input" placeholder="Ej: Gerente de TI"
              value={form.cargo ?? ''} onChange={e => set('cargo', e.target.value)} />
          </div>
          <p className="mfield__section-title" style={{ marginTop: 8 }}>CONTACTO</p>
          <div className="modal__row modal__row--2">
            <div className="mfield">
              <label className="mfield__label"><Mail size={10} style={{ display: 'inline', marginRight: 3 }} />Email</label>
              <input className="mfield__input" type="email" placeholder="juan@empresa.com"
                value={form.email ?? ''} onChange={e => set('email', e.target.value)} />
            </div>
            <div className="mfield">
              <label className="mfield__label"><Phone size={10} style={{ display: 'inline', marginRight: 3 }} />Teléfono</label>
              <input className="mfield__input" type="tel" placeholder="+593 99 123 4567"
                value={form.telefono ?? ''} onChange={e => set('telefono', e.target.value)} />
            </div>
            <div className="mfield">
              <label className="mfield__label"><Linkedin size={10} style={{ display: 'inline', marginRight: 3 }} />LinkedIn</label>
              <input className="mfield__input" type="text" placeholder="Añade su perfil de linkedin"
                value={form.linkedin ?? ''} onChange={e => set('linkedin', e.target.value)} />
            </div>
          </div>
        </div>
        <div className="modal__foot">
          <button className="modal__btn modal__btn--ghost" onClick={onClose}>Cancelar</button>
          <button className="modal__btn modal__btn--primary" onClick={handleSubmit} disabled={loading}>
            <Check size={15} />{loading ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};