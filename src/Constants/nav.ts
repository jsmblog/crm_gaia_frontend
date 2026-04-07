import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  FolderKanban,
  Target,
  Users,
  UserCheck,
  LayoutGrid,
  Shield,
  DownloadCloud,
  Cpu,
  Brain,
} from 'lucide-react';

export const NAV = [
  {
    group: 'Vistas',
    items: [
      { to: '/',            icon: LayoutDashboard, label: 'Reportería'          },
      { to: '/funnel',      icon: TrendingUp,      label: 'Funnel Comercial' },
      { to: '/facturacion', icon: Receipt,          label: 'Facturación'      },
      { to: '/proyectos',   icon: FolderKanban,    label: 'Proyectos'        },
    ],
  },
  {
    group: 'Registro',
    items: [
      { to: '/procesos',    icon: Target,      label: 'Gestión de proyectos'    },
      { to: '/clientes',    icon: Users,       label: 'Clientes'    },
      { to: '/consultores', icon: UserCheck,   label: 'Consultores' },
      { to: '/areas',       icon: LayoutGrid,  label: 'Areas'       },
      { to: '/roles',       icon: Shield,      label: 'Roles'       },
    ],
  },
  {
    group: 'Herramientas',
    items: [
      { to: '/exportar',         icon: DownloadCloud, label: 'Exportar CSV' },
      { to: '/herramientas/rpa', icon: Cpu,           label: 'RPA'          },
      { to: '/gestionar/estados',icon: Target,        label: 'Gestionar Estados'       },
    ],
  },
];