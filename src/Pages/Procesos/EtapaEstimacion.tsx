import { TODAY } from '../../Constants/procesos';
import { ConsultorMultiSelect } from './ConsultorMultiSelect';
import { EstadoSelect } from './Estadoselect';
import { InteraccionesSection } from './components/Interaccionessection';
import { StepSaveRow, StepLockedBanner } from './components/Stepshared';
import { useInteracciones } from '../../Hooks/Useinteracciones';
import { estimacionService } from './service/procesoServiceAdapters';
import type { Props } from '../../Interfaces/i_procesos';
import { toIds } from '../../Utils/toIds';
import { useAutoConsultores } from '../../Hooks/useAutoConsultores';

interface CheckboxFieldProps {
  label:   string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

const CheckboxField = ({ label, checked, onChange }: CheckboxFieldProps) => (
  <div className="wfield wfield--inline">
    <label className="wfield__label wfield__label--check">
      <input type="checkbox" className="wfield__check"
        checked={checked} onChange={e => onChange(e.target.checked)} />
      {label}
    </label>
  </div>
);

const num = (v: any) => v === '' || v === undefined || v === null ? undefined : +v;

export const EtapaEstimacion = ({
  d, set, wizardProcessId, onSave, saving, saved, locked,
}: Props) => {
  const int = useInteracciones(wizardProcessId ?? undefined, estimacionService);
   useAutoConsultores(d as any, set);
   if (locked) return <StepLockedBanner />;
  
  const estIds = toIds(d.est_consultores_ids);
  const requiereCaptcha = d.est_requiere_captcha ?? false;
  const requiereAi      = d.est_requiere_ai      ?? false;
  const requiereOcr     = d.est_requiere_ocr      ?? false;
  const requiereIdp     = d.est_requiere_idp      ?? false;


  return (
    <div className="step-body">
      <div className="etapa-block">
        <p className="step-section-title">ESTIMACIÓN</p>

        <ConsultorMultiSelect
          label="CONSULTORES"
          selected={estIds}
          onChange={ids => set('est_consultores_ids', ids)}
        />

        <div className="wrow">
          <div className="wfield">
            <label className="wfield__label">FECHA</label>
            <input type="date" className="wfield__input"
              value={d.est_fecha ?? TODAY}
              onChange={e => set('est_fecha', e.target.value)} />
          </div>
          <EstadoSelect
            label="ESTADO DEL PROCESO"
            value={d.est_estado_id ?? ''}
            onChange={id => set('est_estado_id', id)}
            defaultValue="Estimacion"
          />
        </div>

        <div className="wfield">
          <label className="wfield__label">OBSERVACIONES</label>
          <textarea className="wfield__input wfield__textarea" rows={3}
            placeholder="Observaciones generales…"
            value={d.est_observaciones ?? ''}
            onChange={e => set('est_observaciones', e.target.value)} />
        </div>

        <div className="wfield">
          <label className="wfield__label">PRÓXIMOS PASOS</label>
          <textarea className="wfield__input wfield__textarea" rows={2}
            placeholder="¿Qué sigue después de esta etapa?…"
            value={d.est_proximos_pasos ?? ''}
            onChange={e => set('est_proximos_pasos', e.target.value)} />
        </div>

        {/* ── MÉTRICAS OPERATIVAS ── */}
        <p className="step-section-title" style={{ marginTop: '1.25rem' }}>MÉTRICAS OPERATIVAS</p>
        <div className="wrow">
          <div className="wfield">
            <label className="wfield__label">VOLUMEN TRANSACCIONAL MENSUAL</label>
            <input type="number" min={0} className="wfield__input" placeholder="Ej: 5000"
              value={d.est_volumen_transaccional_mensual ?? ''}
              onChange={e => set('est_volumen_transaccional_mensual', num(e.target.value))} />
          </div>
          <div className="wfield">
            <label className="wfield__label">TIEMPO DE EJECUCIÓN POR TRANSACCIÓN (min)</label>
            <input type="number" min={0} step={0.01} className="wfield__input" placeholder="Ej: 2.5"
              value={d.est_tiempo_ejecucion_transaccion ?? ''}
              onChange={e => set('est_tiempo_ejecucion_transaccion', num(e.target.value))} />
          </div>
        </div>

        {/* ── CAPTCHA ── */}
        <p className="step-section-title" style={{ marginTop: '1.25rem' }}>CAPTCHA</p>
        <CheckboxField label="¿REQUIERE CAPTCHA?" checked={requiereCaptcha}
          onChange={v => {
            set('est_requiere_captcha', v);
            if (!v) { set('est_volumen_captcha_mes', undefined); set('est_costo_mensual_captcha', undefined); }
          }} />
        {requiereCaptcha && (
          <div className="wrow">
            <div className="wfield">
              <label className="wfield__label">VOLUMEN DE CAPTCHA AL MES</label>
              <input type="number" min={0} className="wfield__input" placeholder="Ej: 1200"
                value={d.est_volumen_captcha_mes ?? ''}
                onChange={e => set('est_volumen_captcha_mes', num(e.target.value))} />
            </div>
            <div className="wfield">
              <label className="wfield__label">COSTO MENSUAL ($)</label>
              <input type="number" min={0} step={0.01} className="wfield__input" placeholder="Ej: 50.00"
                value={(d as any).est_costo_mensual_captcha ?? ''}
                onChange={e => set('est_costo_mensual_captcha' as any, num(e.target.value))} />
            </div>
          </div>
        )}

        {/* ── INTELIGENCIA ARTIFICIAL ── */}
        <p className="step-section-title" style={{ marginTop: '1.25rem' }}>INTELIGENCIA ARTIFICIAL</p>
        <CheckboxField label="¿REQUIERE IA?" checked={requiereAi}
          onChange={v => {
            set('est_requiere_ai', v);
            if (!v) {
              set('est_ai_para_que', undefined); set('est_ai_nombre', undefined);
              set('est_ai_metodo_pago', undefined); set('est_ai_volumen_mensual_tokens', undefined);
              set('est_costo_mensual_ai' as any, undefined);
            }
          }} />
        {requiereAi && (
          <>
            <div className="wfield">
              <label className="wfield__label">¿PARA QUÉ SE USA LA IA?</label>
              <textarea className="wfield__input wfield__textarea" rows={2}
                placeholder="Describe el caso de uso…"
                value={d.est_ai_para_que ?? ''}
                onChange={e => set('est_ai_para_que', e.target.value)} />
            </div>
            <div className="wrow">
              <div className="wfield">
                <label className="wfield__label">NOMBRE / PROVEEDOR DE IA</label>
                <input type="text" className="wfield__input" placeholder="Ej: OpenAI GPT-4o"
                  value={d.est_ai_nombre ?? ''}
                  onChange={e => set('est_ai_nombre', e.target.value)} />
              </div>
              <div className="wfield">
                <label className="wfield__label">MÉTODO DE PAGO</label>
                <input type="text" className="wfield__input" placeholder="Ej: API pay-per-use"
                  value={d.est_ai_metodo_pago ?? ''}
                  onChange={e => set('est_ai_metodo_pago', e.target.value)} />
              </div>
            </div>
            <div className="wrow">
              <div className="wfield">
                <label className="wfield__label">VOLUMEN MENSUAL (TOKENS)</label>
                <input type="number" min={0} className="wfield__input" placeholder="Ej: 500000"
                  value={d.est_ai_volumen_mensual_tokens ?? ''}
                  onChange={e => set('est_ai_volumen_mensual_tokens', num(e.target.value))} />
              </div>
              <div className="wfield">
                <label className="wfield__label">COSTO MENSUAL ($)</label>
                <input type="number" min={0} step={0.01} className="wfield__input" placeholder="Ej: 200.00"
                  value={(d as any).est_costo_mensual_ai ?? ''}
                  onChange={e => set('est_costo_mensual_ai' as any, num(e.target.value))} />
              </div>
            </div>
          </>
        )}

        {/* ── OCR ── */}
        <p className="step-section-title" style={{ marginTop: '1.25rem' }}>OCR</p>
        <CheckboxField label="¿REQUIERE OCR?" checked={requiereOcr}
          onChange={v => {
            set('est_requiere_ocr', v);
            if (!v) { set('est_ocr_nombre', undefined); set('est_ocr_volumen_mensual', undefined); set('est_ocr_costo', undefined); }
          }} />
        {requiereOcr && (
          <>
            <div className="wfield">
              <label className="wfield__label">NOMBRE / PROVEEDOR OCR</label>
              <input type="text" className="wfield__input" placeholder="Ej: Google Vision"
                value={d.est_ocr_nombre ?? ''}
                onChange={e => set('est_ocr_nombre', e.target.value)} />
            </div>
            <div className="wrow">
              <div className="wfield">
                <label className="wfield__label">VOLUMEN MENSUAL (PÁGINAS / DOCS)</label>
                <input type="number" min={0} className="wfield__input" placeholder="Ej: 10000"
                  value={d.est_ocr_volumen_mensual ?? ''}
                  onChange={e => set('est_ocr_volumen_mensual', num(e.target.value))} />
              </div>
              <div className="wfield">
                <label className="wfield__label">COSTO MENSUAL ($)</label>
                <input type="number" min={0} step={0.01} className="wfield__input" placeholder="Ej: 150.00"
                  value={d.est_ocr_costo ?? ''}
                  onChange={e => set('est_ocr_costo', num(e.target.value))} />
              </div>
            </div>
          </>
        )}

        {/* ── IDP ── */}
        <p className="step-section-title" style={{ marginTop: '1.25rem' }}>IDP — PROCESAMIENTO INTELIGENTE DE DOCUMENTOS</p>
        <CheckboxField label="¿REQUIERE IDP?" checked={requiereIdp}
          onChange={v => {
            set('est_requiere_idp', v);
            if (!v) { set('est_idp_documentos', undefined); set('est_idp_volumen_mensual', undefined); set('est_costo_mensual_idp' as any, undefined); }
          }} />
        {requiereIdp && (
          <>
            <div className="wfield">
              <label className="wfield__label">¿QUÉ DOCUMENTOS PROCESA?</label>
              <textarea className="wfield__input wfield__textarea" rows={2}
                placeholder="Ej: facturas PDF, contratos escaneados…"
                value={d.est_idp_documentos ?? ''}
                onChange={e => set('est_idp_documentos', e.target.value)} />
            </div>
            <div className="wrow">
              <div className="wfield">
                <label className="wfield__label">VOLUMEN MENSUAL (DOCUMENTOS)</label>
                <input type="number" min={0} className="wfield__input" placeholder="Ej: 3000"
                  value={d.est_idp_volumen_mensual ?? ''}
                  onChange={e => set('est_idp_volumen_mensual', num(e.target.value))} />
              </div>
              <div className="wfield">
                <label className="wfield__label">COSTO MENSUAL ($)</label>
                <input type="number" min={0} step={0.01} className="wfield__input" placeholder="Ej: 80.00"
                  value={(d as any).est_costo_mensual_idp ?? ''}
                  onChange={e => set('est_costo_mensual_idp' as any, num(e.target.value))} />
              </div>
            </div>
          </>
        )}

        {saved && <InteraccionesSection {...int}  defaultValue="Estimacion" />}
      </div>

      <StepSaveRow
        onSave={onSave}
        saving={saving}
        saved={saved}
        labels={{ idle: 'Guardar Estimación', saved: 'Guardado' }}
      />
    </div>
  );
};