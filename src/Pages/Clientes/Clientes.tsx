import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search, Plus, Pencil, Trash2,  FileText, MapPin,
  Building2,
  UserCheck, RotateCcw,
  Users,
  ChevronRight,
} from 'lucide-react';
import { clienteService } from '../../Services/clienteService';
import { useToast } from '../../Hooks/useToast';
import { agentBus } from '../../Components/AI/nervousSystem';
import './Clientes.css';
import {
  type Cliente,type EstadoCliente,
  type UsuarioClientePayload,
  type SeguimientoPayload,
} from '../../Interfaces/i_cliente';
import { getClsEstado, getNombreEstado } from '../../Constants/i_clientes';
import { useWizardCatalogos } from '../Procesos/WizardContext';
import { fmtDate } from '../../Utils/fmtDate';
import { ClienteModal } from './ClienteModal';
import { ClientePanel } from './ClientePanel';
import { ConfirmModal } from '../../Components/ConfirmModal';

export const Clientes = () => {
  const { toast, ToastContainer } = useToast();
  const { clientes, reloadClientes } = useWizardCatalogos(); 
  const [loading,  setLoading]  = useState(true);
  const [query,    setQuery]    = useState('');
  const [modal,    setModal]    = useState<'create' | Cliente | null>(null);
  const [toDelete, setToDelete] = useState<Cliente | null>(null);
  const [panel,    setPanel]    = useState<Cliente | null>(null);

  const clientesRef = useRef<Cliente[]>([]);
  const panelRef    = useRef<Cliente | null>(null);

  useEffect(() => { clientesRef.current = clientes; }, [clientes]);
  useEffect(() => { panelRef.current    = panel;    }, [panel]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try   { await reloadClientes(); }
      catch { toast.error('Error al cargar los clientes'); }
      finally { setLoading(false); }
    };
    init();
  }, []);

  const fetchClientes = async () => {
    setLoading(true);
    try   { await reloadClientes(); }
    catch { toast.error('Error al cargar los clientes'); }
    finally { setLoading(false); }
  };

  const refreshAndSyncPanel = async () => {
    await reloadClientes();
    if (panelRef.current) {
      try {
        const refreshed = await clienteService.getById(panelRef.current.id);
        setPanel(refreshed);
        panelRef.current = refreshed;
      } catch { }
    }
  };

  useEffect(() => {
    const loadIfEmpty = async (): Promise<Cliente[]> => {
      if (clientesRef.current.length) return clientesRef.current;
      await reloadClientes();
      if (!clientesRef.current.length) {
        const res = await clienteService.getAll();
        clientesRef.current = res.data;
        return res.data;
      }
      return clientesRef.current;
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
          toast.info(`No encontré ningún cliente llamado "${clientName}"`);
        }
      }),

      agentBus.register('clientes:updateEstado', async (payload) => {
        const clientName = payload.clientName as string;
        const estado     = payload.estado as EstadoCliente;
        const lista      = await loadIfEmpty();

        const client = lista.find(c =>
          c.empresa.toLowerCase().includes(clientName.toLowerCase())
        );
        if (!client) return toast.error(`Cliente "${clientName}" no encontrado`);

        try {
          await clienteService.update(client.id, { estado });
          await reloadClientes();

          if (panelRef.current?.id === client.id) {
            const refreshed = await clienteService.getById(client.id);
            setPanel(refreshed);
            panelRef.current = refreshed;
          }
          toast.success(`Estado de "${client.empresa}" actualizado a ${estado}`);
        } catch {
          toast.error('Error al actualizar el estado');
        }
      }),

      agentBus.register('clientes:createUsuario', async (payload) => {
        const clientName = payload.clientName as string;
        const data       = payload.data as UsuarioClientePayload;
        const lista      = await loadIfEmpty();

        const client = lista.find(c =>
          c.empresa.toLowerCase().includes(clientName.toLowerCase())
        );
        if (!client) return toast.error(`Cliente "${clientName}" no encontrado`);

        try {
          await clienteService.createUsuario(client.id, data);
          await reloadClientes();
          toast.success(`Usuario "${data.nombre}" creado en ${client.empresa}`);
          const refreshed = await clienteService.getById(client.id);
          setPanel(refreshed);
          panelRef.current = refreshed;
        } catch {
          toast.error('Error al crear el usuario');
        }
      }),

      agentBus.register('clientes:createSeguimiento', async (payload) => {
        const clientName = payload.clientName as string;
        const data       = payload.data as SeguimientoPayload;
        const lista      = await loadIfEmpty();

        const client = lista.find(c =>
          c.empresa.toLowerCase().includes(clientName.toLowerCase())
        );
        if (!client) return toast.error(`Cliente "${clientName}" no encontrado`);

        try {
          await clienteService.createSeguimiento(client.id, data);
          toast.success(`Seguimiento registrado en ${client.empresa}`);
          const refreshed = await clienteService.getById(client.id);
          setPanel(refreshed);
          panelRef.current = refreshed;
        } catch {
          toast.error('Error al registrar el seguimiento');
        }
      }),

      agentBus.register('clientes:remove', async (payload) => {
        const clientName = payload.clientName as string;
        const lista      = await loadIfEmpty();

        const client = lista.find(c =>
          c.empresa.toLowerCase().includes(clientName.toLowerCase())
        );
        if (!client) return toast.error(`Cliente "${clientName}" no encontrado`);

        try {
          await clienteService.remove(client.id);
          if (panelRef.current?.id === client.id) {
            setPanel(null);
            panelRef.current = null;
          }
          await reloadClientes();
          toast.info(`"${client.empresa}" desactivado`);
        } catch {
          toast.error('Error al desactivar el cliente');
        }
      }),

      agentBus.register('clientes:restore', async (payload) => {
        const clientName = payload.clientName as string;
        const lista      = await loadIfEmpty();

        const client = lista.find(c =>
          c.empresa.toLowerCase().includes(clientName.toLowerCase())
        );
        if (!client) return toast.error(`Cliente "${clientName}" no encontrado`);

        try {
          await clienteService.restaurar(client.id);
          await reloadClientes();
          toast.success(`"${client.empresa}" reactivado`);
        } catch {
          toast.error('Error al reactivar el cliente');
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
      await reloadClientes();
    } catch { toast.error('Error al desactivar el cliente'); }
  };

  const handleRestore = async (cliente: Cliente) => {
    try {
      await clienteService.restaurar(cliente.id);
      toast.success('Cliente reactivado');
      await reloadClientes();
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
          <ConfirmModal
            title="Desactivar Cliente"
            message={`¿Desactivar "${toDelete.empresa}"? Esta acción se puede revertir posteriormente.`}
            confirmLabel="Desactivar"
            onConfirm={handleDelete}
            onCancel={() => setToDelete(null)}
          />
      )}
    </div>
  );
};