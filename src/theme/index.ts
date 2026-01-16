/**
 * Theme system for ThreadBound
 * Provides consistent colors, typography, and spacing
 */

export const colors = {
  // Primary palette
  primary: '#e94560',
  primaryDark: '#c73a52',
  primaryLight: '#ff6b81',

  // Background colors
  background: '#16213e',
  surface: '#1a1a2e',
  surfaceLight: '#2d3561',

  // Text colors
  textPrimary: '#ffffff',
  textSecondary: '#e0e0e0',
  textMuted: '#8b8b8b',

  // Status colors
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',

  // Misc
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

export const typography = {
  // Font sizes
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 32,
  },
  // Font weights
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
};

export const shadows = {
  small: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Dark mode colors (for future implementation)
export const darkModeColors = {
  ...colors,
  // Already dark themed, but can be adjusted
};

// Light mode colors (for future implementation)
export const lightModeColors = {
  background: '#f5f5f5',
  surface: '#ffffff',
  surfaceLight: '#e0e0e0',
  textPrimary: '#1a1a2e',
  textSecondary: '#424242',
  textMuted: '#757575',
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
};
