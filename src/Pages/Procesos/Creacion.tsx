import { useState, useEffect, useCallback } from 'react';
import { Check, Loader } from 'lucide-react';
import type { WizardPayload } from '../../Interfaces/i_procesos';
import { TIPOS_CLASIFICACION, PRIORIDADES, type Setter } from '../../Constants/procesos';
import { useWizardCatalogos } from './WizardContext';
import { EstadoSelect } from './Estadoselect';
import type { ProyectoSummary } from '../../Services/pipelineService';

interface Props {
  d: Partial<WizardPayload>;
  set: Setter;
  onSave: () => Promise<void>;
  saving: boolean;
  saved: boolean;
  isEditing: boolean;
}

export const Creacion = ({ d, set, onSave, saving, saved, isEditing }: Props) => {
  const { clientes, herramientas, fetchProyectosByCliente } = useWizardCatalogos();

  const [selectedClienteId, setSelectedClienteId] = useState<string>('');
  const [proyectos,         setProyectos]         = useState<ProyectoSummary[]>([]);
  const [loadingProyectos,  setLoadingProyectos]  = useState(false);
  console.log(proyectos);
  useEffect(() => {
    if (!d.proyecto_id || selectedClienteId) return;

    const resolveCliente = async () => {
      for (const cliente of clientes) {
        try {
          const ps = await fetchProyectosByCliente(cliente.id);
          const found = ps.find(p => p.id === d.proyecto_id);
          if (found) {
            setSelectedClienteId(cliente.id);
            setProyectos(ps);
            return;
          }
        } catch {}
      }
    };

    if (clientes.length > 0) resolveCliente();
  }, [d.proyecto_id, clientes, fetchProyectosByCliente, selectedClienteId]);

  useEffect(() => {
    if (!selectedClienteId) { setProyectos([]); return; }
    setLoadingProyectos(true);
    fetchProyectosByCliente(selectedClienteId)
      .then(setProyectos)
      .finally(() => setLoadingProyectos(false));
  }, [selectedClienteId, fetchProyectosByCliente]);

  const handleClienteChange = (clienteId: string) => {
    setSelectedClienteId(clienteId);
    set('proyecto_id', '');
    set('nombre_proceso', '');
    set('herramientas_ids', []);
  };

  const handleProyectoChange = (proyectoId: string) => {
    set('proyecto_id', proyectoId);
  };

  const handleHerramientaToggle = useCallback((id: string) => {
    const current = (d.herramientas_ids as string[]) ?? [];
    set('herramientas_ids', current.includes(id)
      ? current.filter(h => h !== id)
      : [...current, id],
    );
  }, [d.herramientas_ids, set]);

  return (
    <div className="step-body">
      <p className="step-section-title">INFORMACIÓN DE CREACIÓN</p>

      <div className="wfield">
        <label className="wfield__label">CLIENTE <span className="wfield__req">*</span></label>
        <select
          className="wfield__input"
          value={selectedClienteId}
          onChange={e => handleClienteChange(e.target.value)}
        >
          <option value="">— Selecciona un cliente —</option>
          {clientes.map(c => <option key={c.id} value={c.id}>{c.empresa}</option>)}
        </select>
      </div>

      <div className="wfield">
        <label className="wfield__label">PROYECTO <span className="wfield__req">*</span></label>
        <select
          className="wfield__input"
          value={d.proyecto_id ?? ''}
          onChange={e => handleProyectoChange(e.target.value)}
          disabled={!selectedClienteId || loadingProyectos}
        >
          <option value="">
            {!selectedClienteId
              ? '— Primero selecciona un cliente —'
              : loadingProyectos
                ? 'Cargando proyectos…'
                : '— Selecciona un proyecto —'}
          </option>
          {proyectos.map(p => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </div>

      <div className="wrow">
        <div className="wfield">
          <label className="wfield__label">CLASIFICACIÓN <span className="wfield__req">*</span></label>
          <select
            className="wfield__input"
            value={d.tipo ?? ''}
            onChange={e => set('tipo', e.target.value)}
          >
            <option value="">— Selecciona —</option>
            {TIPOS_CLASIFICACION.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="wfield">
          <label className="wfield__label">PRIORIDAD</label>
          <select
            className="wfield__input"
            value={d.prioridad ?? ''}
            onChange={e => set('prioridad', e.target.value)}
          >
            <option value="">— Selecciona —</option>
            {PRIORIDADES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <EstadoSelect
        label="ESTADO DEL PROCESO"
        value={d.lev_estado_id ?? ''}
        onChange={id => set('lev_estado_id', id)}
        defaultValue="Levantamiento"
      />

      <div className="wfield">
        <label className="wfield__label">HERRAMIENTAS RPA</label>
        {herramientas.length === 0 ? (
          <p className="wfield__hint">No hay herramientas disponibles</p>
        ) : (
          <div className="wfield__checkbox-group">
            {herramientas.map(h => {
              const selected = ((d.herramientas_ids as string[]) ?? []).includes(h.id);
              return (
                <label
                  key={h.id}
                  className={`wfield__checkbox-item ${selected ? 'wfield__checkbox-item--selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => handleHerramientaToggle(h.id)}
                  />
                  <span>{h.nombre}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div className="step-save-row">
        <button className="step-save-btn" onClick={onSave} disabled={saving}>
          {saving
            ? <><Loader size={14} className="spin" /> Guardando…</>
            : saved
              ? <><Check size={14} /> {isEditing ? 'Actualizado' : 'Proceso creado'}</>
              : <><Check size={14} /> {isEditing ? 'Actualizar' : 'Crear proceso y continuar'}</>
          }
        </button>
        {saved && (
          <span className="step-save-hint">✓ Guardado — puedes continuar con las siguientes etapas</span>
        )}
      </div>
    </div>
  );
};