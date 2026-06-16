import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './Context/AuthContext.tsx';
import { WizardProvider } from './Pages/Procesos/WizardContext.tsx';
import { ThemeProvider } from './Context/ThemeContext.tsx';

createRoot(document.getElementById('root')!).render(
    <AuthProvider>
  <ThemeProvider>          
    <WizardProvider>
      <App />
    </WizardProvider>
  </ThemeProvider> 
</AuthProvider>
)
