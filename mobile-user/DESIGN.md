---
name: Sporta Performance
colors:
  surface: '#f9f9ff'
  surface-dim: '#d9dadf'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f9'
  surface-container: '#ededf3'
  surface-container-high: '#e7e8ee'
  surface-container-highest: '#e2e2e8'
  on-surface: '#191c20'
  on-surface-variant: '#444748'
  inverse-surface: '#2e3035'
  inverse-on-surface: '#f0f0f6'
  outline: '#747878'
  outline-variant: '#c4c7c8'
  surface-tint: '#5d5f5f'
  primary: '#5d5f5f'
  on-primary: '#ffffff'
  primary-container: '#ffffff'
  on-primary-container: '#747676'
  inverse-primary: '#c6c6c7'
  secondary: '#2b6954'
  on-secondary: '#ffffff'
  secondary-container: '#adedd3'
  on-secondary-container: '#306d58'
  tertiary: '#735c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#ffffff'
  on-tertiary-container: '#8e7300'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#b0f0d6'
  secondary-fixed-dim: '#95d3ba'
  on-secondary-fixed: '#002117'
  on-secondary-fixed-variant: '#0b513d'
  tertiary-fixed: '#ffe083'
  tertiary-fixed-dim: '#eec200'
  on-tertiary-fixed: '#231b00'
  on-tertiary-fixed-variant: '#574500'
  background: '#f9f9ff'
  on-background: '#191c20'
  surface-variant: '#e2e2e8'
typography:
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base-unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
---

## Brand & Style
The design system is engineered for a high-performance sports and athletic management environment. It prioritizes clarity, energy, and precision. The aesthetic is a blend of **Corporate Modern** and **High-Contrast Bold**, utilizing a strict 60-30-10 color distribution to ensure a clean, focused user experience that highlights critical actions. The target audience includes athletes, coaches, and sports administrators who require data density without cognitive overload. The UI evokes a sense of professional excellence, reliability, and athletic momentum.

## Colors
The palette follows a disciplined 60-30-10 rule to maintain visual hierarchy:
- **60% Primary (Base):** #FFFFFF is the dominant background color to provide maximum "air" and legibility. #F9F9FF is used for subtle sectioning and surface shifts.
- **30% Secondary (Structure):** #064E3B (Forest Green) provides the professional backbone. It is used for typography, icons, borders, and structural navigation elements.
- **10% Accent (Action):** #FACC15 (Deep Golden Yellow) is reserved exclusively for high-priority interactions, active states, and calls-to-action.

Functional status colors (Success, Error, Warning) should be used sparingly and derived from the Secondary green or muted variations of the accent yellow to maintain the triad's integrity.

## Typography
This design system utilizes **Hanken Grotesk** across all levels to project a sharp, contemporary, and technical feel. 
- **Headlines:** Use heavy weights (700-800) with slight negative letter spacing for a punchy, athletic editorial look. 
- **Body:** Kept clean and legible with standard weights.
- **Labels:** Use semi-bold or bold weights with increased letter spacing for categorization and "data-tag" styling.
- **Mobile scaling:** Headlines scale down significantly to ensure information density is maintained on smaller screens without horizontal scrolling.

## Layout & Spacing
The system utilizes a **Fluid Grid** with a fixed maximum container width for desktop. 
- **The 8px Rhythm:** All padding, margins, and component heights are multiples of 8px.
- **Desktop:** 12-column grid, 24px gutters, and 40px outer margins.
- **Tablet:** 8-column grid, 16px gutters, and 24px outer margins.
- **Mobile:** 4-column grid, 16px gutters, and 16px outer margins.
Vertical spacing between sections should be generous (64px - 80px) to balance the high-contrast elements and the bold typography.

## Elevation & Depth
The system relies on **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows to maintain a sleek, athletic feel.
- **Level 0:** Pure White (#FFFFFF) base background.
- **Level 1:** Off-white (#F9F9FF) for cards or sidebar containers.
- **Level 2:** Elements are defined by 1px borders in a transparent version of the Secondary Forest Green (10-15% opacity).
- **Interactive Depth:** Only the primary Action buttons or active cards receive a very subtle, sharp shadow (4px blur, 2px Y-offset) to indicate "pressability."

## Shapes
The design system employs a **Rounded** shape language, specifically the "Round Eight" philosophy where the standard radius is 0.5rem (8px).
- **Base Components:** 8px radius (buttons, input fields, small cards).
- **Large Containers:** 16px radius (modals, main dashboard cards).
- **Special Elements:** 24px radius or full pills for chips and status badges to contrast against the structured grid.

## Components
- **Buttons:** Primary buttons use the Accent #FACC15 with black or very dark green text for maximum contrast. Secondary buttons use an outline of #064E3B.
- **Chips:** Small, pill-shaped tags. Active chips use a light tint of Forest Green with dark green text.
- **Lists:** Clean rows with 1px #F9F9FF separators. Hover states use a subtle #F9F9FF background fill.
- **Input Fields:** 8px rounded corners, 1px #064E3B border at 20% opacity. Focus state increases border opacity to 100%.
- **Cards:** White background, 8px radius, and a subtle 1px border. No shadows unless the card is interactive/hoverable.
- **Data Visualization:** Use the Forest Green for primary data series and the Accent Yellow for highlights or "Goal" markers.