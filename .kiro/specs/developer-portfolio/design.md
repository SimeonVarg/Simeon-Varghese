# Design Document: Developer Portfolio

## Overview

A single-page developer portfolio for Simeon Varghese, built with plain HTML, CSS, and vanilla JavaScript — no build tooling or frameworks required. The site is a static file that can be opened directly in a browser or served from any static host (GitHub Pages, Netlify, etc.).

The design prioritizes:
- Instant load (no JS framework overhead)
- Dark mode with UT Austin burnt orange (`#BF5700`) and white accents
- Smooth CSS animations and hover transitions
- Fully responsive layout via CSS Grid and Flexbox
- Semantic HTML for accessibility and SEO

## Architecture

```
developer-portfolio/
├── index.html       # Single HTML file containing all markup
├── styles.css       # All styles (custom properties, layout, animations)
└── main.js          # Minimal JS for scroll-triggered fade-in (optional enhancement)
```

All three files are co-located. No dependencies, no package manager, no bundler.

### Technology Decisions

- **Plain HTML/CSS/JS** — zero dependencies, instant load, trivially deployable
- **CSS Custom Properties** — single source of truth for colors, spacing, and typography
- **CSS Grid** — three-column project grid that collapses to one column on mobile
- **CSS `@keyframes`** — fade-in animation on hero content
- **SVG icons** — inline SVGs for GitHub, LinkedIn, and Email (no icon library CDN needed)
- **`prefers-reduced-motion` media query** — respects user accessibility preferences for animations

## Components and Interfaces

### Color Palette (CSS Custom Properties)

```css
:root {
  --bg:          #0d0d0d;   /* near-black background */
  --surface:     #1a1a1a;   /* card / section surface */
  --accent:      #BF5700;   /* UT Austin burnt orange */
  --text:        #ffffff;   /* primary text */
  --text-muted:  #a0a0a0;   /* secondary / muted text */
  --border:      #2a2a2a;   /* default card border */
  --radius-pill: 9999px;    /* Tech_Stack_Tag border-radius */
}
```

### Section Components

| Component | HTML Element | Key Styles |
|---|---|---|
| Hero_Section | `<header>` | `min-height: 100vh`, flexbox center, fade-in animation |
| About_Section | `<section id="about">` | `padding: 80px 0` top/bottom |
| Projects_Section | `<section id="projects">` | CSS Grid, 3-col → 1-col responsive |
| Project_Card | `<article>` | `border: 1px solid var(--border)`, hover lift + border accent |
| Tech_Stack_Tag | `<span>` | `border-radius: var(--radius-pill)`, accent border |
| Footer_Section | `<footer>` | flexbox center, icon links |

### Fade-In Animation

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.hero-content {
  animation: fadeIn 800ms ease forwards;
}

