import { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, X, Check, Loader,
  Calendar as CalIcon, Link, Clock, Trash2, Pencil,
  AlertCircle, ExternalLink, Link2Off,
} from 'lucide-react';
import { useToast } from '../../Hooks/useToast';
import { calendarioService } from '../../Services/calendarService';
import type { CalEvent, CreateEventPayload } from '../../Interfaces/i_calendario';
import './Calendario.css';
import { useAuth } from '../../Context/AuthContext';

const DIAS  = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
               'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const COLOR_MAP: Record<string, string> = {
  '1': '#4285f4', '2': '#33b679', '3': '#8e24aa', '4': '#e67c73',
  '5': '#f6bf26', '6': '#f4511e', '7': '#039be5', '8': '#616161',
  '9': '#3f51b5', '10': '#0b8043', '11': '#d50000',
};

const COLOR_OPTIONS = Object.entries(COLOR_MAP).map(([id, hex]) => ({ id, hex }));

const toLocalDate = (iso?: string) => iso ? new Date(iso) : null;

const fmtTime = (iso?: string) => {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
};

const fmtDateInput = (d: Date) => {
  const y   = d.getFullYear();
  const m   = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth()    === b.getMonth()    &&
  a.getDate()     === b.getDate();

const getDaysInMonth    = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

interface EventForm {
  titulo:      string;
  descripcion: string;
  fecha:       string;
  horaInicio:  string;
  horaFin:     string;
  color:       string;
}

const EMPTY_FORM: EventForm = {
  titulo:      '',
  descripcion: '',
  fecha:       fmtDateInput(new Date()),
  horaInicio:  '09:00',
  horaFin:     '10:00',
  color:       '1',
};

export const Calendario = () => {
  const { toast, ToastContainer } = useToast();

  const { user } = useAuth();
  const userId = user?.id ? String(user.id) : '';

  const [linked,      setLinked]      = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [eventos,     setEventos]     = useState<CalEvent[]>([]);
  const [loadingEvt,  setLoadingEvt]  = useState(false);

  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editEvent, setEditEvent] = useState<CalEvent | null>(null);
  const [form,      setForm]      = useState<EventForm>({ ...EMPTY_FORM });
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    if (!userId) { setLoadingAuth(false); return; }

    const params = new URLSearchParams(window.location.search);
    if (params.get('linked') === 'true') {
      toast.success('¡Google Calendar vinculado correctamente!');
      window.history.replaceState({}, '', window.location.pathname);
    }

    calendarioService.getStatus(userId)
      .then(r => setLinked(r.linked))
      .catch(() => {})
      .finally(() => setLoadingAuth(false));
  }, [userId]);

  const fetchEventos = useCallback(async () => {
    if (!linked || !userId) return;
    setLoadingEvt(true);
    try {
      const timeMin = new Date(year, month, 1).toISOString();
      const timeMax = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
      const data    = await calendarioService.listarEventos(userId, timeMin, timeMax);
      setEventos(data ?? []);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setLinked(false);
        toast.error('Sesión de Google expirada. Vuelve a vincular.');
      } else {
        toast.error('Error al cargar eventos');
      }
    } finally {
      setLoadingEvt(false);
    }
  }, [linked, userId, year, month]);

  useEffect(() => { fetchEventos(); }, [fetchEventos]);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else              setMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else               setMonth(m => m + 1);
    setSelectedDay(null);
  };
  const goToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDay(today);
  };

  const eventosDelDia = (d: Date) =>
    eventos.filter(e => {
      const start = toLocalDate(e.start.dateTime ?? e.start.date);
      return start && isSameDay(start, d);
    });

  const openCreate = (day?: Date) => {
    setEditEvent(null);
    setForm({ ...EMPTY_FORM, fecha: day ? fmtDateInput(day) : fmtDateInput(new Date()) });
    setShowModal(true);
  };

  const openEdit = (evt: CalEvent) => {
    const start = new Date(evt.start.dateTime ?? evt.start.date ?? '');
    const end   = new Date(evt.end.dateTime   ?? evt.end.date   ?? '');
    setEditEvent(evt);
    setForm({
      titulo:      evt.summary ?? '',
      descripcion: evt.description ?? '',
      fecha:       fmtDateInput(start),
      horaInicio:  `${String(start.getHours()).padStart(2,'0')}:${String(start.getMinutes()).padStart(2,'0')}`,
      horaFin:     `${String(end.getHours()).padStart(2,'0')}:${String(end.getMinutes()).padStart(2,'0')}`,
      color:       evt.colorId ?? '1',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.titulo.trim()) return toast.warning('El título es obligatorio');
    if (!form.fecha)         return toast.warning('La fecha es obligatoria');
    setSaving(true);
    try {
      const fechaInicio = new Date(`${form.fecha}T${form.horaInicio}:00`).toISOString();
      const fechaFin    = new Date(`${form.fecha}T${form.horaFin}:00`).toISOString();

      const payload: CreateEventPayload = {
        userId,
        titulo:      form.titulo.trim(),
        descripcion: form.descripcion.trim() || undefined,
        fechaInicio,
        fechaFin,
        color:       form.color,
      };

      if (editEvent) {
        await calendarioService.actualizarEvento(editEvent.id, payload);
        toast.success('Evento actualizado');
      } else {
        await calendarioService.crearEvento(payload);
        toast.success('Evento creado');
      }
      setShowModal(false);
      await fetchEventos();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (evt: CalEvent) => {
    try {
      await calendarioService.eliminarEvento(evt.id, userId);
      toast.success('Evento eliminado');
      await fetchEventos();
      if (selectedDay) {
        const remaining = eventosDelDia(selectedDay).filter(e => e.id !== evt.id);
        if (remaining.length === 0) setSelectedDay(null);
      }
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay    = getFirstDayOfMonth(year, month);
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="cal-page">
      <ToastContainer />

      <div className="cal-header">
        <div className="cal-header__left">
          <h1 className="cal-header__title">Calendario</h1>
          <p className="cal-header__sub">Gestión de agenda y eventos</p>
        </div>
        <div className="cal-header__right">
          {loadingAuth ? (
            <span className="cal-link-status cal-link-status--loading">
              <Loader size={13} className="spin" /> Verificando…
            </span>
          ) : linked ? (
            <div className="cal-linked-row">
              <span className="cal-link-status cal-link-status--ok">
                <Link size={13} /> Google Calendar vinculado
              </span>
              <button
                className="cal-btn cal-btn--ghost cal-btn--sm"
                onClick={async () => {
                  await calendarioService.unlink(userId);
                  setLinked(false);
                  setEventos([]);
                  toast.success('Desvinculado');
                }}
              >
                <Link2Off size={12} /> Desvincular
              </button>
            </div>
          ) : (
            <button
              className="cal-btn cal-btn--primary"
              onClick={() => calendarioService.startOAuth(userId)}
              disabled={!userId}
            >
              <Link size={14} /> Vincular Google Calendar
            </button>
          )}
          {linked && (
            <button className="cal-btn cal-btn--accent" onClick={() => openCreate()}>
              <Plus size={14} /> Nuevo evento
            </button>
          )}
        </div>
      </div>

      {!userId && (
        <div className="cal-empty-state">
          <AlertCircle size={36} strokeWidth={1.2} />
          <p>No se encontró el ID de usuario. Asegúrate de estar autenticado.</p>
        </div>
      )}

      {userId && !loadingAuth && !linked && (
        <div className="cal-unlinked">
          <div className="cal-unlinked__card">
            <div className="cal-unlinked__icon">
              <CalIcon size={40} strokeWidth={1.2} />
            </div>
            <h2>Conecta tu Google Calendar</h2>
            <p>Vincula tu cuenta de Google para ver y gestionar tus eventos directamente desde el CRM.</p>
            <ul className="cal-unlinked__features">
              <li><Check size={14} /> Visualiza todos tus eventos del mes</li>
              <li><Check size={14} /> Crea y edita eventos con un clic</li>
              <li><Check size={14} /> Verifica disponibilidad antes de agendar</li>
              <li><Check size={14} /> Sincronización en tiempo real</li>
            </ul>
            <button
              className="cal-btn cal-btn--primary cal-btn--lg"
              onClick={() => calendarioService.startOAuth(userId)}
            >
              <Link size={16} /> Vincular Google Calendar
            </button>
          </div>
        </div>
      )}

      {userId && linked && (
        <div className="cal-body">
          <div className="cal-nav">
            <div className="cal-nav__left">
              <button className="cal-icon-btn" onClick={prevMonth}><ChevronLeft size={16} /></button>
              <h2 className="cal-nav__month">{MESES[month]} {year}</h2>
              <button className="cal-icon-btn" onClick={nextMonth}><ChevronRight size={16} /></button>
            </div>
            <button className="cal-btn cal-btn--ghost cal-btn--sm" onClick={goToday}>Hoy</button>
          </div>

          <div className={`cal-layout ${selectedDay ? 'cal-layout--split' : ''}`}>
            <div className="cal-grid-wrap">
              {loadingEvt && (
                <div className="cal-loading-bar">
                  <Loader size={13} className="spin" /> Sincronizando…
                </div>
              )}
              <div className="cal-grid cal-grid--head">
                {DIAS.map(d => (
                  <div key={d} className="cal-cell cal-cell--head">{d}</div>
                ))}
              </div>
              <div className="cal-grid cal-grid--body">
                {cells.map((day, idx) => {
                  if (!day) return <div key={`empty-${idx}`} className="cal-cell cal-cell--empty" />;

                  const cellDate  = new Date(year, month, day);
                  const isToday   = isSameDay(cellDate, today);
                  const isSel     = selectedDay ? isSameDay(cellDate, selectedDay) : false;
                  const dayEvents = eventosDelDia(cellDate);

                  return (
                    <div
                      key={day}
                      className={[
                        'cal-cell',
                        isToday ? 'cal-cell--today'    : '',
                        isSel   ? 'cal-cell--selected' : '',
                        dayEvents.length > 0 ? 'cal-cell--has-events' : '',
                      ].filter(Boolean).join(' ')}
                      onClick={() => setSelectedDay(isSel ? null : cellDate)}
                    >
                      <span className="cal-cell__num">{day}</span>
                      <div className="cal-cell__events">
                        {dayEvents.slice(0, 3).map(e => (
                          <span
                            key={e.id}
                            className="cal-evt-pill"
                            style={{
                              background:  COLOR_MAP[e.colorId ?? '1'] + '26',
                              borderLeft: `3px solid ${COLOR_MAP[e.colorId ?? '1']}`,
                            }}
                          >
                            {fmtTime(e.start.dateTime)} {e.summary}
                          </span>
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="cal-evt-more">+{dayEvents.length - 3} más</span>
                        )}
                      </div>
                      <button
                        className="cal-cell__add"
                        title="Agregar evento"
                        onClick={ev => { ev.stopPropagation(); openCreate(cellDate); }}
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedDay && (
              <aside className="cal-day-panel">
                <div className="cal-day-panel__head">
                  <div>
                    <p className="cal-day-panel__weekday">{DIAS[selectedDay.getDay()]}</p>
                    <h3 className="cal-day-panel__date">
                      {selectedDay.getDate()} de {MESES[selectedDay.getMonth()]}
                    </h3>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="cal-btn cal-btn--accent cal-btn--sm"
                      onClick={() => openCreate(selectedDay)}
                    >
                      <Plus size={12} />
                    </button>
                    <button className="cal-icon-btn" onClick={() => setSelectedDay(null)}>
                      <X size={15} />
                    </button>
                  </div>
                </div>

                <div className="cal-day-panel__body">
                  {eventosDelDia(selectedDay).length === 0 ? (
                    <div className="cal-day-empty">
                      <CalIcon size={28} strokeWidth={1.2} />
                      <p>Sin eventos este día</p>
                      <button
                        className="cal-btn cal-btn--ghost cal-btn--sm"
                        onClick={() => openCreate(selectedDay)}
                      >
                        <Plus size={12} /> Crear evento
                      </button>
                    </div>
                  ) : (
                    <ul className="cal-day-list">
                      {eventosDelDia(selectedDay)
                        .sort((a, b) =>
                          new Date(a.start.dateTime ?? '').getTime() -
                          new Date(b.start.dateTime ?? '').getTime()
                        )
                        .map(evt => (
                          <li key={evt.id} className="cal-day-item">
                            <div
                              className="cal-day-item__bar"
                              style={{ background: COLOR_MAP[evt.colorId ?? '1'] }}
                            />
                            <div className="cal-day-item__content">
                              <p className="cal-day-item__title">{evt.summary}</p>
                              <p className="cal-day-item__time">
                                <Clock size={11} />
                                {fmtTime(evt.start.dateTime)} – {fmtTime(evt.end.dateTime)}
                              </p>
                              {evt.description && (
                                <p className="cal-day-item__desc">{evt.description}</p>
                              )}
                            </div>
                            <div className="cal-day-item__actions">
                              {evt.htmlLink && (
                                <a
                                  href={evt.htmlLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="cal-icon-btn cal-icon-btn--sm"
                                  title="Ver en Google Calendar"
                                >
                                  <ExternalLink size={12} />
                                </a>
                              )}
                              <button
                                className="cal-icon-btn cal-icon-btn--sm"
                                title="Editar"
                                onClick={() => openEdit(evt)}
                              >
                                <Pencil size={12} />
                              </button>
                              <button
                                className="cal-icon-btn cal-icon-btn--sm cal-icon-btn--danger"
                                title="Eliminar"
                                onClick={() => handleDelete(evt)}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </aside>
            )}
          </div>

          {eventos.length > 0 && (
            <div className="cal-legend">
              <span className="cal-legend__label">
                {eventos.length} evento{eventos.length !== 1 ? 's' : ''} este mes
              </span>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <>
          <div className="cal-backdrop" onClick={() => setShowModal(false)} />
          <div className="cal-modal">
            <div className="cal-modal__head">
              <h3>{editEvent ? 'Editar evento' : 'Nuevo evento'}</h3>
              <button className="cal-icon-btn" onClick={() => setShowModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="cal-modal__body">
              <div className="cal-field">
                <label>TÍTULO <span className="cal-req">*</span></label>
                <input
                  className="cal-input"
                  placeholder="Ej: Reunión con cliente"
                  value={form.titulo}
                  onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
                />
              </div>

              <div className="cal-field">
                <label>FECHA <span className="cal-req">*</span></label>
                <input
                  type="date"
                  className="cal-input"
                  value={form.fecha}
                  onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))}
                />
              </div>

              <div className="cal-row">
                <div className="cal-field">
                  <label>HORA INICIO</label>
                  <input
                    type="time"
                    className="cal-input"
                    value={form.horaInicio}
                    onChange={e => setForm(p => ({ ...p, horaInicio: e.target.value }))}
                  />
                </div>
                <div className="cal-field">
                  <label>HORA FIN</label>
                  <input
                    type="time"
                    className="cal-input"
                    value={form.horaFin}
                    onChange={e => setForm(p => ({ ...p, horaFin: e.target.value }))}
                  />
                </div>
              </div>

              <div className="cal-field">
                <label>DESCRIPCIÓN</label>
                <textarea
                  className="cal-input cal-textarea"
                  placeholder="Detalles adicionales (opcional)"
                  rows={3}
                  value={form.descripcion}
                  onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
                />
              </div>

              <div className="cal-field">
                <label>COLOR</label>
                <div className="cal-color-picker">
                  {COLOR_OPTIONS.map(c => (
                    <button
                      key={c.id}
                      className={`cal-color-dot ${form.color === c.id ? 'cal-color-dot--active' : ''}`}
                      style={{ background: c.hex }}
                      onClick={() => setForm(p => ({ ...p, color: c.id }))}
                      title={c.hex}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="cal-modal__foot">
              <button className="cal-btn cal-btn--ghost" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button
                className="cal-btn cal-btn--primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? <><Loader size={13} className="spin" /> Guardando…</>
                  : <><Check size={13} /> {editEvent ? 'Actualizar' : 'Crear evento'}</>
                }
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};