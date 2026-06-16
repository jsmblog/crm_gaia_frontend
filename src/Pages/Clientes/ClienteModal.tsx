import { Check, ChevronDown, DollarSign, Globe, MapPin, UserCheck, X } from "lucide-react";
import { ESTADOS_PERMITIDOS, type Ciudad, type ClienteModalProps, type ClientePayload, type Pais, type Rubro } from "../../Interfaces/i_cliente";
import { useToast } from "../../Hooks/useToast";
import { useWizardCatalogos } from "../Procesos/WizardContext";
import { useEffect, useState } from "react";
import { clienteService } from "../../Services/clienteService";
import { RubroSelect } from "./RubroSelect";

const numOrNull = (s: string): number | null => s.trim() === '' ? null : +s;

const EMPTY_CLIENTE: ClientePayload = {
  empresa: '', pais_id: null, ciudad_id: null, direccion: null,
  rubro_id: null, estado: 'Lead', referido_por: null,
  precio_hora_desarrollo: null, precio_hora_soporte: null,
  precio_hora_cambio: null, porcentaje_gobierno: null, nota: null,
};

export const ClienteModal = ({ initial, onClose, onSaved }: ClienteModalProps) => {
  const { toast, ToastContainer } = useToast();
  const { estados } = useWizardCatalogos(); 

  const [form, setForm] = useState<ClientePayload>(
    initial ? {
      empresa:                initial.empresa,
      pais_id:                initial.pais_id,
      ciudad_id:              initial.ciudad_id,
      direccion:              initial.direccion,
      rubro_id:               initial.rubro_id,
      estado:                 initial.estado,
      estado_id:              initial.estado_id,
      referido_por:           initial.referido_por,
      precio_hora_desarrollo: initial.precio_hora_desarrollo,
      precio_hora_soporte:    initial.precio_hora_soporte,
      precio_hora_cambio:     initial.precio_hora_cambio,
      porcentaje_gobierno:    initial.porcentaje_gobierno,
      nota:                   initial.nota,
    } : { ...EMPTY_CLIENTE }
  );
  const [paises,   setPaises]   = useState<Pais[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [rubros,   setRubros]   = useState<Rubro[]>([]);
  const [loading,  setLoading]  = useState(false);

  const set = <K extends keyof ClientePayload>(k: K, v: ClientePayload[K]) =>
    setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    Promise.all([
      clienteService.getPaises(),
      clienteService.getRubros(),
    ]).then(([p, r]) => {
      setPaises(p); setRubros(r);
    }).catch(() => toast.error('Error al cargar catálogos'));
  }, []);

  useEffect(() => {
    if (form.pais_id) {
      clienteService.getCiudadesByPais(form.pais_id).then(setCiudades).catch(() => setCiudades([]));
    } else {
      setCiudades([]);
      set('ciudad_id', null);
    }
  }, [form.pais_id]);

  const handleSubmit = async () => {
    if (!form.empresa?.trim()) return toast.warning("'Empresa' es requerida");
    setLoading(true);
    try {
      if (initial) { await clienteService.update(initial.id, form); toast.success('Cliente actualizado'); }
      else         { await clienteService.create(form);             toast.success('Cliente creado');      }
      onSaved(); onClose();
    } catch { toast.error('Error al guardar el cliente'); }
    finally  { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <ToastContainer />
      <div className="modal modal--lg" onClick={e => e.stopPropagation()}>
        <div className="modal__head">
          <div>
            <h2 className="modal__title">{initial ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
            <p className="modal__sub">Complete la información del cliente</p>
          </div>
          <button className="modal__close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal__body modal__body--scroll">
          <p className="mfield__section-title">DATOS DE LA EMPRESA</p>

          <div className="modal__row modal__row--2">
            <div className="mfield">
              <label className="mfield__label">Empresa <span className="mfield__req">*</span></label>
              <input className="mfield__input" placeholder="Ej: ABC Corp S.A."
                value={form.empresa} onChange={e => set('empresa', e.target.value)} />
            </div>
            <div className="mfield">
              <label className="mfield__label">Estado</label>
              <div className="mfield__select-wrap">
                <select
                  className="mfield__input mfield__select"
                  value={form.estado_id ?? ''}
                  onChange={e => set('estado_id', e.target.value || null)}>
                  <option value="">— Seleccionar estado —</option>
                  {estados
                    .filter(e => ESTADOS_PERMITIDOS.includes(e.nombre))
                    .map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
                <ChevronDown size={13} className="mfield__select-icon" />
              </div>
            </div>
          </div>

          <div className="modal__row modal__row--2">
            <RubroSelect rubros={rubros} value={form.rubro_id ?? null} onChange={v => set('rubro_id', v)} />
            <div className="mfield">
              <label className="mfield__label"><UserCheck size={10} style={{ display: 'inline', marginRight: 3 }} />Referido por</label>
              <input className="mfield__input" placeholder="Nombre de quien refirió"
                value={form.referido_por ?? ''}
                onChange={e => set('referido_por', e.target.value || null)} />
            </div>
          </div>

          <p className="mfield__section-title" style={{ marginTop: 4 }}>UBICACIÓN</p>

          <div className="modal__row modal__row--2">
            <div className="mfield">
              <label className="mfield__label"><Globe size={10} style={{ display: 'inline', marginRight: 3 }} />País</label>
              <div className="mfield__select-wrap">
                <select className="mfield__input mfield__select"
                  value={form.pais_id ?? ''}
                  onChange={e => { set('pais_id', e.target.value ? +e.target.value : null); set('ciudad_id', null); }}>
                  <option value="">— Seleccionar país —</option>
                  {paises.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
                <ChevronDown size={13} className="mfield__select-icon" />
              </div>
            </div>
            <div className="mfield">
              <label className="mfield__label"><MapPin size={10} style={{ display: 'inline', marginRight: 3 }} />Ciudad</label>
              <div className="mfield__select-wrap">
                <select className="mfield__input mfield__select"
                  value={form.ciudad_id ?? ''}
                  disabled={!form.pais_id || ciudades.length === 0}
                  onChange={e => set('ciudad_id', e.target.value ? +e.target.value : null)}>
                  <option value="">— Seleccionar ciudad —</option>
                  {ciudades.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
                <ChevronDown size={13} className="mfield__select-icon" />
              </div>
            </div>
          </div>

          <div className="mfield">
            <label className="mfield__label">Dirección</label>
            <input className="mfield__input" placeholder="Ej: Av. 9 de Octubre 1234, Piso 3"
              value={form.direccion ?? ''}
              onChange={e => set('direccion', e.target.value || null)} />
          </div>

          <p className="mfield__section-title" style={{ marginTop: 4 }}>TARIFAS POR HORA</p>

          <div className="modal__row modal__row--3">
            {(['precio_hora_desarrollo', 'precio_hora_soporte', 'precio_hora_cambio'] as const).map((k, i) => (
              <div className="mfield" key={k}>
                <label className="mfield__label">
                  <DollarSign size={10} style={{ display: 'inline', marginRight: 3 }} />
                  {['Desarrollo', 'Soporte', 'Cambio'][i]}
                </label>
                <input className="mfield__input" type="number" min="0" step="0.01" placeholder="0.00"
                  value={form[k] ?? ''}
                  onChange={e => set(k, numOrNull(e.target.value))} />
              </div>
            ))}
          </div>

          <div className="mfield" style={{ maxWidth: 200 }}>
            <label className="mfield__label">% de Gerencia</label>
            <input className="mfield__input" type="number" min="0" max="100" step="0.01" placeholder="0.00"
              value={form.porcentaje_gobierno ?? ''}
              onChange={e => set('porcentaje_gobierno', numOrNull(e.target.value))} />
          </div>

          <p className="mfield__section-title" style={{ marginTop: 4 }}>NOTA</p>
          <div className="mfield">
            <textarea className="mfield__input mfield__textarea"
              placeholder="Observaciones sobre este cliente…"
              value={form.nota ?? ''}
              onChange={e => set('nota', e.target.value || null)} />
          </div>
        </div>

        <div className="modal__foot">
          <button className="modal__btn modal__btn--ghost" onClick={onClose}>Cancelar</button>
          <button className="modal__btn modal__btn--primary" onClick={handleSubmit} disabled={loading}>
            <Check size={15} />{loading ? 'Guardando…' : 'Guardar Cliente'}
          </button>
        </div>
      </div>
    </div>
  );
};