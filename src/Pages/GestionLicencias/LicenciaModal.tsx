import { useEffect, useState } from "react";
import { useToast } from "../../Hooks/useToast";
import type { EstadoLicencia, LicenciaModalProps, LicenciaPayload } from "../../Interfaces/i_licencia";
import { EMPTY_LICENCIA } from "../../Constants/licencia";
import type { Cliente } from "../../Interfaces/i_cliente";
import type { Proceso } from "../../Interfaces/i_procesos";
import type { HerramientaRpa } from "../../Interfaces/i_herramienta";
import { herramientaService } from "../../Services/herramientaService";
import { clienteService } from "../../Services/clienteService";
import { procesoService } from "../../Services/procesoService";
import { licenciaService } from "../../Services/licenciaService";
import { AlertCircle, Calendar, Check, Cpu, DollarSign, Monitor, RotateCcw, Shield, X } from "lucide-react";
import { ProcesoMultiSelect } from "./ProcesoMultiSelect";

export const LicenciaModal = ({ initial, onClose, onSaved }: LicenciaModalProps) => {
  const { toast, ToastContainer } = useToast();
  const [form, setForm] = useState<LicenciaPayload>(
    initial ? {
      cliente_id: initial.cliente_id,
      estado: initial.estado,
      fecha_inicio: initial.fecha_inicio || '',
      renovacion: initial.renovacion,
      herramienta_id: initial.herramienta_id,
      valor_anual: initial.valor_anual,
      ip_maquina: initial.ip_maquina || '',
      procesos_ids: initial.procesos?.map(p => p.id) || [],
      fecha_estado: initial.fecha_estado || '',
      motivo_desactivacion: initial.motivo_desactivacion || '',
    } : { ...EMPTY_LICENCIA }
  );
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [procesos, setProcesos] = useState<Proceso[]>([]);
const [herramientas, setHerramientas] = useState<HerramientaRpa[]>([])
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);

  useEffect(() => {
    const fetchCatalogos = async () => {
      setLoadingCatalogos(true);
      try {
        const [clientesRes, procesosRes, herramientasRes] = await Promise.all([
          clienteService.getAll({ limit: 500 }),
          procesoService.getAll({ limit: 500 }),
          herramientaService.getAll({ limit: 500, activo: true }),
        ]);
        setClientes(clientesRes.data);
        setProcesos(procesosRes.data);
        setHerramientas(herramientasRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCatalogos(false);
      }
    };
    fetchCatalogos();
  }, []);

  const setField = (k: keyof LicenciaPayload, v: any) =>
    setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.cliente_id) return toast.warning('Selecciona un cliente');
    if (!form.fecha_inicio) return toast.warning('La fecha de inicio es requerida');
    if (form.estado === 'Desactivada' && !form.motivo_desactivacion?.trim()) {
      return toast.warning('Motivo de desactivación requerido');
    }
    setLoading(true);
    try {
      const payload: LicenciaPayload = {
        ...form,
        fecha_estado: form.fecha_estado?.trim() || undefined,
        motivo_desactivacion: form.motivo_desactivacion?.trim() || undefined,
        herramienta_id: form.herramienta_id || undefined,
      };

      if (initial) {
        await licenciaService.update(initial.id, payload);
        toast.success('Licencia actualizada correctamente');
      } else {
        await licenciaService.create(payload);
        toast.success('Licencia creada correctamente');
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje ?? 'Error al guardar la licencia');
    } finally {
      setLoading(false);
    }
  };

  const isDesactivada = form.estado === 'Desactivada';

  return (
    <div className="gl-overlay" onClick={onClose}>
      <ToastContainer />
      <div className="gl-modal" onClick={e => e.stopPropagation()}>
        <div className="gl-modal__header">
          <div className="gl-modal__header-icon">
            <Shield size={18} />
          </div>
          <div className="gl-modal__header-text">
            <h2 className="gl-modal__title">{initial ? 'Editar Licencia' : 'Nueva Licencia'}</h2>
            <p className="gl-modal__subtitle">Gestión de licencias RPA y software</p>
          </div>
          <button className="gl-modal__close" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <div className="gl-modal__body">
          <div className="gl-modal__row">
            <div className="gl-field">
              <label className="gl-field__label">
                Cliente <span className="gl-field__req">*</span>
              </label>
              <select
                className="gl-field__input"
                value={form.cliente_id}
                onChange={e => setField('cliente_id', e.target.value)}
                disabled={loadingCatalogos}
              >
                <option value="">— Seleccionar cliente —</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.empresa}</option>
                ))}
              </select>
            </div>
            <div className="gl-field">
              <label className="gl-field__label">Estado</label>
              <select
                className={`gl-field__input gl-field__input--estado ${isDesactivada ? 'gl-field__input--desactivada' : 'gl-field__input--activada'}`}
                value={form.estado}
                onChange={e => setField('estado', e.target.value as EstadoLicencia)}
              >
                <option value="Activada">✓ Activada</option>
                <option value="Desactivada">✗ Desactivada</option>
              </select>
            </div>
          </div>

          <div className="gl-modal__row">
            <div className="gl-field">
              <label className="gl-field__label">
                <Calendar size={11} /> Fecha Inicio <span className="gl-field__req">*</span>
              </label>
              <input
                type="date"
                className="gl-field__input"
                value={form.fecha_inicio}
                onChange={e => setField('fecha_inicio', e.target.value)}
              />
            </div>
            <div className="gl-field">
              <label className="gl-field__label">
                <RotateCcw size={11} /> Renovación
              </label>
              <select
                className="gl-field__input"
                value={form.renovacion || ''}
                onChange={e => setField('renovacion', e.target.value || undefined)}
              >
                <option value="">— Sin renovación —</option>
                <option value="mensual">Mensual</option>
                <option value="anual">Anual</option>
                <option value="2 años">2 años</option>
                <option value="3 años">3 años</option>
              </select>
            </div>
          </div>

          <div className="gl-modal__row">
            <div className="gl-field">
              <label className="gl-field__label">
                <Cpu size={11} /> Herramienta RPA
              </label>
              <select
                className="gl-field__input"
                value={form.herramienta_id || ''}
                onChange={e => setField('herramienta_id', e.target.value || undefined)}
                disabled={loadingCatalogos}
              >
                <option value="">— Seleccionar herramienta —</option>
                {herramientas.map(h => (
                  <option key={h.id} value={h.id}>{h.nombre}</option>
                ))}
              </select>
            </div>
            <div className="gl-field">
              <label className="gl-field__label">
                <DollarSign size={11} /> Valor Anual (USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="gl-field__input"
                placeholder="0.00"
                value={form.valor_anual ?? ''}
                onChange={e => setField('valor_anual', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
          </div>

          <div className="gl-modal__row gl-modal__row--single">
            <div className="gl-field">
              <label className="gl-field__label">
                <Monitor size={11} /> IP Máquina
              </label>
              <input
                className="gl-field__input"
                placeholder="Ej: 192.168.1.100"
                value={form.ip_maquina}
                onChange={e => setField('ip_maquina', e.target.value)}
              />
            </div>
          </div>

          <ProcesoMultiSelect
            label="Procesos Asociados"
            selected={form.procesos_ids || []}
            onChange={ids => setField('procesos_ids', ids)}
            procesos={procesos}
            disabled={loadingCatalogos}
          />

          {isDesactivada && (
            <div className="gl-deactivation-block">
              <div className="gl-deactivation-block__header">
                <AlertCircle size={13} />
                <span>Información de desactivación</span>
              </div>
              <div className="gl-modal__row">
                <div className="gl-field">
                  <label className="gl-field__label">
                    <Calendar size={11} /> Fecha de desactivación
                  </label>
                  <input
                    type="date"
                    className="gl-field__input"
                    value={form.fecha_estado || ''}
                    onChange={e => setField('fecha_estado', e.target.value || '')}
                  />
                </div>
              </div>
              <div className="gl-field">
                <label className="gl-field__label">
                  Motivo de desactivación <span className="gl-field__req">*</span>
                </label>
                <textarea
                  className="gl-field__input gl-field__textarea"
                  rows={3}
                  placeholder="Ej: Migración a nueva versión, no renovación del contrato…"
                  value={form.motivo_desactivacion}
                  onChange={e => setField('motivo_desactivacion', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="gl-modal__footer">
          <button className="gl-btn gl-btn--ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button className="gl-btn gl-btn--primary" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <span className="gl-spinner" />
                Guardando…
              </>
            ) : (
              <>
                <Check size={14} />
                {initial ? 'Actualizar Licencia' : 'Guardar Licencia'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};