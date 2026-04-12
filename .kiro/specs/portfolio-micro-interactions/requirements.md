# Requirements Document

## Introduction

A suite of micro-interactions and visual effects layered onto the existing static developer portfolio (index.html / styles.css / main.js / hero-animation.js). The goal is to elevate the perceived quality of the site through tactile, purposeful motion — magnetic buttons, 3D card tilt, text scramble/typewriter effects, scroll-driven animations, a spotlight hover effect, animated skill tags, and a custom cursor. All effects must degrade gracefully when JavaScript is unavailable or when the user prefers reduced motion.

## Glossary

- **Portfolio_Site**: The existing single-page developer portfolio web application
- **Micro_Interaction_Module**: The new JavaScript module (`micro-interactions.js`) that implements all effects in this spec
- **Magnetic_Button**: A footer social icon link that translates toward the cursor when the cursor is within a defined proximity radius
- **Tilt_Card**: A `.project-card` element that rotates in 3D along the X and Y axes in response to cursor position within the card
- **Scramble_Text**: The hero `<h1>` element whose characters randomize through a character set before resolving to the real text on page load
- **Typewriter_Text**: The `.hero-sub` paragraph that renders its content character by character at a fixed interval
- **Scroll_Progress_Bar**: A fixed, full-width bar at the top of the viewport whose width reflects the user's scroll progress through the page
- **Staggered_Entrance**: The sequential, delayed entrance animation applied to `.project-card` elements as they enter the viewport
- **Spotlight_Effect**: A radial gradient overlay that follows the cursor inside a `.project-card`, simulating a torch or spotlight
- **Tag_Shimmer**: A brief shimmer or pulse animation applied to `.tag` elements when their parent `.project-card` enters the viewport
- **Custom_Cursor**: A replacement for the default OS cursor consisting of a larger outer ring and a smaller inner dot that lags behind the ring
- **Accent_Color**: `#BF5700` — the burnt orange already used throughout the portfolio
- **Reduced_Motion**: The `prefers-reduced-motion: reduce` media query state


## Requirements

### Requirement 1: Magnetic Buttons

**User Story:** As a visitor, I want the footer social icons to subtly pull toward my cursor as I hover near them, so that the interaction feels premium and tactile.

#### Acceptance Criteria

1. WHEN the cursor enters a proximity radius of 80px around a footer icon link, THE Magnetic_Button SHALL translate toward the cursor position using a CSS `transform: translate()` proportional to the cursor's offset from the element's center.
2. WHEN the cursor exits the 80px proximity radius, THE Magnetic_Button SHALL animate back to its original position using a CSS transition of 400ms with an ease-out timing function.
3. THE Magnetic_Button SHALL limit the maximum translation to 12px in any direction to prevent the element from moving outside its layout bounds.
4. IF Reduced_Motion is active, THEN THE Magnetic_Button SHALL apply no translation and SHALL remain in its default position at all times.
5. THE Magnetic_Button SHALL not interfere with the existing `color` hover transition defined in `styles.css`.

---

### Requirement 2: 3D Tilt on Project Cards

**User Story:** As a visitor, I want project cards to subtly rotate in 3D as I move my mouse over them, so that the grid feels dimensional and engaging.

#### Acceptance Criteria

1. WHEN the cursor moves over a Tilt_Card, THE Tilt_Card SHALL apply a `rotateX` and `rotateY` CSS transform proportional to the cursor's position relative to the card's center, with a maximum rotation of 12 degrees on each axis.
2. THE Tilt_Card SHALL apply a `perspective` of 800px to its parent container to produce a realistic 3D depth effect.
3. WHEN the cursor leaves a Tilt_Card, THE Tilt_Card SHALL reset its transform to `rotateX(0deg) rotateY(0deg)` using a transition of 500ms with an ease-out timing function.
4. THE Tilt_Card SHALL preserve the existing `translateY(-4px)` hover lift defined in `styles.css` by composing transforms rather than replacing them.
5. IF Reduced_Motion is active, THEN THE Tilt_Card SHALL apply no rotation transform at any time.

---

### Requirement 3: Scramble/Glitch Text on Hero Heading

**User Story:** As a visitor, I want the hero heading to scramble through random characters before resolving to the real text on page load, so that the site immediately communicates a "hacker" aesthetic fitting a CS portfolio.