@media (prefers-reduced-motion: reduce) {
  .hero-content { animation: none; }
}
```

### Project Card Hover

```css
.project-card {
  transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease;
}
.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(191, 87, 0, 0.25);
  border-color: var(--accent);
}
```

### Footer Icon Hover

```css
.footer-link svg {
  transition: color 200ms ease, fill 200ms ease;
}
.footer-link:hover svg {
  fill: var(--accent);
}
```

## Data Models

This is a static site with no runtime data layer. Content is hardcoded in HTML. The three project cards follow this structure:

```
Project {
  image_placeholder: div with aspect-ratio 16/9
  title: string          // "Project Alpha" | "Project Beta" | "Project Gamma"
  description: string    // two-sentence placeholder
  tech_tags: string[]    // e.g. ["Java", "SQL", "TypeScript"]
}
```

Contact links:

```
ContactLink {
  type: "github" | "linkedin" | "email"
  href: string           // URL or mailto:
  icon: SVG markup
  label: string          // aria-label for accessibility
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Most acceptance criteria for this feature are UI rendering and layout requirements (color scheme, responsive breakpoints, animation timing, hover effects). These are best validated through snapshot tests, visual regression tests, and example-based DOM assertions — not property-based testing.

However, a small number of criteria involve structural invariants that should hold universally across all rendered elements, making them suitable for property-based testing.

**Property Reflection:** Criteria 4.6, 4.7, and 4.8 all describe required fields on a Project_Card — title, description, and tags. These are logically unified: a card is only valid if all three are present. They are combined into Property 1. Criteria 4.9, 6.3, and 6.6 each test distinct universal invariants and remain as separate properties.

### Property 1: Project cards contain all required fields

*For any* project data object with a non-empty title, non-empty description, and an array of at least three technology tags, rendering it as a Project_Card SHALL produce a DOM element that contains the title text, the description text, and at least three Tech_Stack_Tag child elements.

**Validates: Requirements 4.6, 4.7, 4.8**

### Property 2: Tech_Stack_Tags are pill-shaped

*For any* technology tag string rendered as a Tech_Stack_Tag element, the element's computed `border-radius` SHALL equal `9999px`.

**Validates: Requirements 4.9**

### Property 3: Footer links are keyboard-activatable

*For any* icon link rendered in the Footer_Section, the anchor element SHALL have a non-empty `href` attribute and a non-empty `aria-label` attribute, ensuring it is reachable and activatable via keyboard navigation.

**Validates: Requirements 5.2, 5.3, 5.4, 6.5, 6.6**

### Property 4: All images have non-empty alt text

*For any* `<img>` element present in the page DOM, the `alt` attribute SHALL be present and its value SHALL be a non-empty, non-whitespace-only string.

**Validates: Requirements 6.3**

## Error Handling

This is a static site with no server-side logic or async operations. Error scenarios are limited to:

| Scenario | Handling |
|---|---|
| Broken image src | `alt` attribute provides fallback text; placeholder divs use CSS background instead of `<img>` to avoid broken image icons |
| External link unreachable | Standard browser behavior; links open in new tab (`target="_blank" rel="noopener noreferrer"`) |
| JS disabled | All layout and styling is pure CSS; JS is only used for optional scroll enhancements — the page is fully functional without it |
| Reduced motion preference | `@media (prefers-reduced-motion: reduce)` disables animations |

## Testing Strategy

Since this is a static HTML/CSS/JS site, property-based testing is not the primary tool. The testing approach is:

### Unit / DOM Tests (Jest + jsdom or Playwright component tests)

Focus on verifiable DOM structure and computed styles:

- Hero section renders `<header>` with `min-height: 100vh`
- Hero heading text matches "Hi, I'm Simeon Varghese."
- Hero sub-headline text is present
- About section has `padding-top` and `padding-bottom` ≥ 80px
- Projects section renders exactly 3 `.project-card` elements
- Each project card contains: image placeholder, title, description, ≥3 tech tags
- Each tech tag has `border-radius: 9999px`
- Footer contains exactly 3 icon links (GitHub, LinkedIn, Email)
- All icon links have non-empty `href` and `aria-label` attributes
- All `<img>` elements have non-empty `alt` attributes
- Semantic elements present: `<header>`, `<main>`, `<section>`, `<footer>`

### Visual / Responsive Tests (Playwright or manual)

- At 320px viewport: all multi-column layouts collapse to single column
- At 768px viewport: project grid shows 3 columns
- At 1280px viewport: layout uses max-width container with centered content
- Hover states on project cards (translateY(-4px), border-color → accent)
- Hover states on footer icons (fill → accent, 200ms transition)
- Fade-in animation fires on page load (opacity 0 → 1, 800ms)

### Accessibility Checks (axe-core or Lighthouse)

- Color contrast ratio ≥ 4.5:1 for all text/background combinations
- All interactive elements reachable via Tab key
- Visible focus indicators on all interactive elements
- No missing `alt` attributes
- Landmark regions present (`<header>`, `<main>`, `<footer>`)

### Property-Based Tests (fast-check, minimum 100 iterations)

For the structural invariants that hold across variable inputs:

**Feature: developer-portfolio, Property 1: Project cards contain all required fields**
- Generate random project data objects: arbitrary non-empty title string, arbitrary non-empty description string, arbitrary array of ≥ 3 tag strings
- Render each into the card template function
- Assert: rendered DOM contains title text, description text, and ≥ 3 tag elements

**Feature: developer-portfolio, Property 2: Tech_Stack_Tags are pill-shaped**
- Generate arbitrary tag text strings (including edge cases: single char, long strings, special characters)
- Render each as a Tech_Stack_Tag element
- Assert: computed border-radius equals 9999px

**Feature: developer-portfolio, Property 3: Footer links are keyboard-activatable**
- Generate random valid URLs (GitHub, LinkedIn) and email addresses
- Render footer with generated link data
- Assert: each anchor has non-empty `href` and non-empty `aria-label`

**Feature: developer-portfolio, Property 4: All images have non-empty alt text**
- Generate arbitrary alt text strings; include edge cases (whitespace-only strings should be rejected)
- Render image elements with generated alt values
- Assert: `alt` is present and trimmed value is non-empty
