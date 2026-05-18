import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search, Plus, Pencil, Trash2, X, Check,
  Users, ChevronRight, UserPlus, Mail, Phone, Briefcase,
  Share2, PhoneOff, DollarSign, FileText, MapPin, Globe,
  Building2, Tag, Activity, Calendar, Clock,
  UserCheck, RotateCcw, ChevronDown,
  Snowflake, TrendingUp, Flame, AlertCircle, ThumbsDown, Linkedin,
} from 'lucide-react';
import { clienteService } from '../../Services/clienteService';
import { consultorService } from '../../Services/consultorService';
import { useToast } from '../../Hooks/useToast';
import { agentBus } from '../../Components/AI/nervousSystem';
import { addToast } from '../../Hooks/useToast';
import './Clientes.css';
import {
  type Cliente, type ClientePayload, type EstadoCliente,
  type UsuarioCliente, type UsuarioClientePayload,
  type SeguimientoCliente, type SeguimientoPayload,
  type MedioSeguimiento, type TipoSeguimiento,
  type Pais, type Ciudad, type Rubro,
  type EstadoObj,
  ESTADOS_PERMITIDOS,
} from '../../Interfaces/i_cliente';
import type { Consultor } from '../../Interfaces/i_consultor';
import { ESTADO_CFG, MEDIOS, TIPOS } from '../../Constants/i_clientes';
import { SeguimientoItem } from './SeguimientoItem';
import { estadoService } from '../../Services/estadoService';

// ─── Helpers de estado ─────────────────────────────────────────
const getNombreEstado = (c: Cliente): string =>
  c.estadoObj?.nombre ?? c.estado ?? '—';

const getClsEstado = (c: Cliente): string =>
  ESTADO_CFG[c.estadoObj?.nombre as EstadoCliente]?.cls ??
  ESTADO_CFG[c.estado]?.cls ?? '';

export const RELACION_CFG: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  frio:      { label: 'Frío',      cls: 'rel--frio',     icon: <Snowflake size={10} /> },
  tibio:     { label: 'Tibio',     cls: 'rel--tibio',    icon: <TrendingUp size={10} /> },
  caliente:  { label: 'Caliente',  cls: 'rel--caliente', icon: <Flame size={10} /> },
  en_riesgo: { label: 'En riesgo', cls: 'rel--riesgo',   icon: <AlertCircle size={10} /> },
  cerrado:   { label: 'Cerrado',   cls: 'rel--cerrado',  icon: <ThumbsDown size={10} /> },
};

const fmtMoney = (v?: number | null) => v != null ? `$${Number(v).toFixed(2)}` : '—';
const numOrNull = (s: string): number | null => s.trim() === '' ? null : +s;
const fmtDate  = (iso?: string | null) => iso
  ? new Date(iso).toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' })
  : '—';

const EMPTY_CLIENTE: ClientePayload = {
  empresa: '', pais_id: null, ciudad_id: null, direccion: null,
  rubro_id: null, estado: 'Lead', referido_por: null,
  precio_hora_desarrollo: null, precio_hora_soporte: null,
  precio_hora_cambio: null, porcentaje_gobierno: null, nota: null,
};

const EMPTY_USUARIO: UsuarioClientePayload = {
  nombre: '', cargo: '', email: '', telefono: '', linkedin: '',
};

interface ClienteModalProps {
  initial?: Cliente | null;
  onClose: () => void;
  onSaved: () => void;
}

