# Design Document: Portfolio Micro-Interactions

## Overview

This feature adds a suite of tactile micro-interactions to the existing static developer portfolio via a single new file: `micro-interactions.js`. The module is loaded after `main.js` and `hero-animation.js` and wraps all logic in an IIFE to avoid global scope pollution.

The nine interaction systems are:

1. Magnetic footer buttons
2. 3D tilt on project cards
3. Scramble/glitch text on the hero `<h1>`
4. Typewriter effect on `.hero-sub`
5. Scroll progress bar
6. Staggered card entrance (replaces the existing `main.js` card fade-in)
7. Spotlight/torch effect on project cards
8. Animated shimmer on `.tag` pills
9. Custom cursor (outer ring + lagging inner dot)

All effects check `prefers-reduced-motion` once at initialization and apply the appropriate degraded behavior. When JavaScript is disabled the page remains fully functional because all content is visible in the HTML and the module adds no required markup.

---

## Architecture

The module is a single IIFE with a linear initialization sequence:

```
DOMContentLoaded
  └─ init()
       ├─ reducedMotion = matchMedia('prefers-reduced-motion: reduce').matches
       ├─ initScrollBar()
       ├─ initScrambleText(reducedMotion)
       ├─ initTypewriter(reducedMotion)        ← called by scramble on completion
       ├─ initStaggeredEntrance(reducedMotion) ← replaces main.js card observer
       ├─ initTiltCards(reducedMotion)
       ├─ initSpotlight()
       ├─ initTagShimmer(reducedMotion)
       ├─ initMagneticButtons(reducedMotion)
       └─ initCustomCursor(reducedMotion)
```

Each `init*` function is self-contained: it queries the DOM, attaches event listeners, and manages its own state. No shared mutable state exists between subsystems except the `reducedMotion` flag.

