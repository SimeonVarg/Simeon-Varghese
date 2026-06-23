/* nav.js — fixed site nav: scrolled state, flying-name hero→nav morph,
   active-section highlight, smooth scroll, and mobile hamburger toggle. */
(function () {
  'use strict';

  function init() {
    const nav = document.getElementById('site-nav');
    if (!nav) return;

    const toggle = document.getElementById('nav-toggle');
    const linksList = document.getElementById('nav-links');
    const links = Array.from(nav.querySelectorAll('.nav-link'));
    const hero = document.getElementById('hero');
    const flyer = document.getElementById('flying-name');
    const brand = nav.querySelector('.nav-brand');
    const heroAccent = document.querySelector('#hero h1 .accent');

    const prefersReduced = typeof matchMedia !== 'undefined' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Flying-name morph (handoff model) ────────────────────────────────────
    // At rest the REAL hero <h1> name is shown and scrolls naturally — the flyer
    // is hidden, so page load looks exactly as before. When the hero crosses
    // the boundary we measure live rects, drop the flyer onto the anchor it's
    // leaving FROM (no transition), then on the next frame flip it to the
    // destination state so CSS animates position + size + colour + period.
    // Landing back on the hero retires the flyer and re-shows the real name.
    const morphReady = flyer && brand && heroAccent;
    let currentHero = true;        // current settled state
    let morphRaf = null;           // running rAF for the active morph
    // Flyer's resting nav-corner font size (CSS default 1.05rem), resolved to px.
    const navFont = morphReady ? parseFloat(getComputedStyle(flyer).fontSize) : 0;

    if (morphReady) {
      brand.setAttribute('aria-hidden', 'true');
    }

    function easeInOut(t) {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    // Bounding rect of an element's rendered TEXT GLYPHS (via a Range over its
    // first non-empty text node, leading/trailing whitespace trimmed). We must
    // align glyph-to-glyph, not box-to-box: the hero name lives in an h1 whose
    // wrapping/whitespace makes getBoundingClientRect().left sit ~30px LEFT of
    // the actual glyphs, and the flyer's period span inflates its box height —
    // so box alignment is off both horizontally and vertically. Glyph rects are
    // exact. (Verified in a headless browser: box-align gave a 30px/23px jump.)
    function glyphRect(el) {
      let node = null;
      for (let i = 0; i < el.childNodes.length; i++) {
        const n = el.childNodes[i];
        if (n.nodeType === 3 && n.textContent.trim().length) { node = n; break; }
      }
      if (!node) return el.getBoundingClientRect();
      const txt = node.textContent;
      const s = txt.length - txt.replace(/^\s+/, '').length;
      const e = txt.replace(/\s+$/, '').length;
      const range = document.createRange();
      range.setStart(node, s);
      range.setEnd(node, e);
      return range.getBoundingClientRect();
    }

    // Place the flyer so ITS glyphs sit exactly at (glyphLeft, glyphTop). We
    // read the flyer's own current glyph-within-box offset every call, so this
    // self-corrects as the flyer's font-size eases (the period span, leading,
    // and box height all change mid-morph) and lands pixel-exact at the end.
    function placeGlyphsAt(glyphLeft, glyphTop) {
      const box = flyer.getBoundingClientRect();
      const g = glyphRect(flyer);
      flyer.style.setProperty('--fly-left', (glyphLeft - (g.left - box.left)) + 'px');
      flyer.style.setProperty('--fly-top', (glyphTop - (g.top - box.top)) + 'px');
    }

    // Drive the morph by hand each frame. Size + colour are eased by CSS (the
    // .at-hero class toggle), but POSITION is interpolated in JS so it can chase
    // the live anchor — critical going back to the hero, whose name keeps moving
    // as the user scrolls. Without this the flyer would aim at a stale point,
    // finish, then teleport to wherever the real name ended up.
    function morphTo(toHero) {
      if (!morphReady || toHero === currentHero) return;
      currentHero = toHero;
      if (morphRaf) { cancelAnimationFrame(morphRaf); morphRaf = null; }

      // Hide the real hero name while the flyer stands in for it.
      heroAccent.classList.add('fly-anchor');

      const heroSize = parseFloat(getComputedStyle(heroAccent).fontSize);
      flyer.style.setProperty('--fly-hero-size', heroSize + 'px');

      // FROM anchor is whichever element the flyer is leaving; TO anchor is the
      // one it's heading to. We re-measure the TO anchor every frame.
      const fromEl   = toHero ? brand : heroAccent;
      const toEl     = toHero ? heroAccent : brand;
      const from     = glyphRect(fromEl);   // glyph rect of the departure point
      const fromSize = toHero ? navFont : heroSize;
      const toSize   = toHero ? heroSize : navFont;

      // Reduced motion: no slide, just settle on the destination glyphs.
      if (prefersReduced) {
        flyer.style.transition = 'none';
        flyer.classList.add('active');
        flyer.classList.toggle('at-hero', toHero);
        flyer.style.fontSize = toSize + 'px';
        const to = glyphRect(toEl);
        placeGlyphsAt(to.left, to.top);
        flyer.style.transition = '';
        if (toHero) {
          heroAccent.classList.remove('fly-anchor');
          flyer.classList.remove('active');
        }
        return;
      }

      // Establish a clean FROM frame: set the FROM colour state + font size with
      // transitions suppressed and place the flyer's glyphs on the FROM anchor,
      // so the first painted frame matches exactly (no flash). Forcing a reflow
      // commits this before we flip to the TO colour state.
      flyer.style.transition = 'none';
      flyer.classList.add('active');
      flyer.classList.toggle('at-hero', !toHero);   // FROM colour/letter-spacing
      flyer.style.fontSize = fromSize + 'px';
      placeGlyphsAt(from.left, from.top);
      void flyer.offsetWidth;                        // force reflow — commit FROM
      flyer.style.transition = '';                   // re-enable colour/ls easing
      flyer.classList.toggle('at-hero', toHero);     // TO colour → eases via CSS

      // Time-based travel. Each frame we ease BOTH the font size and the glyph
      // target (from the FROM glyphs to the re-measured live TO glyphs), then
      // place the flyer's glyphs there. Driving font size in JS (not CSS) means
      // size and position advance together every frame — no easing-lag drift —
      // so the flyer stays welded to the moving name and lands pixel-exact.
      const DURATION = 550;
      let t0 = null;
      function step(now) {
        if (t0 == null) t0 = now;
        const e = easeInOut(Math.min(1, (now - t0) / DURATION));
        flyer.style.fontSize = (fromSize + (toSize - fromSize) * e) + 'px';
        const to = glyphRect(toEl);         // live — re-measured every frame
        placeGlyphsAt(
          from.left + (to.left - from.left) * e,
          from.top  + (to.top  - from.top)  * e
        );
        if (e < 1) {
          morphRaf = requestAnimationFrame(step);
          return;
        }
        // Final exact pin at the settled size. CRITICAL: this placement must be
        // PAINTED before we hand off. If we hid the flyer in this same frame the
        // browser would never paint the exact position — the last painted flyer
        // frame would be the prior e<1 frame (a few px short), cutting to the
        // real name → a visible jump. So paint here, hand off on the NEXT frame.
        flyer.style.fontSize = toSize + 'px';
        const settled = glyphRect(toEl);
        placeGlyphsAt(settled.left, settled.top);
        if (!toHero) { morphRaf = null; return; }   // nav rest: flyer stays put
        morphRaf = requestAnimationFrame(function () {
          morphRaf = null;
          // Flyer glyphs were painted exactly on the real name's glyphs last
          // frame — now reveal the real (scrolling) name and retire the flyer.
          // Zero jump: pixel-aligned, and the swap happens between two frames.
          heroAccent.classList.remove('fly-anchor');
          flyer.classList.remove('active');
        });
      }
      morphRaf = requestAnimationFrame(step);
    }

    // ── Bar background: keyed off the hero SECTION leaving the viewport ──────
    if (hero && typeof IntersectionObserver !== 'undefined') {
      const barObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          nav.classList.toggle('scrolled', !entry.isIntersecting);
        });
      }, { rootMargin: '-80px 0px 0px 0px', threshold: 0 });
      barObserver.observe(hero);
    } else if (hero) {
      window.addEventListener('scroll', function () {
        nav.classList.toggle('scrolled', window.scrollY > window.innerHeight - 80);
      }, { passive: true });
    }

    // ── Flyer morph: keyed off the hero NAME crossing under the nav ──────────
    // The name lives centered in a 100vh hero, so the section boundary fires
    // far too late. Observe the name itself: when its box scrolls up under the
    // nav bar (≈64px), hand off to the flyer; when it scrolls back into view,
    // morph home. The negative top rootMargin shrinks the viewport's top edge
    // down to the nav line so "not intersecting" == "tucked under the nav".
    if (morphReady && typeof IntersectionObserver !== 'undefined') {
      const nameObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          morphTo(entry.isIntersecting);   // visible → hero state; gone → nav state
        });
      }, { rootMargin: '-64px 0px 0px 0px', threshold: 0 });
      nameObserver.observe(heroAccent);
    } else if (morphReady) {
      window.addEventListener('scroll', function () {
        const r = heroAccent.getBoundingClientRect();
        morphTo(r.bottom > 64);
      }, { passive: true });
    }

    // ── Active-section highlight ────────────────────────────────────────────
    const sections = links
      .map(function (link) {
        const id = link.getAttribute('href').slice(1);
        return { link: link, section: document.getElementById(id) };
      })
      .filter(function (entry) { return entry.section; });

    if (typeof IntersectionObserver !== 'undefined') {
      const sectionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            links.forEach(function (link) {
              link.classList.toggle('active', link.getAttribute('href') === '#' + id);
            });
          }
        });
      }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

      sections.forEach(function (entry) { sectionObserver.observe(entry.section); });
    }

    // ── Smooth scroll for all in-page anchors in the nav (+ flyer) ──────────
    const anchors = Array.from(nav.querySelectorAll('a[href^="#"]'));
    if (flyer) anchors.push(flyer);
    anchors.forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const id = anchor.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        closeMenu();
        target.scrollIntoView({
          behavior: prefersReduced ? 'auto' : 'smooth',
          block: 'start'
        });
      });
    });

    // ── Mobile hamburger ─────────────────────────────────────────────────────
    function closeMenu() {
      if (!toggle) return;
      toggle.setAttribute('aria-expanded', 'false');
      linksList.classList.remove('open');
    }

    if (toggle && linksList) {
      toggle.addEventListener('click', function () {
        const open = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!open));
        linksList.classList.toggle('open', !open);
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
}());
