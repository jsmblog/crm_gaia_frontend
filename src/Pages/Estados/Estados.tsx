import { useState } from "react";
import { Plus, Pencil, Trash2, X, Tag, RotateCcw } from "lucide-react";
import { estadoService, type Estado } from "../../Services/estadoService";
import { useToast } from "../../Hooks/useToast";
import "./Estados.css";
import { useWizardCatalogos } from "../Procesos/WizardContext";
import { EstadoModal } from "./EstadoModal";

export const Estados = () => {
  const { toast, ToastContainer } = useToast();
  const { estados, reloadEstados } = useWizardCatalogos();
  const [modal, setModal] = useState<"create" | Estado | null>(null);
  const [toDelete, setToDelete] = useState<Estado | null>(null);

  const handleDelete = async (estado: Estado) => {
    try {
      await estadoService.remove(estado.id);
      toast.success("Estado desactivado");
      setToDelete(null);
      await reloadEstados();
    } catch {
      toast.error("Error al desactivar el estado");
    }
  };

  const handleRestore = async (e: Estado) => {
    await estadoService.update(e.id, { nombre: e.nombre });
    await reloadEstados();
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
                {estados.length === 0 ? (
                  <tr><td colSpan={4} className="ctable__empty">Sin estados registrados</td></tr>
                ) : estados.map((e, i) => (
                  <tr key={e.id}>
                    <td className="ctable__num">#{i + 1}</td>
                    <td className="ctable__name">
                      <span className="tag-chip">
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
                          <button className="action-btn action-btn--restore" onClick={() => handleRestore(e)}>
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
          onSaved={reloadEstados}
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