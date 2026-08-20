export const COLORS = {
  // Brand Core Colors (From design Visuals and YAML)
  primary: '#064E3B',                  // Deep Emerald Green (30% Structure / Active)
  onPrimary: '#FFFFFF',
  primaryContainer: '#064E3B',         // Deep Emerald Green
  onPrimaryContainer: '#80BEA6',
  
  secondary: '#FED01B',                // Dynamic Athletic Yellow (10% Action/Accent)
  onSecondary: '#003527',              // Deep Emerald contrast text
  secondaryContainer: '#FED01B',       // Dynamic Athletic Yellow
  onSecondaryContainer: '#6F5900',
  
  tertiary: '#735C00',                 // Yellowish / Bronze (from MD3 secondary)
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FED01B',
  onTertiaryContainer: '#6F5900',
  
  background: '#F9F9FF',               // Off-white Neutral background
  onBackground: '#151C27',
  
  surface: '#FFFFFF',                  // Pure white surface (from surface-container-lowest)
  onSurface: '#151C27',
  surfaceVariant: '#DCE2F3',
  onSurfaceVariant: '#404944',
  
  // Tonal Layer Containers (From MD3 YAML)
  surfaceDim: '#D3DAEA',
  surfaceBright: '#F9F9FF',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F0F3FF',
  surfaceContainer: '#E7EEFE',
  surfaceContainerHigh: '#E2E8F8',
  surfaceContainerHighest: '#DCE2F3',
  
  outline: '#707974',
  outlineVariant: '#BFC9C3',
  surfaceTint: '#2B6954',
  
  inverseSurface: '#2A313D',
  inverseOnSurface: '#EBF1FF',
  inversePrimary: '#95D3BA',
  
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#93000A',
  
  // Custom brand helpers
  brandGreen: '#064E3B',
  brandGold: '#FED01B',
  brandPrimaryDark: '#003527', // The #003527 color from YAML
  
  primaryFixed: '#B0F0D6',
  primaryFixedDim: '#95D3BA',
  onPrimaryFixed: '#002117',
  onPrimaryFixedVariant: '#0B513D',
  
  secondaryFixed: '#FFE083',
  secondaryFixedDim: '#EEC200',
  onSecondaryFixed: '#231B00',
  onSecondaryFixedVariant: '#574500',
  
  tertiaryFixed: '#FFDAD5',
  tertiaryFixedDim: '#FFB4A9',
  onTertiaryFixed: '#380D08',
  onTertiaryFixedVariant: '#6E372F',

  // Custom status text colors
  success: '#10B981',
  successText: '#10B981',
  errorText: '#BA1A1A',
  grayText: '#707974',

  // Keep other helpers used by existing pages
  primaryOpacity05: 'rgba(6, 78, 59, 0.05)',
  primaryOpacity06: 'rgba(6, 78, 59, 0.06)',
  primaryOpacity08: 'rgba(6, 78, 59, 0.08)',
  primaryOpacity10: 'rgba(6, 78, 59, 0.1)',
  primaryOpacity12: 'rgba(6, 78, 59, 0.12)',
  primaryOpacity15: 'rgba(6, 78, 59, 0.15)',
  primaryOpacity20: 'rgba(6, 78, 59, 0.2)',
  primaryOpacity25: 'rgba(6, 78, 59, 0.25)',
  primaryOpacity30: 'rgba(6, 78, 59, 0.3)',
  primaryOpacity40: 'rgba(6, 78, 59, 0.4)',

  secondaryOpacity10: 'rgba(254, 208, 27, 0.1)',
  secondaryOpacity15: 'rgba(254, 208, 27, 0.15)',
  secondaryOpacity20: 'rgba(254, 208, 27, 0.2)',

  blackOpacity05: 'rgba(0, 0, 0, 0.05)',
  blackOpacity15: 'rgba(0, 0, 0, 0.15)',
  blackOpacity20: 'rgba(0, 0, 0, 0.2)',
  blackOpacity30: 'rgba(0, 0, 0, 0.3)',
  blackOpacity50: 'rgba(0, 0, 0, 0.5)',
  blackOpacity60: 'rgba(0, 0, 0, 0.6)',
  
  whiteOpacity70: 'rgba(255, 255, 255, 0.7)',
  whiteOpacity30: 'rgba(255, 255, 255, 0.3)',
  whiteOpacity10: 'rgba(255, 255, 255, 0.1)',
  successOpacity10: 'rgba(16, 185, 129, 0.1)',
  errorOpacity08: 'rgba(186, 26, 26, 0.08)',
  errorOpacity10: 'rgba(186, 26, 26, 0.1)',
  grayOpacity10: 'rgba(112, 121, 116, 0.1)',
  grayOpacity20: 'rgba(112, 121, 116, 0.2)',

  sportTeal: '#0D9488',
  pickleball: '#0D9488',
  amber: '#B45309',
  amberStar: '#D97706',
  purple: '#9333EA',
  amberOpacity10: 'rgba(180, 83, 9, 0.1)',
  white: '#FFFFFF',
  shadowBlack: '#000000',
};

export const SPACING = {
  xs: 4,
  base: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  marginMobile: 20, // Synced to 20px from new web-owner design margin-mobile
};

export const BORDER_RADIUS = {
  sm: 4,           // 0.25rem
  default: 8,      // 0.5rem (formerly lg in code, default in design)
  md: 12,          // 0.75rem (formerly xl in code)
  lg: 16,          // 1rem (formerly xxl in code)
  xl: 24,          // 1.5rem (formerly xxxl in code)
  full: 9999,
};

export const TYPOGRAPHY = {
  headlineXl: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.64, // -0.02em
  },
  headlineLg: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
    letterSpacing: -0.24, // -0.01em
  },
  headlineLgMobile: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 30,
  },
  headlineMd: {
    fontFamily: 'HankenGrotesk-SemiBold',
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  titleMd: {
    fontFamily: 'HankenGrotesk-SemiBold',
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  bodyLg: {
    fontFamily: 'HankenGrotesk-Regular',
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyMd: {
    fontFamily: 'HankenGrotesk-Regular',
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  bodySm: {
    fontFamily: 'HankenGrotesk-Regular',
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  labelMd: {
    fontFamily: 'HankenGrotesk-SemiBold',
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.6, // 0.05em
  },
  labelSm: {
    fontFamily: 'HankenGrotesk-Medium',
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 15,
  },
  titleLg: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
    letterSpacing: -0.56,
  },
};
