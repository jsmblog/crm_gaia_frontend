import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { clienteService } from '../../Services/clienteService';
import { consultorService } from '../../Services/consultorService';
import { herramientaService } from '../../Services/herramientaService';
import { proyectoService } from '../../Services/proyectoService';
import { estadoService, type Estado } from '../../Services/estadoService';
import type { Cliente } from '../../Interfaces/i_cliente';
import type { Proyecto } from '../../Interfaces/i_proyecto';
import type { HerramientaRpa } from '../../Interfaces/i_herramienta';
import type { Opt } from '../../Constants/procesos';

interface WizardCatalogos {
  clientes:     Cliente[];
  proyectos:    Proyecto[];
  consultores:  Opt[];
  herramientas: HerramientaRpa[];
  estados:      Estado[];
  reloadProyectos: () => Promise<void>;
  reloadClientes: () => Promise<void>;
  reloadConsultores: () => Promise<void>;
  reloadEstados: () => Promise<void>;
  reloadHerramientas: () => Promise<void>;
}

const WizardContext = createContext<WizardCatalogos | null>(null);

export const useWizardCatalogos = (): WizardCatalogos => {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error('useWizardCatalogos must be used inside WizardProvider');
  return ctx;
};

export const WizardProvider = ({ children }: { children: ReactNode }) => {
  const [clientes,     setClientes]     = useState<Cliente[]>([]);
  const [proyectos,    setProyectos]    = useState<Proyecto[]>([]);
  const [consultores,  setConsultores]  = useState<Opt[]>([]);
  const [herramientas, setHerramientas] = useState<HerramientaRpa[]>([]);
  const [estados,      setEstados]      = useState<Estado[]>([]);

  const reloadProyectos = async () => {
    const r = await proyectoService.getAll({ limit: 200 });
    setProyectos(r.data);
  };

  const reloadClientes = async () => {
    const r = await clienteService.getAll({ limit: 200 });
    setClientes(r.data);
  };

  const reloadConsultores = async () => {
    const r = await consultorService.getAll({ activo: true, limit: 100 });
    setConsultores(r.data);
  };

  const reloadEstados = async () => {
    const r = await estadoService.getAll();
    setEstados(r);
  };

  const reloadHerramientas = async () => {
    const r = await herramientaService.getAll({ activo: true, limit: 100 });
    setHerramientas(r.data);
  }

  useEffect(() => {
   Promise.all([
     reloadClientes(),
     reloadProyectos(),
     reloadConsultores(),
     reloadEstados(),
     reloadHerramientas(),
   ]);
  }, []);

  return (
    <WizardContext.Provider value={{
      clientes,
      proyectos,
      consultores,
      herramientas,
      estados,
      reloadProyectos,
      reloadClientes,
      reloadConsultores,
      reloadEstados,
      reloadHerramientas,
      }}>
      {children}
    </WizardContext.Provider>
  );
};