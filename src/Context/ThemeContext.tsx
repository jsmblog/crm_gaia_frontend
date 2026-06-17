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
  'Montserrat', 'Open Sans', 'Lato', 'Raleway', 'Merriweather',
  'Playfair Display', 'Ubuntu', 'Nunito Sans', 'Quicksand', 'Work Sans',
  'Manrope', 'Lexend', 'Geist', 'Outfit', 'Sora',
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

  dark: base({
    gray: '#8A99AA', dark: '#A3C468', mid: '#2D7A4F', light: '#94A3B8',
    green: '#A3C468', bg: '#111820', card: '#111820', border: '#243347',
    text: '#615858', graySecondary: '#5E7080', white: '#F0F2FF',
    danger: '#F07070', dangerHover: '#D44040', greenText: '#A3C468',
    placeholder: '#2E3D50',
    sidebarBg: '#0C1520', sidebarText: '#607080',
    sidebarActive: '#A3C468', sidebarHover: 'rgba(163,196,104,0.13)',
  }, 'dark', 'Oscuro', 'soft', { sidebarBlur: true, accentGlow: true }),

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

  slate: base({
    gray: '#94A3B8', dark: '#22D3EE', mid: '#1C1E36', light: '#CBD5E1',
    green: '#22D3EE', bg: '#0F172A', card: '#0F172A', border: '#1E3050',
    text: '#4e527e', graySecondary: '#4A607A', white: '#F1F5F9',
    danger: '#FB7185', dangerHover: '#F43F5E', greenText: '#22D3EE',
    placeholder: '#1E3050',
    sidebarBg: '#0A1020', sidebarText: '#3D5268',
    sidebarActive: '#22D3EE', sidebarHover: 'rgba(34,211,238,0.12)',
  }, 'slate', 'Pizarra', 'soft', { sidebarBlur: true }),

  sunset: base({
    gray: '#9A7060', dark: '#3D1A0A', mid: '#CC4400', light: '#FFAA80',
    green: '#FF6B35', bg: '#FFF8F4', card: '#FFFFFF', border: '#FFE0D0',
    text: '#3D1A0A', graySecondary: '#A0705A', white: '#FFF',
    danger: '#E53E3E', dangerHover: '#C53030', greenText: '#CC4400',
    placeholder: '#3D1A0A',
    sidebarBg: '#2D1008', sidebarText: '#80503A',
    sidebarActive: '#FF6B35', sidebarHover: 'rgba(255,107,53,0.15)',
  }, 'sunset', 'Atardecer', 'round'),

  ocean: base({
    gray: '#6A8899', dark: '#2D7A4F', mid: '#2D7A4F', light: '#70A8C0',
    green: '#00C9A7', bg: '#020F18', card: '#020F18', border: '#0E2840',
    text: '#615858', graySecondary: '#3D6070', white: '#E8F4F8',
    danger: '#FF6B6B', dangerHover: '#E53E3E', greenText: '#00C9A7',
    placeholder: '#0E2840',
    sidebarBg: '#010C14', sidebarText: '#2E5060',
    sidebarActive: '#00C9A7', sidebarHover: 'rgba(0,201,167,0.13)',
  }, 'ocean', 'Océano', 'soft', { sidebarBlur: true, accentGlow: true }),

  graphite: base({
    gray: '#8A8A8A', dark: '#E8A020', mid: '#111111', light: '#B0B0B0',
    green: '#E8A020', bg: '#1A1A1A', card: '#1A1A1A', border: '#333333',
    text: '#615858', graySecondary: '#606060', white: '#F5F5F5',
    danger: '#FF5555', dangerHover: '#DD2222', greenText: '#E8A020',
    placeholder: '#333333',
    sidebarBg: '#111111', sidebarText: '#505050',
    sidebarActive: '#E8A020', sidebarHover: 'rgba(232,160,32,0.12)',
  }, 'graphite', 'Grafito', 'sharp', { accentGlow: false }),

  rose: base({
    gray: '#9B7B85', dark: '#3D0F1F', mid: '#B03060', light: '#E8A0B8',
    green: '#E0437A', bg: '#FFF5F8', card: '#FFFFFF', border: '#FCDDE8',
    text: '#3D0F1F', graySecondary: '#B08090', white: '#FFFFFF',
    danger: '#DC2626', dangerHover: '#B91C1C', greenText: '#B03060',
    placeholder: '#F0C0D0',
    sidebarBg: '#2A0818', sidebarText: '#90506A',
    sidebarActive: '#E0437A', sidebarHover: 'rgba(224,67,122,0.14)',
  }, 'rose', 'Rosa', 'round'),

  amber: base({
    gray: '#8A7050', dark: '#2C1A00', mid: '#B07A00', light: '#D4A840',
    green: '#D97706', bg: '#FFFBF0', card: '#FFFFFF', border: '#F0E0B0',
    text: '#2C1A00', graySecondary: '#9A8060', white: '#FFFFFF',
    danger: '#DC2626', dangerHover: '#B91C1C', greenText: '#B07A00',
    placeholder: '#E8D090',
    sidebarBg: '#1C1000', sidebarText: '#806040',
    sidebarActive: '#D97706', sidebarHover: 'rgba(217,119,6,0.14)',
  }, 'amber', 'Ámbar', 'soft'),

  arctic: base({
    gray: '#7090A8', dark: '#0A1E30', mid: '#1A6090', light: '#90C0D8',
    green: '#0EA5E9', bg: '#F0F8FF', card: '#FFFFFF', border: '#C8E0F0',
    text: '#0A1E30', graySecondary: '#6080A0', white: '#FFFFFF',
    danger: '#EF4444', dangerHover: '#DC2626', greenText: '#0369A1',
    placeholder: '#B0D0E8',
    sidebarBg: '#050F1A', sidebarText: '#407090',
    sidebarActive: '#0EA5E9', sidebarHover: 'rgba(14,165,233,0.13)',
  }, 'arctic', 'Ártico', 'sharp'),

  sakura: base({
    gray: '#8878A0', dark: '#1E0E30', mid: '#6B3FA0', light: '#C8A8E0',
    green: '#A855F7', bg: '#FAF6FF', card: '#FFFFFF', border: '#EAD8FF',
    text: '#1E0E30', graySecondary: '#9878C0', white: '#FFFFFF',
    danger: '#E11D48', dangerHover: '#BE123C', greenText: '#7E22CE',
    placeholder: '#DCC8F8',
    sidebarBg: '#120820', sidebarText: '#604880',
    sidebarActive: '#A855F7', sidebarHover: 'rgba(168,85,247,0.14)',
  }, 'sakura', 'Sakura', 'round', { accentGlow: true }),

  neon: base({
    gray: '#406040', dark: '#00FF88', mid: '#003020', light: '#40A060',
    green: '#00FF88', bg: '#020C06', card: '#020C06', border: '#053018',
    text: '#40A060', graySecondary: '#205030', white: '#053018',
    danger: '#FF3366', dangerHover: '#CC0044', greenText: '#00FF88',
    placeholder: '#053018',
    sidebarBg: '#010804', sidebarText: '#205030',
    sidebarActive: '#00FF88', sidebarHover: 'rgba(0,255,136,0.10)',
  }, 'neon', 'Neón', 'sharp', { accentGlow: true, sidebarBlur: true }),

  copper: base({
    gray: '#8A6850', dark: '#D4722A', mid: '#2A1A0A', light: '#C89060',
    green: '#CD7F32', bg: '#120C08', card: '#1C1008', border: '#3A2010',
    text: '#C89060', graySecondary: '#604830', white: '#F5EDE0',
    danger: '#FF4444', dangerHover: '#CC2222', greenText: '#CD7F32',
    placeholder: '#3A2010',
    sidebarBg: '#0C0804', sidebarText: '#503820',
    sidebarActive: '#CD7F32', sidebarHover: 'rgba(205,127,50,0.14)',
  }, 'copper', 'Cobre', 'soft', { accentGlow: true }),
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

