import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import type { BgImage, Density, RadiusScale, ThemeConfig, ThemeId, ThemeTokens, Typography } from '../Interfaces/i_theme';

const RADIUS_MAP: Record<RadiusScale, { sm: string; md: string }> = {
  sharp: { sm: '4px',  md: '6px'  },
  soft:  { sm: '8px',  md: '12px' },
  round: { sm: '14px', md: '20px' },
};

const DENSITY_MAP: Record<Density, { spacing: string; itemPy: string }> = {
  compact:  { spacing: '0.75',  itemPy: '3px'  },
  normal:   { spacing: '1',     itemPy: '5.5px'},
  spacious: { spacing: '1.3',   itemPy: '8px'  },
};

export const DEFAULT_TYPOGRAPHY: Typography = {
  fontFamily:    'DM Sans',
  fontSize:      14,
  lineHeight:    1.55,
  fontWeight:    400,
  letterSpacing: 0,
};

export const FONT_FAMILIES = [
  'DM Sans', 'Inter', 'Roboto', 'Poppins', 'Nunito',
  'IBM Plex Sans', 'Geist', 'Outfit', 'Plus Jakarta Sans', 'Sora',
];

const base = (tokens: ThemeTokens, id: ThemeId, name: string, radius: RadiusScale, extra: Partial<ThemeConfig> = {}): ThemeConfig => ({
  id, name, tokens, radius,
  typography:   DEFAULT_TYPOGRAPHY,
  sidebarBlur:  false,
  accentGlow:   false,
  bgImage:      null,
  cardOpacity:  1,
  density:      'normal',
  sidebarWidth: 230,
  ...extra,
});

export const PRESETS: Record<Exclude<ThemeId, 'custom'>, ThemeConfig> = {

  light: base({
    gray: '#666666', dark: '#2F3D4D', mid: '#3D5166', light: '#779CAB',
    green: '#95B359', bg: '#F4F6F8', card: '#ffffff', border: '#E2E8EE',
    text: '#2F3D4D', graySecondary: '#8A99AA', white: '#fff',
    danger: '#E05C5C', dangerHover: '#c04040', greenText: '#5e8a1e',
    placeholder: '#C8D2DB',
    sidebarBg: '#1E2D3D', sidebarText: '#8DA8B8',
    sidebarActive: '#95B359', sidebarHover: 'rgba(149,179,89,0.12)',
  }, 'light', 'Claro', 'soft'),

  /* Dark: fondo más rico, card con más separación, contraste mejorado */
  dark: base({
    gray: '#8A99AA', dark: '#A3C468', mid: '#2D7A4F', light: '#94A3B8',
    green: '#A3C468', bg: '#111820', card: '#111820', border: '#243347',
    text: '#615858', graySecondary: '#5E7080', white: '#E2E8EE',
    danger: '#F07070', dangerHover: '#D44040', greenText: '#A3C468',
    placeholder: '#2E3D50',
    sidebarBg: '#0C1520', sidebarText: '#607080',
    sidebarActive: '#A3C468', sidebarHover: 'rgba(163,196,104,0.13)',
  }, 'dark', 'Oscuro', 'soft', { sidebarBlur: true, accentGlow: true }),

  /* Midnight: índigo profundo, acento violeta eléctrico */
  midnight: base({
    gray: '#6B7280', dark: '#615858', mid: '#1C1E36', light: '#9CA3C8',
    green: '#7C6FFF', bg: '#05060F', card: '#05060F', border: '#1C1E36',
    text: '#615858', graySecondary: '#5A5F80', white: '#F0F2FF',
    danger: '#FF5C5C', dangerHover: '#DC2626', greenText: '#A5A0FF',
    placeholder: '#1C1E36',
    sidebarBg: '#08091A', sidebarText: '#454870',
    sidebarActive: '#7C6FFF', sidebarHover: 'rgba(124,111,255,0.15)',
  }, 'midnight', 'Medianoche', 'sharp', { sidebarBlur: true, accentGlow: true }),

  forest: base({
    gray: '#6B7C6E', dark: '#1A2E1C', mid: '#2D7A4F', light: '#5A8060',
    green: '#4CAF72', bg: '#e0f0e3', card: '#FAFCFA', border: '#D4E4D8',
    text: '#1A2E1C', graySecondary: '#7A9B80', white: '#FAFCFA',
    danger: '#D9534F', dangerHover: '#B03A38', greenText: '#2D7A4F',
    placeholder: '#B8D4BE',
    sidebarBg: '#142016', sidebarText: '#6A9070',
    sidebarActive: '#4CAF72', sidebarHover: 'rgba(76,175,114,0.15)',
  }, 'forest', 'Bosque', 'round'),

  /* Slate: azul acero, acento cyan brillante mejorado */
  slate: base({
    gray: '#94A3B8', dark: '#22D3EE', mid: '#1C1E36', light: '#CBD5E1',
    green: '#22D3EE', bg: '#0F172A', card: '#0F172A', border: '#1E3050',
    text: '#4e527e', graySecondary: '#4A607A', white: '#F1F5F9',
    danger: '#FB7185', dangerHover: '#F43F5E', greenText: '#22D3EE',
    placeholder: '#1E3050',
    sidebarBg: '#0A1020', sidebarText: '#3D5268',
    sidebarActive: '#22D3EE', sidebarHover: 'rgba(34,211,238,0.12)',
  }, 'slate', 'Pizarra', 'soft', { sidebarBlur: true }),

  /* Sunset: cálido, naranja-coral con fondo crema oscura */
  sunset: base({
    gray: '#9A7060', dark: '#3D1A0A', mid: '#CC4400', light: '#FFAA80',
    green: '#FF6B35', bg: '#FFF8F4', card: '#FFFFFF', border: '#FFE0D0',
    text: '#3D1A0A', graySecondary: '#A0705A', white: '#FFF',
    danger: '#E53E3E', dangerHover: '#C53030', greenText: '#CC4400',
    placeholder: '#3D1A0A',
    sidebarBg: '#2D1008', sidebarText: '#80503A',
    sidebarActive: '#FF6B35', sidebarHover: 'rgba(255,107,53,0.15)',
  }, 'sunset', 'Atardecer', 'round'),

  /* Ocean: azul profundo marino, acento teal */
  ocean: base({
    gray: '#6A8899', dark: '#2D7A4F', mid: '#2D7A4F', light: '#70A8C0',
    green: '#00C9A7', bg: '#020F18', card: '#020F18', border: '#0E2840',
    text: '#615858', graySecondary: '#3D6070',  white: '#E8F4F8',
    danger: '#FF6B6B', dangerHover: '#E53E3E', greenText: '#00C9A7',
    placeholder: '#0E2840',
    sidebarBg: '#010C14', sidebarText: '#2E5060',
    sidebarActive: '#00C9A7', sidebarHover: 'rgba(0,201,167,0.13)',
  }, 'ocean', 'Océano', 'soft', { sidebarBlur: true, accentGlow: true }),

  graphite: base({
    gray: '#8A8A8A', dark: '#E8A020', mid: '#111111', light: '#B0B0B0',
    green: '#E8A020', bg: '#1A1A1A', card: '#1A1A1A', border: '#333333',
    text: '#615858', graySecondary: '#606060', white: '#F5F5F',
    danger: '#FF5555', dangerHover: '#DD2222', greenText: '#E8A020',
    placeholder: '#333333',
    sidebarBg: '#111111', sidebarText: '#505050',
    sidebarActive: '#E8A020', sidebarHover: 'rgba(232,160,32,0.12)',
  }, 'graphite', 'Grafito', 'sharp', { accentGlow: false }),
};

