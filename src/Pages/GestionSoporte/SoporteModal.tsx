import { useEffect, useState } from "react";
import { useToast } from "../../Hooks/useToast";
import type { EstadoSoporte, SoporteModalProps, SoportePayload } from "../../Interfaces/i_soporte";
import { EMPTY_SOPORTE } from "../../Constants/EMPTY_SOPORTE";
import { buildHorario, DIAS_SEMANA, parseHorario } from "../../Constants/soporte";
import { clienteService } from "../../Services/clienteService";
import type { Cliente, UsuarioCliente } from "../../Interfaces/i_cliente";
import { soporteService } from "../../Services/soporteService";
import { Check, X } from "lucide-react";

export const SoporteModal = ({ initial, onClose, onSaved }: SoporteModalProps) => {
  const { toast, ToastContainer } = useToast();

  const initDias = (): string[] => {
    if (!initial?.dias) return [];
    if (Array.isArray(initial.dias)) return initial.dias;
    return (initial.dias as string).split(',').map(d => d.trim()).filter(Boolean);
  };

  const [form, setForm] = useState<SoportePayload & { dias: string[] }>(() => {
    if (initial) {
      return {
        cliente_id: initial.cliente_id,
        estado: initial.estado,
        propuesta: initial.propuesta || '',
        horas: initial.horas || 0,
        tarifa: initial.tarifa || 0,
        valor_paquete: initial.valor_paquete || 0,
        fecha_inicio: initial.fecha_inicio || '',
        fecha_fin: initial.fecha_fin || '',
        horario: initial.horario || '09:00 - 18:00',
        dias: initDias(),
        observacion: initial.observacion || '',
        responsable_cliente_id: initial.responsable_cliente_id || '',
        fecha_aprobacion: initial.fecha_aprobacion || '',
        fecha_rechazo: initial.fecha_rechazo || '',
        motivo_rechazo: initial.motivo_rechazo || '',
        fecha_inicio_soporte: initial.fecha_inicio_soporte || '',
      };
    }
    return { ...EMPTY_SOPORTE, dias: [] };
  });

  const [horaInicio, setHoraInicio] = useState(() => parseHorario(form.horario).inicio);
  const [horaFin, setHoraFin] = useState(() => parseHorario(form.horario).fin);

  useEffect(() => {
    setForm(p => ({ ...p, horario: buildHorario(horaInicio, horaFin) }));
  }, [horaInicio, horaFin]);

  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [responsables, setResponsables] = useState<UsuarioCliente[]>([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);

  useEffect(() => {
    setLoadingCatalogos(true);
    clienteService.getAll({ limit: 500 })
      .then(res => setClientes(res.data))
      .catch(console.error)
      .finally(() => setLoadingCatalogos(false));
  }, []);

  useEffect(() => {
    if (form.cliente_id) {
      clienteService.getUsuarios(form.cliente_id)
        .then(setResponsables)
        .catch(() => setResponsables([]));
    } else {
      setResponsables([]);
    }
  }, [form.cliente_id]);

  const setField = (k: keyof SoportePayload, v: any) =>
    setForm(p => ({ ...p, [k]: v }));

  const toggleDia = (dia: string) => {
    setForm(p => {
      const dias = Array.isArray(p.dias) ? p.dias : [];
      return {
        ...p,
        dias: dias.includes(dia) ? dias.filter(d => d !== dia) : [...dias, dia],
      };
    });
  };

  const handleSubmit = async () => {
    if (!form.cliente_id) return toast.warning('Selecciona un cliente');
    if (form.estado === 'Rechazado' && !form.motivo_rechazo)
      return toast.warning('Motivo de rechazo requerido');
    setLoading(true);
    try {
      if (initial) {
        await soporteService.update(initial.id, form);
        toast.success('Soporte actualizado');
      } else {
        await soporteService.create(form);
        toast.success('Soporte creado');
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje ?? 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const diasArray = Array.isArray(form.dias) ? form.dias : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <ToastContainer />
      <div className="modal modal--lg" onClick={e => e.stopPropagation()}>
        <div className="modal__head">
          <div>
            <h2 className="modal__title">{initial ? 'Editar Soporte' : 'Nuevo Soporte'}</h2>
            <p className="modal__sub">Gestión de contratos de soporte</p>
          </div>
          <button className="modal__close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal__body">
          <div className="modal__row">
            <div className="mfield">
              <label className="mfield__label">Cliente <span className="mfield__req">*</span></label>
              <select
                className="mfield__input mfield__select"
                value={form.cliente_id}
                onChange={e => setField('cliente_id', e.target.value)}
                disabled={loadingCatalogos}
              >
                <option value="">— Seleccionar —</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.empresa}</option>)}
              </select>
            </div>
            <div className="mfield">
              <label className="mfield__label">Estado</label>
              <select
                className="mfield__input mfield__select"
                value={form.estado}
                onChange={e => setField('estado', e.target.value as EstadoSoporte)}
              >
                <option value="En Aprobación">En Aprobación</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Rechazado">Rechazado</option>
              </select>
            </div>
          </div>

          {/* Horas / Tarifa / Paquete */}
          <div className="modal__row">
            <div className="mfield">
              <label className="mfield__label">Horas contratadas</label>
              <input type="number" className="mfield__input"
                value={form.horas} onChange={e => setField('horas', +e.target.value)} />
            </div>
            <div className="mfield">
              <label className="mfield__label">Tarifa por hora (USD)</label>
              <input type="number" step="0.01" className="mfield__input"
                value={form.tarifa} onChange={e => setField('tarifa', +e.target.value)} />
            </div>
            <div className="mfield">
              <label className="mfield__label">Valor del paquete (USD)</label>
              <input type="number" step="0.01" className="mfield__input"
                value={form.valor_paquete} onChange={e => setField('valor_paquete', +e.target.value)} />
            </div>
          </div>

          {/* Fechas */}
          <div className="modal__row">
            <div className="mfield">
              <label className="mfield__label">Fecha Inicio</label>
              <input type="date" className="mfield__input"
                value={form.fecha_inicio} onChange={e => setField('fecha_inicio', e.target.value)} />
            </div>
            <div className="mfield">
              <label className="mfield__label">Fecha Fin</label>
              <input type="date" className="mfield__input"
                value={form.fecha_fin} onChange={e => setField('fecha_fin', e.target.value)} />
            </div>
          </div>

          {/* Horario — dos time pickers */}
          <div className="modal__row">
            <div className="mfield">
              <label className="mfield__label">Hora de inicio</label>
              <input
                type="time"
                className="mfield__input"
                value={horaInicio}
                onChange={e => setHoraInicio(e.target.value)}
              />
            </div>
            <div className="mfield">
              <label className="mfield__label">Hora de fin</label>
              <input
                type="time"
                className="mfield__input"
                value={horaFin}
                onChange={e => setHoraFin(e.target.value)}
              />
            </div>
            <div className="mfield">
              <label className="mfield__label">Horario resultante</label>
              <input
                className="mfield__input"
                value={form.horario}
                readOnly
                style={{ background: 'var(--surface-2, #f5f5f5)', cursor: 'default' }}
              />
            </div>
          </div>

          <div className="mfield">
            <label className="mfield__label">Días de atención</label>
            <div className="dias-check-group">
              {DIAS_SEMANA.map(dia => (
                <label key={dia} className="dias-check-item">
                  <input
                    type="checkbox"
                    checked={diasArray.includes(dia)}
                    onChange={() => toggleDia(dia)}
                  />
                  <span>{dia}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Responsable */}
          <div className="modal__row">
            <div className="mfield">
              <label className="mfield__label">Responsable Cliente</label>
              <select
                className="mfield__input mfield__select"
                value={form.responsable_cliente_id}
                onChange={e => setField('responsable_cliente_id', e.target.value)}
              >
                <option value="">— Seleccionar —</option>
                {responsables.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
            </div>
          </div>

          {/* Propuesta / Observación */}
          <div className="mfield">
            <label className="mfield__label">Propuesta / Alcance</label>
            <textarea className="mfield__input mfield__textarea" rows={2}
              value={form.propuesta} onChange={e => setField('propuesta', e.target.value)} />
          </div>
          <div className="mfield">
            <label className="mfield__label">Observación</label>
            <textarea className="mfield__input mfield__textarea" rows={2}
              value={form.observacion} onChange={e => setField('observacion', e.target.value)} />
          </div>

          {/* Rechazo */}
          {form.estado === 'Rechazado' && (
            <>
              <div className="modal__row">
                <div className="mfield">
                  <label className="mfield__label">Fecha Rechazo</label>
                  <input type="date" className="mfield__input"
                    value={form.fecha_rechazo} onChange={e => setField('fecha_rechazo', e.target.value)} />
                </div>
              </div>
              <div className="mfield">
                <label className="mfield__label">Motivo de Rechazo <span className="mfield__req">*</span></label>
                <textarea className="mfield__input mfield__textarea" rows={2}
                  value={form.motivo_rechazo} onChange={e => setField('motivo_rechazo', e.target.value)} />
              </div>
            </>
          )}

          {/* Aprobación */}
          {form.estado === 'Aprobado' && (
            <div className="modal__row">
              <div className="mfield">
                <label className="mfield__label">Fecha Aprobación</label>
                <input type="date" className="mfield__input"
                  value={form.fecha_aprobacion} onChange={e => setField('fecha_aprobacion', e.target.value)} />
              </div>
              <div className="mfield">
                <label className="mfield__label">Fecha Inicio Soporte</label>
                <input type="date" className="mfield__input"
                  value={form.fecha_inicio_soporte} onChange={e => setField('fecha_inicio_soporte', e.target.value)} />
              </div>
            </div>
          )}
        </div>

        <div className="modal__foot">
          <button className="modal__btn modal__btn--ghost" onClick={onClose}>Cancelar</button>
          <button className="modal__btn modal__btn--primary" onClick={handleSubmit} disabled={loading}>
            <Check size={15} /> {loading ? 'Guardando…' : 'Guardar Soporte'}
          </button>
        </div>
      </div>
    </div>
  );
};