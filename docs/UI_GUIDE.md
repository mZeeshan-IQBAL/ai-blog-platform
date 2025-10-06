# UI Design System Guide

This project uses Tailwind CSS with CSS variable-driven design tokens and a small set of accessible, reusable UI primitives.

- Theme: token-based. Dark mode toggle is currently not exposed in the UI.
- Tokens: defined in `src/app/globals.css` under `:root` and `.dark`, mapped in `tailwind.config.js` (background, foreground, primary, secondary, accent, destructive, muted, border, ring, card, popover).
- Typography: Inter via `next/font/google` in `src/app/layout.js`.
- Container: centered with responsive padding via Tailwind container config.
- Motion: pre-defined animations (fade-in, slide-up-fade, shimmer, accordion up/down).

## Primitives

- Button: `@/components/ui/Button`
  - Variants: `default | secondary | outline | ghost | destructive | link`
  - Sizes: `sm | md | lg | icon`
  - Usage:
  ```jsx
  import { Button } from "@/components/ui/Button";
  <Button>Save</Button>
  <Button variant="secondary">Cancel</Button>
  <Button as="link" href="/docs">Docs</Button>
  ```

- Input/Textarea/Select: `@/components/ui/Input`, `Textarea`, `Select`
  - Usage:
  ```jsx
  import { Input } from "@/components/ui/Input";
  <Input placeholder="Email" type="email" />
  ```

- Card: `@/components/ui/Card`
  - Slots: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
  - Usage:
  ```jsx
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
  <Card>
    <CardHeader>
      <CardTitle>Title</CardTitle>
      <CardDescription>Subtitle</CardDescription>
    </CardHeader>
    <CardContent>Body</CardContent>
    <CardFooter>Actions</CardFooter>
  </Card>
  ```

- Badge: `@/components/ui/Badge` with variants: `default | outline | success | warning | danger`
- Modal: `@/components/ui/Modal` (uses framer-motion)
- Skeleton: `@/components/ui/Skeleton` (uses shimmer animation)

## Patterns

- Use tokens classes: `bg-background`, `text-foreground`, `border-border`.
- Prefer `text-muted-foreground` for secondary text.
- Respect `focus-visible` with ring styles; avoid removing outlines.
- Spacing: use consistent `gap-*` and `space-*` for vertical rhythm.
- Responsiveness: design for `sm`, `md`, `lg`, `xl` using Tailwind breakpoints.

## Theming

- The app ships with design tokens for both light and dark in globals.css. UI does not expose a theme toggle.
- Initial theme is determined by tokens; you can add a toggle later if needed.

## Migrating existing components

- Replace ad-hoc buttons/links with `Button`.
- Replace raw inputs with `Input/Textarea/Select`.
- Wrap content in `Card` where a surface is needed.
- Replace color utilities with tokenized classes when possible.