The module patches the existing `main.js` card fade-in by removing the `.project-card` elements from the `main.js` IntersectionObserver before they become visible, then taking ownership of their entrance animation. This is achieved by adding a `data-mi-owned` attribute to each card immediately at module load (before `main.js`'s observer fires), so `main.js` never marks them `.visible`.

> Design decision: patching via a data attribute is safer than monkey-patching `IntersectionObserver` and avoids touching `main.js` source.

---

## Components and Interfaces

### 1. Scroll Progress Bar

**DOM**: One `<div id="mi-scroll-bar">` injected as the first child of `<body>`.

**CSS** (injected via `<style>` tag):
```css
#mi-scroll-bar {
  position: fixed;
  top: 0; left: 0;
  width: 0%;
  height: 3px;
  background: var(--accent);
  z-index: 9999;
  pointer-events: none;
}
```

**Logic**: On `scroll`, schedule a `requestAnimationFrame` callback that sets `bar.style.width = pct + '%'` where `pct = scrollY / (document.documentElement.scrollHeight - innerHeight) * 100`. A `ticking` boolean prevents multiple rAF calls per frame.

---

### 2. Scramble Text

**Target**: `document.querySelector('h1')` — the hero heading.

**Algorithm**:
- Snapshot the `innerHTML` of `<h1>` to preserve the `<span class="accent">` child.
- Build a flat array of `{node, charIndex, finalChar}` tuples by walking only `Text` nodes inside `<h1>`.
- On each rAF tick, replace non-resolved characters with `String.fromCharCode(33 + Math.random() * 94)`.
- Resolve characters left-to-right: character at index `i` resolves after `i * (1800 / totalChars)` ms.
- On completion, call the typewriter initializer.

**Reduced motion**: skip animation, display final text immediately, call typewriter initializer immediately.

---

### 3. Typewriter Effect

**Target**: `document.querySelector('.hero-sub')`.

**Algorithm**:
- Store full text content. Set element text to `''`.
- Use `setInterval` at 35 ms/char to append one character at a time plus a `|` cursor character.
- After all characters are appended, wait 600 ms then remove the `|`.

**Reduced motion**: display full text immediately, no cursor.

---

### 4. Magnetic Buttons

**Targets**: `document.querySelectorAll('.footer-links a')`.

**Algorithm**:
- On `mousemove` over `<body>`, for each button compute distance from cursor to button center.
- If distance ≤ 80 px: `tx = clamp((cx - bx) * 0.35, -12, 12)`, `ty = clamp((cy - by) * 0.35, -12, 12)`. Apply `transform: translate(tx px, ty px)`.
- On distance > 80 px (or `mouseleave`): reset transform to `translate(0,0)` with `transition: transform 400ms ease-out`.
- The existing `color` transition on `.footer-links a` is on a separate CSS property and is unaffected.

**Reduced motion**: skip all translation.

---

### 5. 3D Tilt Cards

**Targets**: `document.querySelectorAll('.project-card')`.

**Algorithm**:
- Set `perspective: 800px` on `.projects-grid` via injected style.
- On `mousemove` inside a card: compute normalized offset `nx = (cx - cardCenterX) / (cardW / 2)`, `ny = (cy - cardCenterY) / (cardH / 2)`. Apply `transform: translateY(-4px) rotateX(${-ny*12}deg) rotateY(${nx*12}deg)`. The `translateY(-4px)` preserves the existing hover lift.
- On `mouseleave`: reset to `transform: translateY(-4px)` then after transition end reset to `''` (so the CSS `:hover` rule takes over again).

**Reduced motion**: no rotation applied.

---

### 6. Staggered Card Entrance

**Targets**: `document.querySelectorAll('.project-card')`.

**Coordination with `main.js`**: Cards are given `data-mi-owned="true"` synchronously at module parse time (before DOMContentLoaded observers fire). The `main.js` observer still calls `observer.observe(card)` but the card will never receive `.visible` from it because `micro-interactions.js` manages visibility directly via inline styles.

Actually, to be safe, `micro-interactions.js` will call `observer.unobserve` on each card via a MutationObserver watching for the `.visible` class being added — but a simpler approach is: since `micro-interactions.js` loads after `main.js`, by the time `DOMContentLoaded` fires both scripts have run. `micro-interactions.js` removes `.project-card` from the `main.js` observer by re-querying and calling `unobserve` on a new observer that wraps the same elements. 

**Revised approach**: `micro-interactions.js` overrides the card visibility by:
1. Ensuring cards start at `opacity:0; transform:translateY(24px)` (set via inline style immediately).
2. Using its own `IntersectionObserver` (threshold 0.15) to trigger the entrance.
3. On intersection: set `transition` and animate to `opacity:1; transform:translateY(0)` with a stagger delay of `index * 120ms`.

Since `main.js` also observes `.project-card` and will add `.visible` (which sets `opacity:1; transform:translateY(0)` via CSS), the two could conflict. The fix: `micro-interactions.js` removes the `body.js-loaded .project-card` CSS rules by injecting a style that overrides them, and manages card visibility entirely via inline styles.

**Reduced motion**: set all cards to `opacity:1; transform:none` immediately.

---

### 7. Spotlight Effect

**Target**: each `.project-card`.

**DOM**: inject a `<div class="mi-spotlight">` as the last child of each card.

**CSS** (injected):
```css
.mi-spotlight {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  transition: opacity 300ms ease;
  background: radial-gradient(circle 180px at 50% 50%, rgba(255,255,255,0.07), transparent);
}
.project-card { position: relative; }
```

**Logic**: On `mousemove` inside a card, update `background` with cursor-relative coordinates and set `opacity: 1`. On `mouseleave`, set `opacity: 0`.

**Reduced motion**: spotlight still renders (positional, not autonomous).

---

### 8. Tag Shimmer

**Targets**: `.tag` elements inside each `.project-card`.

**CSS** (injected):
```css
@keyframes mi-tag-shimmer {
  0%   { background-color: rgba(191,87,0,0.12); }
  50%  { background-color: rgba(191,87,0,0.35); }
  100% { background-color: rgba(191,87,0,0.12); }
}
.mi-tag-shimmer {
  animation: mi-tag-shimmer 600ms ease forwards;
}
```

**Logic**: The same `IntersectionObserver` used for staggered entrance triggers tag shimmer when a card enters the viewport. Each `.tag` within the card gets `.mi-tag-shimmer` added with a `animation-delay` of `tagIndex * 60ms`. The observer disconnects after firing (fires once per card).

**Reduced motion**: class is never added.

---

### 9. Custom Cursor

**DOM**: Two elements injected into `<body>`:
```html
<div id="mi-cursor-ring"></div>
<div id="mi-cursor-dot"></div>
```

**CSS** (injected):
```css
body.mi-custom-cursor { cursor: none; }
#mi-cursor-ring {
  position: fixed; pointer-events: none; z-index: 99999;
  width: 24px; height: 24px;
  border: 2px solid var(--accent);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: transform 200ms ease, width 200ms ease, height 200ms ease;
  will-change: left, top;
}
#mi-cursor-dot {
  position: fixed; pointer-events: none; z-index: 99999;
  width: 6px; height: 6px;
  background: var(--accent);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  will-change: left, top;
}
#mi-cursor-ring.mi-cursor-hover {
  width: 38px; height: 38px;  /* 24 * 1.6 ≈ 38 */
}
```

**Logic**:
- `mouseX/mouseY` updated on `mousemove` via rAF.
- Ring: `ring.style.left = mouseX + 'px'; ring.style.top = mouseY + 'px'` each frame.
- Dot: lerp `dotX += (mouseX - dotX) * 0.12`, `dotY += (mouseY - dotY) * 0.12` each frame.
- Interactive elements (`a, button`): add/remove `.mi-cursor-hover` on `mouseenter`/`mouseleave`.
- `mouseleave` on `document`: hide both elements. `mouseenter` on `document`: show both.
- Touch guard: only initialize if `matchMedia('(pointer: fine)').matches`.

**Reduced motion**: cursor still renders (tracking is not autonomous animation).

---

## Data Models

All state is local to each `init*` closure. No shared data store is needed.

```
ScrollBarState {
  bar: HTMLElement
  ticking: boolean
}

ScrambleState {
  chars: Array<{ node: Text, index: number, finalChar: string }>
  startTime: number
  totalDuration: 1800  // ms
  onComplete: () => void
}

TypewriterState {
  el: HTMLElement
  fullText: string
  index: number
  intervalId: number
}

MagneticState {
  buttons: NodeList<HTMLAnchorElement>
  // per-button: { el, cx, cy, width, height }
}

TiltState {
  cards: NodeList<HTMLElement>
  // per-card: active boolean
}

CursorState {
  ring: HTMLElement
  dot: HTMLElement
  mouseX: number
  mouseY: number
  dotX: number
  dotY: number
  rafHandle: number
}

EntranceState {
  observer: IntersectionObserver
  cards: Array<HTMLElement>
}

SpotlightState {
  // per-card overlay div
}

TagShimmerState {
  // fired set: Set<HTMLElement> — cards already animated
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

