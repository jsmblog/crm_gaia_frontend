import { useState, useMemo } from 'react';
import {
  Search, Plus, Pencil, Trash2,
  Cpu, Building2,
} from 'lucide-react';
import { herramientaService } from '../../Services/herramientaService';
import { useToast } from '../../Hooks/useToast';
import './HerramientasRpa.css';
import type { HerramientaRpa } from '../../Interfaces/i_herramienta';
import { useWizardCatalogos } from '../Procesos/WizardContext';
import { HerramientaModal } from './HerramientaModal';
import { fmtDate } from '../../Utils/fmtDate';
import { ConfirmModal } from '../../Components/ConfirmModal';

export const HerramientasRpa = () => {
  const { toast, ToastContainer } = useToast();
  const { herramientas, reloadHerramientas } = useWizardCatalogos();
  const [query, setQuery] = useState('');
  const [filtroActivo, setFiltroActivo] = useState<'todos' | 'activo' | 'inactivo'>('activo');
  const [modal, setModal] = useState<'create' | HerramientaRpa | null>(null);
  const [toDelete, setToDelete] = useState<HerramientaRpa | null>(null);

  const filtered = useMemo(() =>
    herramientas.filter(h => {
      const matchQ = h.nombre.toLowerCase().includes(query.toLowerCase()) ||
        (h.fabricante ?? '').toLowerCase().includes(query.toLowerCase());
      const matchA = filtroActivo === 'todos'
        || (filtroActivo === 'activo' && h.activo)
        || (filtroActivo === 'inactivo' && !h.activo);
      return matchQ && matchA;
    }), [herramientas, query, filtroActivo]);

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await herramientaService.remove(toDelete.id);
      toast.success('Herramienta desactivada');
      setToDelete(null);
      await reloadHerramientas();
    } catch (err: any) {
      toast.error(err?.response?.data?.mensaje ?? 'Error al desactivar');
    }
  };

  return (
    <div className="herramientas-page">
      <ToastContainer />
      <section className="herramientas-section">
        <div className="herramientas-section__head">
          <h2 className="herramientas-section__title">Herramientas RPA</h2>
          <button className="btn-new" onClick={() => setModal('create')}>
            <Plus size={15} /> Nueva Herramienta
          </button>
        </div>

        <div className="table-card">
          <div className="table-card__toolbar">
            <span className="table-card__label">Catálogo de Herramientas</span>

            <div className="table-search">
              <Search size={13} className="table-search__icon" />
              <input
                className="table-search__input"
                placeholder="Buscar por nombre o fabricante…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>

            <select
              className="table-filter"
              value={filtroActivo}
              onChange={e => setFiltroActivo(e.target.value as typeof filtroActivo)}
            >
              <option value="todos">Todas</option>
              <option value="activo">Activas</option>
              <option value="inactivo">Inactivas</option>
            </select>

            <span className="table-card__count">{filtered.length} / {herramientas.length}</span>
          </div>

          <div className="table-wrap">
            <table className="ctable">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Herramienta</th>
                  <th>Fabricante</th>
                  <th>Estado</th>
                  <th>Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="ctable__empty">Sin resultados</td></tr>
                ) : filtered.map((h, i) => (
                  <tr key={h.id} className={!h.activo ? 'ctable__row--inactive' : ''}>
                    <td className="ctable__num">#{i + 1}</td>
                    <td>
                      <div className="herra-name">
                        <span className="herra-name__icon"><Cpu size={14} /></span>
                        <span className="herra-name__label">{h.nombre}</span>
                      </div>
                    </td>
                    <td>
                      {h.fabricante
                        ? <div className="ctable__meta"><Building2 size={11} />{h.fabricante}</div>
                        : <span className="ctable__muted">—</span>
                      }
                    </td>
                    <td>
                      <span className={`badge ${h.activo ? 'badge--activo' : 'badge--inactivo'}`}>
                        {h.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="ctable__muted">{fmtDate(h.createdAt)}</td>
                    <td>
                      <div className="ctable__actions">
                        <button className="action-btn action-btn--edit" onClick={() => setModal(h)}>
                          <Pencil size={13} /> Editar
                        </button>
                        {h.activo && (
                          <button className="action-btn action-btn--del" onClick={() => setToDelete(h)}>
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

      {modal && (
        <HerramientaModal
          initial={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={reloadHerramientas}
        />
      )}

      {toDelete && (
        <ConfirmModal
          title="Eliminar herramienta"
          message={`¿Estás seguro de que quieres eliminar la herramienta "${toDelete.nombre}"?`}
          confirmLabel="Eliminar"
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
};