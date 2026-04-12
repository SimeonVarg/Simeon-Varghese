/* hero-animation.js — Canvas particle constellation for header#hero */
(function () {
  'use strict';

  // ── Constants ────────────────────────────────────────────────────────────
  const ACCENT          = '#BF5700';
  const LINE_WIDTH      = 0.5;
  const CONNECTION_DIST = 120;
  const REPULSION_DIST  = 100;
  const REPULSION_STR   = 3;
  const RESTORE_FACTOR  = 1 / 60; // lerp factor — restores over ~60 frames
  const MIN_PARTICLES   = 80;
  const MAX_PARTICLES   = 120;
  const MIN_RADIUS      = 1;
  const MAX_RADIUS      = 2.5;
  const MIN_OPACITY     = 0.4;
  const MAX_OPACITY     = 0.9;
  const MIN_SPEED       = 0.2;
  const MAX_SPEED       = 0.6;

  // ── Module state ─────────────────────────────────────────────────────────
  let canvas    = null;
  let ctx       = null;
  let particles = [];
  let rafHandle = null;
  let cursor    = null;
  let hero      = null;
  let resizeTimer = null;

  // ── Helpers ───────────────────────────────────────────────────────────────
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  // ── Canvas injection ──────────────────────────────────────────────────────
  function injectCanvas() {
    canvas = document.createElement('canvas');
    canvas.id = 'hero-particle-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:absolute;inset:0;z-index:0;pointer-events:none;';
    hero.insertBefore(canvas, hero.firstChild);
  }

  // ── Canvas sizing ─────────────────────────────────────────────────────────
  function resizeCanvas() {
    canvas.width  = hero.clientWidth;
    canvas.height = hero.clientHeight;
  }

  // ── Particle initialisation ───────────────────────────────────────────────
  function createParticle() {
    const speed = rand(MIN_SPEED, MAX_SPEED);
    const angle = Math.random() * Math.PI * 2;
    const vx    = Math.cos(angle) * speed;
    const vy    = Math.sin(angle) * speed;
    return {
      x:       rand(0, canvas.width),
      y:       rand(0, canvas.height),
      vx,
      vy,
      baseVx:  vx,
      baseVy:  vy,
      r:       rand(MIN_RADIUS, MAX_RADIUS),
      opacity: rand(MIN_OPACITY, MAX_OPACITY),
    };
  }

  function initParticles() {
    const count = Math.round(rand(MIN_PARTICLES, MAX_PARTICLES));
    particles = Array.from({ length: count }, createParticle);
  }

  // ── Update ────────────────────────────────────────────────────────────────
  function updateParticles() {
    const w = canvas.width;
    const h = canvas.height;

    for (const p of particles) {
      // Repulsion
      if (cursor) {
        const dx   = p.x - cursor.x;
        const dy   = p.y - cursor.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0 && dist < REPULSION_DIST) {
          const force = (REPULSION_DIST - dist) / REPULSION_DIST;
          p.vx += (dx / dist) * force * REPULSION_STR;
          p.vy += (dy / dist) * force * REPULSION_STR;
        }
      }

      // Restore toward idle drift
      p.vx += (p.baseVx - p.vx) * RESTORE_FACTOR;
      p.vy += (p.baseVy - p.vy) * RESTORE_FACTOR;

      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Edge wrap
      if (p.x < 0)  p.x = w;
      if (p.x > w)  p.x = 0;
      if (p.y < 0)  p.y = h;
      if (p.y > h)  p.y = 0;
    }
  }

  // ── Draw ──────────────────────────────────────────────────────────────────
  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a  = particles[i];
        const b  = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < CONNECTION_DIST) {
          const alpha = (CONNECTION_DIST - d) / CONNECTION_DIST;
          ctx.beginPath();
          ctx.strokeStyle = hexToRgba(ACCENT, alpha);
          ctx.lineWidth   = LINE_WIDTH;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  }

  function drawParticles() {
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(ACCENT, p.opacity);
      ctx.fill();
    }
  }

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // ── Render loop ───────────────────────────────────────────────────────────
  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateParticles();
    drawLines();
    drawParticles();
    rafHandle = requestAnimationFrame(frame);
  }

  function startLoop() {
    if (rafHandle === null) {
      rafHandle = requestAnimationFrame(frame);
    }
  }

  function stopLoop() {
    if (rafHandle !== null) {
      cancelAnimationFrame(rafHandle);
      rafHandle = null;
    }
  }

  // ── Event handlers ────────────────────────────────────────────────────────
  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    cursor = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function onMouseLeave() {
    cursor = null;
  }

  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resizeCanvas();
      initParticles();
    }, 100);
  }

  // ── Teardown / reinit helpers ─────────────────────────────────────────────
  function removeCanvas() {
    stopLoop();
    if (canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
    canvas    = null;
    ctx       = null;
    particles = [];
    cursor    = null;
  }

  function setup() {
    injectCanvas();
    ctx = canvas.getContext('2d');
    if (!ctx) {
      // Canvas 2D not supported — remove and bail
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      canvas = null;
      return;
    }
    resizeCanvas();
    initParticles();
    hero.addEventListener('mousemove', onMouseMove);
    hero.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('resize', onResize);

    // IntersectionObserver — pause when hero leaves viewport
    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            startLoop();
          } else {
            stopLoop();
          }
        });
      }, { threshold: 0 });
      observer.observe(hero);
    } else {
      startLoop();
    }
  }

  // ── Entry point ───────────────────────────────────────────────────────────
  function init() {
    hero = document.querySelector('header#hero');
    if (!hero) return; // guard: hero not in DOM

    // Reduced-motion check
    const mq = typeof matchMedia !== 'undefined'
      ? matchMedia('(prefers-reduced-motion: reduce)')
      : null;

    if (mq && mq.matches) return; // guard: reduced motion active at load

    setup();

    // Live reduced-motion toggle
    if (mq && typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', function (e) {
        if (e.matches) {
          removeCanvas();
        } else {
          setup();
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
}());
