/* carousel.js — 3-visible rotating carousel */
(function () {
  const track   = document.getElementById('carousel-track');
  const btnPrev = document.getElementById('carousel-prev');
  const btnNext = document.getElementById('carousel-next');
  const dotsEl  = document.getElementById('carousel-dots');
  if (!track || !btnPrev || !btnNext) return;

  const cards = Array.from(track.querySelectorAll('.project-card'));
  const total = cards.length;
  let current = 0;
  let animating = false;

  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to project ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  function mod(n, m) { return ((n % m) + m) % m; }

  function render(instant) {
    cards.forEach((card, i) => {
      const offset = mod(i - current, total);
      // offset 0 = center, 1 = right, total-1 = left, others hidden
      let tx, scale, opacity, zIndex;

      if (offset === 0) {
        tx = 0;    scale = 1;    opacity = 1;   zIndex = 10;
      } else if (offset === 1) {
        tx = 108;  scale = 0.85; opacity = 0.55; zIndex = 5;
      } else if (offset === total - 1) {
        tx = -108; scale = 0.85; opacity = 0.55; zIndex = 5;
      } else {
        // hidden off to the side
        tx = offset < total / 2 ? 160 : -160;
        scale = 0.7; opacity = 0; zIndex = 1;
      }

      card.style.transition = instant ? 'none' : 'transform 420ms cubic-bezier(0.4,0,0.2,1), opacity 420ms ease';
      card.style.transform  = `translateX(${tx}%) scale(${scale})`;
      card.style.opacity    = opacity;
      card.style.zIndex     = zIndex;
      card.style.pointerEvents = offset === 0 ? '' : 'none';
    });

    dotsEl.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('carousel-dot--active', i === current);
      d.setAttribute('aria-selected', i === current ? 'true' : 'false');
    });

    if (instant) syncHeight();
    else setTimeout(syncHeight, 430);
  }

  function syncHeight() {
    track.style.height = cards[current].offsetHeight + 'px';
  }

  function goTo(idx) {
    if (animating) return;
    animating = true;
    current = mod(idx, total);
    render(false);
    setTimeout(() => { animating = false; }, 430);
  }

  btnPrev.addEventListener('click', () => goTo(current - 1));
  btnNext.addEventListener('click', () => goTo(current + 1));

  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) goTo(current + (dx < 0 ? 1 : -1));
  }, { passive: true });

  window.addEventListener('resize', () => render(true));
  render(true);
})();
