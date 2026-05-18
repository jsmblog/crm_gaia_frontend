import { useState, useEffect, useMemo } from 'react';
import { Search, FolderOpen, Tag, Users, Wrench } from 'lucide-react';
import { proyectoService } from '../../Services/proyectoService';
import { useToast } from '../../Hooks/useToast';
import './Proyectos.css';
import type { Proyecto } from '../../Interfaces/i_proyecto';

export const Proyectos = () => {
  const { toast, ToastContainer } = useToast();
  const [proyectos, setProyectos]   = useState<Proyecto[]>([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [query, setQuery]           = useState('');
  const [filtroActivo, setFiltroActivo] =
    useState<'todos' | 'activo' | 'inactivo'>('todos');

  useEffect(() => {
    setLoading(true);
    proyectoService
      .getAll({ limit: 200 })
      .then(res => { setProyectos(res.data); setTotal(res.total); })
      .catch(() => toast.error('Error al cargar proyectos'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() =>
    proyectos.filter(p => {
      const matchQ =
        p.nombre.toLowerCase().includes(query.toLowerCase()) ||
        p.cliente.nombre.toLowerCase().includes(query.toLowerCase());
      const matchA =
        filtroActivo === 'todos' ||
        (filtroActivo === 'activo'   && p.activo) ||
        (filtroActivo === 'inactivo' && !p.activo);
      return matchQ && matchA;
    }),
    [proyectos, query, filtroActivo]
  );

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-EC', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });

  return (
    <div className="proyectos-page">
      <ToastContainer />
      <section className="proyectos-section">
        <div className="proyectos-section__head">
          <h2 className="proyectos-section__title">Proyectos</h2>
        </div>

        <div className="table-card">
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

            <span className="table-card__count">{filtered.length} / {total}</span>
          </div>

          <div className="table-wrap">
            <table className="ctable">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Proyecto</th>
                  <th>Empresa</th>
                  <th>Áreas</th>
                  <th>Personal</th>
                  <th>Herramientas</th>
                  <th>Estado</th>
                  <th>Creado</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="ctable__empty">Cargando…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="ctable__empty">Sin resultados</td></tr>
                ) : filtered.map((p, i) => (
                  <tr
                    key={p.id}
                    className={!p.activo ? 'ctable__row--inactive' : ''}
                  >
                    <td className="ctable__num">#{i + 1}</td>
                    <td className="ctable__name">
                      <span className="project-name-btn">
                        <FolderOpen size={13} /> {p.nombre}
                      </span>
                    </td>
                    <td>
                      <div className="ctable__client">
                        <span className="ctable__client-name">{p.cliente.nombre}</span>
                        <span className="ctable__client-empresa">{p.cliente.empresa}</span>
                      </div>
                    </td>
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
                    <td>
                      <span className={`count-badge ${p.herramientas.length > 0 ? 'count-badge--active' : 'count-badge--zero'}`}>
                        <Wrench size={10} />{p.herramientas.length}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`estado-pill estado-pill--${(p.estado_actual?.nombre ?? '').toLowerCase().replace(/\s+/g, '')}`}
                      >
                        {p.estado_actual?.nombre ?? (p.activo ? 'Activo' : 'Pendiente')}
                      </span>
                    </td>
                    <td className="ctable__muted">{fmtDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};