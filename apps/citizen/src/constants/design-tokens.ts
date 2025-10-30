export const Colors = {
  primary: "#0A0A0A",
  text: "#0A0A0A",
  textSecondary: "#666666",
  textTertiary: "#999999",
  textInverse: "#FFFFFF",
  background: "#FAFAFA",
  cardBackground: "#FFFFFF",
  border: "#E5E5E5",
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const BorderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
} as const;

export const Typography = {
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 16,
    xl: 18,
    xxl: 22,
    xxxl: 28,
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
} as const;
