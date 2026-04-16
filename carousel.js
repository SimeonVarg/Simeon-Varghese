/* carousel.js */
(function () {
  const outer  = document.querySelector('.carousel-track-outer');
  const track  = document.getElementById('carousel-track');
  const btnPrev = document.getElementById('carousel-prev');
  const btnNext = document.getElementById('carousel-next');
  const dotsEl  = document.getElementById('carousel-dots');
  if (!track || !btnPrev || !btnNext) return;

  const cards = Array.from(track.querySelectorAll('.project-card'));
  const N = cards.length;
  let cur = 0;
  let busy = false;

  cards.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'carousel-dot';
    d.setAttribute('role', 'tab');
    d.setAttribute('aria-label', `Project ${i + 1}`);
    d.addEventListener('click', () => go(i));
    dotsEl.appendChild(d);
  });

  function mod(n, m) { return ((n % m) + m) % m; }

  function layout() {
    const gap  = 16;
    const cw   = (outer.offsetWidth - gap * 2) / 3;
    const step = cw + gap;

    cards.forEach(card => {
      card.style.position = 'absolute';
      card.style.top      = '0';
      card.style.left     = '0';
      card.style.width    = cw + 'px';
    });

    return { cw, step };
  }

  function render(instant) {
    const { cw, step } = layout();

    cards.forEach((card, i) => {
      const slot = mod(i - cur, N);
      let tx, opacity, scale;

      if      (slot === 0)   { tx = 0;        opacity = 1;    scale = 1;    }
      else if (slot === 1)   { tx = step;     opacity = 1;    scale = 1;    }
      else if (slot === 2)   { tx = step * 2; opacity = 1;    scale = 1;    }
      else if (slot === 3)   { tx = step * 3; opacity = 0.45; scale = 0.92; }
      else if (slot === N-1) { tx = -step;    opacity = 0.45; scale = 0.92; }
      else                   { tx = slot < N / 2 ? step * 4 : -step * 2; opacity = 0; scale = 0.9; }

      card.style.transition = instant ? 'none' : 'transform 420ms cubic-bezier(0.4,0,0.2,1), opacity 420ms ease';
      card.style.transform  = `translateX(${tx}px) scale(${scale})`;
      card.style.opacity    = String(opacity);
      card.style.pointerEvents = slot <= 2 ? '' : 'none';
    });

    track.style.height = cards[0].offsetHeight + 'px';

    dotsEl.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('carousel-dot--active', i === cur);
    });
    btnPrev.disabled = false;
    btnNext.disabled = false;
  }

  function go(i) {
    if (busy) return;
    busy = true;
    cur = mod(i, N);
    render(false);
    setTimeout(() => { busy = false; }, 430);
  }

  btnPrev.addEventListener('click', () => go(cur - 1));
  btnNext.addEventListener('click', () => go(cur + 1));

  let x0 = 0;
  track.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1));
  }, { passive: true });

  window.addEventListener('resize', () => render(true));
  render(true);
})();
