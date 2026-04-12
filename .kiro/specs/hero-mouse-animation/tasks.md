# Implementation Plan: Hero Mouse Animation

## Overview

Implement a canvas-based particle constellation animation in `hero-animation.js` as a self-contained IIFE. Tasks progress from canvas setup → particle logic → line drawing → cursor interaction → performance/accessibility → integration wiring.

## Tasks

- [x] 1. Create `hero-animation.js` with IIFE scaffold and canvas injection
  - Create `hero-animation.js` with an IIFE that runs on `DOMContentLoaded`
  - Guard against missing `header#hero` and missing `getContext('2d')` support
  - Implement `injectCanvas()`: create `<canvas id="hero-particle-canvas">` with `aria-hidden="true"` and inline styles `position:absolute;inset:0;z-index:0;pointer-events:none;`
  - Implement `resizeCanvas()`: sync canvas pixel dims to `hero.clientWidth` / `hero.clientHeight`
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 7.1, 7.4_

- [x] 2. Implement particle initialisation and idle drift
  - [x] 2.1 Implement `initParticles()` and `updateParticles()` (drift + edge wrap)
    - Define all module-level constants (`CONNECTION_DIST`, `REPULSION_DIST`, `RESTORE_FRAMES`, particle range/size/speed/colour constants)
    - `initParticles()`: allocate 80–120 particles with random `x`, `y`, `r` (1–2.5 px), `opacity` (0.4–0.9), `baseVx`/`baseVy` (speed 0.2–0.6 px/frame, random direction), `vx`/`vy` initialised to `baseVx`/`baseVy`
    - `updateParticles()`: advance `x += vx`, `y += vy`; apply edge-wrap for all four edges
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ]* 2.2 Write property test — particle field invariants (Property 2)
    - **Property 2: Particle field invariants** — for any particle from `initParticles()`, radius ∈ [1, 2.5], opacity ∈ [0.4, 0.9], idle speed ∈ [0.2, 0.6]
    - Use fast-check `fc.integer()` as seed; run ≥ 100 iterations
    - **Validates: Requirements 2.2, 2.3**

  - [ ]* 2.3 Write property test — particle count in range (Property 3)
    - **Property 3: Particle count in range** — `initParticles()` always produces an array of length ∈ [80, 120]
    - Use fast-check `fc.integer()` as seed
    - **Validates: Requirements 2.1**

  - [ ]* 2.4 Write property test — edge wrapping (Property 4)
    - **Property 4: Edge wrapping** — any particle placed outside canvas bounds appears at the opposite edge after one `updateParticles()` call
    - Use `fc.float` for particle position, `fc.integer` for canvas size
    - **Validates: Requirements 2.4**

- [x] 3. Implement constellation line drawing
  - [x] 3.1 Implement `drawParticles()` and `drawLines()`
    - `drawParticles()`: for each particle draw a filled arc using accent colour `#BF5700` with per-particle opacity
    - `drawLines()`: O(n²) loop over unique pairs; if distance < 120 px, stroke a line with `strokeStyle` alpha = `(120 - d) / 120`, colour `#BF5700`, `lineWidth` 0.5 px
    - _Requirements: 2.5, 3.1, 3.2, 3.3, 3.4, 5.4_

  - [ ]* 3.2 Write property test — lines drawn for proximate pairs (Property 5)
    - **Property 5: Constellation lines drawn for proximate pairs** — pairs with distance < 120 px always get a stroke; pairs ≥ 120 px never do
    - Use `fc.float` for particle x, y positions
    - **Validates: Requirements 3.1**

  - [ ]* 3.3 Write property test — line opacity proportional to proximity (Property 6)
    - **Property 6: Line opacity proportional to proximity** — for distance d ∈ [0, 120), strokeStyle alpha equals `(120 - d) / 120`
    - Use `fc.float({ min: 0, max: 119.99 })` for distance
    - **Validates: Requirements 3.2**

  - [ ]* 3.4 Write property test — O(n²) line evaluation (Property 11)
    - **Property 11: O(n²) line evaluation** — for particle count n, `drawLines()` performs exactly `n * (n - 1) / 2` unique pair evaluations per frame
    - Use `fc.integer({ min: 80, max: 120 })` for n
    - **Validates: Requirements 5.4**

