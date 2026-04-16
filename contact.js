/* contact.js — Interactive contact section */
(function () {
  'use strict';

  const ACCENT = 'rgba(191,87,0,';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. Particle Canvas ─────────────────────────────────────────── */
  const canvas = document.getElementById('contact-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, nodes = [];
  const mouse = { x: -999, y: -999 };

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function makeNode() {
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r:  Math.random() * 1.5 + 1,
    };
  }

  function initNodes() {
    const count = W < 600 ? 40 : 80;
    nodes = Array.from({ length: count }, makeNode);
  }

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);

    // Move nodes
    for (const n of nodes) {
      // Mouse repel
      const dx = n.x - mouse.x;
      const dy = n.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        const force = (100 - dist) / 100 * 0.6;
        n.vx += (dx / dist) * force;
        n.vy += (dy / dist) * force;
      }
      // Speed cap
      const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
      if (speed > 1.8) { n.vx *= 1.8 / speed; n.vy *= 1.8 / speed; }

      n.x += n.vx;
      n.y += n.vy;

      // Wrap edges
      if (n.x < 0) n.x = W;
      if (n.x > W) n.x = 0;
      if (n.y < 0) n.y = H;
      if (n.y > H) n.y = 0;
    }

    // Draw edges
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = ACCENT + (1 - d / 120) * 0.35 + ')';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = ACCENT + '0.7)';
      ctx.fill();
    }

    requestAnimationFrame(drawFrame);
  }

  if (!reduced) {
    resize();
    initNodes();
    drawFrame();
    window.addEventListener('resize', () => { resize(); initNodes(); });

    const section = document.getElementById('contact');
    section.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    section.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });
  }


  /* ── 2. Magnetic Buttons ────────────────────────────────────────── */
  if (!reduced) {
    document.querySelectorAll('.mag-btn').forEach(btn => {
      let raf = null;
      btn.addEventListener('mousemove', e => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = null;
          const r  = btn.getBoundingClientRect();
          const cx = r.left + r.width  / 2;
          const cy = r.top  + r.height / 2;
          const dx = e.clientX - cx;
          const dy = e.clientY - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const zone = Math.max(r.width, r.height) * 1.4;
          if (dist < zone) {
            const pull = (1 - dist / zone) * 14;
            btn.style.transform = `translate(${dx / dist * pull}px, ${dy / dist * pull}px)`;
          }
        });
      });
      btn.addEventListener('mouseleave', () => {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        btn.style.transform = '';
      });
    });
  }

  /* ── 3. Copy-to-clipboard email chip ────────────────────────────── */
  const chip = document.getElementById('email-chip');
  if (chip) {
    chip.addEventListener('click', () => {
      navigator.clipboard.writeText('simeonvarg@outlook.com').then(() => {
        chip.classList.add('copied');
        setTimeout(() => chip.classList.remove('copied'), 1800);
      });
    });
  }


  /* ── 4. Contact Form ────────────────────────────────────────────── */
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('form-success');

  function validate(form) {
    let ok = true;
    const fields = [
      { id: 'cf-name',    test: v => v.trim().length > 0,          msg: 'Name is required.' },
      { id: 'cf-email',   test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), msg: 'Enter a valid email.' },
      { id: 'cf-message', test: v => v.trim().length > 0,          msg: 'Message is required.' },
    ];
    for (const f of fields) {
      const el    = document.getElementById(f.id);
      const wrap  = el.closest('.form-field');
      const errEl = wrap.querySelector('.field-error');
      if (!f.test(el.value)) {
        wrap.classList.add('has-error');
        errEl.textContent = f.msg;
        ok = false;
      } else {
        wrap.classList.remove('has-error');
        errEl.textContent = '';
      }
    }
    return ok;
  }

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!validate(form)) return;
      // mailto fallback
      const name = document.getElementById('cf-name').value.trim();
      const msg  = document.getElementById('cf-message').value.trim();
      const href = `mailto:simeonvarg@outlook.com?subject=Portfolio%20Contact%20from%20${encodeURIComponent(name)}&body=${encodeURIComponent(msg)}`;
      window.location.href = href;
      form.hidden    = true;
      success.hidden = false;
    });
  }

  /* ── 5. Glitch heading on scroll-enter ─────────────────────────── */
  const heading = document.querySelector('.contact-heading');
  if (heading) {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        heading.classList.add('glitch-play');
        setTimeout(() => heading.classList.remove('glitch-play'), 700);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    obs.observe(heading);
  }

  /* ── 6. Footer year ─────────────────────────────────────────────── */
  const yr = document.getElementById('footer-year');
  if (yr) yr.textContent = new Date().getFullYear();

}());
