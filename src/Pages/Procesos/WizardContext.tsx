import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { clienteService } from '../../Services/clienteService';
import { consultorService } from '../../Services/consultorService';
import { herramientaService } from '../../Services/herramientaService';
import { estadoService, type Estado } from '../../Services/estadoService';
import { pipelineService, type ProyectoSummary } from '../../Services/pipelineService';
import type { Cliente } from '../../Interfaces/i_cliente';
import type { HerramientaRpa } from '../../Interfaces/i_herramienta';
import type { Opt } from '../../Constants/procesos';
import type { Rol } from '../../Interfaces/i_rol';
import { rolService } from '../../Services/rolService';
import { proyectoService } from '../../Services/proyectoService';
import type { Proyecto } from '../../Interfaces/i_proyecto';

interface WizardCatalogos {
  clientes:    Cliente[];
  consultores: Opt[];
  herramientas: HerramientaRpa[];
  estados:     Estado[];
  roles:       Rol[];
  proyectos:    Proyecto[];
  fetchProyectosByCliente: (clienteId: string) => Promise<ProyectoSummary[]>;
  reloadClientes:    () => Promise<void>;
  reloadConsultores: () => Promise<void>;
  reloadEstados:     () => Promise<void>;
  reloadHerramientas: () => Promise<void>;
  reloadRoles:       () => Promise<void>;
  reloadProyectos:   () => Promise<void>; 
}

const WizardContext = createContext<WizardCatalogos | null>(null);

export const useWizardCatalogos = (): WizardCatalogos => {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error('useWizardCatalogos must be used inside WizardProvider');
  return ctx;
};

export const WizardProvider = ({ children }: { children: ReactNode }) => {
  const [clientes,     setClientes]     = useState<Cliente[]>([]);
  const [consultores,  setConsultores]  = useState<Opt[]>([]);
  const [herramientas, setHerramientas] = useState<HerramientaRpa[]>([]);
  const [estados,      setEstados]      = useState<Estado[]>([]);
  const [roles,        setRoles]        = useState<Rol[]>([]);
  const [proyectos,     setProyectos]     = useState<Proyecto[]>([]);

  const reloadClientes = async () => {
    const { data } = await clienteService.getAll({ limit: 200 });
    setClientes(data);
  };

  const reloadConsultores = async () => {
    const { data } = await consultorService.getAll({ activo: true, limit: 100 });
    setConsultores(data);
  };

  const reloadEstados = async () => {
    const r = await estadoService.getAll();
    setEstados(r);
  };

  const reloadHerramientas = async () => {
    const { data } = await herramientaService.getAll({ activo: true, limit: 100 });
    setHerramientas(data);
  };

  const reloadRoles = async () => {
    const { data } = await rolService.getAll({ limit: 100 });
    setRoles(data);
  };

  const fetchProyectosByCliente = useCallback(
    (clienteId: string): Promise<ProyectoSummary[]> =>
      pipelineService.getProyectos(clienteId),
    [],
  );

  const reloadProyectos = async () => {
    const {data} = await proyectoService.getAll({ limit: 200 });
    setProyectos(data);
  };

  useEffect(() => {
    Promise.all([
      reloadClientes(),
      reloadConsultores(),
      reloadEstados(),
      reloadHerramientas(),
      reloadRoles(),
    ]);
  }, []);

  return (
    <WizardContext.Provider value={{
      clientes,
      consultores,
      herramientas,
      estados,
      roles,
      proyectos,
      fetchProyectosByCliente,
      reloadClientes,
      reloadConsultores,
      reloadEstados,
      reloadHerramientas,
      reloadRoles,
      reloadProyectos,
    }}>
      {children}
    </WizardContext.Provider>
  );
};