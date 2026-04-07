import { useEffect, useState, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";
import {
  TrendingUp, DollarSign, Users, Wrench, Activity,
  RefreshCw, AlertTriangle, Building2, CheckCircle2,
  ChevronRight, Clock, ArrowUpRight, SlidersHorizontal,
  Target, Heart, Zap, TrendingDown, AlertCircle,
} from "lucide-react";
import { reporteService } from "../../Services/reporteService";
import type {
  DashboardResponse,
  ReportePipelineResponse,
  ReporteFinancieroResponse,
  ReporteConsultoresResponse,
  ReporteClientesResponse,
  ReporteHerramientasResponse,
  ActividadRecienteResponse,
  ReporteForecastResponse,
  ReporteSaludClientesResponse,
  ReporteCapacidadResponse,
} from "../../Services/reporteService";
import "./Reporteria.css";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const fmtNum = (n: number) => new Intl.NumberFormat("es-EC").format(n);
const fmtMonth = (iso: string) => {
  try { return new Date(iso + "-02").toLocaleDateString("es-EC", { month: "short", year: "2-digit" }); }
  catch { return iso; }
};
const fmtDate = (iso: string) => {
  try { return new Date(iso).toLocaleDateString("es-EC", { day: "2-digit", month: "short" }); }
  catch { return iso; }
};
const growthColor = (v: number | null) => {
  if (v === null) return "var(--gray-secondary)";
  return v >= 0 ? "var(--green)" : "#e07070";
};
const growthArrow = (v: number | null) => {
  if (v === null) return "—";
  return `${v >= 0 ? "+" : ""}${v}%`;
};

const PALETTE = ["#3D5166", "#779CAB", "#95B359", "#2F3D4D", "#aabbc9", "#5a8a3f", "#b8cdd6"];

type Tab = "dashboard" | "pipeline" | "financiero" | "consultores" | "clientes" | "herramientas" | "forecast" | "salud" | "capacidad";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard",    label: "Resumen",        icon: <Activity size={13} /> },
  { id: "pipeline",     label: "Pipeline",        icon: <TrendingUp size={13} /> },
  { id: "financiero",   label: "Financiero",      icon: <DollarSign size={13} /> },
  { id: "consultores",  label: "Consultores",     icon: <Users size={13} /> },
  { id: "clientes",     label: "Clientes",        icon: <Building2 size={13} /> },
  { id: "herramientas", label: "Herramientas",    icon: <Wrench size={13} /> },
  { id: "forecast",     label: "Forecast",        icon: <Target size={13} /> },
  { id: "salud",        label: "Salud Clientes",  icon: <Heart size={13} /> },
  { id: "capacidad",    label: "Capacidad",       icon: <Zap size={13} /> },
];

const PILL_MAP: Record<string, string> = {
  Aprobado: "rep2__pill--green", Rechazado: "rep2__pill--red",
  "En Ejecución": "rep2__pill--purple", Activo: "rep2__pill--green",
  Pendiente: "rep2__pill--gray", Cancelado: "rep2__pill--red",
};

const tooltipStyle = {
  fontSize: 12,
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--card)",
  color: "var(--text)",
  boxShadow: "0 4px 16px rgba(0,0,0,.08)",
};

function Spinner() {
  return (
    <div className="rep2__center">
      <div className="rep2__spinner" />
      <span className="rep2__spinner-text">Cargando datos…</span>
    </div>
  );
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="rep2__stat">
      <div className="rep2__stat-label">{label}</div>
      <div className="rep2__stat-value" style={accent ? { color: accent } : {}}>{value}</div>
      {sub && <div className="rep2__stat-sub">{sub}</div>}
    </div>
  );
}