#### Acceptance Criteria

1. WHEN the page finishes loading, THE Scramble_Text SHALL begin animating by replacing each character in the heading with a randomly selected character from a defined set of printable ASCII characters (characters 33–126).
2. THE Scramble_Text SHALL resolve each character position to its correct final character sequentially from left to right, with each position resolving after a delay proportional to its index.
3. THE Scramble_Text SHALL complete the full scramble-to-resolve sequence within 1800 milliseconds of page load.
4. THE Scramble_Text SHALL preserve all HTML child elements (e.g., the `<span class="accent">` wrapper) and their styles throughout the animation.
5. IF Reduced_Motion is active, THEN THE Scramble_Text SHALL display the final resolved text immediately without any scramble animation.

---

### Requirement 4: Typewriter Effect on Hero Subtitle

**User Story:** As a visitor, I want the hero subtitle to type itself out character by character, so that it draws attention and feels more dynamic than a static fade-in.

#### Acceptance Criteria

1. WHEN the page finishes loading, THE Typewriter_Text SHALL begin rendering its content one character at a time at an interval of 35 milliseconds per character.
2. THE Typewriter_Text SHALL start the typewriter sequence only after the Scramble_Text animation has completed, so the two effects do not compete visually.
3. WHILE the Typewriter_Text is animating, THE Typewriter_Text SHALL display a blinking cursor character (`|`) at the end of the current text.
4. WHEN the Typewriter_Text has rendered all characters, THE Typewriter_Text SHALL remove the blinking cursor character after a 600ms pause.
5. IF Reduced_Motion is active, THEN THE Typewriter_Text SHALL display the full subtitle text immediately without any typewriter animation.

---

### Requirement 5: Scroll Progress Bar

**User Story:** As a visitor, I want a thin accent-colored bar at the top of the page that fills as I scroll, so that I have a clear visual indicator of my reading progress.

#### Acceptance Criteria

1. THE Scroll_Progress_Bar SHALL be a fixed-position element rendered at the top of the viewport, spanning the full viewport width, with a height of 3px and a background color of `var(--accent)`.
2. WHEN the user scrolls the page, THE Scroll_Progress_Bar SHALL update its width as a percentage equal to `(scrollY / (documentHeight - viewportHeight)) * 100`.
3. THE Scroll_Progress_Bar SHALL update on every `scroll` event using `requestAnimationFrame` to avoid layout thrashing.
4. THE Scroll_Progress_Bar SHALL be rendered above all other page content using a `z-index` of 9999.
5. IF Reduced_Motion is active, THE Scroll_Progress_Bar SHALL still update its width on scroll, as it is a functional indicator rather than a decorative animation.

---

### Requirement 6: Staggered Card Entrance

**User Story:** As a visitor, I want project cards to slide in one by one with a slight delay between each, so that the grid feels alive rather than appearing all at once.

#### Acceptance Criteria

1. WHEN a `.project-card` enters the viewport, THE Staggered_Entrance SHALL animate the card from `opacity: 0; transform: translateY(24px)` to `opacity: 1; transform: translateY(0)` over 500ms with an ease-out timing function.
2. THE Staggered_Entrance SHALL apply a stagger delay of 120ms multiplied by the card's zero-based index within the grid (card 0: 0ms, card 1: 120ms, card 2: 240ms).
3. THE Staggered_Entrance SHALL use an `IntersectionObserver` with a threshold of 0.15 to trigger the animation.
4. THE Staggered_Entrance SHALL replace the existing scroll-triggered fade-in for `.project-card` elements defined in `main.js` and `styles.css`, so the two mechanisms do not conflict.
5. IF Reduced_Motion is active, THEN THE Staggered_Entrance SHALL make all cards immediately visible without any translate or opacity animation.

---

### Requirement 7: Spotlight / Torch Effect on Project Cards

**User Story:** As a visitor, I want a radial gradient to follow my cursor inside each project card, so that hovering feels like shining a light on the card, complementing the dark theme.

#### Acceptance Criteria

