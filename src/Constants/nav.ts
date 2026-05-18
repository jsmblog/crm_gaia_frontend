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
  Cpu,
  CalendarDays,
  Headset,
  FileLock,
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
      { to: '/clientes',    icon: Users,       label: 'Clientes'    },
      { to: '/gestion/proyectos',    icon: Target,      label: 'Gestión de proyectos'    },
      { to: '/gestion/soporte',icon: Headset,        label: ' Soporte'       },
      { to: '/gestionar/licencias',icon: FileLock,        label: ' Licencias'       },
    ],
  },
  {
    group: 'Datos Maestros',
    items: [
      { to: '/areas',       icon: LayoutGrid,  label: 'Areas'       },
      { to: '/calendario',       icon: CalendarDays,      label: 'Calendario'       },
      { to: '/consultores', icon: UserCheck,   label: 'Consultores' },
      { to: '/gestionar/estados',icon: Target,        label: 'Gestionar Estados'       },
      { to: '/herramientas/rpa', icon: Cpu,           label: 'Herramientas RPA'          },
      { to: '/roles',       icon: Shield,      label: 'Roles'       },
    ],
  },
];