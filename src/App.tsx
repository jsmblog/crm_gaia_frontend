import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider }       from './Context/AuthContext';
import { Auth }               from './Pages/Auth/Auth';
import { PageNotFound }       from './Components/PageNotFound';
import { ProtectedRoute }     from './Components/ProtectedRoute';
import { Layout }             from './Components/Layout/Layout';
import { Home }               from './Pages/Home/Home';
import { FunnelComercial }    from './Pages/FunnelComercial/FunnelComercial';
import { Facturacion }        from './Pages/Facturacion/Facturacion';
import { Proyectos }          from './Pages/Proyectos/Proyectos';
import { Procesos }           from './Pages/Procesos/Procesos';
import { Clientes }           from './Pages/Clientes/Clientes';
import { Consultores }        from './Pages/Consultores/Consultores';
import { Verificar }          from './Pages/Verificar/Verificar';
import { HerramientasRpa }    from './Pages/Herramientas/HerramientasRpa';
import { Areas }              from './Pages/Areas/Areas';
import { Roles }              from './Pages/Roles/Roles';
import { ChatBotGuard }       from './Components/ChatBot/ChatBotGuard';
import { Estados } from './Pages/Estados/Estados';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login"     element={<Auth />} />
          <Route path="/verificar" element={<Verificar />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/"             element={<Home />} />
              <Route path="/funnel"       element={<FunnelComercial />} />
              <Route path="/facturacion"  element={<Facturacion />} />
              <Route path="/proyectos"    element={<Proyectos />} />
              <Route path="/procesos"     element={<Procesos />} />
              <Route path="/clientes"     element={<Clientes />} />
              <Route path="/consultores"  element={<Consultores />} />
              <Route path="/herramientas/rpa" element={<HerramientasRpa />} />
              <Route path="/areas"        element={<Areas />} />
              <Route path="/roles"        element={<Roles />} />
              <Route path='/gestionar/estados' element={<Estados />} />
            </Route>
          </Route>

          <Route path="*" element={<PageNotFound />} />
        </Routes>
        <ChatBotGuard />

      </Router>
    </AuthProvider>
  );
}

export default App;