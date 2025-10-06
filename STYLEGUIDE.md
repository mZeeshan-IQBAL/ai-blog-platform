# BlogSphere Design System

This project uses a token-driven design system built on Tailwind + CSS variables.

Core principles
- Minimal, modern UI with plenty of white space
- Consistent card-based layout and rounded corners
- Purple/blue brand core with magenta accent
- Soft shadows, no heavy borders
- Responsive, clamped hero typography (not oversized)

Color tokens (HSL)
- Background: --background: 210 20% 98%
- Foreground: --foreground: 222 47% 11%
- Primary: --primary: 258 90% 60% (purple)
- Accent: --accent: 330 90% 60% (magenta)
- Ring: --ring: 258 90% 60%
- Gradient: --brand-start, --brand-mid, --brand-end

Utilities (globals.css)
- .brand-gradient, .brand-gradient-text
- .heading-hero, .subheading-hero
- .eyebrow, .section-title, .section-subtitle
- .card, .card-hover, .card-padding

Components
- Button: variant="default|secondary|outline|ghost|destructive|link|gradient"
- Card: src/components/ui/Card.jsx (wrapper + header/content/title/description)
- Inputs: microinteractions w/ focus ring and glow; placeholder transitions
- NavbarPro: glass background, brand gradient, notification dropdown (theme toggle removed)
- Testimonials: clean grid of cards (industry standard)

Layout patterns
- Use container-mobile or max-w-7xl with px-4 sm:px-6 lg:px-8
- Sections start with optional .eyebrow, then .section-title, and .section-subtitle
- Cards: use <Card className="card-hover card-padding"> for consistent look

Hero guidance
- Use .heading-hero for titles and .subheading-hero for subtitle text
- Avoid text-7xl except in marketing hero with clamp

Do/Don’t
- Do use tokens and utilities; avoid hard-coded hex colors
- Do keep headings reasonable; use clamp utilities for marketing hero only
- Don’t add custom per-page button styles; use Button variants
- Don’t apply heavy drop-shadows; use .shadow-glow or default card shadows

Refactor checklist (apply as you touch files)
1) Replace ad-hoc card classes with <Card ...>
2) Replace large hero stacks with .heading-hero/.subheading-hero
3) Use Button variant="gradient" for primary CTAs
4) Use text-muted-foreground for secondary body text
5) Ensure spacing: p-5 sm:p-6 on cards, section py-16
