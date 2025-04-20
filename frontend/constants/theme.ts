export const COLORS = {
  primary: '#34d399',
  primaryLight: '#6ee7b7',
  secondary: '#f8fafc',
  accent: '#f97316',
  background: '#f0fdf4',
  card: '#ffffff',
  text: '#1e293b',
  textLight: '#64748b',
  border: '#d1fae5',
  error: '#ef4444',
  success: '#22c55e',
  warning: '#eab308',

  // Gradients
  gradientStart: '#34d399',
  gradientEnd: '#10b981',

  // Neutral colors
  black: '#000000',
  darkGray: '#334155',
  gray: '#64748b',
  lightGray: '#94a3b8',
  ultraLightGray: '#f1f5f9',
  white: '#ffffff',

  // Glassmorphism
  glass: 'rgba(255, 255, 255, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.7)',
  glassHighlight: 'rgba(255, 255, 255, 0.95)',
  glassShadow: 'rgba(0, 0, 0, 0.1)',
};

export const FONTS = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
};

export const SIZES = {
  // Font sizes
  xsmall: 12,
  small: 14,
  medium: 16,
  large: 18,
  xlarge: 22,
  xxlarge: 28,
  xxxlarge: 36,

  // Spacing
  spacing: 8,
  spacingSmall: 4,
  spacingMedium: 12,
  spacingLarge: 16,
  spacingXLarge: 24,
  spacingXXLarge: 32,

  // Border radius
  borderRadiusSmall: 12,
  borderRadius: 16,
  borderRadiusLarge: 20,
  borderRadiusXLarge: 28,

  // Card styles
  cardPadding: 20,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  // Neumorphic shadow
  neumorphic: {
    shadowColor: '#b1b1b1',
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
};

export const GRADIENTS = {
  primary: ['#34d399', '#10b981'],
  secondary: ['#6ee7b7', '#34d399'],
  accent: ['#f97316', '#fb923c'],
  calming: ['#a7f3d0', '#6ee7b7'],
  hope: ['#34d399', '#059669'],
  glass: ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.4)'],
  warmGreen: ['#d1fae5', '#a7f3d0'],
};
