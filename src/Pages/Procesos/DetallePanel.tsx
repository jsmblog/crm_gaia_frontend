import { useState } from 'react';
import { X, Check, Users, Calendar, DollarSign, Clock, AlertCircle, User } from 'lucide-react';
import { procesoService } from '../../Services/procesoService';
import { useToast } from '../../Hooks/useToast';
import type { Proceso } from '../../Interfaces/i_procesos';
import { fmtFecha, fmtMoney } from '../../Constants/procesos';
import { ConsultorMultiSelect } from './ConsultorMultiSelect';
import { useWizardCatalogos } from './WizardContext';
import { EstadoSelect } from './Estadoselect';

const ConsultoresList = ({ consultores }: { consultores?: { id: string; nombre: string }[] }) => {
  if (!consultores || consultores.length === 0) return null;
  return (
    <div className="etapa-consultores">
      <span className="etapa-row__label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Users size={10} /> {consultores.length === 1 ? 'Consultor' : 'Consultores'}
      </span>
      <div className="etapa-consultores__chips">
        {consultores.map(c => (
          <span key={c.id} className="etapa-consultor-chip">
            <User size={9} /> {c.nombre}
          </span>
        ))}
      </div>
    </div>
  );
};

const Row = ({ icon, label, value }: { icon?: React.ReactNode; label: string; value?: string | null }) =>
  value ? (
    <div className="etapa-row">
      {icon && <span className="etapa-row__icon">{icon}</span>}
      <span className="etapa-row__label">{label}</span>
      <span className="etapa-row__value">{value}</span>
    </div>
  ) : null;

interface Props {
  proceso: Proceso;
  onClose: () => void;
  onRefresh: (p: Proceso) => void;
  onEdit: (p: Proceso) => void;
}