interface ThemeContextValue {
  theme:          ThemeConfig;
  setPreset:      (id: Exclude<ThemeId, 'custom'>) => void;
  setToken:       (key: keyof ThemeTokens, value: string) => void;
  setRadius:      (r: RadiusScale)   => void;
  setTypography:  (patch: Partial<Typography>) => void;
  setSidebarBlur: (v: boolean)       => void;
  setAccentGlow:  (v: boolean)       => void;
  setBgImage:     (img: BgImage | null) => void;
  setCardOpacity: (v: number)        => void;
  setDensity:     (d: Density)       => void;
  setSidebarWidth:(v: number)        => void;
  resetAll:       () => void;
}

const ThemeCtx = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'crm_theme_v3';

function hex2rgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function applyTheme(t: ThemeConfig) {
  const r = document.documentElement;
  const tk = t.tokens;

  const props: [string, string][] = [
    ['--gray',            tk.gray],
    ['--dark',            tk.dark],
    ['--mid',             tk.mid],
    ['--light',           tk.light],
    ['--green',           tk.green],
    ['--bg',              tk.bg],
    ['--card',            tk.card],
    ['--border',          tk.border],
    ['--text',            tk.text],
    ['--gray-secondary',  tk.graySecondary],
    ['--white',           tk.white],
    ['--danger',          tk.danger],
    ['--danger-hover',    tk.dangerHover],
    ['--green-text',      tk.greenText],
    ['--placeholder',     tk.placeholder],
    ['--sidebar-bg',      tk.sidebarBg],
    ['--sidebar-text',    tk.sidebarText],
    ['--sidebar-active',  tk.sidebarActive],
    ['--sidebar-hover',   tk.sidebarHover],
    ['--dark-tint',       hex2rgba(tk.dark,   0.08)],
    ['--green-tint',      hex2rgba(tk.green,  0.12)],
    ['--danger-tint',     hex2rgba(tk.danger, 0.10)],
    ['--danger-border',   hex2rgba(tk.danger, 0.15)],
    ['--light-tint',      hex2rgba(tk.light,  0.10)],
    ['--light-border',    hex2rgba(tk.light,  0.20)],
  ];
  props.forEach(([k, v]) => r.style.setProperty(k, v));

  const rm = RADIUS_MAP[t.radius];
  r.style.setProperty('--radius-sm', rm.sm);
  r.style.setProperty('--radius-md', rm.md);

  const ty = t.typography;
  r.style.setProperty('--font-body',           `'${ty.fontFamily}', sans-serif`);
  r.style.setProperty('--font-size-base',      `${ty.fontSize}px`);
  r.style.setProperty('--line-height-base',    `${ty.lineHeight}`);
  r.style.setProperty('--font-weight-base',    `${ty.fontWeight}`);
  r.style.setProperty('--letter-spacing-base', `${ty.letterSpacing}em`);
  r.style.setProperty('--card-opacity',        `${t.cardOpacity}`);

  // Aplicar tipografía al body directamente para que afecte todo
  document.body.style.fontFamily    = `'${ty.fontFamily}', sans-serif`;
  document.body.style.fontSize      = `${ty.fontSize}px`;
  document.body.style.lineHeight    = `${ty.lineHeight}`;
  document.body.style.fontWeight    = `${ty.fontWeight}`;
  document.body.style.letterSpacing = `${ty.letterSpacing}em`;

  // Densidad
  const dm = DENSITY_MAP[t.density];
  r.style.setProperty('--density-spacing', dm.spacing);
  r.style.setProperty('--density-item-py', dm.itemPy);

  // Sidebar width
  r.style.setProperty('--sidebar-width', `${t.sidebarWidth}px`);

  r.setAttribute('data-theme',  t.id);
  r.setAttribute('data-radius', t.radius);

  t.accentGlow  ? r.setAttribute('data-glow', 'true')          : r.removeAttribute('data-glow');
  t.sidebarBlur ? r.setAttribute('data-sidebar-blur', 'true')  : r.removeAttribute('data-sidebar-blur');

  let bg = document.getElementById('__crm_bg__');
  if (t.bgImage) {
    if (!bg) {
      bg = document.createElement('div');
      bg.id = '__crm_bg__';
      bg.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;';
      document.body.insertBefore(bg, document.body.firstChild);
    }
    bg.style.backgroundImage    = `url(${t.bgImage.dataUrl})`;
    bg.style.backgroundSize     = t.bgImage.fit === 'repeat' ? 'auto' : t.bgImage.fit;
    bg.style.backgroundRepeat   = t.bgImage.fit === 'repeat' ? 'repeat' : 'no-repeat';
    bg.style.backgroundPosition = 'center';
    bg.style.opacity            = `${t.bgImage.opacity}`;
    bg.style.filter             = t.bgImage.blur > 0 ? `blur(${t.bgImage.blur}px)` : '';
  } else {
    bg?.remove();
  }
}

