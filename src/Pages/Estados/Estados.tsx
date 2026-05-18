import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Check, Tag, RotateCcw } from "lucide-react";
import { estadoService, type Estado} from "../../Services/estadoService";
import { useToast } from "../../Hooks/useToast";
import "./Estados.css";

interface ModalProps {
  initial?: Estado | null;
  onClose: () => void;
  onSaved: () => void;
}

const EstadoModal = ({ initial, onClose, onSaved }: ModalProps) => {
  const { toast, ToastContainer } = useToast();
  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!nombre.trim()) return toast.warning("'Nombre' es requerido");
    setLoading(true);
    try {
      if (initial) {
        await estadoService.update(initial.id, { nombre: nombre.trim() });
        toast.success("Estado actualizado");
      } else {
        await estadoService.create({ nombre: nombre.trim() });
        toast.success("Estado creado");
      }
      onSaved();
      onClose();
    } catch {
      toast.error("Error al guardar el estado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <ToastContainer />
      <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
        <div className="modal__head">
          <div>
            <h2 className="modal__title">{initial ? "Editar Estado" : "Nuevo Estado"}</h2>
            <p className="modal__sub">Define un estado para clientes, proyectos o procesos</p>
          </div>
          <button className="modal__close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal__body">
          <div className="mfield">
            <label className="mfield__label">Nombre <span className="mfield__req">*</span></label>
            <input
              className="mfield__input"
              placeholder="Ej: En Negociación"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              autoFocus
            />
          </div>
        </div>
        <div className="modal__foot">
          <button className="modal__btn modal__btn--ghost" onClick={onClose}>Cancelar</button>
          <button className="modal__btn modal__btn--primary" onClick={handleSubmit} disabled={loading}>
            <Check size={14} />{loading ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export const Estados = () => {
  const { toast, ToastContainer } = useToast();
  const [estados, setEstados] = useState<Estado[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | Estado | null>(null);
  const [toDelete, setToDelete] = useState<Estado | null>(null);

  const fetchEstados = async () => {
    setLoading(true);
    try {
      setEstados(await estadoService.getAll());
    } catch {
      toast.error("Error al cargar estados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEstados(); }, []);

  const handleDelete = async (estado: Estado) => {
    try {
      await estadoService.remove(estado.id);
      toast.success("Estado desactivado");
      setToDelete(null);
      fetchEstados();
    } catch {
      toast.error("Error al desactivar el estado");
    }
  };

  return (
    <div className="estados-page">
      <ToastContainer />

      <section className="estados-section">
        <div className="estados-section__head">
          <h2 className="estados-section__title">Gestión de Estados</h2>
          <button className="btn-new" onClick={() => setModal("create")}>
            <Plus size={15} /> Nuevo Estado
          </button>
        </div>

        <div className="table-card">
          <div className="table-card__toolbar">
            <span className="table-card__label">Estados Registrados</span>
            <span className="table-card__count">{estados.length} registros</span>
          </div>

          <div className="table-wrap">
            <table className="ctable">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="ctable__empty">Cargando…</td></tr>
                ) : estados.length === 0 ? (
                  <tr><td colSpan={4} className="ctable__empty">Sin estados registrados</td></tr>
                ) : estados.map((e, i) => (
                  <tr key={e.id}>
                    <td className="ctable__num">#{i + 1}</td>
                    <td className="ctable__name">
                      <span className="estado-pill">
                        <Tag size={11} /> {e.nombre}
                      </span>
                    </td>
                    <td>
                      <span className={`estado-badge ${e.activo ? "estado-badge--activo" : "estado-badge--inactivo"}`}>
                        {e.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td>
                      <div className="ctable__actions">
                        <button className="action-btn action-btn--edit" onClick={() => setModal(e)}>
                          <Pencil size={13} /> Editar
                        </button>
                        {e.activo ? (
                          <button className="action-btn action-btn--del" onClick={() => setToDelete(e)}>
                            <Trash2 size={13} />
                          </button>
                        ) : (
                          <button className="action-btn action-btn--restore" onClick={async () => {
                            await estadoService.update(e.id, { nombre: e.nombre });
                            fetchEstados();
                          }}>
                            <RotateCcw size={13} />
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
        <EstadoModal
          initial={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchEstados}
        />
      )}

      {toDelete && (
        <div className="modal-overlay" onClick={() => setToDelete(null)}>
          <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
            <div className="modal__head">
              <h2 className="modal__title">Desactivar estado</h2>
              <button className="modal__close" onClick={() => setToDelete(null)}><X size={16} /></button>
            </div>
            <div className="modal__body">
              <p className="confirm__text">
                ¿Desactivar el estado <strong>{toDelete.nombre}</strong>?
                Los registros que lo usen no se verán afectados.
              </p>
            </div>
            <div className="modal__foot">
              <button className="modal__btn modal__btn--ghost" onClick={() => setToDelete(null)}>Cancelar</button>
              <button className="modal__btn modal__btn--danger" onClick={() => handleDelete(toDelete)}>
                <Trash2 size={14} /> Desactivar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};