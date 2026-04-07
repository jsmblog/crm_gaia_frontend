import { Check, Loader } from 'lucide-react';
import type { WizardPayload, EstatusProceso } from '../../Interfaces/i_procesos';
import type { Proyecto } from '../../Interfaces/i_proyecto';
import type { HerramientaRpa } from '../../Interfaces/i_herramienta';
import {
  TODAY, TIPOS_CLASIFICACION, TIPOS_PROCESO, PRIORIDADES,
  PROB_LIST, ESTATUS_LIST, type Setter,
} from '../../Constants/procesos';

interface Props {
  d: Partial<WizardPayload>;
  set: Setter;
  proyectos: (Proyecto & { clienteLabel?: string })[];
  herramientas: HerramientaRpa[];
  onSave: () => Promise<void>;
  saving: boolean;
  saved: boolean;
  isEditing: boolean;
}

export const Step1 = ({ d, set, proyectos, herramientas, onSave, saving, saved, isEditing }: Props) => (
  <div className="step-body">
    <p className="step-section-title">INFORMACIÓN DEL LEAD</p>

    <div className="wfield">
      <label className="wfield__label">PROYECTO <span className="wfield__req">*</span></label>
      <select className="wfield__input" value={d.proyecto_id ?? ''} onChange={e => set('proyecto_id', e.target.value)}>
        <option value="">— Selecciona un proyecto —</option>
        {proyectos.map(p => (
          <option key={p.id} value={p.id}>{p.nombre} — {p.cliente.nombre}</option>
        ))}
      </select>
    </div>

    <div className="wfield">
      <label className="wfield__label">NOMBRE DEL PROCESO <span className="wfield__req">*</span></label>
      <input className="wfield__input" placeholder="Ej: Automatización de facturación"
        value={d.nombre_proceso ?? ''} onChange={e => set('nombre_proceso', e.target.value)} />
    </div>

    <div className="wrow">
      <div className="wfield">
        <label className="wfield__label">CLASIFICACIÓN <span className="wfield__req">*</span></label>
        <select className="wfield__input" value={d.tipo ?? ''} onChange={e => set('tipo', e.target.value)}>
          <option value="">— Selecciona —</option>
          {TIPOS_CLASIFICACION.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div className="wfield">
        <label className="wfield__label">TIPO DE PROCESO <span className="wfield__req">*</span></label>
        <select className="wfield__input" value={d.tipo_proceso ?? ''} onChange={e => set('tipo_proceso', e.target.value)}>
          <option value="">— Selecciona —</option>
          {TIPOS_PROCESO.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
    </div>

    <div className="wrow">
      <div className="wfield">
        <label className="wfield__label">PROBABILIDAD</label>
        <select className="wfield__input" value={d.probabilidad_aprobacion ?? ''} onChange={e => set('probabilidad_aprobacion', e.target.value)}>
          <option value="">— Selecciona —</option>
          {PROB_LIST.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>
      <div className="wfield">
        <label className="wfield__label">PRIORIDAD</label>
        <select className="wfield__input" value={d.prioridad ?? ''} onChange={e => set('prioridad', e.target.value)}>
          <option value="">— Selecciona —</option>
          {PRIORIDADES.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>
    </div>

    <div className="wrow">
      <div className="wfield">
        <label className="wfield__label">FECHA LEAD</label>
        <input type="date" className="wfield__input"
          value={d.fecha_lead ?? TODAY} onChange={e => set('fecha_lead', e.target.value)} />
      </div>
      <div className="wfield">
        <label className="wfield__label">PLAZO DE INICIO</label>
        <input type="date" className="wfield__input" min={TODAY}
          value={d.plazo_inicio ?? ''} onChange={e => set('plazo_inicio', e.target.value)} />
      </div>
    </div>

    <div className="wrow">
      <div className="wfield">
        <label className="wfield__label">HERRAMIENTA RPA</label>
        <select className="wfield__input" value={d.herramienta_rpa_id ?? ''} onChange={e => set('herramienta_rpa_id', e.target.value)}>
          <option value="">— Sin herramienta —</option>
          {herramientas.map(h => (
            <option key={h.id} value={h.id}>{h.nombre}{h.fabricante ? ` · ${h.fabricante}` : ''}</option>
          ))}
        </select>
      </div>
      <div className="wfield">
        <label className="wfield__label">ESTATUS</label>
        <select className="wfield__input" value={d.estatus ?? 'Lead'} onChange={e => set('estatus', e.target.value as EstatusProceso)}>
          {ESTATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>

    <div className="wfield">
      <label className="wfield__label">ACCIÓN / RESPONSABLE</label>
      <input className="wfield__input" placeholder="Ej: FU Consultor — pendiente respuesta"
        value={d.accion_responsable ?? ''} onChange={e => set('accion_responsable', e.target.value)} />
    </div>

    <div className="step-save-row">
      <button className="step-save-btn" onClick={onSave} disabled={saving}>
        {saving ? <><Loader size={14} className="spin" /> Guardando…</> : saved
          ? <><Check size={14} /> {isEditing ? 'Actualizado' : 'Proceso creado'}</>
          : <><Check size={14} /> {isEditing ? 'Actualizar Lead' : 'Crear proceso y continuar'}</>
        }
      </button>
      {saved && <span className="step-save-hint">✓ Guardado — puedes continuar con las siguientes etapas</span>}
    </div>
  </div>
);
