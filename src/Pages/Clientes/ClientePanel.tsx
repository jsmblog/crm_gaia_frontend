import { useEffect, useRef, useState } from "react";
import { useToast } from "../../Hooks/useToast";
import type { Cliente, SeguimientoCliente, SeguimientoPayload, UsuarioCliente, UsuarioClientePayload } from "../../Interfaces/i_cliente";
import type { Consultor } from "../../Interfaces/i_consultor";
import { consultorService } from "../../Services/consultorService";
import { agentBus } from "../../Components/AI/nervousSystem";
import { CompartirModal } from "./CompartirModal";
import { UsuarioModal } from "./UsuarioModal";
import { SeguimientoModal } from "./SeguimientoModal";
import { SeguimientoItem } from "./SeguimientoItem";
import { Activity, Briefcase, DollarSign, FileText, Linkedin, Mail, Pencil, Phone, Plus, Share2, Trash2, UserCheck, UserPlus, Users, X } from "lucide-react";
import { clienteService } from "../../Services/clienteService";
import { getClsEstado, getNombreEstado } from "../../Constants/i_clientes";
import { ConfirmModal } from "../../Components/ConfirmModal";

const fmtMoney = (v?: number | null) => v != null ? `$${Number(v).toFixed(2)}` : '—';

type PanelTab = 'usuarios' | 'seguimientos';

export const ClientePanel = ({ cliente, onClose, onClienteRefresh }: {
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
            toast.error(`No encontré al usuario "${userName}"`);
          }
        }, 200);
      }),

      agentBus.register('clientes:removeUsuario', async (payload) => {
        const userName = payload.userName as string;
        const u = usuariosRef.current.find(x => x.nombre.toLowerCase().includes(userName.toLowerCase()));
        if (!u) return toast.info(`Usuario "${userName}" no encontrado en este panel`);
        try {
          await clienteService.removeUsuario(cliente.id, u.id);
          toast.info(`"${u.nombre}" eliminado`);
          fetchUsuarios();
          onClienteRefresh();
        } catch { toast.error('Error al eliminar el usuario'); }
      }),

      agentBus.register('clientes:updateUsuario', async (payload) => {
        const userName = payload.userName as string;
        const data = payload.data as Partial<UsuarioClientePayload>;
        const u = usuariosRef.current.find(x => x.nombre.toLowerCase().includes(userName.toLowerCase()));
        if (!u) return toast.info(`Usuario "${userName}" no encontrado`);
        try {
          await clienteService.updateUsuario(cliente.id, u.id, data);
          toast.success(`"${u.nombre}" actualizado`);
          fetchUsuarios();
        } catch { toast.error('Error al actualizar el usuario'); }
      }),

      agentBus.register('panel:createSeguimiento', async (payload) => {
        const data = payload.data as SeguimientoPayload;
        try {
          await clienteService.createSeguimiento(cliente.id, data);
          toast.success('Seguimiento registrado');
          setTab('seguimientos');
          fetchSeguimientos();
        } catch { toast.error('Error al registrar el seguimiento'); }
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
                        {u.email    && <span className="ulist__meta"><Mail      size={11} /> {u.email}</span>}
                        {u.telefono && <span className="ulist__meta"><Phone     size={11} /> {u.telefono}</span>}
                        {u.linkedin && <span className="ulist__meta"><Linkedin  size={11} /> {u.linkedin}</span>}
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
        <ConfirmModal
          title="Eliminar contacto"
          message={`¿Confirma que desea eliminar a "${toDelUser.nombre}"? Esta acción no se puede deshacer.`}
          confirmLabel="Sí, eliminar"
          onConfirm={handleDeleteUser}
          onCancel={() => setToDelUser(null)}
        />
      )}
      {toDelSeg && (
        <ConfirmModal
          title="Eliminar seguimiento"
          message={`¿Confirma que desea eliminar este seguimiento? Esta acción no se puede deshacer.`}
          confirmLabel="Sí, eliminar"
          onConfirm={handleDeleteSeg}
          onCancel={() => setToDelSeg(null)}
        />
      )}
    </>
  );
};
