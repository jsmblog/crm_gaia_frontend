import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Search, FolderOpen, Tag, Users, Wrench,
  ChevronRight, X, Clock, DollarSign, Loader2
} from 'lucide-react';
import './Proyectos.css';
import { useWizardCatalogos } from '../Procesos/WizardContext';
import type { Proceso } from '../../Interfaces/i_procesos';
import { procesoService } from '../../Services/procesoService';
import { fmtDate } from '../../Utils/fmtDate';
import { ESTATUS_LABEL } from '../../Constants/oportunidad';
import { ETAPA_PROGRESO } from '../../Constants/proyectos';

export const Proyectos = () => {
  const { proyectos } = useWizardCatalogos();
  const [query, setQuery] = useState('');
  const [filtroActivo, setFiltroActivo] = useState<'todos' | 'activo' | 'inactivo'>('todos');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [procesosCache, setProcesosCache] = useState<Record<string, Proceso[]>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() =>
    proyectos.filter(p => {
      const matchQ =
        p.nombre.toLowerCase().includes(query.toLowerCase()) ||
        p.cliente.nombre.toLowerCase().includes(query.toLowerCase());
      const matchA =
        filtroActivo === 'todos' ||
        (filtroActivo === 'activo' && p.activo) ||
        (filtroActivo === 'inactivo' && !p.activo);
      return matchQ && matchA;
    }),
    [proyectos, query, filtroActivo]
  );

  const selectedProject = proyectos.find(p => p.id === selectedId) ?? null;
  const procesos = selectedId ? (procesosCache[selectedId] ?? []) : [];

  const handleRowClick = useCallback(async (id: string) => {
    if (selectedId === id) { setSelectedId(null); return; }
    setSelectedId(id);

    if (procesosCache[id]) return;
    setLoadingId(id);
    try {
      const res = await procesoService.getAll({ proyectoId: id });
      setProcesosCache(prev => ({ ...prev, [id]: res.data }));
    } catch {
      setProcesosCache(prev => ({ ...prev, [id]: [] }));
    } finally {
      setLoadingId(null);
    }
  }, [selectedId, procesosCache]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedId(null); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);


  const totalValor = procesos.reduce((a, p) => a + (p.propuesta?.valor_presupuestado ?? 0), 0);
  const totalHoras = procesos.reduce((a, p) => a + (p.propuesta?.horas_presupuestadas ?? 0), 0);

  return (
    <div className="proyectos-page">
      <section className="proyectos-section">
        <div className="proyectos-section__head">
          <h2 className="proyectos-section__title">Proyectos</h2>
        </div>

        <div className="proj-layout">
          <div className={`table-card proj-table-card ${selectedId ? 'proj-table-card--shrunk' : ''}`}>
            <div className="table-card__toolbar">
              <span className="table-card__label">Proyectos Registrados</span>
              <div className="table-search">
                <Search size={13} className="table-search__icon" />
                <input
                  className="table-search__input"
                  placeholder="Buscar por proyecto o cliente…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
              </div>
              <select
                className="table-filter"
                value={filtroActivo}
                onChange={e => setFiltroActivo(e.target.value as typeof filtroActivo)}
              >
                <option value="todos">Todos</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>
              <span className="table-card__count">{filtered.length} / {proyectos.length}</span>
            </div>

            <div className="table-wrap">
              <table className="ctable">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Proyecto</th>
                    {!selectedId && <th>Empresa</th>}
                    <th>Áreas</th>
                    <th>Personal</th>
                    {!selectedId && <th>Herramientas</th>}
                    <th>Creado</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} className="ctable__empty">Sin resultados</td></tr>
                  ) : filtered.map((p, i) => (
                    <tr
                      key={p.id}
                      className={[
                        !p.activo ? 'ctable__row--inactive' : '',
                        selectedId === p.id ? 'ctable__row--selected' : '',
                      ].filter(Boolean).join(' ')}
                      onClick={() => handleRowClick(p.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="ctable__num">#{i + 1}</td>
                      <td className="ctable__name">
                        <span className="project-name-btn">
                          <ChevronRight
                            size={13}
                            className={selectedId === p.id ? 'chevron--open' : ''}
                          />
                          <FolderOpen size={13} /> {p.nombre}
                        </span>
                      </td>
                      {!selectedId && (
                        <td>
                          <div className="ctable__client">
                            <span className="ctable__client-name">{p.cliente.nombre}</span>
                            <span className="ctable__client-empresa">{p.cliente.empresa}</span>
                          </div>
                        </td>
                      )}
                      <td>
                        <span className={`count-badge ${p.areas.length > 0 ? 'count-badge--active' : 'count-badge--zero'}`}>
                          <Tag size={10} />{p.areas.length}
                        </span>
                      </td>
                      <td>
                        <span className={`count-badge ${p.miembros.length > 0 ? 'count-badge--active' : 'count-badge--zero'}`}>
                          <Users size={10} />{p.miembros.length}
                        </span>
                      </td>
                      {!selectedId && (
                        <td>
                          <span className={`count-badge ${p.herramientas.length > 0 ? 'count-badge--active' : 'count-badge--zero'}`}>
                            <Wrench size={10} />{p.herramientas.length}
                          </span>
                        </td>
                      )}
                      <td className="ctable__muted">{fmtDate(p.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div ref={drawerRef} className={`proc-drawer ${selectedId ? 'proc-drawer--open' : ''}`}>
            {selectedProject && (
              <>
                <div className="proc-drawer__head">
                  <div className="proc-drawer__head-top">
                    <div className="proc-drawer__head-info">
                      <span className="proc-drawer__proyecto">{selectedProject.nombre}</span>
                      <span className="proc-drawer__cliente">
                        {selectedProject.cliente.nombre} · {selectedProject.cliente.empresa}
                      </span>
                    </div>
                    <button className="proc-drawer__close" onClick={() => setSelectedId(null)} aria-label="Cerrar">
                      <X size={14} />
                    </button>
                  </div>

                  <div className="proc-drawer__stats">
                    <div className="proc-stat">
                      <span className="proc-stat__val">{procesos.length}</span>
                      <span className="proc-stat__lbl">Procesos</span>
                    </div>
                    <div className="proc-stat__sep" />
                    <div className="proc-stat">
                      <span className="proc-stat__val">{totalHoras}h</span>
                      <span className="proc-stat__lbl">Horas</span>
                    </div>
                    <div className="proc-stat__sep" />
                    <div className="proc-stat">
                      <span className="proc-stat__val">${(totalValor / 1000).toFixed(0)}k</span>
                      <span className="proc-stat__lbl">Valor</span>
                    </div>
                  </div>
                </div>

                <div className="proc-drawer__body">
                  {loadingId === selectedId ? (
                    <div className="proc-drawer__loading">
                      <Loader2 size={16} className="spin" />
                      <span>Cargando procesos…</span>
                    </div>
                  ) : procesos.length === 0 ? (
                    <div className="proc-drawer__empty">
                      <FolderOpen size={28} />
                      <span>Sin procesos registrados</span>
                    </div>
                  ) : (
                    <ul className="proc-drawer__list">
                      {procesos.map((proc, idx) => {
                        const slug = (proc.estadoObj?.nombre ?? '')
                          .toLowerCase().replace(/\s+/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                        const progreso = ETAPA_PROGRESO[slug] ?? 0;
                        const valor = proc.propuesta?.valor_presupuestado ?? 0;
                        const horas = proc.propuesta?.horas_presupuestadas ?? 0;
                        const herramientas: string[] = proc.herramientas?.map((h: any) => h.nombre) ?? [];

                        return (
                          <li
                            key={proc.id}
                            className="proc-drawer__card"
                            style={{ animationDelay: `${idx * 55}ms` }}
                          >
                            <div className="proc-drawer__card-head">
                              <div className="proc-drawer__card-info">
                                <span className="proc-drawer__card-name">{proc.nombre_proceso}</span>
                                <span className="proc-drawer__card-tipo">{proc.tipo}</span>
                              </div>
                              <span className={`estatus-badge estatus--${slug}`}>
                                {ESTATUS_LABEL[slug] ?? proc.estadoObj?.nombre ?? '—'}
                              </span>
                            </div>

                            <div className="proc-drawer__card-meta">
                              {horas > 0 && (
                                <span className="proc-drawer__chip proc-drawer__chip--hours">
                                  <Clock size={10} />{horas}h
                                </span>
                              )}
                              {valor > 0 && (
                                <span className="proc-drawer__chip proc-drawer__chip--money">
                                  <DollarSign size={10} />${valor.toLocaleString()}
                                </span>
                              )}
                              {herramientas.map(h => (
                                <span key={h} className="proc-drawer__chip">
                                  <Wrench size={10} />{h}
                                </span>
                              ))}
                            </div>

                            {progreso > 0 && (
                              <div className="proc-drawer__progress">
                                <div
                                  className="proc-drawer__progress-fill"
                                  style={{ width: `${progreso}%` }}
                                />
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};