export const DetallePanel = ({ proceso, onClose, onRefresh, onEdit }: Props) => {
  const { estados, consultores } = useWizardCatalogos();
  const { toast, ToastContainer } = useToast();
  const [data, setData] = useState<Proceso>(proceso);
  const [editIds, setEditIds] = useState<string[]>([]);
  const [editingEtapa, setEditingEtapa] = useState<string | null>(null);
  const [savingEtapa, setSavingEtapa] = useState(false);

  const refrescar = async () => {
    const updated = await procesoService.getById(data.id);
    setData(updated);
    onRefresh(updated);
  };

  const handleSaveConsultores = async () => {
    if (!editingEtapa) return;
    setSavingEtapa(true);
    try {
      await procesoService.upsertEtapa(data.id, editingEtapa, { consultores_ids: editIds });
      setEditingEtapa(null);
      await refrescar();
      toast.success('Consultores actualizados');
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje ?? 'Error al actualizar');
    } finally {
      setSavingEtapa(false);
    }
  };

  const openEditConsultores = (etapa: string, currentIds: string[]) => {
    setEditingEtapa(etapa);
    setEditIds(currentIds);
  };

  const EtapaCard = ({
    titulo,
    etapaKey,
    check,
    consultoresActuales,
    children,
  }: {
    titulo: string;
    etapaKey: string;
    check: boolean;
    consultoresActuales?: { id: string; nombre: string }[];
    children: React.ReactNode;
  }) => {
    const isEditing = editingEtapa === etapaKey;
    return (
      <div className={`etapa-card ${check ? 'etapa-card--done' : ''}`}>
        <div className="etapa-card__head">
          <span className="etapa-card__title">{titulo}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {check && (
              <button
                className="etapa-card__edit-btn"
                title="Editar consultores"
                onClick={() =>
                  isEditing
                    ? setEditingEtapa(null)
                    : openEditConsultores(etapaKey, consultoresActuales?.map(c => c.id) ?? [])
                }
              >
                {isEditing ? <X size={10} /> : <Users size={10} />}
              </button>
            )}
            {check && <span className="etapa-card__ok"><Check size={11} /></span>}
          </div>
        </div>
        <div className="etapa-card__body">
          {children}
          {isEditing && (
            <div className="etapa-consultores-editor">
              <p className="etapa-consultores-editor__label">Editar consultores asignados</p>
              <ConsultorMultiSelect
                label=""
                selected={editIds}
                onChange={setEditIds}
                consultores={consultores}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button
                  className="btn-dpanel-add btn-dpanel-add--sm"
                  onClick={handleSaveConsultores}
                  disabled={savingEtapa}
                >
                  <Check size={11} /> {savingEtapa ? 'Guardando…' : 'Guardar'}
                </button>
                <button
                  className="opp-btn opp-btn--ghost"
                  style={{ fontSize: 11, padding: '5px 10px' }}
                  onClick={() => setEditingEtapa(null)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <ToastContainer />
      <div className="panel-backdrop" onClick={onClose} />
      <aside className="detalle-panel detalle-panel--wide">
        <div className="dpanel__head">
          <div className="dpanel__info">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <EstadoSelect
                label="Estado"
                value={data.estatus}
                onChange={async (estadoId:any) => {
                  try {
                    await procesoService.cambiarEstatus(data.id, estadoId);
                    await refrescar();
                    toast.success(`Estado actualizado`);
                  } catch (err: any) {
                    toast.error(err?.response?.data?.mensaje ?? 'Error');
                  }
                }}
              />
              <button className="btn-dpanel-edit" onClick={() => onEdit(data)}>
                Editar proceso
              </button>
            </div>
            <h3 className="dpanel__title" style={{ marginTop: 12 }}>{data.nombre_proceso}</h3>
            <p className="dpanel__sub">
              <span style={{ fontWeight: 600 }}>{data.proyecto?.nombre}</span>
              {data.prioridad && <> · {data.prioridad}</>}
            </p>
          </div>
          <button className="modal__close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="dpanel__body">
          <div className="dpanel__section">
            {/* Levantamiento */}
            <EtapaCard
              titulo="Levantamiento"
              etapaKey="levantamiento"
              check={!!data.levantamiento}
              consultoresActuales={data.levantamiento?.consultores}
            >
              {data.levantamiento ? (
                <>
                  <ConsultoresList consultores={data.levantamiento.consultores} />
                  <Row icon={<Calendar size={11} />} label="Fecha" value={fmtFecha(data.levantamiento.fecha_levantamiento)} />
                  {data.levantamiento.observaciones && <p className="etapa-obs">{data.levantamiento.observaciones}</p>}
                </>
              ) : <p className="etapa-empty">Sin registrar</p>}
            </EtapaCard>

            {/* Estimación */}
            <EtapaCard
              titulo="Estimación"
              etapaKey="estimacion"
              check={!!data.estimacion}
              consultoresActuales={data.estimacion?.consultores}
            >
              {data.estimacion ? (
                <>
                  <ConsultoresList consultores={data.estimacion.consultores} />
                  <Row icon={<Calendar size={11} />} label="Fecha" value={fmtFecha(data.estimacion.fecha_estimacion)} />
                  {data.estimacion.observaciones && <p className="etapa-obs">{data.estimacion.observaciones}</p>}
                </>
              ) : <p className="etapa-empty">Sin registrar</p>}
            </EtapaCard>

            {/* Propuesta */}
            <EtapaCard
              titulo="Propuesta"
              etapaKey="propuesta"
              check={!!data.propuesta}
              consultoresActuales={data.propuesta?.consultores}
            >
              {data.propuesta ? (
                <>
                  <ConsultoresList consultores={data.propuesta.consultores} />
                  <Row icon={<Calendar size={11} />} label="Entrega" value={fmtFecha(data.propuesta.fecha_entrega_propuesta)} />
                  <Row icon={<DollarSign size={11} />} label="Valor" value={fmtMoney(data.propuesta.valor_presupuestado)} />
                  <Row icon={<Clock size={11} />} label="Horas" value={data.propuesta.horas_presupuestadas ? `${data.propuesta.horas_presupuestadas} h` : null} />
                  {data.propuesta.nivel_detalle && <Row label="Nivel" value={data.propuesta.nivel_detalle} />}
                  {data.propuesta.observaciones && <p className="etapa-obs">{data.propuesta.observaciones}</p>}
                </>
              ) : <p className="etapa-empty">Sin registrar</p>}
            </EtapaCard>

            {/* Preliminar */}
            <EtapaCard
              titulo="Preliminar"
              etapaKey="preliminar"
              check={!!data.preliminar}
              consultoresActuales={data.preliminar?.consultores}
            >
              {data.preliminar ? (
                <>
                  <ConsultoresList consultores={data.preliminar.consultores} />
                  <Row icon={<Calendar size={11} />} label="Fecha" value={fmtFecha(data.preliminar.fecha_preliminar)} />
                  <Row icon={<Check size={11} />} label="Viable" value={data.preliminar.viable === null ? null : data.preliminar.viable ? 'Sí' : 'No'} />
                  {data.preliminar.resultado && <p className="etapa-obs">{data.preliminar.resultado}</p>}
                </>
              ) : <p className="etapa-empty">Sin registrar</p>}
            </EtapaCard>

            {/* Aprobación */}
            <EtapaCard
              titulo="Aprobación"
              etapaKey="aprobacion"
              check={!!data.aprobacion}
              consultoresActuales={data.aprobacion?.consultores}
            >
              {data.aprobacion ? (
                <>
                  <ConsultoresList consultores={data.aprobacion.consultores} />
                  <span
                    className={`badge ${data.aprobacion.aprobado ? 'badge--activo' : 'badge--inactivo'}`}
                    style={{ marginBottom: 6, display: 'inline-flex' }}
                  >
                    {data.aprobacion.aprobado ? 'Aprobado' : 'Rechazado'}
                  </span>
                  <Row icon={<Calendar size={11} />} label="Fecha" value={fmtFecha(data.aprobacion.fecha_aprobacion)} />
                  {data.aprobacion.motivo_rechazo && (
                    <div className="etapa-row etapa-row--warn">
                      <AlertCircle size={11} className="etapa-row__icon" />
                      <span className="etapa-row__label">Motivo:</span>
                      <span className="etapa-row__value">{data.aprobacion.motivo_rechazo}</span>
                    </div>
                  )}
                </>
              ) : <p className="etapa-empty">Sin registrar</p>}
            </EtapaCard>

            {/* Ejecución */}
            <EtapaCard
              titulo="Ejecución"
              etapaKey="ejecucion"
              check={!!data.ejecucion}
              consultoresActuales={data.ejecucion?.consultores}
            >
              {data.ejecucion ? (
                <>
                  {data.ejecucion.consultor && (
                    <div className="etapa-row" style={{ marginBottom: 4 }}>
                      <span className="etapa-row__icon"><User size={11} /></span>
                      <span className="etapa-row__label">Responsable</span>
                      <span className="etapa-row__value" style={{ fontWeight: 700 }}>
                        {data.ejecucion.consultor.nombre}
                      </span>
                    </div>
                  )}
                  <ConsultoresList consultores={data.ejecucion.consultores} />
                  <Row icon={<Calendar size={11} />} label="Inicio" value={fmtFecha(data.ejecucion.fecha_inicio)} />
                  <Row icon={<Calendar size={11} />} label="Cierre" value={fmtFecha(data.ejecucion.fecha_fin)} />
                  <Row icon={<Clock size={11} />} label="Hrs reales" value={data.ejecucion.horas_reales ? `${data.ejecucion.horas_reales} h` : null} />
                  {data.ejecucion.observaciones && <p className="etapa-obs">{data.ejecucion.observaciones}</p>}
                </>
              ) : <p className="etapa-empty">Sin registrar</p>}
            </EtapaCard>
          </div>
        </div>
      </aside>
    </>
  );
};