- [x] 4. Implement the rAF render loop and canvas clear
  - Implement `frame(ts)`: call `ctx.clearRect(0, 0, canvas.width, canvas.height)`, then `updateParticles()`, `drawLines()`, `drawParticles()`, then schedule next frame via `requestAnimationFrame`
  - Implement `startLoop()` / `stopLoop()` using `rafHandle`
  - _Requirements: 5.1, 5.3_

- [x] 5. Checkpoint — verify idle animation runs end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement cursor interaction (repulsion)
  - [x] 6.1 Implement `onMouseMove()`, `onMouseLeave()`, and repulsion logic in `updateParticles()`
    - `onMouseMove(e)`: record cursor position relative to canvas using `getBoundingClientRect()`
    - `onMouseLeave()`: set `cursor = null`
    - In `updateParticles()`: for each particle within `REPULSION_DIST` (100 px) of cursor, apply repulsion force `(dx/dist) * force * REPULSION_STRENGTH`; lerp `vx`/`vy` back toward `baseVx`/`baseVy` by factor `1/RESTORE_FRAMES` every frame
    - Bind both listeners to `header#hero`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 6.2 Write property test — cursor position recorded accurately (Property 7)
    - **Property 7: Cursor position recorded accurately** — after any mousemove event with coords (x, y), internal cursor record equals `{ x, y }`
    - Use `fc.integer` for coordinates
    - **Validates: Requirements 4.1**

  - [ ]* 6.3 Write property test — repulsion force inversely proportional to distance (Property 8)
    - **Property 8: Repulsion force inversely proportional to distance** — for d1 < d2 < 100 px, force at d1 > force at d2; for d ≥ 100 px, no force applied
    - Use `fc.float` for particle and cursor positions
    - **Validates: Requirements 4.2, 4.3**

  - [ ]* 6.4 Write property test — velocity restored within 60 frames (Property 9)
    - **Property 9: Velocity restored to idle drift within 60 frames** — after 60 `updateParticles()` calls with `cursor = null`, velocity is within ε ≤ 0.01 px/frame of `(baseVx, baseVy)`
    - Use `fc.float` for initial velocity deltas
    - **Validates: Requirements 4.4**

- [x] 7. Implement resize handling and IntersectionObserver pause/resume
  - [x] 7.1 Implement `onResize()` (debounced) and IntersectionObserver
    - `onResize()`: debounce with a short delay; call `resizeCanvas()` then re-scatter particles via `initParticles()`
    - Bind `resize` listener to `window`
    - Set up `IntersectionObserver` with threshold 0: call `stopLoop()` on `isIntersecting = false`, `startLoop()` on `isIntersecting = true`; feature-detect and fall back to always-running loop if unsupported
    - _Requirements: 1.4, 5.2_

  - [ ]* 7.2 Write property test — canvas dimensions match hero dimensions (Property 1)
    - **Property 1: Canvas dimensions match hero dimensions** — for any hero clientWidth/clientHeight, canvas pixel dims equal those values after `resizeCanvas()`
    - Use `fc.integer({ min: 100, max: 3000 })` for width and height
    - **Validates: Requirements 1.3, 1.4**

  - [ ]* 7.3 Write property test — loop pauses and resumes with hero visibility (Property 10)
    - **Property 10: Render loop pauses and resumes with hero visibility** — `isIntersecting = false` cancels rAF handle; `isIntersecting = true` schedules a new rAF
    - Use `fc.boolean()` for isIntersecting
    - **Validates: Requirements 5.2**

- [x] 8. Implement reduced-motion support
  - Feature-detect `window.matchMedia`; if unsupported, skip reduced-motion logic and let animation always run
  - At `init()`: check `prefers-reduced-motion: reduce`; if active, return without injecting canvas or starting loop
  - Add `matchMedia.addEventListener('change', …)`: on activate → `stopLoop()` + remove canvas from DOM; on deactivate → `injectCanvas()` + `initParticles()` + `startLoop()`
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 9. Wire `hero-animation.js` into `index.html` and verify integration
  - Add `<script src="hero-animation.js"></script>` to `index.html` after the existing `<script src="main.js"></script>`
  - Verify the canvas is injected as the first child of `header#hero` and that `.hero-content` z-index layering is unaffected
  - Verify no global variables are introduced and `js-loaded` class is untouched
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 10. Final checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests use **fast-check** (`npm install --save-dev fast-check`) with ≥ 100 iterations each
- Each property test file should include the tag comment: `// Feature: hero-mouse-animation, Property N: <property text>`
- Smoke tests (no `setInterval`/`setTimeout`, no `window` globals) can be verified with a static grep after task 9
