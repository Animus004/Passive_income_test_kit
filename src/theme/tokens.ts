export interface ColorTheme {
  name: string;
  bg: string;        // 60% canvas background
  primary: string;   // 30% main shape / card fill
  accent: string;    // 10% highlight / badge / pop element
  ink: string;       // Thick 5-8px outline & shadows (#141414 or dark indigo)
  text: string;      // Caption / text color
  cardBg?: string;   // Optional secondary card fill
}

const rawColors: Record<string, string> = {
  black: '#000000',
  white: '#FFFFFF',
  primary: '#38BDF8',
  gold: '#FDE047',
  coral: '#F87171',
  mint: '#34D399',
  ink: '#000000',
  electricCyan: '#38BDF8',
  sunnyGold: '#FDE047',
  sunsetCoral: '#F87171',
  mintEmerald: '#34D399',
  warmTangerine: '#FB923C',
  pureWhite: '#FFFFFF',
  pureBlack: '#000000',
  midnightIndigo: '#1E1B4B',
};

// Fallback palette for LLM hallucinations like colors.red[500], colors.slate[800], colors.gray[950]
const colorPaletteFallbacks: Record<string, Record<string | number, string>> = {
  red: { 50: '#FEF2F2', 100: '#FEE2E2', 200: '#FECACA', 300: '#FCA5A5', 400: '#F87171', 500: '#EF4444', 600: '#DC2626', 700: '#B91C1C', 800: '#991B1B', 900: '#7F1D1D' },
  blue: { 50: '#EFF6FF', 100: '#DBEAFE', 200: '#BFDBFE', 300: '#93C5FD', 400: '#60A5FA', 500: '#3B82F6', 600: '#2563EB', 700: '#1D4ED8', 800: '#1E40AF', 900: '#1E3A8A' },
  cyan: { 50: '#ECFEFF', 100: '#CFFAFE', 200: '#A5F3FC', 300: '#67E8F9', 400: '#22D3EE', 500: '#06B6D4', 600: '#0891B2', 700: '#0E7490', 800: '#155E75', 900: '#164E63' },
  green: { 50: '#F0FDF4', 100: '#DCFCE7', 200: '#BBF7D0', 300: '#86EFAC', 400: '#4ADE80', 500: '#22C55E', 600: '#16A34A', 700: '#15803D', 800: '#166534', 900: '#14532D' },
  emerald: { 50: '#ECFDF5', 100: '#D1FAE5', 200: '#A7F3D0', 300: '#6EE7B7', 400: '#34D399', 500: '#10B981', 600: '#059669', 700: '#047857', 800: '#065F46', 900: '#064E3B' },
  yellow: { 50: '#FEFCE8', 100: '#FEF9C3', 200: '#FEF08A', 300: '#FDE047', 400: '#FACC15', 500: '#EAB308', 600: '#CA8A04', 700: '#A16207', 800: '#854D0E', 900: '#713F12' },
  amber: { 50: '#FFFBEB', 100: '#FEF3C7', 200: '#FDE68A', 300: '#FCD34D', 400: '#FBBF24', 500: '#F59E0B', 600: '#D97706', 700: '#B45309', 800: '#92400E', 900: '#78350F' },
  orange: { 50: '#FFF7ED', 100: '#FFEDD5', 200: '#FED7AA', 300: '#FDBA74', 400: '#FB923C', 500: '#F97316', 600: '#EA580C', 700: '#C2410C', 800: '#9A3412', 900: '#7C2D12' },
  lime: { 50: '#F7FEE7', 100: '#ECFCCB', 200: '#D9F99D', 300: '#BEF264', 400: '#A3E635', 500: '#84CC16', 600: '#65A30D', 700: '#4D7C0F', 800: '#3F6212', 900: '#365314' },
  teal: { 50: '#F0FDFA', 100: '#CCFBF1', 200: '#99F6E4', 300: '#5EEAD4', 400: '#2DD4BF', 500: '#14B8A6', 600: '#0D9488', 700: '#0F766E', 800: '#115E59', 900: '#134E4A' },
  slate: { 50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1', 400: '#94A3B8', 500: '#64748B', 600: '#475569', 700: '#334155', 800: '#1E293B', 900: '#0F172A' },
  gray: { 50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB', 300: '#D1D5DB', 400: '#9CA3AF', 500: '#6B7280', 600: '#4B5563', 700: '#374151', 800: '#1F2937', 900: '#111827', 950: '#0B0F19' },
  stone: { 50: '#FAFAF9', 100: '#F5F5F4', 200: '#E7E5E4', 300: '#D6D3D1', 400: '#A8A29E', 500: '#78716C', 600: '#57534E', 700: '#44403C', 800: '#292524', 900: '#1C1917' },
  purple: { 50: '#FAF5FF', 100: '#F3E8FF', 200: '#E9D5FF', 300: '#D8B4FE', 400: '#C084FC', 500: '#A855F7', 600: '#9333EA', 700: '#7E22CE', 800: '#6B21A8', 900: '#581C87' },
  pink: { 50: '#FDF2F8', 100: '#FCE7F3', 200: '#FBCFE8', 300: '#F472B6', 400: '#F472B6', 500: '#EC4899', 600: '#DB2777', 700: '#BE185D', 800: '#9D174D', 900: '#831843' },
};

// Bulletproof Proxy: Allows both colors.gold (#FDE047) AND colors.red[500] without runtime crashes!
export const colors: any = new Proxy(rawColors, {
  get(target: any, prop: string | symbol) {
    if (typeof prop === 'string') {
      if (prop in target) return target[prop];
      if (prop in colorPaletteFallbacks) {
        return colorPaletteFallbacks[prop];
      }
      // Ultimate fallback: returns self-proxying string so any further [index] returns valid hex
      return new Proxy({}, {
        get(_, shade) {
          return '#141414';
        },
        toString() {
          return '#141414';
        }
      });
    }
    return target[prop];
  }
});

export const tokens = {
  colors,
  fontFamilies: {
    cartoon: 'Impact, Arial Black, sans-serif',
    comic: 'Impact, Arial Black, sans-serif',
    body: 'Arial Black, sans-serif',
    heading: 'Impact, Arial Black, sans-serif',
    primary: 'Impact, Arial Black, sans-serif',
    main: 'Impact, Arial Black, sans-serif',
  },
  fontFamily: {
    cartoon: 'Impact, Arial Black, sans-serif',
    comic: 'Impact, Arial Black, sans-serif',
    body: 'Arial Black, sans-serif',
    heading: 'Impact, Arial Black, sans-serif',
    primary: 'Impact, Arial Black, sans-serif',
    main: 'Impact, Arial Black, sans-serif',
  },
  fonts: {
    primary: 'Impact, Arial Black, sans-serif',
    heading: 'Impact, Arial Black, sans-serif',
    body: 'Arial Black, sans-serif',
    comic: 'Impact, Arial Black, sans-serif',
    main: 'Impact, Arial Black, sans-serif',
  },
  font: {
    family: 'Impact, Arial Black, sans-serif',
    heading: 'Impact, Arial Black, sans-serif',
    body: 'Arial Black, sans-serif',
  },
};

export const fontFamilies = tokens.fontFamilies;
export const fontFamily = tokens.fontFamily;
export const fonts = tokens.fonts;
export const font = tokens.font;
export default tokens;

const rawThemes: Record<string, ColorTheme> = {
  SUNNY_GOLD: {
    name: 'SUNNY_GOLD',
    bg: '#FFF4CC',
    primary: '#FFB800',
    accent: '#FF4D4D',
    ink: '#141414',
    text: '#141414',
    cardBg: '#FFFFFF',
  },
  ELECTRIC_CYAN: {
    name: 'ELECTRIC_CYAN',
    bg: '#E0F7FA',
    primary: '#00BCD4',
    accent: '#FF6D00',
    ink: '#141414',
    text: '#141414',
    cardBg: '#FFFFFF',
  },
  MIDNIGHT_INDIGO: {
    name: 'MIDNIGHT_INDIGO',
    bg: '#1E1B4B',
    primary: '#6366F1',
    accent: '#FACC15',
    ink: '#0F0E17',
    text: '#FFFFFF',
    cardBg: '#2E2B6B',
  },
  MINT_EMERALD: {
    name: 'MINT_EMERALD',
    bg: '#DCFCE7',
    primary: '#10B981',
    accent: '#EC4899',
    ink: '#141414',
    text: '#141414',
    cardBg: '#FFFFFF',
  },
  SUNSET_CORAL: {
    name: 'SUNSET_CORAL',
    bg: '#FFE8E0',
    primary: '#FF6F61',
    accent: '#00BCD4',
    ink: '#141414',
    text: '#141414',
    cardBg: '#FFFFFF',
  },
  NIGHT_SKY: {
    name: 'MIDNIGHT_INDIGO',
    bg: '#1E1B4B',
    primary: '#6366F1',
    accent: '#FACC15',
    ink: '#0F0E17',
    text: '#FFFFFF',
    cardBg: '#2E2B6B',
  },
};

// Bulletproof Proxy: Returns MIDNIGHT_INDIGO or SUNNY_GOLD if non-existent theme is requested
export const COLOR_THEMES: Record<string, ColorTheme> = new Proxy(rawThemes, {
  get(target, prop: string | symbol) {
    if (typeof prop === 'string') {
      if (prop in target) return target[prop];
      return target.SUNNY_GOLD;
    }
    return (target as any)[prop];
  }
});
