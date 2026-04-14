/**
 * DurgSetu AI - Unified Design System
 * Central source of truth for colors, spacing, typography, and components
 */

// ─── Color Palette ───────────────────────────────────
export const COLORS = {
  // Primary
  primary: {
    50:  '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316', // Main orange
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  // Secondary
  secondary: {
    50:  '#f1f5f9',
    100: '#e2e8f0',
    200: '#cbd5e1',
    300: '#94a3b8',
    400: '#64748b',
    500: '#475569', // Slate
    600: '#334155',
    700: '#1e293b',
    800: '#0f172a',
    900: '#020617',
  },
  // Status
  status: {
    success:  '#10b981',
    warning:  '#f59e0b',
    error:    '#ef4444',
    info:     '#3b82f6',
  },
  // Semantic
  semantic: {
    safe:      '#10b981',
    low:       '#64748b',
    medium:    '#f59e0b',
    high:      '#f97316',
    critical:  '#ef4444',
  },
};

// ─── Typography ──────────────────────────────────────
export const TYPOGRAPHY = {
  fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
  sizes: {
    xs:  '0.75rem',    // 12px
    sm:  '0.875rem',   // 14px
    base: '1rem',      // 16px
    lg:  '1.125rem',   // 18px
    xl:  '1.25rem',    // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },
  weights: {
    medium:    500,
    semibold: 600,
    bold:     700,
    extrabold: 800,
    black:    900,
  },
};

// ─── Spacing ─────────────────────────────────────────
export const SPACING = {
  0:  '0',
  1:  '0.25rem',  // 4px
  2:  '0.5rem',   // 8px
  3:  '0.75rem',  // 12px
  4:  '1rem',     // 16px
  5:  '1.25rem',  // 20px
  6:  '1.5rem',   // 24px
  8:  '2rem',     // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
};

// ─── Border Radius ───────────────────────────────────
export const RADIUS = {
  sm:  '0.5rem',   // 8px
  md:  '0.75rem',  // 12px
  lg:  '1rem',     // 16px
  xl:  '1.25rem',  // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '2rem',   // 32px
  full: '9999px',
};

// ─── Shadows ─────────────────────────────────────────
export const SHADOWS = {
  sm:     '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base:   '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md:     '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg:     '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl:     '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl':  '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

// ─── Component Presets ────────────────────────────────
export const COMPONENTS = {
  // Card/Container
  card: `bg-white rounded-xl border border-slate-100 shadow-sm hover:border-orange-200 hover:shadow-md transition-all`,
  cardPrimary: `bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-orange-200 hover:-translate-y-1 hover:shadow-lg transition-all`,
  
  // Buttons
  buttonPrimary: `px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer`,
  buttonSecondary: `px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-200 rounded-xl font-semibold transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer`,
  buttonDanger: `px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-800 border border-red-200 rounded-xl font-semibold transition-all cursor-pointer`,
  
  // Inputs
  inputBase: `w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-slate-900 font-medium outline-none placeholder:text-slate-400`,
  selectBase: `w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-slate-900 font-medium outline-none appearance-none cursor-pointer`,
  
  // Badge
  badgeDefault: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border bg-slate-50 text-slate-700 border-slate-200`,
  badgeSuccess: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200`,
  badgeWarning: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-200`,
  badgeError: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border bg-red-50 text-red-700 border-red-200`,
};

// ─── Transitions ─────────────────────────────────────
export const TRANSITIONS = {
  fast: 'transition-all duration-150',
  base: 'transition-all duration-200',
  slow: 'transition-all duration-300',
  slower: 'transition-all duration-500',
};

// ─── Responsive Breakpoints ──────────────────────────
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export default {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  SHADOWS,
  COMPONENTS,
  TRANSITIONS,
  BREAKPOINTS,
};