1. WHEN the cursor moves over a Tilt_Card, THE Spotlight_Effect SHALL render a radial gradient centered on the cursor's position within the card, using a semi-transparent white-to-transparent gradient with a radius of 180px.
2. THE Spotlight_Effect SHALL be implemented as a CSS `background` applied to a pseudo-element or overlay `div` inside the card, updated via inline style on `mousemove`.
3. WHEN the cursor leaves a Tilt_Card, THE Spotlight_Effect SHALL fade out over 300ms by transitioning the overlay opacity from 1 to 0.
4. THE Spotlight_Effect SHALL not obscure the card's text content or interactive elements; the overlay SHALL use `pointer-events: none`.
5. IF Reduced_Motion is active, THEN THE Spotlight_Effect SHALL still render on hover, as it is a positional effect rather than an autonomous animation.

---

### Requirement 8: Animated Skill / Tag Pills

**User Story:** As a visitor, I want the technology tags on each project card to pulse or shimmer briefly when the card enters view, so that they draw attention to the tech stack.

#### Acceptance Criteria

1. WHEN a `.project-card` enters the viewport, THE Tag_Shimmer SHALL apply a shimmer keyframe animation to each `.tag` element within that card.
2. THE Tag_Shimmer SHALL stagger the animation start across the tags within a single card, with a delay of 60ms per tag index.
3. THE Tag_Shimmer animation SHALL transition the tag's background color from its default `rgba(191, 87, 0, 0.12)` to `rgba(191, 87, 0, 0.35)` and back over a duration of 600ms.
4. THE Tag_Shimmer SHALL fire only once per card per page load; re-entering the viewport SHALL NOT re-trigger the animation.
5. IF Reduced_Motion is active, THEN THE Tag_Shimmer SHALL not apply any animation to the tags.

---

### Requirement 9: Custom Cursor

**User Story:** As a visitor on a desktop device, I want a custom cursor consisting of a small outer ring and a lagging inner dot, so that the cursor feels polished and unique.

#### Acceptance Criteria

1. THE Custom_Cursor SHALL consist of two DOM elements: an outer ring (24px diameter, 2px border in `var(--accent)`, transparent fill) and an inner dot (6px diameter, solid `var(--accent)` fill).
2. THE Custom_Cursor outer ring SHALL follow the cursor position exactly, updated on every `mousemove` event using `requestAnimationFrame`.
3. THE Custom_Cursor inner dot SHALL lag behind the outer ring by interpolating toward the outer ring's position each frame using a lerp factor of 0.12.
4. WHEN the cursor hovers over an interactive element (links, buttons), THE Custom_Cursor outer ring SHALL scale to 1.6× its default size using a CSS transition of 200ms.
5. THE Custom_Cursor SHALL hide the default OS cursor by applying `cursor: none` to the `body` element.
6. WHEN the cursor leaves the browser window, THE Custom_Cursor elements SHALL be hidden.
7. WHEN the cursor re-enters the browser window, THE Custom_Cursor elements SHALL become visible again.
8. IF the device is a touch device (no pointer: fine media query match), THEN THE Custom_Cursor SHALL not be initialized and the default cursor behavior SHALL be preserved.
9. IF Reduced_Motion is active, THEN THE Custom_Cursor SHALL still render and track the cursor, as cursor tracking is not an autonomous animation.

---

### Requirement 10: Graceful Degradation and Integration

**User Story:** As a developer maintaining this portfolio, I want all micro-interactions to be implemented in a single self-contained module that integrates cleanly with the existing codebase, so that the effects can be added or removed without breaking the base site.

#### Acceptance Criteria

1. THE Micro_Interaction_Module SHALL be implemented as a single JavaScript file (`micro-interactions.js`) loaded via a `<script>` tag in `index.html` after `main.js` and `hero-animation.js`.
2. THE Micro_Interaction_Module SHALL wrap all logic in an IIFE or ES module to avoid polluting the global scope.
3. WHEN JavaScript is disabled, THE Portfolio_Site SHALL remain fully functional and visually complete, with all content visible and all links operable.
4. THE Micro_Interaction_Module SHALL check for `prefers-reduced-motion: reduce` once at initialization and apply the appropriate reduced-motion behavior to all effects as specified in Requirements 1–9.
5. THE Micro_Interaction_Module SHALL not modify or override any existing CSS class names, IDs, or JavaScript logic defined in `styles.css`, `main.js`, or `hero-animation.js`, except where Requirement 6.4 explicitly requires replacing the card fade-in.