const ClienteModal = ({ initial, onClose, onSaved }: ClienteModalProps) => {
  const { toast, ToastContainer } = useToast();
  const [form, setForm] = useState<ClientePayload>(
    initial ? {
      empresa:               initial.empresa,
      pais_id:               initial.pais_id,
      ciudad_id:             initial.ciudad_id,
      direccion:             initial.direccion,
      rubro_id:              initial.rubro_id,
      estado:                initial.estado,
      estado_id:             initial.estado_id,
      referido_por:          initial.referido_por,
      precio_hora_desarrollo: initial.precio_hora_desarrollo,
      precio_hora_soporte:   initial.precio_hora_soporte,
      precio_hora_cambio:    initial.precio_hora_cambio,
      porcentaje_gobierno:   initial.porcentaje_gobierno,
      nota:                  initial.nota,
    } : { ...EMPTY_CLIENTE }
  );
  const [paises,   setPaises]   = useState<Pais[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [rubros,   setRubros]   = useState<Rubro[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [estados,  setEstados]  = useState<EstadoObj[]>([]);

  const set = <K extends keyof ClientePayload>(k: K, v: ClientePayload[K]) =>
    setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    Promise.all([
      clienteService.getPaises(),
      clienteService.getRubros(),
      estadoService.getAll(),
    ]).then(([p, r, e]) => {
      setPaises(p); setRubros(r); setEstados(e);
    }).catch(() => toast.error('Error al cargar catálogos'));
  }, []);

  useEffect(() => {
    if (form.pais_id) {
      clienteService.getCiudadesByPais(form.pais_id).then(setCiudades).catch(() => setCiudades([]));
    } else {
      setCiudades([]);
      set('ciudad_id', null);
    }
  }, [form.pais_id]);

  const handleSubmit = async () => {
    if (!form.empresa?.trim()) return toast.warning("'Empresa' es requerida");
    setLoading(true);
    try {
      if (initial) { await clienteService.update(initial.id, form); toast.success('Cliente actualizado'); }
      else         { await clienteService.create(form);             toast.success('Cliente creado');      }
      onSaved(); onClose();
    } catch { toast.error('Error al guardar el cliente'); }
    finally  { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <ToastContainer />
      <div className="modal modal--lg" onClick={e => e.stopPropagation()}>
        <div className="modal__head">
          <div>
            <h2 className="modal__title">{initial ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
            <p className="modal__sub">Complete la información del cliente</p>
          </div>
          <button className="modal__close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal__body modal__body--scroll">
          <p className="mfield__section-title">DATOS DE LA EMPRESA</p>

          <div className="modal__row modal__row--2">
            <div className="mfield">
              <label className="mfield__label">Empresa <span className="mfield__req">*</span></label>
              <input className="mfield__input" placeholder="Ej: ABC Corp S.A."
                value={form.empresa} onChange={e => set('empresa', e.target.value)} />
            </div>
            <div className="mfield">
              <label className="mfield__label">Estado</label>
              <div className="mfield__select-wrap">
                <select
                  className="mfield__input mfield__select"
                  value={form.estado_id ?? ''}
                  onChange={e => set('estado_id', e.target.value || null)}>
                  <option value="">— Seleccionar estado —</option>
                  {estados
                    .filter(e => ESTADOS_PERMITIDOS.includes(e.nombre))
                    .map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
                <ChevronDown size={13} className="mfield__select-icon" />
              </div>
            </div>
          </div>

          <div className="modal__row modal__row--2">
            <div className="mfield">
              <label className="mfield__label"><Tag size={10} style={{ display: 'inline', marginRight: 3 }} />Rubro / Industria</label>
              <div className="mfield__select-wrap">
                <select className="mfield__input mfield__select"
                  value={form.rubro_id ?? ''}
                  onChange={e => set('rubro_id', e.target.value ? +e.target.value : null)}>
                  <option value="">— Sin rubro —</option>
                  {rubros.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                </select>
                <ChevronDown size={13} className="mfield__select-icon" />
              </div>
            </div>
            <div className="mfield">
              <label className="mfield__label"><UserCheck size={10} style={{ display: 'inline', marginRight: 3 }} />Referido por</label>
              <input className="mfield__input" placeholder="Nombre de quien refirió"
                value={form.referido_por ?? ''}
                onChange={e => set('referido_por', e.target.value || null)} />
            </div>
          </div>

          <p className="mfield__section-title" style={{ marginTop: 4 }}>UBICACIÓN</p>

          <div className="modal__row modal__row--2">
            <div className="mfield">
              <label className="mfield__label"><Globe size={10} style={{ display: 'inline', marginRight: 3 }} />País</label>
              <div className="mfield__select-wrap">
                <select className="mfield__input mfield__select"
                  value={form.pais_id ?? ''}
                  onChange={e => { set('pais_id', e.target.value ? +e.target.value : null); set('ciudad_id', null); }}>
                  <option value="">— Seleccionar país —</option>
                  {paises.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
                <ChevronDown size={13} className="mfield__select-icon" />
              </div>
            </div>
            <div className="mfield">
              <label className="mfield__label"><MapPin size={10} style={{ display: 'inline', marginRight: 3 }} />Ciudad</label>
              <div className="mfield__select-wrap">
                <select className="mfield__input mfield__select"
                  value={form.ciudad_id ?? ''}
                  disabled={!form.pais_id || ciudades.length === 0}
                  onChange={e => set('ciudad_id', e.target.value ? +e.target.value : null)}>
                  <option value="">— Seleccionar ciudad —</option>
                  {ciudades.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
                <ChevronDown size={13} className="mfield__select-icon" />
              </div>
            </div>
          </div>

          <div className="mfield">
            <label className="mfield__label">Dirección</label>
            <input className="mfield__input" placeholder="Ej: Av. 9 de Octubre 1234, Piso 3"
              value={form.direccion ?? ''}
              onChange={e => set('direccion', e.target.value || null)} />
          </div>

          <p className="mfield__section-title" style={{ marginTop: 4 }}>TARIFAS POR HORA</p>

          <div className="modal__row modal__row--3">
            {(['precio_hora_desarrollo', 'precio_hora_soporte', 'precio_hora_cambio'] as const).map((k, i) => (
              <div className="mfield" key={k}>
                <label className="mfield__label">
                  <DollarSign size={10} style={{ display: 'inline', marginRight: 3 }} />
                  {['Desarrollo', 'Soporte', 'Cambio'][i]}
                </label>
                <input className="mfield__input" type="number" min="0" step="0.01" placeholder="0.00"
                  value={form[k] ?? ''}
                  onChange={e => set(k, numOrNull(e.target.value))} />
              </div>
            ))}
          </div>

          <div className="mfield" style={{ maxWidth: 200 }}>
            <label className="mfield__label">% de Gerencia</label>
            <input className="mfield__input" type="number" min="0" max="100" step="0.01" placeholder="0.00"
              value={form.porcentaje_gobierno ?? ''}
              onChange={e => set('porcentaje_gobierno', numOrNull(e.target.value))} />
          </div>

          <p className="mfield__section-title" style={{ marginTop: 4 }}>NOTA</p>
          <div className="mfield">
            <textarea className="mfield__input mfield__textarea"
              placeholder="Observaciones sobre este cliente…"
              value={form.nota ?? ''}
              onChange={e => set('nota', e.target.value || null)} />
          </div>
        </div>

        <div className="modal__foot">
          <button className="modal__btn modal__btn--ghost" onClick={onClose}>Cancelar</button>
          <button className="modal__btn modal__btn--primary" onClick={handleSubmit} disabled={loading}>
            <Check size={15} />{loading ? 'Guardando…' : 'Guardar Cliente'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// Modal — Seguimiento
// ══════════════════════════════════════════════════════════════
interface SeguimientoModalProps {
  clienteId:   string;
  usuarios:    UsuarioCliente[];
  consultores: Consultor[];
  initial?:    SeguimientoCliente | null;
  onClose:     () => void;
  onSaved:     () => void;
}

const EMPTY_SEG: SeguimientoPayload = {
  consultor_id:         '',
  usuario_cliente_id:   null,
  fecha:                new Date().toISOString().slice(0, 10),
  fecha_proxima_accion: null,
  medio:                'telefono',
  tipo:                 'llamada',
  descripcion:          '',
  resultado:            null,
  estado:               'programado',
};

const SeguimientoModal = ({
  clienteId, usuarios, consultores, initial, onClose, onSaved,
}: SeguimientoModalProps) => {
  const { toast, ToastContainer } = useToast();
  const [form, setForm] = useState<SeguimientoPayload>(
    initial ? {
      consultor_id:         initial.consultor_id,
      usuario_cliente_id:   initial.usuario_cliente_id,
      fecha:                initial.fecha,
      fecha_proxima_accion: initial.fecha_proxima_accion,
      medio:                initial.medio,
      tipo:                 initial.tipo,
      descripcion:          initial.descripcion,
      resultado:            initial.resultado,
      estado:               initial.estado,
    } : { ...EMPTY_SEG }
  );
  const [loading, setLoading] = useState(false);
  const set = <K extends keyof SeguimientoPayload>(k: K, v: SeguimientoPayload[K]) =>
    setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.consultor_id)       return toast.warning("'Consultor' es requerido");
    if (!form.fecha)              return toast.warning("'Fecha' es requerida");
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
              <label className="mfield__label">Contacto del cliente</label>
              <div className="mfield__select-wrap">
                <select className="mfield__input mfield__select"
                  value={form.usuario_cliente_id ?? ''}
                  onChange={e => set('usuario_cliente_id', e.target.value || null)}>
                  <option value="">— Sin contacto específico —</option>
                  {usuarios.filter(u => u.activo).map(u =>
                    <option key={u.id} value={u.id}>
                      {u.nombre}{u.cargo ? ` · ${u.cargo}` : ''}
                    </option>
                  )}
                </select>
                <ChevronDown size={13} className="mfield__select-icon" />
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

interface UsuarioModalProps {
  clienteId: string;
  initial?:  UsuarioCliente | null;
  onClose:   () => void;
  onSaved:   () => void;
}

const UsuarioModal = ({ clienteId, initial, onClose, onSaved }: UsuarioModalProps) => {
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
          <p className="mfield__section-title" style={{ marginTop: 8 }}>CONTACTO (opcional)</p>
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

const ConfirmDelete = ({ nombre, onConfirm, onCancel }: {
  nombre: string; onConfirm: () => void; onCancel: () => void;
}) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
      <div className="modal__head">
        <h2 className="modal__title">Desactivar cliente</h2>
        <button className="modal__close" onClick={onCancel}><X size={16} /></button>
      </div>
      <div className="modal__body">
        <p className="confirm__text">
          El cliente <strong>{nombre}</strong> pasará a estado <strong>Inactivo</strong>.
          Podrás reactivarlo en cualquier momento.
        </p>
      </div>
      <div className="modal__foot">
        <button className="modal__btn modal__btn--ghost" onClick={onCancel}>Cancelar</button>
        <button className="modal__btn modal__btn--danger" onClick={onConfirm}>
          <Trash2 size={14} /> Desactivar
        </button>
      </div>
    </div>
  </div>
);

const CompartirModal = ({ usuario, cliente, consultores, onClose }: {
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
      ...(usuario.cargo    ? [`💼 *Cargo:* ${usuario.cargo}`]      : []),
      ...(usuario.email    ? [`✉️ *Email:* ${usuario.email}`]       : []),
      ...(usuario.telefono ? [`📞 *Tel:* ${usuario.telefono}`]      : []),
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

type PanelTab = 'usuarios' | 'seguimientos';

const ClientePanel = ({ cliente, onClose, onClienteRefresh }: {
  cliente: Cliente; onClose: () => void; onClienteRefresh: () => void;
}) => {
  const { toast, ToastContainer } = useToast();
  const [tab,          setTab]          = useState<PanelTab>('usuarios');
  const [usuarios,     setUsuarios]     = useState<UsuarioCliente[]>(cliente.usuarios ?? []);
  const [modalUsuario, setModalUsuario] = useState<'create' | UsuarioCliente | null>(null);
  const [toDelUser,    setToDelUser]    = useState<UsuarioCliente | null>(null);
  const [compartiendo, setCompartiendo] = useState<UsuarioCliente | null>(null);
  const [consultores,  setConsultores]  = useState<Consultor[]>([]);
  const [seguimientos, setSeguimientos] = useState<SeguimientoCliente[]>([]);
  const [loadingSeg,   setLoadingSeg]   = useState(false);
  const [modalSeg,     setModalSeg]     = useState<'create' | SeguimientoCliente | null>(null);
  const [toDelSeg,     setToDelSeg]     = useState<SeguimientoCliente | null>(null);

  // Refs para closures del agentBus
  const usuariosRef = useRef<UsuarioCliente[]>([]);
  useEffect(() => { usuariosRef.current = usuarios; }, [usuarios]);

  useEffect(() => {
    fetchUsuarios();
    consultorService.getAll({ limit: 100 }).then(r => setConsultores(r.data)).catch(() => { });
    fetchSeguimientos();
  }, [cliente.id]);

  useEffect(() => {
    if (seguimientos.some(s => s.contexto_seguimiento === null)) {
      const timer = setTimeout(fetchSeguimientos, 5000);
      return () => clearTimeout(timer);
    }
  }, [seguimientos]);

  useEffect(() => {
    const unreg = [

      agentBus.register('clientes:switchTab', (payload) => {
        const t = payload.tab as string;
        if (t === 'usuarios' || t === 'seguimientos') setTab(t);
      }),

      agentBus.register('clientes:highlightUsuario', (payload) => {
        const userName = payload.userName as string;
        setTab('usuarios');
        setTimeout(() => {
          const el = document.querySelector<HTMLElement>(
            `[data-usuario-nombre*="${userName.toLowerCase()}"]`
          );
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ai-highlight');
            setTimeout(() => el.classList.remove('ai-highlight'), 3000);
          } else {
            addToast(`No encontré al usuario "${userName}"`, 'warning');
          }
        }, 200);
      }),

      agentBus.register('clientes:removeUsuario', async (payload) => {
        const userName = payload.userName as string;
        const u = usuariosRef.current.find(x => x.nombre.toLowerCase().includes(userName.toLowerCase()));
        if (!u) return addToast(`Usuario "${userName}" no encontrado en este panel`, 'warning');
        try {
          await clienteService.removeUsuario(cliente.id, u.id);
          addToast(`"${u.nombre}" eliminado`, 'info');
          fetchUsuarios();
          onClienteRefresh();
        } catch { addToast('Error al eliminar el usuario', 'error'); }
      }),

      agentBus.register('clientes:updateUsuario', async (payload) => {
        const userName = payload.userName as string;
        const data = payload.data as Partial<UsuarioClientePayload>;
        const u = usuariosRef.current.find(x => x.nombre.toLowerCase().includes(userName.toLowerCase()));
        if (!u) return addToast(`Usuario "${userName}" no encontrado`, 'warning');
        try {
          await clienteService.updateUsuario(cliente.id, u.id, data);
          addToast(`"${u.nombre}" actualizado`, 'success');
          fetchUsuarios();
        } catch { addToast('Error al actualizar el usuario', 'error'); }
      }),

      agentBus.register('panel:createSeguimiento', async (payload) => {
        const data = payload.data as SeguimientoPayload;
        try {
          await clienteService.createSeguimiento(cliente.id, data);
          addToast('Seguimiento registrado', 'success');
          setTab('seguimientos');
          fetchSeguimientos();
        } catch { addToast('Error al registrar el seguimiento', 'error'); }
      }),
    ];

    return () => unreg.forEach(fn => fn());
  }, [cliente.id]); 

  const fetchUsuarios = async () => {
    try { setUsuarios(await clienteService.getUsuarios(cliente.id)); }
    catch { toast.error('Error al cargar el personal'); }
  };

  const fetchSeguimientos = async () => {
    setLoadingSeg(true);
    try {
      const res = await clienteService.getSeguimientos(cliente.id, { limit: 50 });
      setSeguimientos(res.data);
    } catch { toast.error('Error al cargar seguimientos'); }
    finally { setLoadingSeg(false); }
  };

  const handleDeleteUser = async () => {
    if (!toDelUser) return;
    try {
      await clienteService.removeUsuario(cliente.id, toDelUser.id);
      toast.success('Usuario eliminado');
      setToDelUser(null);
      fetchUsuarios(); onClienteRefresh();
    } catch { toast.error('Error al eliminar'); }
  };

  const handleDeleteSeg = async () => {
    if (!toDelSeg) return;
    try {
      await clienteService.removeSeguimiento(cliente.id, toDelSeg.id);
      toast.success('Seguimiento eliminado');
      setToDelSeg(null);
      fetchSeguimientos();
    } catch { toast.error('Error al eliminar el seguimiento'); }
  };

  const hayTarifas = [
    cliente.precio_hora_desarrollo, cliente.precio_hora_soporte,
    cliente.precio_hora_cambio,     cliente.porcentaje_gobierno,
  ].some(v => v != null);

  return (
    <>
      <ToastContainer />
      <div className="panel-backdrop" onClick={onClose} />
      <aside className="usuarios-panel">

        <div className="upanel__head">
          <div className="upanel__info">
            <span className={`estado-badge estado-badge--sm ${getClsEstado(cliente)}`}>
              {getNombreEstado(cliente)}
            </span>
            <h3 className="upanel__title">{cliente.empresa}</h3>
            <p className="upanel__sub">
              {[cliente.rubro?.nombre, cliente.ciudad?.nombre, cliente.pais?.nombre, cliente?.direccion]
                .filter(Boolean).join(' · ')}
            </p>
            {cliente.referido_por && (
              <p className="upanel__ref"><UserCheck size={10} /> Ref: {cliente.referido_por}</p>
            )}
          </div>
          <button className="modal__close" onClick={onClose}><X size={16} /></button>
        </div>

        {hayTarifas && (
          <div className="upanel__tarifas">
            <p className="upanel__tarifas-title"><DollarSign size={11} /> Tarifas por hora</p>
            <div className="upanel__tarifas-grid">
              {cliente.precio_hora_desarrollo != null && (
                <div className="tarifa-chip">
                  <span className="tarifa-chip__label">Desarrollo</span>
                  <span className="tarifa-chip__value">{fmtMoney(cliente.precio_hora_desarrollo)}/h</span>
                </div>
              )}
              {cliente.precio_hora_soporte != null && (
                <div className="tarifa-chip">
                  <span className="tarifa-chip__label">Soporte</span>
                  <span className="tarifa-chip__value">{fmtMoney(cliente.precio_hora_soporte)}/h</span>
                </div>
              )}
              {cliente.precio_hora_cambio != null && (
                <div className="tarifa-chip">
                  <span className="tarifa-chip__label">Cambio</span>
                  <span className="tarifa-chip__value">{fmtMoney(cliente.precio_hora_cambio)}/h</span>
                </div>
              )}
              {cliente.porcentaje_gobierno != null && (
                <div className="tarifa-chip tarifa-chip--gov">
                  <span className="tarifa-chip__label">% Gobierno</span>
                  <span className="tarifa-chip__value">{cliente.porcentaje_gobierno}%</span>
                </div>
              )}
            </div>
            {cliente.nota && <p className="upanel__nota"><FileText size={10} /> {cliente.nota}</p>}
          </div>
        )}

        <div className="upanel__tabs">
          <button
            className={`upanel__tab ${tab === 'usuarios' ? 'upanel__tab--active' : ''}`}
            onClick={() => setTab('usuarios')}>
            <Users size={12} /> Contactos <span className="upanel__tab-badge">{usuarios.length}</span>
          </button>
          <button
            className={`upanel__tab ${tab === 'seguimientos' ? 'upanel__tab--active' : ''}`}
            onClick={() => setTab('seguimientos')}>
            <Activity size={12} /> Seguimientos <span className="upanel__tab-badge">{seguimientos.length}</span>
          </button>
        </div>

        {tab === 'usuarios' && (
          <>
            <div className="upanel__toolbar">
              <span className="upanel__count">
                <Users size={13} /> {usuarios.length} contacto{usuarios.length !== 1 ? 's' : ''}
              </span>
              <button className="btn-add-user" onClick={() => setModalUsuario('create')}>
                <UserPlus size={13} /> Agregar
              </button>
            </div>
            <div className="upanel__body">
              {usuarios.length === 0 ? (
                <div className="upanel__empty">
                  <Users size={32} strokeWidth={1.2} />
                  <p>Sin personal registrado</p>
                  <button className="btn-add-user" onClick={() => setModalUsuario('create')}>
                    <UserPlus size={13} /> Agregar primero
                  </button>
                </div>
              ) : (
                <ul className="ulist">
                  {usuarios.map(u => (
                    <li
                      key={u.id}
                      data-usuario-nombre={u.nombre.toLowerCase()}
                      data-usuario-id={u.id}
                      className={`ulist__item ${!u.activo ? 'ulist__item--inactive' : ''}`}
                    >
                      <div className="ulist__avatar">{u.nombre.charAt(0).toUpperCase()}</div>
                      <div className="ulist__data">
                        <span className="ulist__name">
                          {u.nombre}
                          {!u.activo && <span className="ulist__badge--inactive">Inactivo</span>}
                        </span>
                        {u.cargo    && <span className="ulist__meta"><Briefcase size={11} /> {u.cargo}</span>}
                        {u.email    && <span className="ulist__meta"><Mail  size={11} /> {u.email}</span>}
                        {u.telefono && <span className="ulist__meta"><Phone size={11} /> {u.telefono}</span>}
                        {u.linkedin && <span className="ulist__meta"><Linkedin size={11} /> {u.linkedin}</span>}
                      </div>
                      <div className="ulist__actions">
                        <button className="action-btn action-btn--share"
                          onClick={() => setCompartiendo(u)} title="Compartir por WhatsApp">
                          <Share2 size={12} />
                        </button>
                        <button className="action-btn action-btn--edit"
                          onClick={() => setModalUsuario(u)} title="Editar">
                          <Pencil size={12} />
                        </button>
                        <button className="action-btn action-btn--del"
                          onClick={() => setToDelUser(u)} title="Eliminar">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        {tab === 'seguimientos' && (
          <>
            <div className="upanel__toolbar">
              <span className="upanel__count">
                <Activity size={13} /> {seguimientos.length} registro{seguimientos.length !== 1 ? 's' : ''}
              </span>
              <button className="btn-add-user" onClick={() => setModalSeg('create')}>
                <Plus size={13} /> Registrar
              </button>
            </div>
            <div className="upanel__body">
              {loadingSeg ? (
                <div className="upanel__empty"><p>Cargando…</p></div>
              ) : seguimientos.length === 0 ? (
                <div className="upanel__empty">
                  <Activity size={32} strokeWidth={1.2} />
                  <p>Sin seguimientos registrados</p>
                  <button className="btn-add-user" onClick={() => setModalSeg('create')}>
                    <Plus size={13} /> Registrar primero
                  </button>
                </div>
              ) : (
                <ul className="ulist seg-list">
                  {seguimientos.map(s => (
                    <SeguimientoItem
                      key={s.id}
                      s={s}
                      onEdit={setModalSeg}
                      onDelete={setToDelSeg}
                    />
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </aside>

      {compartiendo && (
        <CompartirModal
          usuario={compartiendo} cliente={cliente} consultores={consultores}
          onClose={() => setCompartiendo(null)}
        />
      )}
      {modalUsuario && (
        <UsuarioModal
          clienteId={cliente.id}
          initial={modalUsuario === 'create' ? null : modalUsuario}
          onClose={() => setModalUsuario(null)}
          onSaved={() => { fetchUsuarios(); onClienteRefresh(); }}
        />
      )}
      {modalSeg && (
        <SeguimientoModal
          clienteId={cliente.id}
          usuarios={usuarios}
          consultores={consultores}
          initial={modalSeg === 'create' ? null : modalSeg}
          onClose={() => setModalSeg(null)}
          onSaved={() => { setModalSeg(null); fetchSeguimientos(); }}
        />
      )}
      {toDelUser && (
        <ConfirmDelete nombre={toDelUser.nombre}
          onConfirm={handleDeleteUser} onCancel={() => setToDelUser(null)} />
      )}
      {toDelSeg && (
        <ConfirmDelete nombre="este seguimiento"
          onConfirm={handleDeleteSeg} onCancel={() => setToDelSeg(null)} />
      )}
    </>
  );
};

export const Clientes = () => {
  const { toast, ToastContainer } = useToast();
  const [clientes,  setClientes]  = useState<Cliente[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [query,     setQuery]     = useState('');
  const [modal,     setModal]     = useState<'create' | Cliente | null>(null);
  const [toDelete,  setToDelete]  = useState<Cliente | null>(null);
  const [panel,     setPanel]     = useState<Cliente | null>(null);

  // ── Refs para closures del agentBus ─────────────────────────
  const clientesRef = useRef<Cliente[]>([]);
  const panelRef    = useRef<Cliente | null>(null);

  useEffect(() => { clientesRef.current = clientes; }, [clientes]);
  useEffect(() => { panelRef.current    = panel;    }, [panel]);

  // ── Fetch principal ─────────────────────────────────────────
  const fetchClientes = async () => {
    setLoading(true);
    try {
      const res = await clienteService.getAll();
      setClientes(res.data);
      clientesRef.current = res.data;
    }
    catch { toast.error('Error al cargar los clientes'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchClientes(); }, []);

  const refreshAndSyncPanel = async () => {
    await fetchClientes();
    if (panelRef.current) {
      try {
        const refreshed = await clienteService.getById(panelRef.current.id);
        setPanel(refreshed);
        panelRef.current = refreshed;
      } catch { /* silencioso */ }
    }
  };

  // ── Capacidades del agente — registradas UNA VEZ con refs ───
  useEffect(() => {
    const loadIfEmpty = async (): Promise<Cliente[]> => {
      if (clientesRef.current.length) return clientesRef.current;
      const res = await clienteService.getAll();
      setClientes(res.data);
      clientesRef.current = res.data;
      return res.data;
    };

    const unreg = [

      agentBus.register('clientes:search', (payload) => {
        setQuery((payload.query as string) ?? '');
      }),

      agentBus.register('clientes:openPanel', async (payload) => {
        const clientName = payload.clientName as string;
        const lista = await loadIfEmpty();

        const found = lista.find(c =>
          c.empresa.toLowerCase().includes(clientName.toLowerCase())
        );
        if (found) {
          setPanel(found);
          panelRef.current = found;
          setTimeout(() => {
            const row = document.querySelector<HTMLElement>(
              `[data-cliente-nombre*="${clientName.toLowerCase()}"]`
            );
            if (row) {
              row.scrollIntoView({ behavior: 'smooth', block: 'center' });
              row.classList.add('ai-highlight');
              setTimeout(() => row.classList.remove('ai-highlight'), 3000);
            }
          }, 300);
        } else {
          addToast(`No encontré ningún cliente llamado "${clientName}"`, 'warning');
        }
      }),

      agentBus.register('clientes:updateEstado', async (payload) => {
        const clientName = payload.clientName as string;
        const estado     = payload.estado as EstadoCliente;
        const lista      = await loadIfEmpty();

        const client = lista.find(c =>
          c.empresa.toLowerCase().includes(clientName.toLowerCase())
        );
        if (!client) return addToast(`Cliente "${clientName}" no encontrado`, 'error');

        try {
          await clienteService.update(client.id, { estado });
          const updated = await clienteService.getAll();
          setClientes(updated.data);
          clientesRef.current = updated.data;

          if (panelRef.current?.id === client.id) {
            const refreshed = await clienteService.getById(client.id);
            setPanel(refreshed);
            panelRef.current = refreshed;
          }
          addToast(`Estado de "${client.empresa}" actualizado a ${estado}`, 'success');
        } catch {
          addToast('Error al actualizar el estado', 'error');
        }
      }),

      agentBus.register('clientes:createUsuario', async (payload) => {
        const clientName = payload.clientName as string;
        const data       = payload.data as UsuarioClientePayload;
        const lista      = await loadIfEmpty();

        const client = lista.find(c =>
          c.empresa.toLowerCase().includes(clientName.toLowerCase())
        );
        if (!client) return addToast(`Cliente "${clientName}" no encontrado`, 'error');

        try {
          await clienteService.createUsuario(client.id, data);
          const updated = await clienteService.getAll();
          setClientes(updated.data);
          clientesRef.current = updated.data;
          addToast(`Usuario "${data.nombre}" creado en ${client.empresa}`, 'success');
          const refreshed = await clienteService.getById(client.id);
          setPanel(refreshed);
          panelRef.current = refreshed;
        } catch {
          addToast('Error al crear el usuario', 'error');
        }
      }),

      agentBus.register('clientes:createSeguimiento', async (payload) => {
        const clientName = payload.clientName as string;
        const data       = payload.data as SeguimientoPayload;
        const lista      = await loadIfEmpty();

        const client = lista.find(c =>
          c.empresa.toLowerCase().includes(clientName.toLowerCase())
        );
        if (!client) return addToast(`Cliente "${clientName}" no encontrado`, 'error');

        try {
          await clienteService.createSeguimiento(client.id, data);
          addToast(`Seguimiento registrado en ${client.empresa}`, 'success');
          const refreshed = await clienteService.getById(client.id);
          setPanel(refreshed);
          panelRef.current = refreshed;
        } catch {
          addToast('Error al registrar el seguimiento', 'error');
        }
      }),

      agentBus.register('clientes:remove', async (payload) => {
        const clientName = payload.clientName as string;
        const lista      = await loadIfEmpty();

        const client = lista.find(c =>
          c.empresa.toLowerCase().includes(clientName.toLowerCase())
        );
        if (!client) return addToast(`Cliente "${clientName}" no encontrado`, 'error');

        try {
          await clienteService.remove(client.id);
          if (panelRef.current?.id === client.id) {
            setPanel(null);
            panelRef.current = null;
          }
          const updated = await clienteService.getAll();
          setClientes(updated.data);
          clientesRef.current = updated.data;
          addToast(`"${client.empresa}" desactivado`, 'info');
        } catch {
          addToast('Error al desactivar el cliente', 'error');
        }
      }),

      agentBus.register('clientes:restore', async (payload) => {
        const clientName = payload.clientName as string;
        const lista      = await loadIfEmpty();

        const client = lista.find(c =>
          c.empresa.toLowerCase().includes(clientName.toLowerCase())
        );
        if (!client) return addToast(`Cliente "${clientName}" no encontrado`, 'error');

        try {
          await clienteService.restaurar(client.id);
          const updated = await clienteService.getAll();
          setClientes(updated.data);
          clientesRef.current = updated.data;
          addToast(`"${client.empresa}" reactivado`, 'success');
        } catch {
          addToast('Error al reactivar el cliente', 'error');
        }
      }),
    ];

    return () => unreg.forEach(fn => fn());
  }, []); 

  const filtered = useMemo(() =>
    clientes.filter(c =>
      c.empresa.toLowerCase().includes(query.toLowerCase()) ||
      (c.rubro?.nombre  ?? '').toLowerCase().includes(query.toLowerCase()) ||
      (c.ciudad?.nombre ?? '').toLowerCase().includes(query.toLowerCase()) ||
      (c.pais?.nombre   ?? '').toLowerCase().includes(query.toLowerCase())
    ), [clientes, query]);

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await clienteService.remove(toDelete.id);
      toast.success('Cliente desactivado');
      setToDelete(null);
      if (panel?.id === toDelete.id) setPanel(null);
      fetchClientes();
    } catch { toast.error('Error al desactivar el cliente'); }
  };

  const handleRestore = async (cliente: Cliente) => {
    try {
      await clienteService.restaurar(cliente.id);
      toast.success('Cliente reactivado');
      fetchClientes();
    } catch { toast.error('Error al reactivar el cliente'); }
  };

  return (
    <div className="clientes-page">
      <ToastContainer />

      <section className="clientes-section">
        <div className="clientes-section__head">
          <h2 className="clientes-section__title">Gestión de Clientes</h2>
          <button className="btn-new" onClick={() => setModal('create')}>
            <Plus size={15} /> Nuevo Cliente
          </button>
        </div>

        <div className="table-card">
          <div className="table-card__toolbar">
            <span className="table-card__label">Clientes Registrados</span>
            <div className="table-search">
              <Search size={13} className="table-search__icon" />
              <input
                className="table-search__input"
                placeholder="Buscar empresa, rubro, ciudad…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <span className="table-card__count">{filtered.length} registros</span>
          </div>

          <div className="table-wrap">
            <table className="ctable">
              <thead>
                <tr>
                  <th>#</th><th>Empresa</th><th>Estado</th><th>Rubro</th>
                  <th>Ubicación</th><th>Contactos</th><th>Proyectos</th>
                  <th>Registro</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="ctable__empty">Cargando…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={9} className="ctable__empty">Sin resultados</td></tr>
                ) : filtered.map((c, i) => (
                  <tr
                    key={c.id}
                    data-cliente-nombre={c.empresa.toLowerCase()}
                    data-cliente-id={c.id}
                    className={panel?.id === c.id ? 'ctable__row--active' : ''}
                  >
                    <td className="ctable__num">#{i + 1}</td>

                    <td className="ctable__name"
                      onClick={() => setPanel(panel?.id === c.id ? null : c)}>
                      {c.empresa}
                      {c.referido_por && (
                        <span className="ctable__nota-dot" title={`Referido por: ${c.referido_por}`}>
                          <UserCheck size={10} />
                        </span>
                      )}
                      {c.nota && (
                        <span className="ctable__nota-dot" title={c.nota}>
                          <FileText size={10} />
                        </span>
                      )}
                    </td>

                    <td>
                      <span className={`estado-badge ${getClsEstado(c)}`}>
                        {getNombreEstado(c)}
                      </span>
                    </td>

                    <td className="ctable__muted">
                      {c.rubro
                        ? <span className="ctable__rubro"><Building2 size={11} /> {c.rubro.nombre}</span>
                        : '—'}
                    </td>

                    <td className="ctable__muted">
                      {c.ciudad || c.pais
                        ? <span className="ctable__ubicacion">
                            <MapPin size={11} />
                            {[c.ciudad?.nombre, c.pais?.codigo_iso].filter(Boolean).join(', ')}
                          </span>
                        : '—'}
                    </td>

                    <td>
                      <button
                        className={`opp-badge opp-badge--btn ${(c.usuarios?.length ?? 0) > 0 ? 'opp-badge--active' : 'opp-badge--zero'}`}
                        onClick={() => setPanel(panel?.id === c.id ? null : c)}
                        title="Ver panel del cliente">
                        <Users size={11} />
                        {c.usuarios?.length ?? 0}
                        <ChevronRight size={11} className={panel?.id === c.id ? 'chevron--open' : ''} />
                      </button>
                    </td>

                    <td>
                      <span className={`opp-badge ${(c.proyectos?.length ?? 0) > 0 ? 'opp-badge--active' : 'opp-badge--zero'}`}>
                        {c.proyectos?.length ?? 0}
                      </span>
                    </td>

                    <td className="ctable__muted">{fmtDate(c.createdAt)}</td>

                    <td>
                      <div className="ctable__actions">
                        <button className="action-btn action-btn--edit" onClick={() => setModal(c)}>
                          <Pencil size={13} /> Editar
                        </button>
                        {c.estado === 'Inactivo' ? (
                          <button className="action-btn action-btn--restore"
                            onClick={() => handleRestore(c)} title="Reactivar cliente">
                            <RotateCcw size={13} /> Activar
                          </button>
                        ) : (
                          <button className="action-btn action-btn--del"
                            onClick={() => setToDelete(c)}>
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {panel && (
        <ClientePanel
          cliente={panel}
          onClose={() => setPanel(null)}
          onClienteRefresh={refreshAndSyncPanel}
        />
      )}
      {modal && (
        <ClienteModal
          initial={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchClientes}
        />
      )}
      {toDelete && (
        <ConfirmDelete
          nombre={toDelete.empresa}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
};  