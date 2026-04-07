import { useState } from 'react';
import {
  X, Check, Plus, Activity, Calendar, Clock,
  DollarSign, User, Users, AlertCircle,
} from 'lucide-react';
import { procesoService } from '../../Services/procesoService';
import { useToast } from '../../Hooks/useToast';
import type { Proceso, EstatusProceso, TipoInteraccion } from '../../Interfaces/i_procesos';
import { ESTATUS_LIST, TIPOS_INTERACCION, TODAY, fmtFecha, fmtMoney, estatusClass, type Opt } from '../../Constants/procesos';
import { ConsultorMultiSelect } from './ConsultorMultiSelect';

type DetailTab = 'etapas' | 'interacciones';

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
  consultores: Opt[];
  onClose: () => void;
  onRefresh: (p: Proceso) => void;
  onEdit: (p: Proceso) => void;
}

export const DetallePanel = ({ proceso, consultores, onClose, onRefresh, onEdit }: Props) => {
  const { toast, ToastContainer } = useToast();
  const [tab, setTab] = useState<DetailTab>('etapas');
  const [data, setData] = useState<Proceso>(proceso);
  const [intForm, setIntForm] = useState({ consultor_id: '', tipo: '' as TipoInteraccion | '', descripcion: '', fecha: TODAY });
  const [saving, setSaving] = useState(false);
  const [newEstatus, setNewEstatus] = useState<EstatusProceso>(proceso.estatus);
  const [editingEtapa, setEditingEtapa] = useState<string | null>(null);
  const [editIds, setEditIds] = useState<string[]>([]);
  const [savingEtapa, setSavingEtapa] = useState(false);

  const refrescar = async () => {
    const updated = await procesoService.getById(data.id);
    setData(updated); onRefresh(updated);
  };

  const handleCambiarEstatus = async () => {
    if (newEstatus === data.estatus) return;
    try {
      await procesoService.cambiarEstatus(data.id, newEstatus);
      await refrescar(); toast.success(`Estatus → ${newEstatus}`);
    } catch (err: any) { toast.error(err?.response?.data?.mensaje ?? 'Error'); }
  };

  const handleAddInteraccion = async () => {
    if (!intForm.consultor_id) return toast.warning('Selecciona un consultor');
    if (!intForm.fecha) return toast.warning('Fecha requerida');
    setSaving(true);
    try {
      await procesoService.crearInteraccion(data.id, {
        consultor_id: intForm.consultor_id, tipo: intForm.tipo || undefined,
        descripcion: intForm.descripcion || undefined, fecha: intForm.fecha,
      });
      setIntForm({ consultor_id: '', tipo: '', descripcion: '', fecha: TODAY });
      await refrescar(); toast.success('Interacción registrada');
    } catch (err: any) { toast.error(err?.response?.data?.mensaje ?? 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelInteraccion = async (intId: string) => {
    try {
      await procesoService.eliminarInteraccion(data.id, intId);
      await refrescar(); toast.success('Interacción eliminada');
    } catch (err: any) { toast.error(err?.response?.data?.mensaje ?? 'Error'); }
  };

  const openEditConsultores = (etapa: string, currentIds: string[]) => {
    setEditingEtapa(etapa); setEditIds(currentIds);
  };

  const handleSaveConsultores = async () => {
    if (!editingEtapa) return;
    setSavingEtapa(true);
    try {
      await procesoService.upsertEtapa(data.id, editingEtapa, { consultores_ids: editIds });
      setEditingEtapa(null); await refrescar(); toast.success('Consultores actualizados');
    } catch (err: any) { toast.error(err?.response?.data?.mensaje ?? 'Error al actualizar'); }
    finally { setSavingEtapa(false); }
  };

  const EtapaCard = ({
    titulo, etapaKey, check, consultoresActuales, children,
  }: {
    titulo: string; etapaKey: string; check: boolean;
    consultoresActuales?: { id: string; nombre: string }[]; children: React.ReactNode;
  }) => {
    const isEditing = editingEtapa === etapaKey;
    return (
      <div className={`etapa-card ${check ? 'etapa-card--done' : ''}`}>
        <div className="etapa-card__head">
          <span className="etapa-card__title">{titulo}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {check && (
              <button className="etapa-card__edit-btn" title="Editar consultores"
                onClick={() => isEditing ? setEditingEtapa(null) : openEditConsultores(etapaKey, consultoresActuales?.map(c => c.id) ?? [])}>
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
              <ConsultorMultiSelect label="" selected={editIds} onChange={setEditIds} consultores={consultores} />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="btn-dpanel-add btn-dpanel-add--sm" onClick={handleSaveConsultores} disabled={savingEtapa}>
                  <Check size={11} /> {savingEtapa ? 'Guardando…' : 'Guardar'}
                </button>
                <button className="opp-btn opp-btn--ghost" style={{ fontSize: 11, padding: '5px 10px' }}
                  onClick={() => setEditingEtapa(null)}>Cancelar</button>
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
            <span className={`estatus-badge estatus--${estatusClass(data.estatus)}`}>{data.estatus}</span>
            <h3 className="dpanel__title" style={{ marginTop: 6 }}>{data.nombre_proceso}</h3>
            <p className="dpanel__sub">
              <span style={{ fontWeight: 600 }}>{data.proyecto.nombre}</span>
              {data.prioridad && <> · {data.prioridad}</>}
            </p>
            <div className="estatus-changer">
              <select className="wfield__input estatus-changer__select" value={newEstatus}
                onChange={e => setNewEstatus(e.target.value as EstatusProceso)}>
                {ESTATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button className="btn-dpanel-add btn-dpanel-add--sm" onClick={handleCambiarEstatus}>
                <Check size={12} /> Actualizar
              </button>
              <button className="btn-dpanel-edit" onClick={() => onEdit(data)}>
                Editar proceso
              </button>
            </div>
          </div>
          <button className="modal__close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="dpanel__tabs">
          {(['etapas', 'interacciones'] as DetailTab[]).map(t => (
            <button key={t} className={`dpanel__tab ${tab === t ? 'dpanel__tab--active' : ''}`} onClick={() => setTab(t)}>
              {t === 'etapas' ? 'Etapas' : 'Interacciones'}
              {t === 'interacciones' && <span className="dpanel__tab-count">{data.interacciones?.length ?? 0}</span>}
            </button>
          ))}
        </div>

        <div className="dpanel__body">
          {tab === 'etapas' && (
            <div className="dpanel__section">
              <EtapaCard titulo="Levantamiento" etapaKey="levantamiento" check={!!data.levantamiento}
                consultoresActuales={data.levantamiento?.consultores}>
                {data.levantamiento ? (
                  <>
                    <ConsultoresList consultores={data.levantamiento.consultores} />
                    <Row icon={<Calendar size={11} />} label="Fecha" value={fmtFecha(data.levantamiento.fecha_levantamiento)} />
                    {data.levantamiento.observaciones && <p className="etapa-obs">{data.levantamiento.observaciones}</p>}
                  </>
                ) : <p className="etapa-empty">Sin registrar</p>}
              </EtapaCard>

              <EtapaCard titulo="Estimación" etapaKey="estimacion" check={!!data.estimacion}
                consultoresActuales={data.estimacion?.consultores}>
                {data.estimacion ? (
                  <>
                    <ConsultoresList consultores={data.estimacion.consultores} />
                    <Row icon={<Calendar size={11} />} label="Fecha" value={fmtFecha(data.estimacion.fecha_estimacion)} />
                    {data.estimacion.observaciones && <p className="etapa-obs">{data.estimacion.observaciones}</p>}
                  </>
                ) : <p className="etapa-empty">Sin registrar</p>}
              </EtapaCard>

              <EtapaCard titulo="Propuesta" etapaKey="propuesta" check={!!data.propuesta}
                consultoresActuales={data.propuesta?.consultores}>
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

              <EtapaCard titulo="Preliminar" etapaKey="preliminar" check={!!data.preliminar}
                consultoresActuales={data.preliminar?.consultores}>
                {data.preliminar ? (
                  <>
                    <ConsultoresList consultores={data.preliminar?.consultores} />
                    <Row icon={<Calendar size={11} />} label="Fecha" value={fmtFecha(data.preliminar.fecha_preliminar)} />
                    <Row icon={<Check size={11} />} label="Viable" value={data.preliminar.viable === null ? null : data.preliminar.viable ? 'Sí' : 'No'} />
                    {data.preliminar.resultado && <p className="etapa-obs">{data.preliminar.resultado}</p>}
                  </>
                ) : <p className="etapa-empty">Sin registrar</p>}
              </EtapaCard>

              <EtapaCard titulo="Aprobación" etapaKey="aprobacion" check={!!data.aprobacion}
                consultoresActuales={data.aprobacion?.consultores}>
                {data.aprobacion ? (
                  <>
                    <ConsultoresList consultores={data.aprobacion?.consultores} />
                    <span className={`badge ${data.aprobacion.aprobado ? 'badge--activo' : 'badge--inactivo'}`} style={{ marginBottom: 6, display: 'inline-flex' }}>
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

              <EtapaCard titulo="Ejecución" etapaKey="ejecucion" check={!!data.ejecucion}
                consultoresActuales={data.ejecucion?.consultores}>
                {data.ejecucion ? (
                  <>
                    {data.ejecucion.consultor && (
                      <div className="etapa-row" style={{ marginBottom: 4 }}>
                        <span className="etapa-row__icon"><User size={11} /></span>
                        <span className="etapa-row__label">Responsable</span>
                        <span className="etapa-row__value" style={{ fontWeight: 700 }}>{data.ejecucion.consultor.nombre}</span>
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
          )}

          {tab === 'interacciones' && (
            <div className="dpanel__section">
              <div className="int-form">
                <p className="step-section-title">NUEVA INTERACCIÓN</p>
                <div className="wrow" style={{ marginTop: 8 }}>
                  <div className="wfield">
                    <label className="wfield__label">TIPO</label>
                    <select className="wfield__input" value={intForm.tipo}
                      onChange={e => setIntForm(p => ({ ...p, tipo: e.target.value as any }))}>
                      <option value="">— Tipo —</option>
                      {TIPOS_INTERACCION.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="wfield">
                    <label className="wfield__label">CONSULTOR <span className="wfield__req">*</span></label>
                    <select className="wfield__input" value={intForm.consultor_id}
                      onChange={e => setIntForm(p => ({ ...p, consultor_id: e.target.value }))}>
                      <option value="">— Selecciona —</option>
                      {consultores.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>
                  <div className="wfield">
                    <label className="wfield__label">FECHA <span className="wfield__req">*</span></label>
                    <input type="date" className="wfield__input" value={intForm.fecha}
                      onChange={e => setIntForm(p => ({ ...p, fecha: e.target.value }))} />
                  </div>
                </div>
                <div className="wfield">
                  <label className="wfield__label">DESCRIPCIÓN</label>
                  <textarea className="wfield__input wfield__textarea" style={{ minHeight: 60 }}
                    placeholder="Notas de la interacción…" value={intForm.descripcion}
                    onChange={e => setIntForm(p => ({ ...p, descripcion: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn-dpanel-add" onClick={handleAddInteraccion} disabled={saving}>
                    <Plus size={13} />{saving ? 'Guardando…' : 'Registrar'}
                  </button>
                </div>
              </div>

              {(data.interacciones?.length ?? 0) === 0 ? (
                <div className="dpanel__empty"><Activity size={28} strokeWidth={1.2} /><p>Sin interacciones</p></div>
              ) : (
                <ul className="int-list">
                  {(data.interacciones ?? []).map(int => (
                    <li key={int.id} className="int-item">
                      <div className="int-item__head">
                        <span className="int-item__tipo">{int.tipo ?? 'Nota'}</span>
                        <span className="int-item__fecha">{fmtFecha(int.fecha)}</span>
                        <button className="chip__remove" onClick={() => handleDelInteraccion(int.id)}><X size={10} /></button>
                      </div>
                      {int.consultor && <p className="int-item__by">Por: {int.consultor.nombre}</p>}
                      {int.descripcion && <p className="int-item__desc">{int.descripcion}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
