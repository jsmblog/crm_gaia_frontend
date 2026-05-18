import { Check, X } from "lucide-react";
import type { Proyecto, ProyectoPayload, ProyectoUpdatePayload } from "../../../Interfaces/i_proyecto";
import { proyectoService } from "../../../Services/proyectoService";
import { clienteService } from "../../../Services/clienteService";
import { useToast } from "../../../Hooks/useToast";
import { useState } from "react";
import type { Cliente } from "../../../Interfaces/i_cliente";
import { useWizardCatalogos } from "../WizardContext";

export const ProyectoModal = ({ initial, clientePreselect, onClose, onSaved }: {
  initial?: Proyecto | null;
  clientePreselect?: string;  
  onClose: () => void;
  onSaved: () => void;
}) => {
  const { clientes , reloadProyectos} = useWizardCatalogos();
  const [form, setForm] = useState<any>(
    initial
      ? { nombre: initial.nombre, descripcion: initial.descripcion ?? '', activo: initial.activo }
      : { cliente_id: clientePreselect || '', nombre: '', descripcion: '' } 
  );
    const { toast, ToastContainer } = useToast();
  const [loading, setLoading] = useState(false);
  const [clienteInfo, setClienteInfo] = useState<Cliente | null>(null);
  const [loadingCliente, setLoadingCliente] = useState(false);

  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const handleClienteChange = async (id: string) => {
    set('cliente_id', id);
    if (!id) { setClienteInfo(null); return; }
    setLoadingCliente(true);
    try { setClienteInfo(await clienteService.getById(id)); }
    catch { setClienteInfo(null); }
    finally { setLoadingCliente(false); }
  };

  const handleSubmit = async () => {
    if (!form.nombre?.trim()) return toast.warning("'Nombre' es requerido");
    if (!initial && !form.cliente_id) return toast.warning('Selecciona un cliente');
    setLoading(true);
    try {
      initial
        ? await proyectoService.update(initial.id, form as ProyectoUpdatePayload)
        : await proyectoService.create(form as ProyectoPayload);
      toast.success(initial ? 'Proyecto actualizado' : 'Proyecto creado');
      onSaved(); onClose();
      await reloadProyectos();
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje ?? 'Error al guardar');
    } finally { setLoading(false); }
  };

  const tarifas = clienteInfo
    ? [
      { label: 'Hora desarrollo', value: clienteInfo.precio_hora_desarrollo, pct: false },
      { label: 'Hora soporte', value: clienteInfo.precio_hora_soporte, pct: false },
      { label: 'Hora cambio', value: clienteInfo.precio_hora_cambio, pct: false },
      { label: '% de Gerencia', value: clienteInfo.porcentaje_gobierno, pct: true },
    ].filter(t => t.value != null)
    : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <ToastContainer />
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__head">
          <div>
            <h2 className="modal__title">{initial ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h2>
            <p className="modal__sub">{initial ? 'Modifica los datos del proyecto' : 'Asocia el proyecto a un cliente'}</p>
          </div>
          <button className="modal__close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal__body">
          {!initial && (
            <div className="mfield">
              <label className="mfield__label">Cliente <span className="mfield__req">*</span></label>
              <select
                className="mfield__input mfield__select"
                value={form.cliente_id}
                onChange={e => handleClienteChange(e.target.value)}
              >
                <option value="">— Selecciona un cliente —</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>· {c.empresa}</option>
                ))}
              </select>
            </div>
          )}

          <div className="mfield">
            <label className="mfield__label">Nombre del Proyecto <span className="mfield__req">*</span></label>
            <input
              className="mfield__input"
              placeholder="Ej: Automatización de Nómina"
              value={form.nombre ?? ''}
              onChange={e => set('nombre', e.target.value)}
            />
          </div>

          <div className="mfield">
            <label className="mfield__label">Descripción</label>
            <textarea
              className="mfield__input mfield__textarea"
              rows={3}
              placeholder="Descripción general del proyecto…"
              value={form.descripcion ?? ''}
              onChange={e => set('descripcion', e.target.value)}
            />
          </div>

          {!initial && loadingCliente && (
            <p className="cliente-tarifas__loading">Cargando tarifas del cliente…</p>
          )}
          {!initial && !loadingCliente && tarifas.length > 0 && (
            <div className="cliente-tarifas">
              <p className="cliente-tarifas__title">Tarifas del cliente</p>
              <table className="cliente-tarifas__table">
                <thead><tr><th>Concepto</th><th>Valor</th><th /></tr></thead>
                <tbody>
                  {tarifas.map(t => (
                    <tr key={t.label} className={t.label === 'Hora desarrollo' ? 'cliente-tarifas__row--highlight' : ''}>
                      <td>{t.label}</td>
                      <td>
                        {t.pct
                          ? `${Number(t.value).toFixed(2)} %`
                          : `$${Number(t.value).toLocaleString('es-EC', { minimumFractionDigits: 2 })} / h`}
                      </td>
                      <td>
                        {t.label === 'Hora desarrollo' && (
                          <span className="cliente-tarifas__used-badge">usado para costo</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {clienteInfo?.precio_hora_desarrollo == null && (
                <p className="cliente-tarifas__warning">
                  Este cliente no tiene tarifa de desarrollo. Se usará ${10}/h.
                </p>
              )}
            </div>
          )}

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
                <span className="toggle__label">{form.activo ? 'Activo' : 'Inactivo'}</span>
              </div>
            </div>
          )}
        </div>

        <div className="modal__foot">
          <button className="modal__btn modal__btn--ghost" onClick={onClose}>Cancelar</button>
          <button className="modal__btn modal__btn--primary" onClick={handleSubmit} disabled={loading}>
            <Check size={15} />{loading ? 'Guardando…' : 'Guardar Proyecto'}
          </button>
        </div>
      </div>
    </div>
  );
};