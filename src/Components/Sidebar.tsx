import { NavLink, useNavigate } from 'react-router-dom';
import '../Styles/Sidebar.css';
import { useAuth }  from '../Context/AuthContext';
import { NAV }      from '../Constants/nav';
import { LogOut, ChevronRight, UserCircle } from 'lucide-react';
import type { SidebarProps } from '../Interfaces/i_sidebar';

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };
  const handleProfile = () => navigate('/perfil');

  const esAdmin = user?.rol?.toLowerCase() === 'admin';

  const puedeVer = (key: string): boolean => {
    if (esAdmin) return true;
    if (key === '__admin__') return false;
    return (user?.vistas ?? []).includes(key as any);
  };

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <button
        className={`sidebar__brand sidebar__brand--clickable ${collapsed ? 'sidebar__brand--collapsed' : ''}`}
        onClick={handleProfile}
        title="Ver mi perfil"
        aria-label="Ir a mi perfil"
      >
        <div className="sidebar__brand-icon">
          {typeof user?.nombre === 'string' ? user.nombre.charAt(0).toUpperCase() : 'G'}
          <span className="sidebar__brand-icon-overlay">
            <UserCircle size={18} />
          </span>
        </div>
        {!collapsed && (
          <div className="sidebar__brand-text">
            <span className="sidebar__brand-name">
              {user?.nombre ?? 'GAIA'}
            </span>
            {user?.email && (
              <span className="sidebar__brand-email">{user.email}</span>
            )}
          </div>
        )}
        {!collapsed && (
          <ChevronRight size={13} className="sidebar__brand-arrow" />
        )}
        {collapsed && <span className="sidebar__tooltip">Mi perfil</span>}
      </button>

      <nav className="sidebar__nav">
        {NAV.map(({ group, items }) => {
          const visibles = items.filter(i => puedeVer(i.key));
          if (!visibles.length) return null;

          return (
            <div key={group} className="sidebar__group">
              {!collapsed && <p className="sidebar__group-label">{group}</p>}
              {visibles.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `sidebar__item ${isActive ? 'sidebar__item--active' : ''}`
                  }
                >
                  <Icon size={18} className="sidebar__item-icon" />
                  {!collapsed && <span className="sidebar__item-label">{label}</span>}
                  {collapsed  && <span className="sidebar__tooltip">{label}</span>}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      <div className="sidebar__footer">
        <button className="sidebar__item sidebar__item--logout" onClick={handleLogout}>
          <LogOut size={18} className="sidebar__item-icon" />
          {!collapsed && <span className="sidebar__item-label">Cerrar sesión</span>}
          {collapsed  && <span className="sidebar__tooltip">Cerrar sesión</span>}
        </button>
      </div>

      <button className="sidebar__toggle" onClick={onToggle} aria-label="Colapsar menú">
        <ChevronRight size={14} />
      </button>
    </aside>
  );
};