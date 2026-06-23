/**
 * Goat Farm Design System — Earthy Edition
 *
 * Forest green + clay/terracotta accent + warm sand surfaces. Tuned for
 * livestock/field use: high contrast, generous tap targets, sunlight-readable.
 * Same token structure as the doctor-both design system so the shared/ui kit
 * ports over cleanly.
 */

export const palette = {
  // Primary ink — graphite / charcoal (bold, rugged; distinct brand identity)
  ink: {
    900: "#1A1A1C",
    800: "#242427",
    700: "#313135",
    600: "#45454A",
    500: "#5E5E64",
    400: "#7E7E85",
    300: "#A2A2A8",
    200: "#C8C8CC",
    100: "#E5E5E8",
    50: "#F2F2F3",
  },

  // Accent — clay / terracotta (warm earthen, not orange-bright)
  amber: {
    900: "#2F170C",
    800: "#552A17",
    700: "#7C3E22",
    600: "#A2522D",
    500: "#C2683B", // Primary accent
    400: "#CF7650",
    300: "#DB9170",
    200: "#E8B49B",
    100: "#F4D6C7",
    50: "#FBEFE9",
  },

  // Warm neutrals — sand, oat, parchment
  neutral: {
    0: "#FFFFFF",
    50: "#FAF7F0",
    100: "#F4EEE1",
    200: "#EBE1CC",
    300: "#DDCFB0",
    400: "#C9B68C",
    500: "#8C8163",
    600: "#5C6B61",
    700: "#3D453C",
    800: "#252A22",
    900: "#10130E",
  },

  surface: {
    primary: "#FFFFFF",
    secondary: "#FAF7F0",
    tertiary: "#F4EEE1",
    raised: "#FFFFFF",
    sunken: "#F4EEE1",
    dark: "#1A1A1C",
    darkRaised: "#242427",
  },

  text: {
    primary: "#1A1A1C",
    secondary: "#45454A",
    tertiary: "#5E5E64",
    disabled: "#A09A88",
    inverse: "#FFFFFF",
    accent: "#A2522D",
  },

  border: {
    subtle: "#F0EADC",
    default: "#EBE1CC",
    strong: "#DDCFB0",
    focus: "#C2683B",
    dark: "#313135",
  },

  // Semantic — herd health and billing states
  success: { bg: "#EBF3EC", text: "#255A31", border: "#CFE2D1" },
  warning: { bg: "#FBF3E6", text: "#8A5A1C", border: "#F0DEBE" },
  danger: { bg: "#FCEEEA", text: "#9B3A1F", border: "#F2D2C7" },
  info: { bg: "#EAF1F3", text: "#3F5A6A", border: "#D3DEE3" },
} as const;

export const spacing = {
  "0": 0,
  px: 1,
  "0.5": 2,
  "1": 4,
  "1.5": 6,
  "2": 8,
  "2.5": 10,
  "3": 12,
  "3.5": 14,
  "4": 16,
  "5": 20,
  "6": 24,
  "7": 28,
  "8": 32,
  "9": 36,
  "10": 40,
  "12": 48,
  "14": 56,
  "16": 64,
  "20": 80,
} as const;

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 28,
  full: 9999,
} as const;

