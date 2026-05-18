import { useState, useEffect, useCallback } from "react";
import {
  Building2, FolderOpen, Target, Plus, ChevronRight,
  DollarSign, Clock, Cpu, Pencil, Trash2, Activity,
Loader2, FolderPlus,
} from "lucide-react";
import {
  pipelineService,
  type ClienteSummary,
  type ProyectoSummary,
  type ProcesoLite,
} from "../../Services/pipelineService";

const fmtMoney = (n: number) =>
  n.toLocaleString("es-EC", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const estatusSlug = (s?: string | null) =>
  (s || "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[áéíóú]/g, (c) => ({ á: "a", é: "e", í: "i", ó: "o", ú: "u" }[c] ?? c));

export interface PipelineViewProps {
  activePanelProcesoId: string | null;
  onNuevoProyecto: (clienteId?: string) => void;
  onEditProyecto:  (p: ProyectoSummary, clienteId: string) => void;
  onDelProyecto:   (p: ProyectoSummary) => void;
  onDetProyecto:   (p: ProyectoSummary, clienteId: string) => void;
  onSelectProceso: (p: ProcesoLite) => void;
  onEditProceso:   (id: string) => void;
  onDelProceso:    (p: ProcesoLite) => void;
  refreshSignal?:  number;
  onNuevoProceso:  (proyectoId?: string) => void; 
}

const PanelClientes = ({
  selectedId,
  onSelect,
  onNuevo,
  refreshSignal,
}: {
  selectedId: string | null;
  onSelect:   (c: ClienteSummary) => void;
  onNuevo:    () => void;
  refreshSignal?: number;
}) => {
  const [clientes, setClientes] = useState<ClienteSummary[]>([]);
  const [loading,  setLoading]  = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setClientes(await pipelineService.getClientes()); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load, refreshSignal]);

  return (
    <div className="pl-col pl-col--clientes">
      <div className="pl-col__head">
        <div className="pl-col__head-left">
          <Building2 size={13} className="pl-col__icon" />
          <span className="pl-col__title">Clientes</span>
          <span className="pl-col__badge">{clientes.length}</span>
        </div>
        <button className="pl-icon-btn" title="Nuevo proyecto" onClick={onNuevo}>
          <Plus size={13} />
        </button>
      </div>
      <div className="pl-col__body">
        {loading ? (
          <div className="pl-loading"><Loader2 size={16} className="spin" /><span>Cargando…</span></div>
        ) : clientes.length === 0 ? (
          <div className="pl-empty"><Building2 size={28} strokeWidth={1.2} /><p>Sin clientes</p></div>
        ) : (
          clientes.map((c) => (
            <button
              key={c.id}
              className={`pl-row pl-row--cliente ${selectedId === c.id ? "pl-row--active" : ""}`}
              onClick={() => onSelect(c)}
            >
              <div className="pl-row__avatar">{c.empresa[0].toUpperCase()}</div>
              <div className="pl-row__info">
                <span className="pl-row__name">{c.empresa}</span>
                <span className="pl-row__meta">
                  {c.proyecto_count} proy · {c.proceso_count} proc
                </span>
              </div>
              {c.valor_total > 0 && (
                <span className="pl-row__val">
                  <DollarSign size={9} />{fmtMoney(c.valor_total)}
                </span>
              )}
              <ChevronRight size={12} className="pl-row__chevron" />
            </button>
          ))
        )}
      </div>
    </div>
  );
};

