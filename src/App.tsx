import './App.css';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext';
import { Auth } from './Pages/Auth/Auth';
import { PageNotFound } from './Components/PageNotFound';
import { ProtectedRoute } from './Components/ProtectedRoute';
import { Layout } from './Components/Layout/Layout';
import { Home } from './Pages/Home/Home';
import { FunnelComercial } from './Pages/FunnelComercial/FunnelComercial';
import { Facturacion } from './Pages/Facturacion/Facturacion';
import { Proyectos } from './Pages/Proyectos/Proyectos';
import { Oportunidades } from './Pages/Oportunidades/Oportunidades';
import { Clientes } from './Pages/Clientes/Clientes';
import { Consultores } from './Pages/Consultores/Consultores';
import { Verificar } from './Pages/Verificar/Verificar';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route path="/verificar" element={<Verificar />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/funnel" element={<FunnelComercial />} />
              <Route path="/facturacion" element={<Facturacion />} />
              <Route path="/proyectos" element={<Proyectos />} />
              <Route path="/oportunidades" element={<Oportunidades />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/consultores" element={<Consultores />} />
            </Route>
          </Route>

          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;