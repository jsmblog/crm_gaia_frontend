import { NavLink, useNavigate } from 'react-router-dom';
import '../Styles/Sidebar.css';
import {useAuth} from '../Context/AuthContext';
import { NAV } from '../Constants/nav';
import { LogOut,ChevronRight} from 'lucide-react';
import type { SidebarProps } from '../Interfaces/i_sidebar';

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const { logout , user } = useAuth();
  const navigate   = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>

      <div className="sidebar__brand">
        <div className="sidebar__brand-icon">{typeof user?.nombre === 'string' ? user.nombre.charAt(0) : 'G'}</div>
        {!collapsed && (
          <div className="sidebar__brand-text">
            <span className="sidebar__brand-name">GAIA</span>
            {
              user && typeof user?.email === 'string' && (
                <span className="sidebar__brand-email">{user.email}</span>
              )
            }
          </div>
        )}
        
      </div>

      <nav className="sidebar__nav">
        {NAV.map(({ group, items }) => (
          <div key={group} className="sidebar__group">
            {!collapsed && <p className="sidebar__group-label">{group}</p>}
            {items.map(({ to, icon: Icon, label }) => (
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
                {collapsed && (
                  <span className="sidebar__tooltip">{label}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar__footer">
        <button className="sidebar__item sidebar__item--logout" onClick={handleLogout}>
          <LogOut size={18} className="sidebar__item-icon" />
          {!collapsed && <span className="sidebar__item-label">Cerrar sesión</span>}
          {collapsed && <span className="sidebar__tooltip">Cerrar sesión</span>}
        </button>
      </div>

      <button className="sidebar__toggle" onClick={onToggle} aria-label="Colapsar menú">
        <ChevronRight size={14} />
      </button>

    </aside>
  );
};