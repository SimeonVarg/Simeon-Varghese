# Implementation Plan: Developer Portfolio

## Overview

Build a static single-page portfolio for Simeon Varghese using plain HTML, CSS, and vanilla JavaScript. Three co-located files: `index.html`, `styles.css`, and `main.js`. No dependencies, no build step.

## Tasks

- [x] 1. Create project structure and base HTML skeleton
  - Create `index.html` with semantic structure: `<header>`, `<main>`, `<section id="about">`, `<section id="projects">`, `<footer>`
  - Link `styles.css` and `main.js` in the document head/body
  - Add `<meta charset>`, `<meta name="viewport">`, and `<title>` tags
  - _Requirements: 1.1, 6.2_

- [x] 2. Implement global styles and CSS custom properties
  - [x] 2.1 Define CSS custom properties and base reset in `styles.css`
    - Declare all custom properties: `--bg`, `--surface`, `--accent`, `--text`, `--text-muted`, `--border`, `--radius-pill`
    - Apply `box-sizing: border-box` reset and base `body` styles (background, color, font)
    - _Requirements: 1.2, 1.3, 1.4_

  - [ ]* 2.2 Write unit tests for CSS custom property values
    - Assert computed value of `--accent` equals `#BF5700`
    - Assert `body` background color matches `--bg` (`#0d0d0d`)
    - _Requirements: 1.2, 1.3_

- [x] 3. Implement Hero Section
  - [x] 3.1 Add Hero Section markup and styles
    - Write `<header>` markup with `<h1>` ("Hi, I'm Simeon Varghese.") and `<p>` sub-headline
    - Style `<header>` to `min-height: 100vh`, flexbox center both axes
    - _Requirements: 2.1, 2.2, 2.4, 2.5_

  - [x] 3.2 Implement fade-in animation
    - Define `@keyframes fadeIn` (opacity 0→1, translateY 12px→0, 800ms)
    - Apply animation to `.hero-content`
    - Add `@media (prefers-reduced-motion: reduce)` override to disable animation
    - _Requirements: 2.3_

  - [ ]* 3.3 Write unit tests for Hero Section
    - Assert `<header>` element exists with correct heading text
    - Assert sub-headline text is present
    - Assert `min-height` style is `100vh`
    - _Requirements: 2.1, 2.2, 2.4_

- [x] 4. Implement About Section
  - [x] 4.1 Add About Section markup and styles
    - Write `<section id="about">` with `<h2>About Me</h2>` and a descriptive paragraph
    - Apply `padding: 80px 0` (top and bottom)
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 4.2 Write unit tests for About Section
    - Assert section heading text equals "About Me"
    - Assert `padding-top` and `padding-bottom` are ≥ 80px
    - _Requirements: 3.1, 3.3_

- [x] 5. Implement Projects Section and Project Cards
  - [x] 5.1 Add Projects Section markup
    - Write `<section id="projects">` with `<h2>Featured Projects</h2>`
    - Add exactly three `<article class="project-card">` elements, each with: 16:9 image placeholder div, `<h3>` title, `<p>` description, and ≥3 `<span class="tag">` tech tags
    - _Requirements: 4.1, 4.2, 4.5, 4.6, 4.7, 4.8_

  - [x] 5.2 Style the project grid and cards
    - Implement CSS Grid: 3-column layout at ≥768px, single-column below 768px
    - Style `.project-card` with `background: var(--surface)`, `border: 1px solid var(--border)`, and `border-radius`
    - Style `.tag` with `border-radius: var(--radius-pill)` (9999px) and accent border
    - _Requirements: 4.3, 4.4, 4.9_

  - [x] 5.3 Implement card hover effects
    - Add `transition` on `.project-card` for `transform`, `box-shadow`, and `border-color`
    - On `:hover`: `transform: translateY(-4px)`, `box-shadow: 0 8px 24px rgba(191,87,0,0.25)`, `border-color: var(--accent)`
    - _Requirements: 4.10, 4.11_

  - [ ]* 5.4 Write property test for Project Card required fields (Property 1)
    - **Property 1: Project cards contain all required fields**
    - Generate arbitrary non-empty title, description, and ≥3 tag strings; render via card template function; assert DOM contains all three
    - **Validates: Requirements 4.6, 4.7, 4.8**

  - [ ]* 5.5 Write property test for Tech_Stack_Tag pill shape (Property 2)
    - **Property 2: Tech_Stack_Tags are pill-shaped**
    - Generate arbitrary tag strings (including edge cases); render as `.tag` element; assert computed `border-radius` equals `9999px`
    - **Validates: Requirements 4.9**

  - [ ]* 5.6 Write unit tests for Projects Section structure
    - Assert exactly 3 `.project-card` elements are rendered
    - Assert each card has an image placeholder, title, description, and ≥3 tags
    - _Requirements: 4.2, 4.5, 4.6, 4.7, 4.8_

