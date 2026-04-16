# Interactive Contact Section — Spec

## Overview
Replace the plain footer contact section with a full-viewport, visually immersive contact experience. The section features a live particle-network canvas background that reacts to mouse movement, magnetic social buttons that physically pull toward the cursor, a copy-to-clipboard email chip, and a minimal contact form with a glitch-reveal heading.

---

## Requirements

### Functional
- **Particle canvas** — animated network of nodes and connecting lines fills the section background; nodes drift and react to mouse proximity (repel/attract within radius).
- **Magnetic buttons** — GitHub, LinkedIn, and Email buttons physically translate toward the cursor when hovered within a proximity zone; snap back on leave.
- **Copy-to-clipboard** — clicking the email address copies it and shows a transient "Copied!" confirmation that auto-dismisses.
- **Contact form** — Name, Email, Message fields + Send button. Client-side validation with inline error states. On submit, shows a success state (no real backend required; `mailto:` fallback or console log).
- **Glitch heading** — "Let's Connect" heading plays a CSS glitch animation on section enter and on hover.
- **Scroll-triggered reveal** — section content fades/slides in when scrolled into view (consistent with existing IntersectionObserver pattern).
- **Reduced-motion** — all animations disabled when `prefers-reduced-motion: reduce` is set.
- **Accessibility** — canvas is `aria-hidden`; all interactive elements have visible focus rings and proper ARIA labels.

### Visual Design
- Full-viewport-height section (`min-height: 100vh`).
- Dark background (`#0a0a0a`) with the particle canvas layered behind content.
- Burnt-orange accent (`#BF5700`) for particles, glows, and interactive highlights — consistent with existing palette.
- Two-column layout on desktop: left = heading + email chip + social buttons; right = contact form.
- Single-column stacked on mobile.
- Magnetic buttons rendered as large pill cards (icon + label), not bare icons.
- Form inputs use a frosted-glass style (`background: rgba(255,255,255,0.04); backdrop-filter: blur(8px)`).

---

## Design Details

### Particle Canvas
- ~80 nodes on desktop, ~40 on mobile (based on `window.innerWidth`).
- Each node: small filled circle (radius 2px), random velocity, wraps at edges.
- Lines drawn between nodes closer than 120px; opacity proportional to distance.
- On `mousemove`, nodes within 100px radius are gently pushed away.
- Canvas resizes on `window.resize`.

### Magnetic Buttons
- Detect cursor within 80px of button center.
- Translate button up to 14px toward cursor using `transform: translate(dx, dy)`.
- Smooth spring-like return on `mouseleave` via CSS `transition`.

### Glitch Heading
- CSS `@keyframes glitch` shifts text with `clip-path` slices and color offsets.
- Plays once on IntersectionObserver trigger, repeats on `h2:hover`.

### Contact Form
- Fields: `name` (text), `email` (email), `message` (textarea).
- Validation: non-empty name, valid email regex, non-empty message.
- Error state: red underline + inline error message below field.
- Success state: form replaced by a centered checkmark + "Message sent!" text.
- Submit uses `mailto:` href construction as fallback (no server needed).

---

## Tasks

1. Write this spec file → `.kiro/specs/interactive-contact/spec.md`
2. Replace `<footer id="contact">` HTML with new markup (canvas, two-column layout, form).
3. Add all CSS for the contact section to `styles.css`.
4. Create `contact.js` — particle engine, magnetic effect, clipboard, form validation.
5. Add `<script src="contact.js"></script>` to `index.html`.
