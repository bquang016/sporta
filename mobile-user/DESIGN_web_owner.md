---
name: Sporty-Tech Design System
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#404944'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#707974'
  outline-variant: '#bfc9c3'
  surface-tint: '#2b6954'
  primary: '#003527'
  on-primary: '#ffffff'
  primary-container: '#064e3b'
  on-primary-container: '#80bea6'
  inverse-primary: '#95d3ba'
  secondary: '#735c00'
  on-secondary: '#ffffff'
  secondary-container: '#fed01b'
  on-secondary-container: '#6f5900'
  tertiary: '#4f1f19'
  on-tertiary: '#ffffff'
  tertiary-container: '#6b342d'
  on-tertiary-container: '#ea9e93'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b0f0d6'
  primary-fixed-dim: '#95d3ba'
  on-primary-fixed: '#002117'
  on-primary-fixed-variant: '#0b513d'
  secondary-fixed: '#ffe083'
  secondary-fixed-dim: '#eec200'
  on-secondary-fixed: '#231b00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#ffdad5'
  tertiary-fixed-dim: '#ffb4a9'
  on-tertiary-fixed: '#380d08'
  on-tertiary-fixed-variant: '#6e372f'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
typography:
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  title-md:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  margin-mobile: 20px
  gutter: 12px
---

## Brand & Style

The design system is built for a performance-oriented mobile experience that bridges the gap between digital efficiency and physical athleticism. It targets active individuals who value speed, precision, and community connection. 

The aesthetic is **Minimalist-Tech**, characterized by a high-ratio of white space to ensure maximum readability during movement. It avoids heavy decorative borders in favor of subtle tonal shifts and precise geometry. The vibe is energetic yet premium—mirroring the feeling of high-end athletic apparel: breathable, functional, and striking. 

Key principles:
- **Velocity:** Interfaces that feel fast through reduced visual friction.
- **Precision:** Tight alignment and consistent 8pt increments.
- **Focus:** Utilizing high-contrast accents only for critical conversion and status cues.

## Colors

The palette follows a strict 60-30-10 distribution to ensure a balanced, professional look. 

- **Dominant (60%):** Pure White (#FFFFFF) serves as the canvas, providing a "clean room" feel that makes content and imagery pop.
- **Secondary (30%):** Deep Emerald Green (#064E3B) is the structural anchor. It is used for primary navigation backgrounds, secondary buttons, and active toggle states. It evokes turf, courts, and stability.
- **Accent (10%):** Dynamic Athletic Yellow (#FACC15) is used sparingly for high-priority CTAs (e.g., "Join Now"), critical alerts, or highlighted metrics. It provides the "energy spike" in the UI.
- **Neutrals:** Cool grays are used for secondary text and subtle divider lines to maintain the minimalist ethos.

## Typography

This design system utilizes **Hanken Grotesk** for its technical precision and modern character. The typeface is highly legible at small sizes, which is essential for data-heavy matchmaking lists and venue details.

For headlines, a tighter letter-spacing and heavier weight are used to create a sense of impact and urgency. Body text maintains a generous line-height to ensure comfort during quick scanning. Labels use a slight uppercase treatment with increased tracking to differentiate them from interactive body text.

## Layout & Spacing

The layout is built on a rigorous **8pt grid system**. 

- **Horizontal Rhythm:** A fluid 4-column grid for mobile with 20px outer margins. Elements should snap to the grid to maintain the "tech" feel.
- **Vertical Rhythm:** Generous vertical padding (24px - 32px between sections) is used to prevent the interface from feeling cluttered, emphasizing the minimalist style.
- **Touch Targets:** All interactive elements maintain a minimum hit area of 44x44pt.
- **Venue Cards:** Horizontal scrolling areas use a "peek" effect where the second card is partially visible to signify horizontal overflow.

## Elevation & Depth

To maintain a premium, clean look, the design system avoids heavy drop shadows. Instead, depth is communicated through:

- **Tonal Layering:** Using a very light gray (#F9FAFB) for container backgrounds against the pure white page background.
- **Soft Ambient Occlusion:** When elevation is necessary (e.g., floating action buttons or active cards), a very soft, diffused shadow (15% opacity of the Deep Emerald) is used with a large blur radius.
- **Glassmorphism (Subtle):** The 5-tab bottom navigation bar utilizes a backdrop-blur (20px) with 95% opacity to allow content to scroll behind it while maintaining legibility.

## Shapes

The shape language is primarily **Rounded**, creating a friendly yet high-tech feel.

- **Standard Containers:** Use a 16px (1rem) radius (e.g., Venue Cards, Matchmaking items).
- **Search Bar:** Uses a fully pill-shaped (32px+) radius for an inviting, tactile entry point.
- **Icons:** Sports category icons are enclosed in perfect circles with a subtle background tint of the primary color at 5-10% opacity.
- **Buttons:** Primary CTAs use a 12px radius to balance the circular icons and sharper card edges.

## Components

### Buttons & CTAs
- **Primary:** Athletic Yellow background with Deep Emerald text for maximum contrast. 
- **Secondary:** Deep Emerald background with White text.
- **Ghost:** Transparent background with Deep Emerald text and a subtle 1px border.

### Search Bar
- A full-width pill-shaped input with a light gray fill (#F3F4F6). The search icon is placed on the left, and a "Filter" icon is docked on the right inside a circular Emerald container.

### Cards
- **Horizontal Venue Cards:** Image on top with a 16:9 aspect ratio, followed by title, distance (with icon), and price-per-hour in Emerald.
- **Matchmaking List Items:** Vertical stacking. Features a circular sport icon on the left, match title and time in the center, and a "Join" button (Yellow) or "Full" status tag on the right.

### Navigation
- **Bottom Bar:** 5-tab minimalist bar. Active state uses the Deep Emerald for the icon and a small 4px dot indicator underneath. Inactive icons are a medium neutral gray.

### Status Tags
- Small, rounded-pill tags for status (e.g., "Open," "3 slots left"). Use high-contrast background tints with bold labels.