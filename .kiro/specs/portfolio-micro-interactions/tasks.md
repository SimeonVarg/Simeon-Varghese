# Implementation Plan: Portfolio Micro-Interactions

## Overview

Implement `micro-interactions.js` as a single IIFE module that layers nine interaction systems onto the existing portfolio. Tasks are ordered so each system is self-contained and wired together at the end. The existing `main.js` card fade-in is superseded by the staggered entrance system.

## Tasks

- [x] 1. Scaffold `micro-interactions.js` and inject shared infrastructure
  - Create `micro-interactions.js` as an IIFE with a `DOMContentLoaded` entry point
  - Read `prefers-reduced-motion` once and store as `reducedMotion`
  - Create a shared `injectStyle(css)` helper that appends a `<style>` tag to `<head>`
  - Add the `<script src="micro-interactions.js">` tag to `index.html` after `hero-animation.js`
  - _Requirements: 10.1, 10.2, 10.4_

- [x] 2. Implement Scroll Progress Bar
  - [x] 2.1 Implement `initScrollBar()`
    - Inject `<div id="mi-scroll-bar">` as first child of `<body>`
    - Inject CSS: `position:fixed; top:0; left:0; width:0%; height:3px; background:var(--accent); z-index:9999; pointer-events:none`
    - On `scroll`, use a `ticking` guard and `requestAnimationFrame` to set `bar.style.width`
    - Formula: `(scrollY / (scrollHeight - innerHeight)) * 100 + '%'`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 3. Implement Scramble Text and Typewriter Effect
  - [x] 3.1 Implement `initScrambleText(reducedMotion, onComplete)`
    - Target `document.querySelector('h1')`
    - Walk only `Text` nodes inside `<h1>` to build `{node, charIndex, finalChar}` tuples, preserving the `<span class="accent">` child
    - On each rAF tick replace unresolved chars with `String.fromCharCode(33 + Math.random() * 94)`
    - Resolve left-to-right: char `i` resolves after `i * (1800 / totalChars)` ms
    - On completion call `onComplete()`
    - If `reducedMotion`: display final text immediately and call `onComplete()` synchronously
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.2 Implement `initTypewriter(reducedMotion)`
    - Target `document.querySelector('.hero-sub')`
    - Store full text, set element text to `''`
    - `setInterval` at 35 ms/char, append one char plus `|` cursor
    - After all chars appended, wait 600 ms then remove `|`
    - If `reducedMotion`: display full text immediately, no cursor
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 3.3 Wire scramble → typewriter
    - Pass `initTypewriter` as the `onComplete` callback to `initScrambleText`
    - _Requirements: 4.2_

- [ ] 4. Checkpoint — Ensure scroll bar, scramble, and typewriter work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement Staggered Card Entrance and Tag Shimmer
  - [x] 5.1 Implement `initStaggeredEntrance(reducedMotion)`
    - Inject CSS that overrides `body.js-loaded .project-card` opacity/transform rules so `main.js` cannot conflict
    - Set each card to `opacity:0; transform:translateY(24px)` via inline style immediately
    - Create an `IntersectionObserver` (threshold 0.15); on intersection set `transition` and animate to `opacity:1; transform:translateY(0)` with `index * 120ms` delay
    - If `reducedMotion`: set all cards to `opacity:1; transform:none` immediately
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 5.2 Implement `initTagShimmer(reducedMotion)`
    - Inject `@keyframes mi-tag-shimmer` and `.mi-tag-shimmer` CSS
    - Reuse the same `IntersectionObserver` from staggered entrance (or a new one) to fire once per card
    - On card intersection add `.mi-tag-shimmer` to each `.tag` with `animation-delay: tagIndex * 60ms`
    - Track fired cards in a `Set` to prevent re-triggering
    - If `reducedMotion`: never add the class
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 6. Implement Spotlight Effect and 3D Tilt on Project Cards
  - [x] 6.1 Implement `initSpotlight()`
    - Inject CSS for `.mi-spotlight` overlay (position absolute, inset 0, pointer-events none, opacity 0, transition 300ms)
    - Inject `<div class="mi-spotlight">` as last child of each `.project-card`
    - On card `mousemove`: compute cursor-relative coords, update `background` radial-gradient center, set `opacity:1`
    - On card `mouseleave`: set `opacity:0`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 6.2 Implement `initTiltCards(reducedMotion)`
    - Inject `perspective:800px` on `.projects-grid` via style
    - On card `mousemove`: compute `nx`, `ny` normalized offsets; apply `transform: translateY(-4px) rotateX(${-ny*12}deg) rotateY(${nx*12}deg)`
    - On card `mouseleave`: reset to `transform:translateY(-4px)`, then after `transitionend` clear inline transform
    - If `reducedMotion`: skip all rotation
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 7. Checkpoint — Ensure card entrance, shimmer, spotlight, and tilt work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement Magnetic Buttons
  - [x] 8.1 Implement `initMagneticButtons(reducedMotion)`
    - Target `document.querySelectorAll('.footer-links a')`
    - On `body` `mousemove`: for each button compute distance from cursor to button center
    - If distance ≤ 80 px: `tx = clamp((cx - bx) * 0.35, -12, 12)`, `ty = clamp((cy - by) * 0.35, -12, 12)`; apply `transform: translate(tx px, ty px)`
    - If distance > 80 px: reset transform with `transition: transform 400ms ease-out`
    - If `reducedMotion`: skip all translation
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 9. Implement Custom Cursor
  - [x] 9.1 Implement `initCustomCursor(reducedMotion)`
    - Guard: only initialize if `matchMedia('(pointer: fine)').matches`
    - Inject `<div id="mi-cursor-ring">` and `<div id="mi-cursor-dot">` into `<body>`
    - Inject CSS: `cursor:none` on `body.mi-custom-cursor`; ring 24px, 2px accent border; dot 6px solid accent; both `position:fixed; pointer-events:none; z-index:99999`
    - Add `body.mi-custom-cursor` class
    - rAF loop: ring follows `mouseX/mouseY` exactly; dot lerps with factor 0.12
    - On `mouseenter`/`mouseleave` of `a, button`: toggle `.mi-cursor-hover` on ring (scales to 38px via CSS transition 200ms)
    - On `document` `mouseleave`: hide both elements; on `mouseenter`: show both
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9_

- [x] 10. Wire all init functions and final integration
  - [x] 10.1 Call all `init*` functions in the correct order inside `DOMContentLoaded`
    - Order: `initScrollBar` → `initScrambleText(reducedMotion, () => initTypewriter(reducedMotion))` → `initStaggeredEntrance(reducedMotion)` → `initTiltCards(reducedMotion)` → `initSpotlight()` → `initTagShimmer(reducedMotion)` → `initMagneticButtons(reducedMotion)` → `initCustomCursor(reducedMotion)`
    - Verify no global variables leak outside the IIFE
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 11. Final checkpoint — Ensure all effects work end-to-end
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The design has no Correctness Properties section, so no property-based tests are included; unit/integration tests are not required by the spec
- All effects share a single `reducedMotion` flag read once at init
- The staggered entrance CSS override (task 5.1) is the only intentional interaction with existing `styles.css` rules, as permitted by Requirement 6.4