export const typography = {
  display: {
    large: {
      fontSize: 40,
      lineHeight: 48,
      fontWeight: "700" as const,
      letterSpacing: -0.5,
    },
    medium: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: "700" as const,
      letterSpacing: -0.4,
    },
    small: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: "700" as const,
      letterSpacing: -0.3,
    },
  },
  heading: {
    h1: {
      fontSize: 24,
      lineHeight: 30,
      fontWeight: "700" as const,
      letterSpacing: -0.4,
    },
    h2: {
      fontSize: 20,
      lineHeight: 26,
      fontWeight: "600" as const,
      letterSpacing: -0.3,
    },
    h3: {
      fontSize: 17,
      lineHeight: 22,
      fontWeight: "600" as const,
      letterSpacing: -0.2,
    },
    h4: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "600" as const,
      letterSpacing: -0.1,
    },
  },
  body: {
    large: { fontSize: 17, lineHeight: 26, fontWeight: "400" as const },
    default: { fontSize: 15, lineHeight: 22, fontWeight: "400" as const },
    small: { fontSize: 13, lineHeight: 18, fontWeight: "400" as const },
  },
  label: {
    large: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "600" as const,
      letterSpacing: -0.1,
    },
    medium: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "600" as const,
      letterSpacing: 0,
    },
    small: {
      fontSize: 11,
      lineHeight: 16,
      fontWeight: "600" as const,
      letterSpacing: 0.2,
    },
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500" as const,
    letterSpacing: 0.1,
  },
  overline: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700" as const,
    letterSpacing: 1.2,
    textTransform: "uppercase" as const,
  },
} as const;

export const shadows = {
  none: {},
  xs: {
    shadowColor: "#1A1A1C",
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  sm: {
    shadowColor: "#1A1A1C",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  md: {
    shadowColor: "#1A1A1C",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  lg: {
    shadowColor: "#1A1A1C",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  xl: {
    shadowColor: "#1A1A1C",
    shadowOpacity: 0.12,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
} as const;

export const motion = {
  duration: { fast: 150, medium: 250, slow: 400 },
  spring: {
    gentle: { damping: 18, stiffness: 180 },
    default: { damping: 20, stiffness: 220 },
    bouncy: { damping: 12, stiffness: 200 },
    crisp: { damping: 25, stiffness: 300 },
  },
} as const;

/**
 * Gradients — 2026 "atmospheric" backgrounds. Each is an ordered color stop
 * array consumed by expo-linear-gradient (`colors={gradients.hero}`).
 * Pair with the default {x:0,y:0}→{x:1,y:1} direction for a soft diagonal.
 */
export const gradients = {
  // Graphite hero — the signature dark surface for headers / feature cards.
  hero: ["#313135", "#1A1A1C", "#121214"] as const,
  // Graphite, slightly lighter for raised dark cards.
  forest: ["#34343A", "#1F1F22"] as const,
  // Clay accent — for the primary metric / call-to-action surfaces.
  clay: ["#CF7650", "#C2683B", "#A2522D"] as const,
  // Warm sand — barely-there sheen for light bento tiles.
  sand: ["#FFFFFF", "#FAF7F0"] as const,
  // Subtle warm-neutral tint for "open/active" module tiles.
  moss: ["#F4F2EE", "#ECE9E3"] as const,
} as const;

/**
 * Glass — translucent overlay surfaces (2026 glassmorphism). Use on top of
 * imagery or gradients; pair with `expo-blur` if a real blur is wanted, else
 * the rgba fill alone reads as a frosted panel over busy backgrounds.
 */
export const glass = {
  light: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderColor: "rgba(255,255,255,0.22)",
    borderWidth: 1,
  },
  lighter: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
  },
  dark: {
    backgroundColor: "rgba(10,30,16,0.32)",
    borderColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
  },
} as const;

/**
 * Elevation — Apple-HIG-style z-axis layers for 2026 spatial depth. Compose
 * over a card the same way `shadows.*` is spread; "raised" and "overlay" carry
 * progressively stronger, softer shadows so hierarchy reads by depth not color.
 */
export const elevation = {
  base: shadows.xs, // content sitting on the page
  raised: shadows.md, // interactive cards / bento tiles
  floating: shadows.lg, // popovers, the floating action surfaces
  overlay: shadows.xl, // modals, sheets, the very top layer
} as const;

export const layout = {
  screenPadding: 20,
  cardPadding: 20,
  sectionGap: 32,
  itemGap: 12,
  tabBarHeight: 80,
  tabBarClearance: 110,
  // Filter/segment chips — fixed-height boxes that center their label so text
  // never clips regardless of font metrics. Used by ChipsRow and inline chips.
  chipHeight: 36,
  chipRowHeight: 44,
} as const;
