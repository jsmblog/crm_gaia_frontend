import { useState } from 'react';
import { Outlet }   from 'react-router-dom';
import '../../Styles/Layout.css';
import { Sidebar } from './../Sidebar';
export const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="layout">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(p => !p)} />
      <main className="layout__main">
        <Outlet />
      </main>
    </div>
  );
};