- [x] 6. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement Footer Section
  - [x] 7.1 Add Footer Section markup
    - Write `<footer>` with a "Get in Touch" label and three `<a>` icon links: GitHub, LinkedIn, Email (mailto)
    - Each link must have `href`, `aria-label`, `target="_blank" rel="noopener noreferrer"` (except mailto), and an inline SVG icon
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.5, 6.6_

  - [x] 7.2 Style the footer
    - Center icon links horizontally with flexbox and generous whitespace
    - Add `transition: fill 200ms ease` on SVG icons; on `:hover` set `fill: var(--accent)`
    - _Requirements: 5.6, 5.7_

  - [ ]* 7.3 Write property test for footer link keyboard accessibility (Property 3)
    - **Property 3: Footer links are keyboard-activatable**
    - Generate random valid URLs and email addresses; render footer with generated data; assert each anchor has non-empty `href` and non-empty `aria-label`
    - **Validates: Requirements 5.2, 5.3, 5.4, 6.5, 6.6**

  - [ ]* 7.4 Write unit tests for Footer Section
    - Assert exactly 3 icon links are present
    - Assert each link has non-empty `href` and `aria-label`
    - _Requirements: 5.2, 5.3, 5.4, 6.5, 6.6_

- [x] 8. Implement responsive layout
  - Add `@media` queries for 320px, 768px, and 1280px breakpoints
  - Ensure all multi-column layouts collapse to single column below 768px
  - Apply `max-width` container with centered content at 1280px+
  - _Requirements: 1.5, 1.6, 4.3, 4.4_

- [x] 9. Implement accessibility and semantic correctness
  - [x] 9.1 Audit and fix semantic HTML
    - Verify `<header>`, `<main>`, `<section>`, `<footer>` landmark elements are present
    - Ensure all `<img>` elements have non-empty, descriptive `alt` attributes
    - Add visible `:focus` indicators on all interactive elements (`<a>` tags)
    - _Requirements: 6.2, 6.3, 6.5_

  - [ ]* 9.2 Write property test for image alt text (Property 4)
    - **Property 4: All images have non-empty alt text**
    - Generate arbitrary alt text strings including whitespace-only edge cases; render `<img>` elements; assert `alt` is present and trimmed value is non-empty
    - **Validates: Requirements 6.3**

  - [ ]* 9.3 Write unit tests for accessibility structure
    - Assert semantic landmark elements are present
    - Assert all interactive elements have visible focus indicators
    - _Requirements: 6.2, 6.5_

- [x] 10. Implement optional scroll-triggered fade-in in `main.js`
  - Use `IntersectionObserver` to add a `.visible` class to sections as they scroll into view
  - Ensure the page is fully functional with JS disabled (CSS-only fallback)
  - _Requirements: 6.1_

- [x] 11. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check (minimum 100 iterations) with jsdom for DOM assertions
- Unit/DOM tests use Jest + jsdom or Playwright
- The page must be fully functional with JS disabled; `main.js` is an enhancement only
