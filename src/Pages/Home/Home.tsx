import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend,
} from 'recharts';
import './Home.css';

/* ── Mock data ── */
const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const barData = [
  { mes:'Ene', aprobados:9, rechazados:3 },
  { mes:'Feb', aprobados:2, rechazados:3 },
  { mes:'Mar', aprobados:6, rechazados:5 },
  { mes:'Abr', aprobados:5, rechazados:4 },
  { mes:'May', aprobados:1, rechazados:2 },
  { mes:'Jun', aprobados:4, rechazados:0 },
  { mes:'Jul', aprobados:3, rechazados:2 },
  { mes:'Ago', aprobados:7, rechazados:2 },
  { mes:'Sep', aprobados:4, rechazados:3 },
  { mes:'Oct', aprobados:4, rechazados:4 },
  { mes:'Nov', aprobados:4, rechazados:0 },
  { mes:'Dic', aprobados:5, rechazados:0 },
];

const areaData = MESES.map((mes, i) => ({
  mes,
  valor: [130,8,42,40,10,5,85,45,88,33,28,35][i] * 1000,
}));

const clienteData = [
  { name:'CER',         value:18 },
  { name:'Ecuaquímica', value:12 },
  { name:'Consenso',    value:7  },
  { name:'JBG',         value:5  },
  { name:'Otros',       value:4  },
];

const pieData = [
  { name:'Lead',        value:35 },
  { name:'Contactado',  value:28 },
  { name:'Propuesta',   value:22 },
  { name:'Cierre',      value:15 },
];

const PIE_COLORS = ['#E05C5C','#3D5166','#779CAB','#95B359'];

const KPI_CARDS = [
  {
    label: 'Total Proyectos Aprobados',
    value: '54',
    sub: 'Todos los meses 2026',
    badge: { text: '136 leads generados', up: true },
    accent: 'var(--light)',
  },
  {
    label: 'Facturación Total',
    value: '$707K',
    sub: 'Meta: $1,000,000',
    badge: { text: '70.8% cumplimiento', up: false },
    accent: 'var(--green)',
  },
  {
    label: 'Valor Promedio / Proyecto',
    value: '$8,968',
    sub: '484,284 total presupuestado',
    badge: { text: '$45/hora promedio', up: true },
    accent: 'var(--light)',
  },
  {
    label: 'Efectividad Aprobación',
    value: '44.3%',
    sub: 'Contactabilidad: 76.5%',
    badge: { text: 'Rechazo: 28.7%', up: false },
    accent: 'var(--green)',
  },
];

const fmt = (v: number) =>
  v >= 1000 ? `$${(v/1000).toFixed(0)}K` : `$${v}`;

export const Home = () => (
  <div className="home">

    {/* ── Topbar ── */}
    <header className="home__topbar">
      <div>
        <h1 className="home__title">Resumen Ejecutivo</h1>
        <p className="home__sub">Actualizado: Marzo 2026</p>
      </div>
      <div className="home__topbar-right">
        <div className="home__search">
          <Search size={14} className="home__search-icon" />
          <input className="home__search-input" placeholder="Buscar cliente o proyecto..." />
        </div>
        <span className="home__year-badge">2026</span>
      </div>
    </header>

    {/* ── KPI row ── */}
    <section className="home__kpis">
      {KPI_CARDS.map(card => (
        <div key={card.label} className="kpi-card" style={{ '--accent': card.accent } as React.CSSProperties}>
          <p className="kpi-card__label">{card.label}</p>
          <p className="kpi-card__value">{card.value}</p>
          <p className="kpi-card__sub">{card.sub}</p>
          <span className={`kpi-card__badge ${card.badge.up ? 'kpi-card__badge--up' : 'kpi-card__badge--down'}`}>
            {card.badge.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {card.badge.text}
          </span>
          <div className="kpi-card__bar" />
        </div>
      ))}
    </section>

    {/* ── Charts row 1 ── */}
    <section className="home__charts">

      <div className="chart-card">
        <div className="chart-card__head">
          <div>
            <p className="chart-card__title">Proyectos Aprobados por Mes</p>
            <p className="chart-card__sub">Cantidad de proyectos aprobados 2026</p>
          </div>
          <span className="chart-card__badge">BARRAS</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} barCategoryGap="30%" barGap={2}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="mes" tick={{ fontSize:11, fill:'var(--gray-secondary)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:11, fill:'var(--gray-secondary)' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 }}
              cursor={{ fill:'rgba(0,0,0,.04)' }}
            />
            <Bar dataKey="aprobados" fill="var(--green)"  radius={[3,3,0,0]} />
            <Bar dataKey="rechazados" fill="var(--light)" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <div className="chart-card__head">
          <div>
            <p className="chart-card__title">Valor Presupuestado por Mes</p>
            <p className="chart-card__sub">En miles de dólares</p>
          </div>
          <span className="chart-card__badge">ÁREA</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={areaData}>
            <defs>
              <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--green)" stopOpacity={0.18} />
                <stop offset="95%" stopColor="var(--green)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="mes" tick={{ fontSize:11, fill:'var(--gray-secondary)' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmt} tick={{ fontSize:11, fill:'var(--gray-secondary)' }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(v: number) => [fmt(v), 'Valor']}
              contentStyle={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 }}
            />
            <Area type="monotone" dataKey="valor" stroke="var(--green)" strokeWidth={2} fill="url(#colorValor)" dot={{ r:3, fill:'var(--green)' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </section>

    {/* ── Charts row 2 ── */}
    <section className="home__charts home__charts--bottom">

      <div className="chart-card">
        <div className="chart-card__head">
          <div>
            <p className="chart-card__title">Proyectos por Cliente (2026)</p>
            <p className="chart-card__sub">Top clientes por número de proyectos aprobados</p>
          </div>
          <span className="chart-card__badge">BARRAS H.</span>
        </div>
        <div className="hbar-list">
          {clienteData.map((d, i) => (
            <div key={d.name} className="hbar-item">
              <span className="hbar-item__name">{d.name}</span>
              <div className="hbar-item__track">
                <div
                  className="hbar-item__fill"
                  style={{
                    width: `${(d.value / clienteData[0].value) * 100}%`,
                    background: i % 2 === 0 ? 'var(--dark)' : 'var(--light)',
                  }}
                />
              </div>
              <span className="hbar-item__val">{d.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-card__head">
          <div>
            <p className="chart-card__title">Distribución por Estatus</p>
            <p className="chart-card__sub">Funnel actual de proyectos</p>
          </div>
          <span className="chart-card__badge">PASTEL</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" strokeWidth={2} stroke="var(--card)">
              {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
            </Pie>
            <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize:12, color:'var(--gray-secondary)' }} />
            <Tooltip contentStyle={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

    </section>

  </div>
);