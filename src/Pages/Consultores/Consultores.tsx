import { useState, useMemo } from 'react';
import { Search, Plus, Pencil, UserX } from 'lucide-react';
import { consultorService } from '../../Services/consultorService';
import { useToast } from '../../Hooks/useToast';
import './Consultores.css';
import { VISTAS_DISPONIBLES, type Consultor} from '../../Interfaces/i_consultor';
import { useWizardCatalogos } from '../Procesos/WizardContext';
import { fmtDate } from '../../Utils/fmtDate';
import { parseVistas } from '../../Constants/parseVistas';
import { ConsultorModal } from './ConsultorModal';
import { ConfirmModal } from '../../Components/ConfirmModal';

export const Consultores = () => {
  const { toast, ToastContainer } = useToast();
  const { consultores: consultoresOpt, reloadConsultores } = useWizardCatalogos();

  const [query,        setQuery]        = useState('');
  const [filtroRol,    setFiltroRol]    = useState('todos');
  const [filtroActivo, setFiltroActivo] = useState<'todos' | 'activo' | 'inactivo'>('todos');
  const [modal,    setModal]    = useState<'create' | Consultor | null>(null);
  const [toDelete, setToDelete] = useState<Consultor | null>(null);


  const consultores = useMemo<Consultor[]>(
    () => (consultoresOpt ?? []).map((c: any) => ({
      ...c,
      vistas: parseVistas(c.vistas),
    })),
    [consultoresOpt]
  );
  
  const rolesUnicos = useMemo(() =>
    Array.from(new Set(consultores.map(c => c.rol).filter(Boolean))),
    [consultores]
  );
  const filtered = useMemo(() => consultores.filter(c => {
    const q = query.toLowerCase();
    return (
      (c.nombre.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)) &&
      (filtroRol    === 'todos' || c.rol === filtroRol) &&
      (filtroActivo === 'todos'
        || (filtroActivo === 'activo'   && c.activo)
        || (filtroActivo === 'inactivo' && !c.activo))
    );
  }), [consultores, query, filtroRol, filtroActivo]);

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await consultorService.remove(toDelete.id);
      toast.success('Consultor desactivado');
      setToDelete(null);
      await reloadConsultores();
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje ?? 'Error al desactivar');
    }
  };

  return (
    <div className="consultores-page">
      <ToastContainer />
      <section className="consultores-section">

        <div className="consultores-section__head">
          <h2 className="consultores-section__title">Gestión de Consultores</h2>
          <button className="btn-new" onClick={() => setModal('create')}>
            <Plus size={15} /> Nuevo Consultor
          </button>
        </div>

        <div className="table-card">
          <div className="table-card__toolbar">
            <span className="table-card__label">Consultores Registrados</span>
            <div className="table-search">
              <Search size={13} className="table-search__icon" />
              <input className="table-search__input" placeholder="Buscar…"
                value={query} onChange={e => setQuery(e.target.value)} />
            </div>
            <select className="table-filter" value={filtroRol}
              onChange={e => setFiltroRol(e.target.value)}>
              <option value="todos">Todos los roles</option>
              {rolesUnicos.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select className="table-filter" value={filtroActivo}
              onChange={e => setFiltroActivo(e.target.value as any)}>
              <option value="todos">Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
            <span className="table-card__count">{filtered.length} / {consultores.length}</span>
          </div>

          <div className="table-wrap">
            <table className="ctable">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Rol</th>
                  <th>Acceso</th>
                  <th>Ingreso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="ctable__empty">Sin resultados</td></tr>
                ) : filtered.map((c, i) => (
                  <tr key={c.id} className={!c.activo ? 'ctable__row--inactive' : ''}>
                    <td className="ctable__num">#{i + 1}</td>
                    <td className="ctable__name">{c.nombre}</td>
                    <td className="ctable__muted">{c.email}</td>
                    <td className="ctable__muted">{c.telefono ?? '—'}</td>
                    <td><span className="badge badge--rol">{c.rol || '—'}</span></td>

                    <td>
                      {!c.vistas?.length ? (
                        <span className="ctable__muted">Sin acceso</span>
                      ) : c.vistas.length === VISTAS_DISPONIBLES.length ? (
                        <span className="vchip vchip--all">Acceso total</span>
                      ) : (
                        <div className="vchips">
                          {c.vistas?.slice(0,3).map(k => {
                            const v = VISTAS_DISPONIBLES.find(x => x.key === k);
                            return <span key={k} className="vchip">{v?.label ?? k}</span>;
                          })}
                          {c.vistas.length > 2 && (
                            <span className="vchip vchip--more">+{c.vistas.length - 3}</span>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="ctable__muted">{c.fecha_ingreso ? fmtDate(c.fecha_ingreso) : '—'}</td>
                    <td>
                      <div className="ctable__actions">
                        <button className="action-btn action-btn--edit" onClick={() => setModal(c)}>
                          <Pencil size={13} />
                        </button>
                        {c.activo && (
                          <button className="action-btn action-btn--del" onClick={() => setToDelete(c)}>
                            <UserX size={13} />
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

      {modal && (
        <ConsultorModal
          initial={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={reloadConsultores}
        />
      )}
      {toDelete && (
        <ConfirmModal
          title="Desactivar Consultor"
          message={`¿Desactivar al consultor "${toDelete.nombre}"? Ya no podrá acceder al sistema.`}
          confirmLabel="Desactivar"
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}