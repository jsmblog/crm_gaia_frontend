import {
  LayoutDashboard, TrendingUp, Receipt, FolderKanban,
  Users, Target, Headset, FileLock,
  LayoutGrid, CalendarDays, UserCheck, Shield, Cpu,
} from 'lucide-react';
import type { VistaKey } from '../Interfaces/i_consultor';

export interface NavItem {
  to:    string;
  icon:  React.ElementType;
  label: string;
  key:   VistaKey | '__admin__';  
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    group: 'Vistas',
    items: [
      { to: '/',            icon: LayoutDashboard, label: 'Reportería',         key: 'reporteria'        },
      { to: '/funnel',      icon: TrendingUp,      label: 'Funnel Comercial',   key: 'funnel'            },
      { to: '/facturacion', icon: Receipt,          label: 'Facturación',        key: 'facturacion'       },
      { to: '/proyectos',   icon: FolderKanban,    label: 'Proyectos',          key: 'proyectos'         },
    ],
  },
  {
    group: 'Registro',
    items: [
      { to: '/clientes',           icon: Users,   label: 'Clientes',             key: 'clientes'          },
      { to: '/gestion/proyectos',  icon: Target,  label: 'Gestión de proyectos', key: 'gestion_proyectos' },
      { to: '/gestion/soporte',    icon: Headset, label: 'Soporte',              key: 'soporte'           },
      { to: '/gestionar/licencias',icon: FileLock,label: 'Licencias',            key: 'licencias'         },
    ],
  },
  {
    group: 'Datos Maestros',
    items: [
      { to: '/areas',              icon: LayoutGrid,  label: 'Areas',              key: 'areas'             },
      { to: '/calendario',         icon: CalendarDays,label: 'Calendario',         key: 'calendario'        },
      { to: '/consultores',        icon: UserCheck,   label: 'Consultores',        key: '__admin__'         },
      { to: '/gestionar/estados',  icon: Target,      label: 'Gestionar Estados',  key: 'gestionar_estados' },
      { to: '/herramientas/rpa',   icon: Cpu,         label: 'Herramientas RPA',   key: 'herramientas_rpa'  },
      { to: '/roles',              icon: Shield,      label: 'Roles',              key: '__admin__'         },
    ],
  },
];