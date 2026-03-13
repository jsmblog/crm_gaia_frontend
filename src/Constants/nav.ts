import {
  LayoutDashboard, TrendingUp, Receipt, FolderKanban,
  Target, Users, UserCheck,
  DownloadCloud,
} from 'lucide-react';

export const NAV = [
  {
    group: 'Vistas',
    items: [
      { to: '/',              icon: LayoutDashboard, label: 'Resumen'          },
      { to: '/funnel',        icon: TrendingUp,      label: 'Funnel Comercial'  },
      { to: '/facturacion',   icon: Receipt,         label: 'Facturación'       },
      { to: '/proyectos',     icon: FolderKanban,    label: 'Proyectos'         },
    ],
  },
  {
    group: 'Registro',
    items: [
      { to: '/oportunidades', icon: Target,     label: 'Oportunidades' },
      { to: '/clientes',      icon: Users,      label: 'Clientes'      },
      { to: '/consultores',   icon: UserCheck,  label: 'Consultores'   },
    ],
  },
  {
    group: 'Herramientas',
    items: [
      { to: '/exportar', icon: DownloadCloud, label: 'Exportar CSV' },
    ],
  },
];
