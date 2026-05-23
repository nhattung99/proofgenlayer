---
name: Luminous Protocol
colors:
  surface: '#fbf8ff'
  surface-dim: '#dad9e3'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f2fd'
  surface-container: '#eeedf7'
  surface-container-high: '#e8e7f1'
  surface-container-highest: '#e3e1ec'
  on-surface: '#1a1b22'
  on-surface-variant: '#514349'
  inverse-surface: '#2f3038'
  inverse-on-surface: '#f1effa'
  outline: '#83737a'
  outline-variant: '#d5c1c9'
  surface-tint: '#8a486f'
  primary: '#8a486f'
  on-primary: '#ffffff'
  primary-container: '#f9a8d4'
  on-primary-container: '#78395f'
  inverse-primary: '#ffaeda'
  secondary: '#5f5a7c'
  on-secondary: '#ffffff'
  secondary-container: '#dcd5fd'
  on-secondary-container: '#605b7d'
  tertiary: '#635c61'
  on-tertiary: '#ffffff'
  tertiary-container: '#c8bec4'
  on-tertiary-container: '#534d51'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd8ea'
  primary-fixed-dim: '#ffaeda'
  on-primary-fixed: '#3a0329'
  on-primary-fixed-variant: '#6f3157'
  secondary-fixed: '#e5deff'
  secondary-fixed-dim: '#c8c2e9'
  on-secondary-fixed: '#1b1735'
  on-secondary-fixed-variant: '#474363'
  tertiary-fixed: '#eae0e6'
  tertiary-fixed-dim: '#cec4ca'
  on-tertiary-fixed: '#1f1a1e'
  on-tertiary-fixed-variant: '#4b454a'
  background: '#fbf8ff'
  on-background: '#1a1b22'
  surface-variant: '#e3e1ec'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 64px
    fontWeight: '600'
    lineHeight: 72px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
---

## Brand & Style

The visual identity of the design system is rooted in **Ethereal Modernism**—a fusion of high-end luxury SaaS and the futuristic precision of Web3 infrastructure. It avoids the aggressive tropes of "cyberpunk" or "dark mode" crypto aesthetics, opting instead for a bright, optimistic, and highly polished interface that feels like high-end hardware.

The system targets sophisticated institutional investors and developers, evoking a sense of calm reliability and advanced AI-driven intelligence. The core aesthetic relies on **Glassmorphism** and **Minimalism**, utilizing white-space, subtle refraction, and soft glowing accents to create a sense of depth and weightlessness. The emotional response should be one of "trust through transparency."

## Colors

The palette is a sophisticated "High-Key" arrangement. It utilizes a primary **Pastel Pink (Blush)** and a secondary **Soft Lavender** to create subtle gradients that mimic natural light dispersion on glass surfaces. 

- **Primary (Blush Pink):** Used for primary actions and key brand moments.
- **Secondary (Lavender Mist):** Used for accents and secondary interactive states.
- **Surface (White/Rose-Wash):** The background is almost pure white with a microscopic tint of rose to keep the interface warm and inviting.
- **Functional Glows:** Subtle purple and pink blurs are used as "ambient light sources" behind containers to suggest energy and activity without clutter.

## Typography

This design system utilizes **Inter** exclusively for its systematic, neutral, and utilitarian properties, allowing the color palette and glass effects to provide the visual character. 

The type hierarchy is generous, with significant negative space between blocks. Headlines use a tighter letter-spacing and heavier weights to feel "architectural," while body text remains airy and highly legible. All typography should be rendered with `antialiased` smoothing to maintain the premium feel.

## Layout & Spacing

The layout follows a **Fixed Grid** model for desktop, centered within the viewport to maintain an "editorial" feel. 

- **Desktop:** 12-column grid, 1280px max-width, 24px gutters.
- **Tablet:** 8-column grid, fluid width, 24px gutters.
- **Mobile:** 4-column grid, fluid width, 16px gutters.

The spacing rhythm is strictly based on an 8px scale. Component internal padding should be generous—never smaller than 16px (2 units) for even the smallest elements, ensuring the UI feels "breathable" and premium. Large sections are separated by 80px to 120px to emphasize the minimalist aesthetic.

## Elevation & Depth

Depth is the cornerstone of this design system. It uses a **Multi-layered Glassmorphism** approach:

1.  **Base Layer:** Solid `#FAFAFA` or a very faint gradient.
2.  **Glass Containers:** Semi-transparent white (`rgba(255, 255, 255, 0.7)`) with a `20px` to `40px` backdrop-blur. 
3.  **Outlines:** Instead of heavy shadows, containers use a `1px` solid border in white at `40%` opacity to define the edges against the background.
4.  **Ambient Shadows:** For high-priority elements, a very soft, diffused shadow (`blur: 60px`, `opacity: 0.05`) with a hint of the primary pink hue is used to "lift" the card.
5.  **Glow Accents:** Absolute-positioned "blobs" of color sit behind glass layers to create a sense of internal illumination.

## Shapes

The shape language is ultra-soft and organic. With a **roundedness level of 3**, the system embraces large radii (24px+) for cards and full-pill shapes for buttons and tags. 

This extreme roundedness removes any visual "friction," making the technology feel approachable and human-centric. Elements like input fields and checkboxes should maintain a minimum of 12px radius to remain consistent with the broader container strategy.

## Components

### Buttons
Primary buttons use a subtle vertical gradient of the Primary Pink to Secondary Lavender. They feature a white inner-border (0.5px) and a soft pink "glow" shadow on hover. Text is semi-bold and centered.

### Glass Cards
The signature component. Cards must have a `backdrop-filter: blur(24px)`, a semi-transparent white background, and a 1px white stroke at low opacity. Content inside cards should have at least 32px of internal padding.

### Input Fields
Inputs should be nearly transparent, using only a subtle light-grey or white stroke. On focus, the stroke transitions to the primary pink with a 4px soft outer glow.

### Chips & Tags
Always pill-shaped. They use high-contrast color pairings (e.g., Lavender background with deep purple text) but at very low opacities (10-15%) to maintain the pastel aesthetic.

### Progress & Data Viz
Use soft, rounded strokes. Data lines should have a "glow" effect, appearing as if they are neon tubes buried under frosted glass. Avoid sharp angles in charts; use smooth bezier curves.