const PanelProyectos = ({
  clienteId,
  clienteNombre,
  selectedId,
  onSelect,
  onNuevo,
  onEdit,
  onDel,
  onDet,
  refreshSignal,
}: {
  clienteId:     string | null;
  clienteNombre: string;
  selectedId:    string | null;
  onSelect: (p: ProyectoSummary) => void;
  onNuevo:  () => void;
  onEdit:   (p: ProyectoSummary) => void;
  onDel:    (p: ProyectoSummary) => void;
  onDet:    (p: ProyectoSummary) => void;
  refreshSignal?: number;
}) => {
  const [proyectos, setProyectos] = useState<ProyectoSummary[]>([]);
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    if (!clienteId) { setProyectos([]); return; }
    setLoading(true);
    pipelineService.getProyectos(clienteId)
      .then(setProyectos)
      .finally(() => setLoading(false));
  }, [clienteId, refreshSignal]);

  if (!clienteId) {
    return (
      <div className="pl-col pl-col--empty">
        <FolderOpen size={32} strokeWidth={1} />
        <p>Selecciona un cliente</p>
      </div>
    );
  }

  return (
    <div className="pl-col pl-col--proyectos">
      <div className="pl-col__head">
        <div className="pl-col__head-left">
          <FolderOpen size={13} className="pl-col__icon" />
          <span className="pl-col__title">{clienteNombre}</span>
          <span className="pl-col__badge">{proyectos.length}</span>
        </div>
        <button className="pl-icon-btn" title="Nuevo proyecto" onClick={onNuevo}>
          <FolderPlus size={13} />
        </button>
      </div>

      <div className="pl-col__body">
        {loading ? (
          <div className="pl-loading"><Loader2 size={16} className="spin" /><span>Cargando…</span></div>
        ) : proyectos.length === 0 ? (
          <div className="pl-empty">
            <FolderOpen size={28} strokeWidth={1.2} />
            <p>Sin proyectos</p>
            <button className="pl-empty__btn" onClick={onNuevo}>
              <Plus size={12} /> Crear proyecto
            </button>
          </div>
        ) : (
          proyectos.map((p) => (
            <div
              key={p.id}
              className={`pl-row pl-row--proyecto ${selectedId === p.id ? "pl-row--active" : ""} ${!p.activo ? "pl-row--inactive" : ""}`}
              onClick={() => onSelect(p)}
            >
              <div className="pl-row__info">
                <span className="pl-row__name">{p.nombre}</span>
                <span className="pl-row__meta">
                  {p.proceso_count} proceso{p.proceso_count !== 1 ? "s" : ""}
                  {!p.activo && " · inactivo"}
                </span>
                {p.valor_total > 0 && (
                  <span className="pl-row__val pl-row__val--block">
                    <DollarSign size={9} />{fmtMoney(p.valor_total)}
                  </span>
                )}
              </div>
              <div className="pl-row__actions" onClick={(e) => e.stopPropagation()}>
                <button className="pl-act-btn" title="Detalle" onClick={() => onDet(p)}>
                  <Activity size={11} />
                </button>
                <button className="pl-act-btn" title="Editar" onClick={() => onEdit(p)}>
                  <Pencil size={11} />
                </button>
                {p.activo && (
                  <button className="pl-act-btn pl-act-btn--del" title="Desactivar" onClick={() => onDel(p)}>
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
              <ChevronRight size={12} className="pl-row__chevron" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const PanelProcesos = ({
  proyectoId,
  proyectoNombre,
  activePanelId,
  onSelect,
  onEdit,
  onDel,
  onNuevo,        
  refreshSignal,
}: {
  proyectoId:     string | null;
  proyectoNombre: string;
  activePanelId:  string | null;
  onSelect: (p: ProcesoLite) => void;
  onEdit:   (id: string)      => void;
  onDel:    (p: ProcesoLite)  => void;
  onNuevo:  (proyectoId: string) => void;   
  refreshSignal?: number;
}) => {
  const [procesos, setProcesos] = useState<ProcesoLite[]>([]);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (!proyectoId) { setProcesos([]); return; }
    setLoading(true);
    pipelineService.getProcesos(proyectoId)
      .then(setProcesos)
      .finally(() => setLoading(false));
  }, [proyectoId, refreshSignal]);

  if (!proyectoId) {
    return (
      <div className="pl-col pl-col--empty">
        <Target size={32} strokeWidth={1} />
        <p>Selecciona un proyecto</p>
      </div>
    );
  }

  const totalValor = procesos.reduce(
    (s, p) => s + (Number(p.propuesta?.valor_presupuestado) || 0), 0
  );
  const totalHoras = procesos.reduce(
    (s, p) => s + (Number(p.propuesta?.horas_presupuestadas) || 0), 0
  );

  return (
    <div className="pl-col pl-col--procesos">
      <div className="pl-col__head">
        <div className="pl-col__head-left">
          <Target size={13} className="pl-col__icon" />
          <span className="pl-col__title">{proyectoNombre}</span>
          <span className="pl-col__badge">{procesos.length}</span>
        </div>
        <button className="pl-icon-btn pl-icon-btn--green" title="Nuevo proceso" onClick={() => onNuevo(proyectoId!)}>
          <Plus size={13} />
        </button>
      </div>

      {(totalValor > 0 || totalHoras > 0) && (
        <div className="pl-col__stats">
          {totalValor > 0 && (
            <span className="pl-stat">
              <DollarSign size={10} /> {fmtMoney(totalValor)}
            </span>
          )}
          {totalHoras > 0 && (
            <span className="pl-stat">
              <Clock size={10} /> {totalHoras} h
            </span>
          )}
        </div>
      )}

      <div className="pl-col__body">
        {loading ? (
          <div className="pl-loading"><Loader2 size={16} className="spin" /><span>Cargando…</span></div>
        ) : procesos.length === 0 ? (
          <div className="pl-empty">
            <Target size={28} strokeWidth={1.2} />
            <p>Sin procesos</p>
            <button className="pl-empty__btn" onClick={() => onNuevo(proyectoId!)}>
              <Plus size={12} /> Nuevo proceso
            </button>
          </div>
        ) : (
          procesos.map((p) => {
            const slug  = estatusSlug(p.estadoObj?.nombre);
            const valor = Number(p.propuesta?.valor_presupuestado) || 0;
            const horas = Number(p.propuesta?.horas_presupuestadas) || 0;
            return (
              <div
                key={p.id}
                className={`pl-proc ${activePanelId === p.id ? "pl-proc--active" : ""}`}
                onClick={() => onSelect(p)}
              >
                <div className="pl-proc__head">
                  <div className={`pl-proc__dot pl-dot--${slug}`} />
                  <div className="pl-proc__info">
                    <span className="pl-proc__name">{p.nombre_proceso}</span>
                    {p.tipo && <span className="pl-proc__tipo">{p.tipo}</span>}
                  </div>
                  <span className={`pl-proc__status estatus--${slug}`}>
                    {p.estadoObj?.nombre ?? "—"}
                  </span>
                </div>

                <div className="pl-proc__foot">
                  <div className="pl-proc__chips">
                    {p.prioridad && (
                      <span className={`pl-chip pl-chip--prio-${(p.prioridad).toLowerCase().replace(/\s+/g, "")}`}>
                        {p.prioridad}
                      </span>
                    )}
                    {p.herramientas?.[0] && (
                      <span className="pl-chip">
                        <Cpu size={9} /> {p.herramientas[0].nombre}
                      </span>
                    )}
                    {valor > 0 && (
                      <span className="pl-chip pl-chip--money">
                        <DollarSign size={9} /> {fmtMoney(valor)}
                      </span>
                    )}
                    {horas > 0 && (
                      <span className="pl-chip">
                        <Clock size={9} /> {horas} h
                      </span>
                    )}
                  </div>
                  <div className="pl-proc__btns" onClick={(e) => e.stopPropagation()}>
                    <button className="pl-act-btn" onClick={() => onEdit(p.id)}>
                      <Pencil size={10} />
                    </button>
                    <button className="pl-act-btn pl-act-btn--del" onClick={() => onDel(p)}>
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export const PipelineView = ({
  activePanelProcesoId,
  onNuevoProyecto,
  onEditProyecto,
  onDelProyecto,
  onDetProyecto,
  onSelectProceso,
  onEditProceso,
  onDelProceso,
  refreshSignal,
  onNuevoProceso,
}: PipelineViewProps) => {
  const [selectedCliente,  setSelectedCliente]  = useState<ClienteSummary  | null>(null);
  const [selectedProyecto, setSelectedProyecto] = useState<ProyectoSummary | null>(null);

  const handleSelectCliente = (c: ClienteSummary) => {
    setSelectedCliente(c);
    setSelectedProyecto(null);
  };

  return (
    <div className="pipeline-grid">
      <PanelClientes
        selectedId={selectedCliente?.id ?? null}
        onSelect={handleSelectCliente}
        onNuevo={() => onNuevoProyecto()}
        refreshSignal={refreshSignal}
      />
      <PanelProyectos
        clienteId={selectedCliente?.id ?? null}
        clienteNombre={selectedCliente?.empresa ?? ""}
        selectedId={selectedProyecto?.id ?? null}
        onSelect={setSelectedProyecto}
        onNuevo={() => onNuevoProyecto(selectedCliente?.id)}
        onEdit={(p) => onEditProyecto(p, selectedCliente!.id)}
        onDel={onDelProyecto}
        onDet={(p) => onDetProyecto(p, selectedCliente!.id)}
        refreshSignal={refreshSignal}
      />
      <PanelProcesos
        proyectoId={selectedProyecto?.id ?? null}
        proyectoNombre={selectedProyecto?.nombre ?? ""}
        activePanelId={activePanelProcesoId}
        onSelect={onSelectProceso}
        onEdit={onEditProceso}
        onDel={onDelProceso}
        onNuevo={onNuevoProceso}
        refreshSignal={refreshSignal}
      />
    </div>
  );
};