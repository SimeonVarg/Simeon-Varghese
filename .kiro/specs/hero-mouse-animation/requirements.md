# Requirements Document

## Introduction

This feature adds an interactive particle constellation animation to the `header#hero` section of the developer portfolio. When the user moves their mouse over the hero, a canvas-based field of floating particles responds — particles near the cursor are repelled outward, and nearby particles are connected by faint lines, creating a living constellation effect. The animation idles with gentle drift when the cursor is absent, and is fully disabled for users who prefer reduced motion.

The effect is implemented in vanilla JS/CSS with no external dependencies, rendered on an HTML5 `<canvas>` element layered inside the existing hero markup.

## Glossary

- **Animation_Controller**: The JavaScript module responsible for initialising, running, and tearing down the canvas animation.
- **Canvas**: The `<canvas>` element injected into `header#hero` that serves as the drawing surface.
- **Particle**: A single point in the constellation field with position, velocity, and size properties.
- **Constellation_Line**: A line drawn between two Particles whose distance is within the connection threshold.
- **Repulsion_Zone**: The circular area around the cursor within which Particles are pushed away.
- **Idle_Drift**: The slow, autonomous movement of Particles when no cursor interaction is occurring.
- **Hero**: The `header#hero` element as defined in `index.html`.
- **Reduced_Motion_Preference**: The OS/browser `prefers-reduced-motion: reduce` media query setting.

## Requirements

### Requirement 1: Canvas Initialisation

**User Story:** As a visitor, I want the hero section to display an animated particle field, so that the page feels dynamic and visually engaging from the moment I arrive.

#### Acceptance Criteria

1. WHEN the DOM is ready, THE Animation_Controller SHALL inject a `<canvas>` element as the first child of `header#hero`.
2. THE Canvas SHALL be positioned absolutely with `inset: 0`, matching the full dimensions of the Hero, and placed on a z-index between the background image overlay and the `.hero-content` (i.e. above `z-index: 0`, below `z-index: 1`).
3. THE Animation_Controller SHALL set the Canvas pixel dimensions to match the Hero's `clientWidth` and `clientHeight` at initialisation time.
4. WHEN the browser window is resized, THE Animation_Controller SHALL resize the Canvas to match the Hero's updated dimensions within one animation frame.
5. THE Canvas SHALL carry `aria-hidden="true"` so assistive technologies ignore the decorative graphic.

### Requirement 2: Particle Field

**User Story:** As a visitor, I want to see a field of softly drifting particles in the hero, so that the background feels alive even before I interact with it.

#### Acceptance Criteria

1. THE Animation_Controller SHALL initialise a field of between 80 and 120 Particles distributed pseudo-randomly across the Canvas.
2. EACH Particle SHALL have a radius between 1 px and 2.5 px and an opacity between 0.4 and 0.9.
3. EACH Particle SHALL have an Idle_Drift velocity with a speed between 0.2 px/frame and 0.6 px/frame in a random direction.
4. WHEN a Particle reaches any edge of the Canvas, THE Animation_Controller SHALL wrap it to the opposite edge so the field appears continuous.
5. THE Animation_Controller SHALL render Particles using the site's accent colour (`#BF5700`) with the per-particle opacity applied.

### Requirement 3: Constellation Lines

**User Story:** As a visitor, I want nearby particles to be visually connected, so that the field looks like a living star map rather than isolated dots.

#### Acceptance Criteria

1. WHEN two Particles are within 120 px of each other, THE Animation_Controller SHALL draw a Constellation_Line between them.
2. THE opacity of each Constellation_Line SHALL be proportional to the proximity of the two Particles — fully opaque at 0 px separation, fully transparent at 120 px separation.
3. THE Constellation_Line SHALL be rendered in the accent colour (`#BF5700`) at a stroke width of 0.5 px.
4. THE Animation_Controller SHALL evaluate and redraw all Constellation_Lines on every animation frame.

### Requirement 4: Cursor Repulsion Interaction

**User Story:** As a visitor, I want particles to react to my mouse movement, so that the animation feels responsive and interactive.

#### Acceptance Criteria

1. WHEN the cursor moves over the Hero, THE Animation_Controller SHALL record the cursor position relative to the Canvas.
2. WHEN a Particle is within 100 px of the cursor, THE Animation_Controller SHALL apply a repulsion force that pushes the Particle directly away from the cursor.
3. THE repulsion force magnitude SHALL be inversely proportional to the distance between the Particle and the cursor — stronger when closer, weaker when farther.
4. WHEN a Particle has been repelled and the cursor moves away, THE Animation_Controller SHALL gradually restore the Particle's velocity toward its original Idle_Drift speed and direction over no more than 60 frames.
5. WHEN the cursor leaves the Hero, THE Animation_Controller SHALL clear the recorded cursor position and allow all Particles to return to Idle_Drift.

### Requirement 5: Performance

**User Story:** As a visitor, I want the animation to run smoothly without degrading the rest of the page, so that my browsing experience is not impacted.

#### Acceptance Criteria

1. THE Animation_Controller SHALL drive the render loop exclusively via `requestAnimationFrame`, never via `setInterval` or `setTimeout`.
2. THE Animation_Controller SHALL cancel the active `requestAnimationFrame` handle when the Hero is no longer visible in the viewport (via `IntersectionObserver` with a threshold of 0), and SHALL resume it when the Hero re-enters the viewport.
3. WHEN the render loop is active, THE Animation_Controller SHALL clear the Canvas with `clearRect` at the start of each frame before redrawing.
4. THE Animation_Controller SHALL limit Constellation_Line evaluation to O(n²) comparisons per frame, where n is the total Particle count.

### Requirement 6: Accessibility — Reduced Motion

**User Story:** As a visitor who has enabled reduced motion in their OS settings, I want the animation to be suppressed, so that I am not exposed to motion that could cause discomfort.

#### Acceptance Criteria

1. WHEN the Reduced_Motion_Preference is active at page load, THE Animation_Controller SHALL not inject the Canvas or start the render loop.
2. WHEN the Reduced_Motion_Preference changes to active while the page is open, THE Animation_Controller SHALL cancel the render loop and remove the Canvas from the DOM.
3. WHEN the Reduced_Motion_Preference changes to inactive while the page is open, THE Animation_Controller SHALL reinitialise the Canvas and restart the render loop.

### Requirement 7: Integration with Existing Codebase

**User Story:** As a developer, I want the animation to integrate cleanly with the existing portfolio code, so that no existing functionality is broken.

#### Acceptance Criteria

1. THE Animation_Controller SHALL be implemented in a dedicated file (`hero-animation.js`) and loaded via a `<script>` tag in `index.html` after `main.js`.
2. THE Animation_Controller SHALL not modify any existing CSS rules or HTML attributes outside of the Canvas it injects.
3. THE Animation_Controller SHALL not interfere with the `.hero-content` fade-in animation defined in `styles.css`.
4. THE Animation_Controller SHALL not introduce any global variables; all state SHALL be encapsulated within an IIFE or module scope.
5. WHEN `main.js` has already added the `js-loaded` class to `document.body`, THE Animation_Controller SHALL not add or remove that class.
