import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Palette, X, RotateCcw, Check, ChevronDown, ChevronUp,
  Maximize2, Minimize2, Upload, Trash2, Image,
} from 'lucide-react';
import {
  useTheme, PRESETS, FONT_FAMILIES, DEFAULT_TYPOGRAPHY,
} from '../Context/ThemeContext';
import '../Styles/ThemePanel.css';
import type { BgFit, RadiusScale, ThemeId, ThemeTokens } from '../Interfaces/i_theme';


const COLOR_TOKENS: { key: keyof ThemeTokens; label: string; group: string }[] = [
  { key: 'bg',            label: 'Fondo principal',   group: 'Base'    },
  { key: 'card',          label: 'Tarjetas',           group: 'Base'    },
  { key: 'border',        label: 'Bordes',             group: 'Base'    },
  { key: 'text',          label: 'Texto principal',    group: 'Base'    },
  { key: 'graySecondary', label: 'Texto secundario',   group: 'Base'    },
  { key: 'green',         label: 'Acento principal',   group: 'Acento'  },
  { key: 'greenText',     label: 'Texto de acento',    group: 'Acento'  },
  { key: 'light',         label: 'Acento suave',       group: 'Acento'  },
  { key: 'danger',        label: 'Error / Peligro',    group: 'Estados' },
  { key: 'dangerHover',   label: 'Peligro (hover)',    group: 'Estados' },
  { key: 'sidebarBg',     label: 'Fondo sidebar',      group: 'Sidebar' },
  { key: 'sidebarText',   label: 'Texto sidebar',      group: 'Sidebar' },
  { key: 'sidebarActive', label: 'Activo sidebar',     group: 'Sidebar' },
];

const PRESET_LIST: { id: Exclude<ThemeId, 'custom'>; dot: string }[] = [
  { id: 'light',    dot: '#95B359' },
  { id: 'dark',     dot: '#A3C468' },
  { id: 'midnight', dot: '#7C6FFF' },
  { id: 'forest',   dot: '#4CAF72' },
  { id: 'slate',    dot: '#22D3EE' },
  { id: 'sunset',   dot: '#FF6B35' },
  { id: 'ocean',    dot: '#00C9A7' },
  { id: 'graphite', dot: '#E8A020' },
];

const RADIUS_OPTIONS: { value: RadiusScale; label: string; preview: string }[] = [
  { value: 'sharp', label: 'Angular', preview: '2px'  },
  { value: 'soft',  label: 'Suave',   preview: '8px'  },
  { value: 'round', label: 'Redondo', preview: '16px' },
];

const BG_FIT_OPTIONS: { value: BgFit; label: string }[] = [
  { value: 'cover',   label: 'Cubrir'   },
  { value: 'contain', label: 'Contener' },
  { value: 'repeat',  label: 'Repetir'  },
  { value: 'center',  label: 'Centrar'  },
];

const SECTIONS = ['Temas', 'Tipografía', 'Colores', 'Fondo', 'Efectos'] as const;
type Section = typeof SECTIONS[number];

function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const g = item[key] as string;
    (acc[g] = acc[g] ?? []).push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

const Slider = ({ label, value, min, max, step = 1, unit = '', onChange }: {
  label: string; value: number; min: number; max: number;
  step?: number; unit?: string; onChange: (v: number) => void;
}) => (
  <div className="tp__slider-row">
    <div className="tp__slider-header">
      <span className="tp__slider-label">{label}</span>
      <span className="tp__slider-value">{typeof value === 'number' ? value.toFixed(step < 1 ? 2 : 0) : value}{unit}</span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      className="tp__slider"
      onChange={e => onChange(parseFloat(e.target.value))}
    />
  </div>
);