function loadTheme(): ThemeConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ThemeConfig;
      if (!parsed.typography)   parsed.typography   = DEFAULT_TYPOGRAPHY;
      if (parsed.cardOpacity == null) parsed.cardOpacity = 1;
      if (!parsed.density)      parsed.density      = 'normal';
      if (!parsed.sidebarWidth) parsed.sidebarWidth = 230;
      return parsed;
    }
  } catch {}
  return PRESETS.light;
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeConfig>(loadTheme);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    applyTheme(theme);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        const toSave = { ...theme };
        if (toSave.bgImage) {
          toSave.bgImage = { ...toSave.bgImage, dataUrl: toSave.bgImage.dataUrl.slice(0, 500_000) };
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      } catch {}
    }, 300);
  }, [theme]);

  const markCustom = (patch: Partial<ThemeConfig>): ThemeConfig =>
    ({ ...patch as ThemeConfig, id: 'custom', name: 'Personalizado' });

  const setPreset      = useCallback((id: Exclude<ThemeId, 'custom'>) => setTheme(PRESETS[id]), []);
  const setToken       = useCallback((key: keyof ThemeTokens, value: string) =>
    setTheme(p => ({ ...p, ...markCustom(p), tokens: { ...p.tokens, [key]: value } })), []);
  const setRadius      = useCallback((r: RadiusScale)            => setTheme(p => ({ ...p, radius: r })),           []);
  const setTypography  = useCallback((patch: Partial<Typography>) =>
    setTheme(p => ({ ...p, ...markCustom(p), typography: { ...p.typography, ...patch } })), []);
  const setSidebarBlur = useCallback((v: boolean)                => setTheme(p => ({ ...p, sidebarBlur: v })),      []);
  const setAccentGlow  = useCallback((v: boolean)                => setTheme(p => ({ ...p, accentGlow: v })),       []);
  const setBgImage     = useCallback((img: BgImage | null)       => setTheme(p => ({ ...p, ...markCustom(p), bgImage: img })),      []);
  const setCardOpacity = useCallback((v: number)                 => setTheme(p => ({ ...p, ...markCustom(p), cardOpacity: v })),    []);
  const setDensity     = useCallback((d: Density)                => setTheme(p => ({ ...p, density: d })),          []);
  const setSidebarWidth= useCallback((v: number)                 => setTheme(p => ({ ...p, ...markCustom(p), sidebarWidth: v })),   []);
  const resetAll       = useCallback(()                          => setTheme(PRESETS.light),                         []);

  return (
    <ThemeCtx.Provider value={{
      theme, setPreset, setToken, setRadius, setTypography,
      setSidebarBlur, setAccentGlow, setBgImage, setCardOpacity,
      setDensity, setSidebarWidth, resetAll,
    }}>
      {children}
    </ThemeCtx.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};