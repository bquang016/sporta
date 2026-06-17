export const COLORS = {
  // Brand Core Colors (From design Visuals and YAML)
  primary: '#064E3B',                  // Forest Green (30% Structure)
  onPrimary: '#FFFFFF',
  primaryContainer: '#FFFFFF',
  onPrimaryContainer: '#747676',
  
  secondary: '#FACC15',                // Deep Golden Yellow (10% Action/Accent)
  onSecondary: '#191C20',
  secondaryContainer: '#ADEDD3',       // Light green mint for badges/chips
  onSecondaryContainer: '#306D58',
  
  tertiary: '#735C00',                 // Yellowish / Bronze
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FFFFFF',
  onTertiaryContainer: '#8E7300',
  
  background: '#F9F9FF',               // Off-white Neutral background
  onBackground: '#191C20',
  
  surface: '#FFFFFF',                  // Pure white surface (60% Base)
  onSurface: '#191C20',
  surfaceVariant: '#E2E2E8',
  onSurfaceVariant: '#444748',
  
  // Tonal Layer Containers (From MD3 YAML)
  surfaceDim: '#D9DADF',
  surfaceBright: '#F9F9FF',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F3F3F9',
  surfaceContainer: '#EDEDF3',
  surfaceContainerHigh: '#E7E8EE',
  surfaceContainerHighest: '#E2E2E8',
  
  outline: '#747878',
  outlineVariant: '#C4C7C8',
  
  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#93000A',
  
  // Custom brand helpers
  brandGreen: '#064E3B',
  brandGold: '#FACC15',
};

export const SPACING = {
  xs: 4,
  base: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  marginMobile: 16, // Synced to 16px from design margin-mobile
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
    fontFamily: 'HankenGrotesk-ExtraBold',
    fontSize: 48,
    fontWeight: '800' as const,
    lineHeight: 56,
    letterSpacing: -0.96, // -0.02em
  },
  headlineLg: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.32, // -0.01em
  },
  headlineLgMobile: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  headlineMd: {
    fontFamily: 'HankenGrotesk-SemiBold',
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  bodyLg: {
    fontFamily: 'HankenGrotesk-Regular',
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 28,
  },
  bodyMd: {
    fontFamily: 'HankenGrotesk-Regular',
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  labelMd: {
    fontFamily: 'HankenGrotesk-SemiBold',
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    letterSpacing: 0.7, // 0.05em
  },
  labelSm: {
    fontFamily: 'HankenGrotesk-Medium',
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
  },
};
