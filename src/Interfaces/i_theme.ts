export type ThemeId    = 'light' | 'dark' | 'midnight' | 'forest' | 'slate' | 'sunset' | 'ocean' | 'graphite' | 'custom' | 'rose' | 'amber' | 'arctic' | 'sakura' | 'neon' | 'copper';
export type RadiusScale = 'sharp' | 'soft' | 'round';
export type BgFit      = 'cover' | 'contain' | 'repeat' | 'center';
export type Density    = 'compact' | 'normal' | 'spacious';

export interface ThemeTokens {
  gray:           string;
  dark:           string;
  mid:            string;
  light:          string;
  green:          string;
  bg:             string;
  card:           string;
  border:         string;
  text:           string;
  graySecondary:  string;
  white:          string;
  danger:         string;
  dangerHover:    string;
  greenText:      string;
  placeholder:    string;
  sidebarBg:      string;
  sidebarText:    string;
  sidebarActive:  string;
  sidebarHover:   string;
}

export interface BgImage {
  dataUrl:  string;
  opacity:  number;
  fit:      BgFit;
  blur:     number;
}

export interface Typography {
  fontFamily:    string;
  fontSize:      number;
  lineHeight:    number;
  fontWeight:    number;
  letterSpacing: number;
}

export interface ThemeConfig {
  id:           ThemeId;
  name:         string;
  tokens:       ThemeTokens;
  radius:       RadiusScale;
  typography:   Typography;
  sidebarBlur:  boolean;
  accentGlow:   boolean;
  bgImage:      BgImage | null;
  cardOpacity:  number;
  density:      Density;
  sidebarWidth: number;
}