const TYPOGRAPHY_STYLE_ID = '__crm_typography__';

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

  let styleTag = document.getElementById(TYPOGRAPHY_STYLE_ID) as HTMLStyleElement | null;
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = TYPOGRAPHY_STYLE_ID;
    document.head.appendChild(styleTag);
  }
  styleTag.textContent = `
    html {
      font-size: ${ty.fontSize}px !important;
      line-height: ${ty.lineHeight} !important;
      font-weight: ${ty.fontWeight} !important;
      font-family: '${ty.fontFamily}', sans-serif !important;
      letter-spacing: ${ty.letterSpacing}em !important;
    }
    body {
      font-size: 1rem !important;
    }
    *, *::before, *::after {
      font-family: '${ty.fontFamily}', sans-serif !important;
      font-size: inherit !important;
      line-height: inherit !important;
      font-weight: inherit !important;
      letter-spacing: inherit !important;
    }
    h1, h2, h3, h4, h5, h6 {
      font-family: '${ty.fontFamily}', sans-serif !important;
      line-height: calc(${ty.lineHeight} * 0.9);
    }
    input, select, textarea, button, option {
      font-family: '${ty.fontFamily}', sans-serif !important;
      font-size: inherit !important;
      font-weight: inherit !important;
      letter-spacing: inherit !important;
    }
  `;

  const dm = DENSITY_MAP[t.density];
  r.style.setProperty('--density-spacing', dm.spacing);
  r.style.setProperty('--density-item-py', dm.itemPy);

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