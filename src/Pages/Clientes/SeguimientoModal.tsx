import { Calendar, Check, ChevronDown, Clock, X } from "lucide-react";
import type { MedioSeguimiento, SeguimientoModalProps, SeguimientoPayload, TipoSeguimiento } from "../../Interfaces/i_cliente";
import { useToast } from "../../Hooks/useToast";
import { useState } from "react";
import { EMPTY_SEG } from "../../Constants/EMPTY_SEG";
import { clienteService } from "../../Services/clienteService";
import { MEDIOS, TIPOS } from "../../Constants/i_clientes";

export const SeguimientoModal = ({
  clienteId, usuarios, consultores, initial, onClose, onSaved,
}: SeguimientoModalProps) => {
  const { toast, ToastContainer } = useToast();
  const [form, setForm] = useState<SeguimientoPayload>(
  initial ? {
    consultor_id:         initial.consultor_id,
    contactos_ids:        initial.contactos_ids ?? [], 
    fecha:                initial.fecha,
    fecha_proxima_accion: initial.fecha_proxima_accion,
    medio:                initial.medio,
    tipo:                 initial.tipo,
    descripcion:          initial.descripcion,
    resultado:            initial.resultado,
    estado:               initial.estado,
  } : { ...EMPTY_SEG}
);
  const [loading, setLoading] = useState(false);
  const set = <K extends keyof SeguimientoPayload>(k: K, v: SeguimientoPayload[K]) =>
    setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.consultor_id)        return toast.warning("'Consultor' es requerido");
    if (!form.fecha)               return toast.warning("'Fecha' es requerida");
    if (!form.descripcion?.trim()) return toast.warning("'Descripción' es requerida");
    setLoading(true);
    try {
      if (initial) {
        await clienteService.updateSeguimiento(clienteId, initial.id, form);
        toast.success('Seguimiento actualizado');
      } else {
        await clienteService.createSeguimiento(clienteId, form);
        toast.success('Seguimiento registrado');
      }
      onSaved();
    } catch { toast.error('Error al guardar el seguimiento'); }
    finally  { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <ToastContainer />
      <div className="modal modal--lg" onClick={e => e.stopPropagation()}>
        <div className="modal__head">
          <div>
            <h2 className="modal__title">{initial ? 'Editar Seguimiento' : 'Nuevo Seguimiento'}</h2>
            <p className="modal__sub">Registro de interacción con el cliente</p>
          </div>
          <button className="modal__close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal__body modal__body--scroll">
          <p className="mfield__section-title">PARTICIPANTES</p>
          <div className="modal__row modal__row--2">
            <div className="mfield">
              <label className="mfield__label">Consultor responsable <span className="mfield__req">*</span></label>
              <div className="mfield__select-wrap">
                <select className="mfield__input mfield__select"
                  value={form.consultor_id}
                  onChange={e => set('consultor_id', e.target.value)}>
                  <option value="">— Seleccionar —</option>
                  {consultores.filter(c => c.activo).map(c =>
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  )}
                </select>
                <ChevronDown size={13} className="mfield__select-icon" />
              </div>
            </div>
           <div className="mfield">
  <label className="mfield__label">Contactos del cliente</label>
  <div className="multi-check-list">
    {usuarios?.filter(u => u.activo).length === 0 ? (
      <p className="multi-check-list__empty">Sin contactos registrados</p>
    ) : (
      usuarios?.filter(u => u.activo).map(u => {
        const checked = form.contactos_ids?.includes(u.id);
        return (
          <label key={u.id} className={`multi-check-item ${checked ? 'multi-check-item--on' : ''}`}>
            <input
              type="checkbox"
              checked={checked}
              onChange={() =>
                set('contactos_ids', checked
                  ? form.contactos_ids.filter(id => id !== u.id)
                  : [...form.contactos_ids, u.id]
                )
              }
            />
            <span className="multi-check-item__check" />
            <span className="multi-check-item__avatar">{u.nombre.charAt(0).toUpperCase()}</span>
            <span className="multi-check-item__info">
              <span className="multi-check-item__nombre">{u.nombre}</span>
              {u.cargo && <span className="multi-check-item__cargo">{u.cargo}</span>}
            </span>
          </label>
        );
      })
    )}
  </div>
</div>
          </div>

          <p className="mfield__section-title" style={{ marginTop: 4 }}>INTERACCIÓN</p>
          <div className="modal__row modal__row--2">
            <div className="mfield">
              <label className="mfield__label">
                <Calendar size={10} style={{ display: 'inline', marginRight: 3 }} />
                Fecha <span className="mfield__req">*</span>
              </label>
              <input className="mfield__input" type="date"
                value={form.fecha}
                onChange={e => set('fecha', e.target.value)} />
            </div>
          </div>

          <div className="modal__row modal__row--3">
            <div className="mfield">
              <label className="mfield__label">Medio</label>
              <div className="mfield__select-wrap">
                <select className="mfield__input mfield__select"
                  value={form.medio}
                  onChange={e => set('medio', e.target.value as MedioSeguimiento)}>
                  {MEDIOS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <ChevronDown size={13} className="mfield__select-icon" />
              </div>
            </div>
            <div className="mfield">
              <label className="mfield__label">Tipo</label>
              <div className="mfield__select-wrap">
                <select className="mfield__input mfield__select"
                  value={form.tipo}
                  onChange={e => set('tipo', e.target.value as TipoSeguimiento)}>
                  {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <ChevronDown size={13} className="mfield__select-icon" />
              </div>
            </div>
            <div className="mfield">
              <label className="mfield__label">Estado</label>
              <div className="mfield__select-wrap">
                <select className="mfield__input mfield__select"
                  value={form.estado ?? 'programado'}
                  onChange={e => set('estado', e.target.value as any)}>
                  <option value="programado">Programado</option>
                  <option value="completado">Completado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
                <ChevronDown size={13} className="mfield__select-icon" />
              </div>
            </div>
          </div>

          <p className="mfield__section-title" style={{ marginTop: 4 }}>DETALLE</p>
          <div className="mfield">
            <label className="mfield__label">Descripción <span className="mfield__req">*</span></label>
            <textarea className="mfield__input mfield__textarea"
              placeholder="¿De qué se trató la interacción? ¿Qué se conversó?"
              value={form.descripcion}
              onChange={e => set('descripcion', e.target.value)} />
          </div>
          <div className="mfield">
            <label className="mfield__label">Siguientes Pasos</label>
            <textarea className="mfield__input mfield__textarea" style={{ minHeight: 60 }}
              placeholder="¿A qué se llegó? ¿Cuál fue el resultado?"
              value={form.resultado ?? ''}
              onChange={e => set('resultado', e.target.value || null)} />
          </div>
          <div className="mfield">
            <label className="mfield__label">
              <Clock size={10} style={{ display: 'inline', marginRight: 3 }} />Próxima acción
            </label>
            <input className="mfield__input" type="date"
              value={form.fecha_proxima_accion ?? ''}
              onChange={e => set('fecha_proxima_accion', e.target.value || null)} />
          </div>
        </div>

        <div className="modal__foot">
          <button className="modal__btn modal__btn--ghost" onClick={onClose}>Cancelar</button>
          <button className="modal__btn modal__btn--primary" onClick={handleSubmit} disabled={loading}>
            <Check size={15} />{loading ? 'Guardando…' : 'Guardar Seguimiento'}
          </button>
        </div>
      </div>
    </div>
  );
};