function Card({ title, sub, children, className = "" }: {
  title?: string; sub?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`rep2__card ${className}`}>
      {title && (
        <div className="rep2__card-hd">
          <div className="rep2__card-title">{title}</div>
          {sub && <div className="rep2__card-sub">{sub}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

function ComparativaKpi({ label, actual, anterior, fmt: fmtFn = String }: {
  label: string; actual: number; anterior: number; fmt?: (n: number) => string;
}) {
  const diff = anterior > 0 ? Math.round(((actual - anterior) / anterior) * 1000) / 10 : null;
  return (
    <div className="rep2__cmp-kpi">
      <div className="rep2__stat-label">{label}</div>
      <div className="rep2__stat-value">{fmtFn(actual)}</div>
      <div className="rep2__cmp-row">
        <span className="rep2__stat-sub">vs ant. {fmtFn(anterior)}</span>
        <span className="rep2__cmp-badge" style={{ color: growthColor(diff) }}>{growthArrow(diff)}</span>
      </div>
    </div>
  );
}

function TabDashboard({ data, actividad }: { data: DashboardResponse; actividad: ActividadRecienteResponse | null }) {
  const { kpis } = data;
  const estatusData = kpis.pipeline.porEstatus.map(r => ({ name: r.estatus, value: r.total }));
  const estadosData = kpis.proyectos.porEstado.map(r => ({ name: r.estado, value: r.total }));

  const feed = [
    ...(actividad?.ultimosCambiosEstadoProyecto ?? []).slice(0, 3).map((e: any) => ({
      tipo: "estado", texto: `"${e.proyecto?.nombre ?? "—"}" → ${e.estado}`, fecha: e.createdAt,
    })),
    ...(actividad?.ultimasDecisionesAprobacion ?? []).slice(0, 3).map((e: any) => ({
      tipo: e.aprobado ? "ok" : "err",
      texto: e.aprobado
        ? `Aprobado: "${e.proceso?.nombre_proceso ?? "—"}"`
        : `Rechazado: "${e.proceso?.nombre_proceso ?? "—"}"`,
      fecha: e.fecha_aprobacion,
    })),
    ...(actividad?.ultimasInteracciones ?? []).slice(0, 3).map((e: any) => ({
      tipo: "info", texto: `${e.consultor?.nombre ?? "—"} — ${e.proceso?.nombre_proceso ?? "—"}`, fecha: e.fecha,
    })),
  ].sort((a, b) => new Date(b.fecha ?? 0).getTime() - new Date(a.fecha ?? 0).getTime()).slice(0, 8);

  return (
    <div className="rep2__content">
      <div className="rep2__metrics-row">
        <Stat label="Clientes" value={fmtNum(kpis.clientes.total)} sub={`+${kpis.clientes.nuevos} en período`} />
        <div className="rep2__metrics-divider" />
        <Stat label="Consultores activos" value={fmtNum(kpis.consultores.activos)} sub={`${kpis.consultores.total} total`} />
        <div className="rep2__metrics-divider" />
        <Stat label="Proyectos" value={fmtNum(kpis.proyectos.total)} sub={`${kpis.proyectos.activos} activos`} />
        <div className="rep2__metrics-divider" />
        <Stat label="Tasa de conversión" value={kpis.pipeline.tasaConversion} accent="var(--green)" />
        <div className="rep2__metrics-divider" />
        <Stat label="Valor aprobado" value={fmt(kpis.finanzas.valorAprobadoTotal)} sub={`${fmtNum(kpis.finanzas.horasAprobadasTotal)} h`} />
        <div className="rep2__metrics-divider" />
        <Stat label="Horas ejecutadas" value={fmtNum(kpis.finanzas.horasRealesTotal)} sub="horas reales totales" />
      </div>

      <div className="rep2__grid rep2__grid--3-2">
        <Card title="Pipeline por estatus" sub="Distribución de todos los procesos">
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={estatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                paddingAngle={2} dataKey="value" stroke="none">
                {estatusData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Proyectos por estado" sub="Estado actual">
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={estadosData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                paddingAngle={2} dataKey="value" stroke="none">
                {estadosData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Actividad reciente" sub="Últimos eventos del sistema" className="rep2__card--feed">
          {feed.length === 0 ? (
            <div className="rep2__empty"><Activity size={20} opacity={.3} /> Sin actividad</div>
          ) : (
            <div className="rep2__feed">
              {feed.map((item, i) => (
                <div className="rep2__feed-item" key={i}>
                  <span className={`rep2__feed-dot rep2__feed-dot--${item.tipo === "ok" ? "green" : item.tipo === "err" ? "red" : "blue"}`} />
                  <div>
                    <div className="rep2__feed-text">{item.texto}</div>
                    {item.fecha && <div className="rep2__feed-time">{fmtDate(item.fecha)}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function TabPipeline({ data }: { data: ReportePipelineResponse }) {
  const { resumen, tendenciaMensual, topProcesos } = data;

  const meses = [...new Set(tendenciaMensual.map(r => r.mes))].sort();
  const estatuses = [...new Set(tendenciaMensual.map(r => r.estatus))];
  const tendData = meses.map(mes => {
    const row: any = { mes: fmtMonth(mes) };
    estatuses.forEach(est => {
      row[est] = tendenciaMensual.find(r => r.mes === mes && r.estatus === est)?.total ?? 0;
    });
    return row;
  });

  const funnelData = resumen.funnel.map(r => ({ name: r.estatus, total: r.total, pct: r.pct }));
  const { tiempoPromedioEtapas: t } = resumen;
  const tiempoData = [
    { etapa: "Levantamiento", dias: +t.diasHastaLevantamiento },
    { etapa: "Estimación",    dias: +t.diasHastaEstimacion },
    { etapa: "Propuesta",     dias: +t.diasHastaPropuesta },
    { etapa: "Aprobación",    dias: +t.diasHastaAprobacion },
  ];

  return (
    <div className="rep2__content">
      <div className="rep2__metrics-row">
        <Stat label="Total procesos" value={fmtNum(resumen.totalProcesos)} />
        <div className="rep2__metrics-divider" />
        <Stat label="Tasa de aprobación" value={`${resumen.tasaConversion}%`} accent="var(--green)" />
        {resumen.probabilidadAprobacion.map(p => (
          <>
            <div className="rep2__metrics-divider" key={p.tipo + "-div"} />
            <Stat key={p.tipo} label={`Prob. ${p.tipo}`} value={p.promedio} sub={`${p.totalProcesos} procesos`} />
          </>
        ))}
      </div>

      <div className="rep2__grid rep2__grid--2">
        <Card title="Tendencia mensual" sub="Procesos por estatus — últimos 12 meses">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={tendData} barSize={6} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 10, fill: "var(--gray-secondary)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--gray-secondary)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10 }} />
              {estatuses.map((est, i) => (
                <Bar key={est} dataKey={est} fill={PALETTE[i % PALETTE.length]} radius={[3, 3, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Tiempo promedio por etapa" sub="Días entre transiciones de etapa">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={tiempoData} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "var(--gray-secondary)" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="etapa" tick={{ fontSize: 11, fill: "var(--gray-secondary)" }}
                axisLine={false} tickLine={false} width={90} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v} días`, "Promedio"]} />
              <Bar dataKey="dias" fill="#779CAB" radius={[0, 6, 6, 0]}>
                {tiempoData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="rep2__grid rep2__grid--2">
        <Card title="Embudo de conversión" sub="Distribución por estatus">
          <div className="rep2__funnel">
            {funnelData.map((item, i) => (
              <div className="rep2__funnel-row" key={item.name}>
                <span className="rep2__funnel-label">{item.name}</span>
                <div className="rep2__funnel-track">
                  <div className="rep2__funnel-bar" style={{ width: `${item.pct}%`, background: PALETTE[i % PALETTE.length] }} />
                </div>
                <span className="rep2__funnel-val">{item.total}</span>
                <span className="rep2__funnel-pct">{item.pct}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Top procesos" sub="Por valor presupuestado">
          <div className="rep2__list">
            {topProcesos.slice(0, 6).map((p: any, i: number) => (
              <div className="rep2__list-item" key={p.id}>
                <span className="rep2__list-rank">{i + 1}</span>
                <div className="rep2__list-info">
                  <div className="rep2__list-name">{p.nombre_proceso}</div>
                  <div className="rep2__list-sub">{p.proyecto?.cliente?.nombre} · {p.tipo_proceso}</div>
                </div>
                <div className="rep2__list-right">
                  <span className="rep2__money">{fmt(p.propuesta?.valor_presupuestado ?? 0)}</span>
                  <span className={`rep2__pill ${PILL_MAP[p.estatus] ?? "rep2__pill--gray"}`}>{p.estatus}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function TabFinanciero({ data }: { data: ReporteFinancieroResponse }) {
  const { resumen, valorPorEstatus, topClientesPorValor, eficienciaHoras, tendenciaValorMensual } = data;

  const tendData = tendenciaValorMensual.map(r => ({
    mes: fmtMonth(r.mes),
    "Valor aprobado": r.valorAprobado,
    "Procesos": r.procesosAprobados,
  }));

  return (
    <div className="rep2__content">
      <div className="rep2__metrics-row">
        <Stat label="Valor aprobado"   value={fmt(resumen.valorAprobado)}   sub={`${fmtNum(resumen.horasAprobadas)} h`} accent="var(--green)" />
        <div className="rep2__metrics-divider" />
        <Stat label="En pipeline"      value={fmt(resumen.valorEnPipeline)} sub="por convertir" />
        <div className="rep2__metrics-divider" />
        <Stat label="Total presupuestado" value={fmt(resumen.valorTotal)}   sub={`${fmtNum(resumen.horasTotal)} h totales`} />
        <div className="rep2__metrics-divider" />
        <Stat label="$/h desarrollo"   value={fmt(resumen.preciosHoraClientes.promedioDesarrollo)} sub="promedio clientes" />
        <div className="rep2__metrics-divider" />
        <Stat label="$/h soporte"      value={fmt(resumen.preciosHoraClientes.promedioSoporte)} sub="promedio clientes" />
      </div>

      <Card title="Valor aprobado por mes" sub="Evolución de ingresos — últimos 12 meses">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={tendData}>
            <defs>
              <linearGradient id="gVal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#779CAB" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#779CAB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="mes" tick={{ fontSize: 10, fill: "var(--gray-secondary)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "var(--gray-secondary)" }} axisLine={false} tickLine={false}
              tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [fmt(v), "Valor"]} />
            <Area type="monotone" dataKey="Valor aprobado" stroke="#779CAB" strokeWidth={2}
              fill="url(#gVal)" dot={{ r: 3, fill: "#779CAB", strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="rep2__grid rep2__grid--2">
        <Card title="Valor por estatus" sub="USD presupuestado según estado del proceso">
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={valorPorEstatus} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "var(--gray-secondary)" }} axisLine={false} tickLine={false}
                tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="estatus" tick={{ fontSize: 11, fill: "var(--gray-secondary)" }}
                axisLine={false} tickLine={false} width={90} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [fmt(v), "Valor"]} />
              <Bar dataKey="valorTotal" radius={[0, 6, 6, 0]}>
                {valorPorEstatus.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Eficiencia de horas" sub="Desviación horas reales vs presupuestadas">
          <div className="rep2__list">
            {eficienciaHoras.slice(0, 7).map((r, i) => (
              <div className="rep2__list-item" key={i}>
                <span className="rep2__list-rank">{i + 1}</span>
                <div className="rep2__list-info">
                  <div className="rep2__list-name">{r.nombre_proceso}</div>
                  <div className="rep2__list-sub">{r.horas_presupuestadas}h pres. · {r.horas_reales}h real</div>
                </div>
                <span className={`rep2__badge ${(r.pct_desviacion ?? 0) > 110 ? "rep2__badge--warn" : "rep2__badge--ok"}`}>
                  {r.pct_desviacion ?? "—"}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Top clientes por valor aprobado">
        <div className="rep2__table-wrap">
          <table className="rep2__table">
            <thead>
              <tr><th>#</th><th>Cliente</th><th>Empresa</th>
                <th className="rep2__tr">Valor aprobado</th>
                <th className="rep2__tr">Horas</th>
                <th className="rep2__tr">Procesos</th></tr>
            </thead>
            <tbody>
              {topClientesPorValor.map((c, i) => (
                <tr key={i}>
                  <td className="rep2__td-muted" style={{ width: 28 }}>{i + 1}</td>
                  <td className="rep2__td-name">{c.cliente}</td>
                  <td className="rep2__td-muted">{c.empresa}</td>
                  <td className="rep2__tr"><span className="rep2__money">{fmt(+c.valor_aprobado)}</span></td>
                  <td className="rep2__tr rep2__td-muted">{c.horas_aprobadas}h</td>
                  <td className="rep2__tr rep2__td-muted">{c.procesos_aprobados}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function TabConsultores({ data }: { data: ReporteConsultoresResponse }) {
  const { horasPorConsultor, participacionPorEtapa, tasaAprobacionPorConsultor } = data;

  const radarData = participacionPorEtapa.slice(0, 5).map(c => ({
    consultor: c.nombre.split(" ")[0],
    Levantamientos: c.levantamientos,
    Estimaciones: c.estimaciones,
    Propuestas: c.propuestas,
    Aprobaciones: c.aprobaciones,
    Ejecuciones: c.ejecuciones,
  }));

  return (
    <div className="rep2__content">
      <div className="rep2__grid rep2__grid--2">
        <Card title="Horas ejecutadas" sub="Horas reales acumuladas por consultor">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={horasPorConsultor.slice(0, 8)} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "var(--gray-secondary)" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="nombre" tick={{ fontSize: 11, fill: "var(--gray-secondary)" }}
                axisLine={false} tickLine={false} width={90} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="horas_ejecutadas" name="Horas" fill="#3D5166" radius={[0, 6, 6, 0]}>
                {horasPorConsultor.slice(0, 8).map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Tasa de aprobación" sub="% procesos aprobados por consultor">
          <div className="rep2__funnel" style={{ marginTop: 8 }}>
            {tasaAprobacionPorConsultor.slice(0, 7).map((c, i) => (
              <div className="rep2__funnel-row" key={c.nombre}>
                <span className="rep2__funnel-label">{c.nombre.split(" ")[0]}</span>
                <div className="rep2__funnel-track">
                  <div className="rep2__funnel-bar"
                    style={{ width: `${c.tasa_aprobacion}%`, background: PALETTE[i % PALETTE.length] }} />
                </div>
                <span className="rep2__funnel-val">{c.aprobados}/{c.total_procesos}</span>
                <span className="rep2__funnel-pct">{c.tasa_aprobacion}%</span>
              </div>
            ))}
            {tasaAprobacionPorConsultor.length === 0 && (
              <div className="rep2__empty"><Users size={20} opacity={.3} /> Sin datos</div>
            )}
          </div>
        </Card>
      </div>

      <div className="rep2__grid rep2__grid--2">
        {radarData.length > 0 && (
          <Card title="Participación multietapa" sub="Top 5 consultores por tipo de etapa">
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={85}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="consultor" tick={{ fontSize: 10, fill: "var(--gray-secondary)" }} />
                {["Levantamientos", "Estimaciones", "Propuestas", "Aprobaciones", "Ejecuciones"].map((k, i) => (
                  <Radar key={k} name={k} dataKey={k} stroke={PALETTE[i]} fill={PALETTE[i]} fillOpacity={0.12} strokeWidth={1.5} />
                ))}
                <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        )}

        <Card title="Participación por etapa" sub="Cantidad de etapas por consultor">
          <div className="rep2__table-wrap">
            <table className="rep2__table">
              <thead>
                <tr>
                  <th>Consultor</th>
                  <th className="rep2__tr">Lev.</th><th className="rep2__tr">Est.</th>
                  <th className="rep2__tr">Prop.</th><th className="rep2__tr">Aprob.</th>
                  <th className="rep2__tr">Ejec.</th>
                </tr>
              </thead>
              <tbody>
                {participacionPorEtapa.map(c => (
                  <tr key={c.id}>
                    <td className="rep2__td-name">{c.nombre}</td>
                    {[c.levantamientos, c.estimaciones, c.propuestas, c.aprobaciones, c.ejecuciones].map((v, i) => (
                      <td key={i} className={`rep2__tr ${+v === 0 ? "rep2__td-muted" : ""}`}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function TabClientes({ data }: { data: ReporteClientesResponse }) {
  const { topClientesPorActividad, tendenciaClientesNuevos, resumen, clientesSinProyectos } = data;
  const tendData = tendenciaClientesNuevos.map(r => ({ mes: fmtMonth(r.mes), Clientes: r.total }));

  return (
    <div className="rep2__content">
      <div className="rep2__metrics-row">
        <Stat label="Total clientes"  value={fmtNum(resumen.totalClientes)} />
        <div className="rep2__metrics-divider" />
        <Stat label="Sin proyectos"   value={fmtNum(resumen.clientesSinProyectos)}
          sub="oportunidades sin explorar" accent={resumen.clientesSinProyectos > 0 ? "#b07a00" : undefined} />
      </div>

      <div className="rep2__grid rep2__grid--2">
        <Card title="Adquisición mensual" sub="Clientes nuevos por mes — últimos 12 meses">
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={tendData}>
              <defs>
                <linearGradient id="gCli" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#95B359" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#95B359" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 10, fill: "var(--gray-secondary)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--gray-secondary)" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="Clientes" stroke="#95B359" strokeWidth={2}
                fill="url(#gCli)" dot={{ r: 3, fill: "#95B359", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {clientesSinProyectos.length > 0 ? (
          <Card title="Sin proyectos asignados" sub={`${clientesSinProyectos.length} oportunidades sin explorar`}>
            <div className="rep2__list">
              {clientesSinProyectos.slice(0, 7).map(c => (
                <div className="rep2__list-item" key={c.id}>
                  <div className="rep2__list-avatar">{c.nombre[0]}</div>
                  <div className="rep2__list-info">
                    <div className="rep2__list-name">{c.nombre}</div>
                    <div className="rep2__list-sub">{c.empresa}</div>
                  </div>
                  <ChevronRight size={14} color="var(--gray-secondary)" />
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card title="Sin proyectos asignados">
            <div className="rep2__empty"><CheckCircle2 size={20} color="var(--green)" /> Todos los clientes tienen proyectos</div>
          </Card>
        )}
      </div>

      <Card title="Top clientes por actividad">
        <div className="rep2__table-wrap">
          <table className="rep2__table">
            <thead>
              <tr><th>#</th><th>Cliente</th><th>Empresa</th>
                <th className="rep2__tr">Proyectos</th>
                <th className="rep2__tr">Activos</th>
                <th className="rep2__tr">Procesos</th>
                <th className="rep2__tr">Aprobados</th>
                <th className="rep2__tr">Valor</th></tr>
            </thead>
            <tbody>
              {topClientesPorActividad.map((c, i) => (
                <tr key={c.id}>
                  <td className="rep2__td-muted" style={{ width: 28 }}>{i + 1}</td>
                  <td className="rep2__td-name">{c.nombre}</td>
                  <td className="rep2__td-muted">{c.empresa}</td>
                  <td className="rep2__tr">{c.total_proyectos}</td>
                  <td className="rep2__tr">
                    <span className={`rep2__pill ${+c.proyectos_activos > 0 ? "rep2__pill--green" : "rep2__pill--gray"}`}>
                      {c.proyectos_activos}
                    </span>
                  </td>
                  <td className="rep2__tr">{c.total_procesos}</td>
                  <td className="rep2__tr">{c.procesos_aprobados}</td>
                  <td className="rep2__tr"><span className="rep2__money">{fmt(+c.valor_total_aprobado)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function TabHerramientas({ data }: { data: ReporteHerramientasResponse }) {
  const { usoPorHerramienta, proximasAExpirar, resumen } = data;
  const usoData = usoPorHerramienta.map(u => ({
    name: u.herramienta_nombre ?? "—",
    Asignaciones: +u.total_asignaciones,
  }));

  return (
    <div className="rep2__content">
      <div className="rep2__metrics-row">
        <Stat label="Herramientas activas"  value={fmtNum(resumen.totalHerramientas)} />
        <div className="rep2__metrics-divider" />
        <Stat label="Asignaciones activas"  value={fmtNum(resumen.asignacionesActivas)} />
        <div className="rep2__metrics-divider" />
        <Stat label="Por expirar (30d)"     value={fmtNum(resumen.proximasExpirar)}
          accent={resumen.proximasExpirar > 0 ? "#b07a00" : undefined}
          sub={resumen.proximasExpirar > 0 ? "requieren atención" : "todo en orden"} />
      </div>

      {proximasAExpirar.length > 0 && (
        <div className="rep2__alert">
          <AlertTriangle size={14} />
          {proximasAExpirar.length} licencia(s) próximas a expirar — revisa y renueva a tiempo
        </div>
      )}

      <div className="rep2__grid rep2__grid--2">
        <Card title="Asignaciones por herramienta" sub="Total de asignaciones agrupadas">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={usoData.slice(0, 8)} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "var(--gray-secondary)" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--gray-secondary)" }}
                axisLine={false} tickLine={false} width={100} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="Asignaciones" radius={[0, 6, 6, 0]}>
                {usoData.slice(0, 8).map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Próximas a expirar" sub="Licencias activas que vencen en 30 días">
          {proximasAExpirar.length === 0 ? (
            <div className="rep2__empty"><CheckCircle2 size={20} color="var(--green)" /> Sin licencias próximas a vencer</div>
          ) : (
            <div className="rep2__list">
              {proximasAExpirar.map((a: any) => (
                <div className="rep2__list-item" key={a.id}>
                  <div className="rep2__list-info">
                    <div className="rep2__list-name">{a.herramienta?.nombre}</div>
                    <div className="rep2__list-sub">{a.proyecto?.nombre} · {a.cod_licencia ?? "—"}</div>
                  </div>
                  <span className="rep2__badge rep2__badge--warn">{fmtDate(a.fecha_expiracion)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card title="Detalle de asignaciones">
        <div className="rep2__table-wrap">
          <table className="rep2__table">
            <thead>
              <tr><th>Herramienta</th><th>Fabricante</th><th>Versión</th>
                <th>Estado</th><th className="rep2__tr">Asignaciones</th></tr>
            </thead>
            <tbody>
              {usoPorHerramienta.length === 0 ? (
                <tr><td colSpan={5} className="rep2__td-empty">Sin datos</td></tr>
              ) : usoPorHerramienta.map((u: any, i) => (
                <tr key={i}>
                  <td className="rep2__td-name">{u.herramienta_nombre}</td>
                  <td className="rep2__td-muted">{u.fabricante}</td>
                  <td className="rep2__td-muted">{u.version ?? "—"}</td>
                  <td><span className={`rep2__pill ${u.estado === "Activa" ? "rep2__pill--green" : "rep2__pill--red"}`}>{u.estado}</span></td>
                  <td className="rep2__tr">{u.total_asignaciones}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function TabForecast({ data }: { data: ReporteForecastResponse }) {
  const { pipelinePonderado, forecastDias, procesosEstancadosAltoRiesgo, comparativaMensual, tiempoCierrePorConsultor, tiempoCierrePorTipo, abandonoPorEtapa } = data;

  const abandData = abandonoPorEtapa.map(r => ({
    etapa: r.etapa,
    "Con etapa": r.conEtapa,
    "Sin siguiente": r.sinSiguiente,
    "% abandono": r.pctAbandono,
  }));

  const cierreConsData = tiempoCierrePorConsultor.map(r => ({
    name: r.nombre.split(" ")[0],
    "Días cierre": +r.dias_promedio_cierre,
    "Win rate": +r.win_rate,
  }));

  return (
    <div className="rep2__content">
      <div className="rep2__metrics-row">
        <Stat label="Pipeline ponderado"   value={fmt(pipelinePonderado.valorPonderado)} sub={`Bruto: ${fmt(pipelinePonderado.valorBruto)}`} accent="var(--green)" />
        <div className="rep2__metrics-divider" />
        <Stat label="Prob. promedio"       value={`${pipelinePonderado.probPromedio}%`} sub={`${pipelinePonderado.totalProcesos} procesos activos`} />
        <div className="rep2__metrics-divider" />
        <Stat label="Forecast 30d"         value={fmt(forecastDias.dias30)} sub="prob. ≥ 75%" />
        <div className="rep2__metrics-divider" />
        <Stat label="Forecast 60d"         value={fmt(forecastDias.dias60)} sub="prob. ≥ 50%" />
        <div className="rep2__metrics-divider" />
        <Stat label="Forecast 90d"         value={fmt(forecastDias.dias90)} sub="pipeline total ponderado" />
      </div>

      <div className="rep2__grid rep2__grid--3">
        <ComparativaKpi label="Valor aprobado mes" actual={comparativaMensual.valorMesActual} anterior={comparativaMensual.valorMesAnterior} fmt={fmt} />
        <ComparativaKpi label="Procesos abiertos"  actual={comparativaMensual.procesosActual}  anterior={comparativaMensual.procesosAnterior} />
        <ComparativaKpi label="Clientes nuevos"    actual={comparativaMensual.clientesActual}  anterior={comparativaMensual.clientesAnterior} />
      </div>

      <div className="rep2__grid rep2__grid--2">
        <Card title="Abandono por etapa" sub="Procesos que no pasan a la siguiente fase">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={abandData} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="etapa" tick={{ fontSize: 10, fill: "var(--gray-secondary)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--gray-secondary)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="Con etapa" fill="#3D5166" radius={[3, 3, 0, 0]} barSize={10} />
              <Bar dataKey="Sin siguiente" fill="#e07070" radius={[3, 3, 0, 0]} barSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Tiempo de cierre por tipo" sub="Días promedio desde apertura hasta decisión">
          <div className="rep2__list">
            {tiempoCierrePorTipo.map((r, i) => (
              <div className="rep2__list-item" key={i}>
                <span className="rep2__list-rank">{i + 1}</span>
                <div className="rep2__list-info">
                  <div className="rep2__list-name">{r.tipo_proceso}</div>
                  <div className="rep2__list-sub">{r.total} procesos · {r.aprobados} aprobados</div>
                </div>
                <div className="rep2__list-right">
                  <span className="rep2__money" style={{ fontSize: 12 }}>{r.dias_promedio_cierre}d</span>
                  <span className={`rep2__pill ${+r.win_rate >= 50 ? "rep2__pill--green" : "rep2__pill--gray"}`}>{r.win_rate}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {procesosEstancadosAltoRiesgo.length > 0 && (
        <Card title="Procesos estancados — alto potencial" sub="Probabilidad ≥ 60% sin movimiento en más de 14 días">
          <div className="rep2__table-wrap">
            <table className="rep2__table">
              <thead>
                <tr><th>Proceso</th><th>Cliente</th><th>Estatus</th>
                  <th className="rep2__tr">Prob.</th>
                  <th className="rep2__tr">Días sin mov.</th>
                  <th className="rep2__tr">Valor</th></tr>
              </thead>
              <tbody>
                {procesosEstancadosAltoRiesgo.map((p: any, i) => (
                  <tr key={i}>
                    <td className="rep2__td-name">{p.nombre_proceso}</td>
                    <td className="rep2__td-muted">{p.cliente_nombre}</td>
                    <td><span className={`rep2__pill ${PILL_MAP[p.estatus] ?? "rep2__pill--gray"}`}>{p.estatus}</span></td>
                    <td className="rep2__tr">
                      <span className={`rep2__badge ${+p.probabilidad_aprobacion >= 75 ? "rep2__badge--ok" : "rep2__badge--warn"}`}>
                        {p.probabilidad_aprobacion}%
                      </span>
                    </td>
                    <td className="rep2__tr">
                      <span className={`rep2__badge ${+p.dias_sin_movimiento > 30 ? "rep2__badge--warn" : ""}`}>
                        {p.dias_sin_movimiento}d
                      </span>
                    </td>
                    <td className="rep2__tr"><span className="rep2__money">{fmt(p.valor_presupuestado ?? 0)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {cierreConsData.length > 0 && (
        <Card title="Velocidad de cierre por consultor" sub="Días promedio hasta decisión — menor es mejor">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cierreConsData} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "var(--gray-secondary)" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--gray-secondary)" }}
                axisLine={false} tickLine={false} width={90} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any, n: any) => [n === "Días cierre" ? `${v} días` : `${v}%`, n]} />
              <Bar dataKey="Días cierre" fill="#779CAB" radius={[0, 6, 6, 0]}>
                {cierreConsData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}

function TabSaludClientes({ data }: { data: ReporteSaludClientesResponse }) {
  const { churnSilencioso, activosSinInteraccion, ltvPorCliente, frecuenciaInteraccion, resumen } = data;

  const ltvTop10 = ltvPorCliente.slice(0, 10).map(c => ({
    name: c.nombre.split(" ")[0],
    LTV: +c.ltv,
  }));

  return (
    <div className="rep2__content">
      <div className="rep2__metrics-row">
        <Stat label="Total clientes"         value={fmtNum(resumen.totalClientes)} />
        <div className="rep2__metrics-divider" />
        <Stat label="En riesgo de churn"     value={fmtNum(resumen.clientesEnRiesgoChurn)}
          accent={resumen.clientesEnRiesgoChurn > 0 ? "#e07070" : undefined}
          sub="+90 días sin contacto" />
        <div className="rep2__metrics-divider" />
        <Stat label="Activos sin interacción" value={fmtNum(resumen.activosSinContactoReciente)}
          accent={resumen.activosSinContactoReciente > 0 ? "#b07a00" : undefined}
          sub="+30 días sin contacto" />
        <div className="rep2__metrics-divider" />
        <Stat label="LTV total portafolio"    value={fmt(resumen.ltvTotalPortafolio)} sub="valor histórico acumulado" accent="var(--green)" />
        <div className="rep2__metrics-divider" />
        <Stat label="LTV promedio"            value={fmt(resumen.ltvPromedio)} sub="por cliente" />
      </div>

      {churnSilencioso.length > 0 && (
        <div className="rep2__alert rep2__alert--danger">
          <AlertCircle size={14} />
          {churnSilencioso.length} cliente(s) sin interacción en más de 90 días — riesgo de churn silencioso
        </div>
      )}

      <div className="rep2__grid rep2__grid--2">
        <Card title="LTV por cliente" sub="Valor histórico acumulado — top 10">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={ltvTop10} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "var(--gray-secondary)" }} axisLine={false} tickLine={false}
                tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--gray-secondary)" }}
                axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [fmt(v), "LTV"]} />
              <Bar dataKey="LTV" radius={[0, 6, 6, 0]}>
                {ltvTop10.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Churn silencioso" sub="Sin interacción en más de 90 días">
          {churnSilencioso.length === 0 ? (
            <div className="rep2__empty"><CheckCircle2 size={20} color="var(--green)" /> Sin clientes en riesgo de churn</div>
          ) : (
            <div className="rep2__list">
              {churnSilencioso.slice(0, 8).map((c: any) => (
                <div className="rep2__list-item" key={c.id}>
                  <div className="rep2__list-avatar" style={{ background: "#fdecea", color: "#c0392b" }}>{c.nombre[0]}</div>
                  <div className="rep2__list-info">
                    <div className="rep2__list-name">{c.nombre}</div>
                    <div className="rep2__list-sub">{c.empresa} · {c.proyectos_activos} proy. activos</div>
                  </div>
                  <span className="rep2__badge rep2__badge--warn">{c.dias_sin_contacto}d</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="rep2__grid rep2__grid--2">
        <Card title="Activos sin contacto reciente" sub="Proyectos activos pero sin interacciones en 30 días">
          {activosSinInteraccion.length === 0 ? (
            <div className="rep2__empty"><CheckCircle2 size={20} color="var(--green)" /> Todos los clientes activos tienen contacto reciente</div>
          ) : (
            <div className="rep2__list">
              {activosSinInteraccion.slice(0, 7).map((c: any) => (
                <div className="rep2__list-item" key={c.id}>
                  <div className="rep2__list-avatar">{c.nombre[0]}</div>
                  <div className="rep2__list-info">
                    <div className="rep2__list-name">{c.nombre}</div>
                    <div className="rep2__list-sub">{c.empresa} · {c.proyectos_activos} proy. activos</div>
                  </div>
                  <span className={`rep2__badge ${+c.dias_sin_contacto > 60 ? "rep2__badge--warn" : ""}`}>
                    {c.dias_sin_contacto !== null ? `${c.dias_sin_contacto}d` : "Nunca"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Frecuencia de interacción" sub="Promedio de contactos por mes">
          <div className="rep2__list">
            {frecuenciaInteraccion.slice(0, 8).map((c: any, i: number) => (
              <div className="rep2__list-item" key={c.id}>
                <span className="rep2__list-rank">{i + 1}</span>
                <div className="rep2__list-info">
                  <div className="rep2__list-name">{c.nombre}</div>
                  <div className="rep2__list-sub">{c.empresa} · {c.total_interacciones} total</div>
                </div>
                <span className={`rep2__badge ${+c.interacciones_por_mes > 2 ? "rep2__badge--ok" : +c.interacciones_por_mes > 0 ? "rep2__badge--warn" : ""}`}>
                  {(+c.interacciones_por_mes).toFixed(1)}/mes
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Detalle LTV por cliente">
        <div className="rep2__table-wrap">
          <table className="rep2__table">
            <thead>
              <tr><th>#</th><th>Cliente</th><th>Empresa</th>
                <th className="rep2__tr">LTV</th>
                <th className="rep2__tr">Horas</th>
                <th className="rep2__tr">Proc. aprobados</th>
                <th className="rep2__tr">Proyectos</th>
                <th className="rep2__tr">Último aprobado</th></tr>
            </thead>
            <tbody>
              {ltvPorCliente.map((c, i) => (
                <tr key={c.id}>
                  <td className="rep2__td-muted" style={{ width: 28 }}>{i + 1}</td>
                  <td className="rep2__td-name">{c.nombre}</td>
                  <td className="rep2__td-muted">{c.empresa}</td>
                  <td className="rep2__tr"><span className="rep2__money">{fmt(+c.ltv)}</span></td>
                  <td className="rep2__tr rep2__td-muted">{c.horas_aprobadas}h</td>
                  <td className="rep2__tr">{c.procesos_aprobados}</td>
                  <td className="rep2__tr rep2__td-muted">{c.total_proyectos}</td>
                  <td className="rep2__tr rep2__td-muted">{c.ultimo_proceso_aprobado ? fmtDate(c.ultimo_proceso_aprobado) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function TabCapacidad({ data }: { data: ReporteCapacidadResponse }) {
  const { cargaPorConsultor, procesosEstancados, winRatePorTipo, winRatePorCliente, razonesRechazo, margenRealPorProceso, resumen } = data;

  const maxHoras = Math.max(...cargaPorConsultor.map(c => +c.horas_comprometidas), 1);

  return (
    <div className="rep2__content">
      <div className="rep2__metrics-row">
        <Stat label="Total consultores"       value={fmtNum(resumen.totalConsultores)} />
        <div className="rep2__metrics-divider" />
        <Stat label="Sobrecargados (+160h)"   value={fmtNum(resumen.consultoresSobrecargados)}
          accent={resumen.consultoresSobrecargados > 0 ? "#e07070" : undefined} />
        <div className="rep2__metrics-divider" />
        <Stat label="Sin asignaciones"        value={fmtNum(resumen.consultoresSinAsignacion)}
          accent={resumen.consultoresSinAsignacion > 0 ? "#b07a00" : undefined} />
        <div className="rep2__metrics-divider" />
        <Stat label="Procesos estancados"     value={fmtNum(resumen.procesosEstancadosTotal)}
          sub="+30 días sin movimiento"
          accent={resumen.procesosEstancadosTotal > 0 ? "#b07a00" : undefined} />
      </div>

      {resumen.consultoresSobrecargados > 0 && (
        <div className="rep2__alert rep2__alert--danger">
          <AlertCircle size={14} />
          {resumen.consultoresSobrecargados} consultor(es) con más de 160 horas comprometidas — revisar distribución
        </div>
      )}

      <div className="rep2__grid rep2__grid--2">
        <Card title="Carga por consultor" sub="Horas comprometidas en procesos activos">
          <div className="rep2__list">
            {cargaPorConsultor.map((c: any) => (
              <div className="rep2__list-item" key={c.id}>
                <div className="rep2__list-info">
                  <div className="rep2__list-name">{c.nombre} <span className="rep2__td-muted" style={{ fontWeight: 400, fontSize: 11 }}>{c.rol}</span></div>
                  <div className="rep2__cap-bar-wrap">
                    <div className="rep2__cap-bar" style={{
                      width: `${Math.min((+c.horas_comprometidas / maxHoras) * 100, 100)}%`,
                      background: +c.horas_comprometidas > 160 ? "#e07070" : +c.horas_comprometidas > 80 ? "#b07a00" : "#95B359",
                    }} />
                  </div>
                </div>
                <div className="rep2__list-right" style={{ gap: 2 }}>
                  <span className="rep2__money" style={{ fontSize: 12 }}>{c.horas_comprometidas}h</span>
                  <span className="rep2__td-muted" style={{ fontSize: 10 }}>{c.procesos_activos} proc.</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Win rate por tipo de proceso" sub="Tasa de éxito en procesos cerrados">
          <div className="rep2__funnel" style={{ marginTop: 8 }}>
            {winRatePorTipo.map((r, i) => (
              <div className="rep2__funnel-row" key={r.tipo_proceso}>
                <span className="rep2__funnel-label">{r.tipo_proceso}</span>
                <div className="rep2__funnel-track">
                  <div className="rep2__funnel-bar"
                    style={{ width: `${r.win_rate}%`, background: PALETTE[i % PALETTE.length] }} />
                </div>
                <span className="rep2__funnel-val">{r.aprobados}/{r.total}</span>
                <span className="rep2__funnel-pct">{r.win_rate}%</span>
              </div>
            ))}
            {winRatePorTipo.length === 0 && (
              <div className="rep2__empty">Sin datos de win rate</div>
            )}
          </div>
        </Card>
      </div>

      <div className="rep2__grid rep2__grid--2">
        <Card title="Razones de rechazo" sub="Motivos más frecuentes de procesos no aprobados">
          {razonesRechazo.length === 0 ? (
            <div className="rep2__empty"><CheckCircle2 size={20} color="var(--green)" /> Sin rechazos registrados con motivo</div>
          ) : (
            <div className="rep2__list">
              {razonesRechazo.map((r: any, i) => (
                <div className="rep2__list-item" key={i}>
                  <span className="rep2__list-rank">{i + 1}</span>
                  <div className="rep2__list-info">
                    <div className="rep2__list-name">{r.motivo_rechazo}</div>
                  </div>
                  <span className="rep2__badge rep2__badge--warn">{r.total}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Procesos estancados" sub="Sin movimiento en más de 30 días">
          {procesosEstancados.length === 0 ? (
            <div className="rep2__empty"><CheckCircle2 size={20} color="var(--green)" /> Sin procesos estancados</div>
          ) : (
            <div className="rep2__list">
              {procesosEstancados.slice(0, 7).map((p: any) => (
                <div className="rep2__list-item" key={p.id}>
                  <div className="rep2__list-info">
                    <div className="rep2__list-name">{p.nombre_proceso}</div>
                    <div className="rep2__list-sub">{p.cliente_nombre} · {p.estatus}</div>
                  </div>
                  <div className="rep2__list-right">
                    <span className={`rep2__badge ${+p.dias_estancado > 60 ? "rep2__badge--warn" : ""}`}>{p.dias_estancado}d</span>
                    <span className="rep2__td-muted" style={{ fontSize: 11 }}>{fmt(p.valor_presupuestado ?? 0)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {margenRealPorProceso.length > 0 && (
        <Card title="Margen real por proceso" sub="Valor aprobado menos costo real de horas ejecutadas">
          <div className="rep2__table-wrap">
            <table className="rep2__table">
              <thead>
                <tr><th>Proceso</th><th>Tipo</th>
                  <th className="rep2__tr">Val. pres.</th>
                  <th className="rep2__tr">H. pres.</th>
                  <th className="rep2__tr">H. reales</th>
                  <th className="rep2__tr">Margen real</th></tr>
              </thead>
              <tbody>
                {margenRealPorProceso.map((r: any, i) => (
                  <tr key={i}>
                    <td className="rep2__td-name">{r.nombre_proceso}</td>
                    <td className="rep2__td-muted">{r.tipo_proceso}</td>
                    <td className="rep2__tr"><span className="rep2__money">{fmt(r.valor_presupuestado)}</span></td>
                    <td className="rep2__tr rep2__td-muted">{r.horas_presupuestadas}h</td>
                    <td className="rep2__tr rep2__td-muted">{r.horas_reales}h</td>
                    <td className="rep2__tr">
                      <span className={`rep2__badge ${+r.margen_real >= 0 ? "rep2__badge--ok" : "rep2__badge--warn"}`}>
                        {+r.margen_real >= 0 ? "+" : ""}{fmt(r.margen_real)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card title="Win rate por cliente" sub="Tasa de éxito en clientes con 2+ procesos cerrados">
        <div className="rep2__table-wrap">
          <table className="rep2__table">
            <thead>
              <tr><th>#</th><th>Cliente</th><th>Empresa</th>
                <th className="rep2__tr">Total</th>
                <th className="rep2__tr">Aprobados</th>
                <th className="rep2__tr">Win rate</th>
                <th className="rep2__tr">Valor ganado</th></tr>
            </thead>
            <tbody>
              {winRatePorCliente.map((c, i) => (
                <tr key={i}>
                  <td className="rep2__td-muted" style={{ width: 28 }}>{i + 1}</td>
                  <td className="rep2__td-name">{c.cliente}</td>
                  <td className="rep2__td-muted">{c.empresa}</td>
                  <td className="rep2__tr">{c.total_procesos}</td>
                  <td className="rep2__tr">{c.aprobados}</td>
                  <td className="rep2__tr">
                    <span className={`rep2__pill ${+c.win_rate >= 50 ? "rep2__pill--green" : "rep2__pill--gray"}`}>{c.win_rate}%</span>
                  </td>
                  <td className="rep2__tr"><span className="rep2__money">{fmt(+c.valor_ganado)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

type DataKey = "dashboard" | "actividad" | "pipeline" | "financiero" | "consultores" | "clientes" | "herramientas" | "forecast" | "salud" | "capacidad";

type DataStore = {
  dashboard:    DashboardResponse | null;
  actividad:    ActividadRecienteResponse | null;
  pipeline:     ReportePipelineResponse | null;
  financiero:   ReporteFinancieroResponse | null;
  consultores:  ReporteConsultoresResponse | null;
  clientes:     ReporteClientesResponse | null;
  herramientas: ReporteHerramientasResponse | null;
  forecast:     ReporteForecastResponse | null;
  salud:        ReporteSaludClientesResponse | null;
  capacidad:    ReporteCapacidadResponse | null;
};

export const Reporteria = () => {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const [data, setData] = useState<DataStore>({
    dashboard: null, actividad: null, pipeline: null, financiero: null,
    consultores: null, clientes: null, herramientas: null,
    forecast: null, salud: null, capacidad: null,
  });

  const [loadingTabs, setLoadingTabs] = useState<Partial<Record<Tab, boolean>>>({});
  const [errorTabs, setErrorTabs] = useState<Partial<Record<Tab, string>>>({});
  const [loadedTabs, setLoadedTabs] = useState<Set<Tab>>(new Set());

  const setTabData = (key: DataKey, value: any) =>
    setData(prev => ({ ...prev, [key]: value }));

  const loadTab = useCallback(async (t: Tab) => {
    const f = { desde: desde || undefined, hasta: hasta || undefined };
    setLoadingTabs(prev => ({ ...prev, [t]: true }));
    setErrorTabs(prev => ({ ...prev, [t]: undefined }));
    try {
      switch (t) {
        case "dashboard": {
          const [db, act] = await Promise.all([
            reporteService.getDashboard(f),
            reporteService.getActividadReciente(15),
          ]);
          setTabData("dashboard", db);
          setTabData("actividad", act);
          break;
        }
        case "pipeline":
          setTabData("pipeline", await reporteService.getPipeline(f));
          break;
        case "financiero":
          setTabData("financiero", await reporteService.getFinanciero(f));
          break;
        case "consultores":
          setTabData("consultores", await reporteService.getConsultores(f));
          break;
        case "clientes":
          setTabData("clientes", await reporteService.getClientes());
          break;
        case "herramientas":
          setTabData("herramientas", await reporteService.getHerramientas());
          break;
        case "forecast":
          setTabData("forecast", await reporteService.getForecast(f));
          break;
        case "salud":
          setTabData("salud", await reporteService.getSaludClientes());
          break;
        case "capacidad":
          setTabData("capacidad", await reporteService.getCapacidad());
          break;
      }
      setLoadedTabs(prev => new Set([...prev, t]));
    } catch (e: any) {
      setErrorTabs(prev => ({
        ...prev,
        [t]: e?.response?.data?.mensaje ?? e?.message ?? "Error al cargar",
      }));
    } finally {
      setLoadingTabs(prev => ({ ...prev, [t]: false }));
    }
  }, [desde, hasta]);

  const switchTab = (t: Tab) => {
    setTab(t);
    if (!loadedTabs.has(t)) {
      loadTab(t);
    }
  };

  const refresh = () => {
    setLoadedTabs(new Set());
    setData({
      dashboard: null, actividad: null, pipeline: null, financiero: null,
      consultores: null, clientes: null, herramientas: null,
      forecast: null, salud: null, capacidad: null,
    });
    loadTab(tab);
  };

  const applyFilter = () => {
    setFilterOpen(false);
    setLoadedTabs(new Set());
    setData({
      dashboard: null, actividad: null, pipeline: null, financiero: null,
      consultores: null, clientes: null, herramientas: null,
      forecast: null, salud: null, capacidad: null,
    });
    loadTab(tab);
  };

  useEffect(() => {
    loadTab("dashboard");
  }, []);

  const isLoading = !!loadingTabs[tab];
  const tabError  = errorTabs[tab];
  const hasFiltro = desde || hasta;

  const renderTab = () => {
    if (isLoading) return <Spinner />;
    if (tabError) return (
      <div className="rep2__error" style={{ marginTop: 16 }}>
        <AlertTriangle size={14} /> {tabError}
      </div>
    );
    switch (tab) {
      case "dashboard":    return data.dashboard    ? <TabDashboard    data={data.dashboard}    actividad={data.actividad} /> : null;
      case "pipeline":     return data.pipeline     ? <TabPipeline     data={data.pipeline} /> : null;
      case "financiero":   return data.financiero   ? <TabFinanciero   data={data.financiero} /> : null;
      case "consultores":  return data.consultores  ? <TabConsultores  data={data.consultores} /> : null;
      case "clientes":     return data.clientes     ? <TabClientes     data={data.clientes} /> : null;
      case "herramientas": return data.herramientas ? <TabHerramientas data={data.herramientas} /> : null;
      case "forecast":     return data.forecast     ? <TabForecast     data={data.forecast} /> : null;
      case "salud":        return data.salud        ? <TabSaludClientes data={data.salud} /> : null;
      case "capacidad":    return data.capacidad    ? <TabCapacidad    data={data.capacidad} /> : null;
    }
  };

  return (
    <div className="rep2">
      <div className="rep2__header">
        <div>
          <div className="rep2__eyebrow">Business Intelligence</div>
          <h1 className="rep2__title">Reportería</h1>
        </div>

        <div className="rep2__header-right">
          {hasFiltro && (
            <div className="rep2__filtro-badge">
              <Clock size={11} />
              {desde && fmtDate(desde)} {desde && hasta && "—"} {hasta && fmtDate(hasta)}
              <button className="rep2__filtro-clear" onClick={() => { setDesde(""); setHasta(""); }}>×</button>
            </div>
          )}

          <div className="rep2__filter-row">
            <button
              className={`rep2__filter-toggle ${filterOpen ? "rep2__filter-toggle--open" : ""}`}
              onClick={() => setFilterOpen(o => !o)}
            >
              <SlidersHorizontal size={13} /> Filtrar período
            </button>
            <button className="rep2__btn-refresh" onClick={refresh} disabled={isLoading}>
              <RefreshCw size={13} className={isLoading ? "rep2__spin" : ""} />
              {isLoading ? "Cargando" : "Actualizar"}
            </button>
          </div>

          {filterOpen && (
            <div className="rep2__filter-panel">
              <div className="rep2__filter-group">
                <label className="rep2__filter-lbl">Desde</label>
                <input type="date" className="rep2__date" value={desde} onChange={e => setDesde(e.target.value)} />
              </div>
              <div className="rep2__filter-group">
                <label className="rep2__filter-lbl">Hasta</label>
                <input type="date" className="rep2__date" value={hasta} onChange={e => setHasta(e.target.value)} />
              </div>
              <button className="rep2__btn-apply" onClick={applyFilter}>
                <ArrowUpRight size={13} /> Aplicar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="rep2__tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`rep2__tab ${tab === t.id ? "rep2__tab--active" : ""} ${loadingTabs[t.id] ? "rep2__tab--loading" : ""}`}
            onClick={() => switchTab(t.id)}
          >
            {t.icon} {t.label}
            {loadingTabs[t.id] && <span className="rep2__tab-dot" />}
          </button>
        ))}
      </div>

      {renderTab()}
    </div>
  );
};