const Toggle = ({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) => (
  <label className="tp__toggle">
    <span>{label}</span>
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
    <span className="tp__toggle-track" />
  </label>
);

export const ThemePanel = ({ collapsed }: { collapsed: boolean }) => {
  const {
    theme, setPreset, setToken, setRadius, setTypography,
    setSidebarBlur, setAccentGlow, setBgImage, setCardOpacity,resetAll,
  } = useTheme();

  const [open, setOpen]             = useState(false);
  const [expanded, setExpanded]     = useState(false);
  const [section, setSection]       = useState<Section>('Temas');
  const [colorGroup, setColorGroup] = useState<string | null>('Base');
  const [confirmReset, setConfirmReset] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const fileRef  = useRef<HTMLInputElement>(null);

  const handleOutside = useCallback((e: MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      setOpen(false);
      setExpanded(false);
    }
  }, []);

  useEffect(() => {
    if (open) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open, handleOutside]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      setBgImage({ dataUrl, opacity: theme.bgImage?.opacity ?? 0.15, fit: 'cover', blur: 0 });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (collapsed) return null;

  const groups = groupBy(COLOR_TOKENS, 'group');
  const ty = theme.typography;

  const panelClass = [
    'tp__panel',
    open     ? 'tp__panel--open'     : '',
    expanded ? 'tp__panel--expanded' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="tp" ref={panelRef}>
      <button className="tp__trigger" onClick={() => setOpen(o => !o)}>
        <Palette size={15} />
        <span>Apariencia</span>
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      <div className={panelClass}>
        {/* ── header ── */}
        <div className="tp__head">
          <span className="tp__head-title">Personalización</span>
          <div className="tp__head-actions">
            <button
              className="tp__icon-btn"
              title={expanded ? 'Compactar' : 'Expandir'}
              onClick={() => setExpanded(e => !e)}
            >
              {expanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
            <button
              className="tp__icon-btn tp__icon-btn--danger"
              title="Restaurar todo"
              onClick={() => setConfirmReset(true)}
            >
              <RotateCcw size={13} />
            </button>
            <button className="tp__icon-btn" onClick={() => { setOpen(false); setExpanded(false); }}>
              <X size={13} />
            </button>
          </div>
        </div>

        {confirmReset && (
          <div className="tp__confirm">
            <span>¿Restaurar todo al tema Claro?</span>
            <div className="tp__confirm-btns">
              <button onClick={() => setConfirmReset(false)}>Cancelar</button>
              <button className="tp__confirm-ok" onClick={() => { resetAll(); setConfirmReset(false); }}>
                Restaurar
              </button>
            </div>
          </div>
        )}

        {/* ── nav tabs ── */}
        <div className="tp__tabs">
          {SECTIONS.map(s => (
            <button
              key={s}
              className={`tp__tab ${section === s ? 'tp__tab--active' : ''}`}
              onClick={() => setSection(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {/* ── content ── */}
        <div className="tp__content">

          {/* TEMAS */}
          {section === 'Temas' && (
            <div className="tp__theme-grid">
              {PRESET_LIST.map(({ id, dot }) => (
                <button
                  key={id}
                  className={`tp__theme-card ${theme.id === id ? 'tp__theme-card--active' : ''}`}
                  onClick={() => setPreset(id)}
                >
                  <span className="tp__theme-swatch" style={{ background: dot }} />
                  <span className="tp__theme-name">{PRESETS[id].name}</span>
                  {theme.id === id && <Check size={11} className="tp__theme-check" />}
                </button>
              ))}
              {theme.id === 'custom' && (
                <div className="tp__theme-card tp__theme-card--custom tp__theme-card--active">
                  <span className="tp__theme-swatch" style={{ background: theme.tokens.green }} />
                  <span className="tp__theme-name">Personalizado</span>
                  <Check size={11} className="tp__theme-check" />
                </div>
              )}
            </div>
          )}

          {/* TIPOGRAFÍA */}
          {section === 'Tipografía' && (
            <div className="tp__typo">
              <div className="tp__field">
                <label className="tp__field-label">Fuente</label>
                <select
                  className="tp__select"
                  value={ty.fontFamily}
                  onChange={e => setTypography({ fontFamily: e.target.value })}
                >
                  {FONT_FAMILIES.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div className="tp__typo-preview" style={{ fontFamily: `'${ty.fontFamily}', sans-serif` }}>
                Gestión de proyectos CRM
              </div>
              <Slider label="Tamaño base" value={ty.fontSize} min={11} max={20} unit="px"
                onChange={v => setTypography({ fontSize: v })} />
              <Slider label="Altura de línea" value={ty.lineHeight} min={1.2} max={2.0} step={0.05}
                onChange={v => setTypography({ lineHeight: v })} />
              <Slider label="Peso tipográfico" value={ty.fontWeight} min={300} max={700} step={100}
                onChange={v => setTypography({ fontWeight: v })} />
              <Slider label="Espaciado entre letras" value={ty.letterSpacing} min={-0.05} max={0.15} step={0.01} unit="em"
                onChange={v => setTypography({ letterSpacing: v })} />
              <button className="tp__reset-btn" onClick={() => setTypography(DEFAULT_TYPOGRAPHY)}>
                <RotateCcw size={11} /> Restaurar tipografía
              </button>
            </div>
          )}

          {/* COLORES */}
          {section === 'Colores' && (
            <div className="tp__colors">
              {Object.entries(groups).map(([group, tokens]) => (
                <div key={group} className="tp__cgroup">
                  <button
                    className="tp__cgroup-hdr"
                    onClick={() => setColorGroup(g => g === group ? null : group)}
                  >
                    <span>{group}</span>
                    {colorGroup === group ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  </button>
                  {colorGroup === group && (
                    <div className="tp__cgroup-body">
                      {tokens.map(({ key, label }) => (
                        <div key={key} className="tp__crow">
                          <span className="tp__crow-label">{label}</span>
                          <div className="tp__crow-right">
                            <input
                              type="color"
                              value={theme.tokens[key].startsWith('#') ? theme.tokens[key] : '#000000'}
                              onChange={e => setToken(key, e.target.value)}
                              className="tp__color-swatch"
                            />
                            <span className="tp__crow-hex">{theme.tokens[key]}</span>
                            <button
                              className="tp__crow-reset"
                              title="Restaurar"
                              onClick={() => {
                                const base = theme.id !== 'custom' ? theme.id : 'light';
                                setToken(key, PRESETS[base as Exclude<ThemeId, 'custom'>].tokens[key]);
                              }}
                            >
                              <RotateCcw size={10} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* FONDO */}
          {section === 'Fondo' && (
            <div className="tp__bg">
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleUpload} />

              {!theme.bgImage ? (
                <button className="tp__upload-btn" onClick={() => fileRef.current?.click()}>
                  <Upload size={16} />
                  <span>Subir imagen de fondo</span>
                  <span className="tp__upload-hint">JPG, PNG, WEBP, GIF</span>
                </button>
              ) : (
                <>
                  <div className="tp__bg-preview">
                    <img src={theme.bgImage.dataUrl} alt="fondo" />
                    <button className="tp__bg-remove" onClick={() => setBgImage(null)} title="Quitar imagen">
                      <Trash2 size={13} />
                    </button>
                    <button className="tp__bg-change" onClick={() => fileRef.current?.click()} title="Cambiar imagen">
                      <Image size={13} />
                    </button>
                  </div>
                  <Slider label="Opacidad" value={theme.bgImage.opacity} min={0} max={1} step={0.01}
                    onChange={v => setBgImage({ ...theme.bgImage!, opacity: v })} />
                  <Slider label="Desenfoque" value={theme.bgImage.blur} min={0} max={20} step={1} unit="px"
                    onChange={v => setBgImage({ ...theme.bgImage!, blur: v })} />
                  <div className="tp__field">
                    <label className="tp__field-label">Ajuste de imagen</label>
                    <div className="tp__segmented">
                      {BG_FIT_OPTIONS.map(({ value, label }) => (
                        <button
                          key={value}
                          className={`tp__seg-btn ${theme.bgImage!.fit === value ? 'tp__seg-btn--active' : ''}`}
                          onClick={() => setBgImage({ ...theme.bgImage!, fit: value as BgFit })}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Slider label="Opacidad de tarjetas" value={theme.cardOpacity} min={0.3} max={1} step={0.01}
                onChange={setCardOpacity} />
            </div>
          )}

          {/* EFECTOS */}
          {section === 'Efectos' && (
            <div className="tp__effects">
              <div className="tp__field">
                <label className="tp__field-label">Radio de bordes</label>
                <div className="tp__radius-grid">
                  {RADIUS_OPTIONS.map(({ value, label, preview }) => (
                    <button
                      key={value}
                      className={`tp__radius-card ${theme.radius === value ? 'tp__radius-card--active' : ''}`}
                      onClick={() => setRadius(value)}
                    >
                      <span className="tp__radius-box" style={{ borderRadius: preview }} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="tp__toggles">
                <Toggle label="Blur en sidebar"  checked={theme.sidebarBlur} onChange={setSidebarBlur} />
                <Toggle label="Brillo en acento" checked={theme.accentGlow}  onChange={setAccentGlow}  />
              </div>
            </div>
          )}

        </div>

        <div className="tp__foot">
          <span className="tp__foot-label">
            {theme.name} · {theme.typography.fontFamily} {theme.typography.fontSize}px · {theme.density}
          </span>
        </div>
      </div>
    </div>
  );
};