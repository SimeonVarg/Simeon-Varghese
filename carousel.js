/* carousel.js — rotating carousel with center focus */
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

  // Build dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to project ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  function mod(n, m) { return ((n % m) + m) % m; }

  function syncHeight() {
    // Set track height to the center card's rendered height
    const center = cards[current];
    track.style.height = center.offsetHeight + 'px';
  }

  function render(instant) {
    cards.forEach((card, i) => {
      const offset = mod(i - current, total);
      let tx, scale, opacity, zIndex, blur;

      if (offset === 0) {
        tx = 0;   scale = 1;    opacity = 1;    zIndex = 10; blur = 0;
      } else if (offset === 1) {
        tx = 78;  scale = 0.8;  opacity = 0.4;  zIndex = 5;  blur = 2;
      } else if (offset === total - 1) {
        tx = -78; scale = 0.8;  opacity = 0.4;  zIndex = 5;  blur = 2;
      } else {
        tx = offset < total / 2 ? 130 : -130;
        scale = 0.65; opacity = 0; zIndex = 1; blur = 4;
      }

      const t = instant ? 'none' : 'transform 450ms cubic-bezier(0.4,0,0.2,1), opacity 450ms ease, filter 450ms ease';
      card.style.transition = t;
      card.style.transform  = `translateX(${tx}%) scale(${scale})`;
      card.style.opacity    = opacity;
      card.style.zIndex     = zIndex;
      card.style.filter     = blur ? `blur(${blur}px)` : '';
      card.style.pointerEvents = offset === 0 ? '' : 'none';
    });

    dotsEl.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('carousel-dot--active', i === current);
      d.setAttribute('aria-selected', i === current ? 'true' : 'false');
    });

    btnPrev.disabled = false;
    btnNext.disabled = false;

    // Sync height after transition (or immediately if instant)
    if (instant) {
      syncHeight();
    } else {
      setTimeout(syncHeight, 460);
    }
  }

  function goTo(idx) {
    if (animating) return;
    animating = true;
    current = mod(idx, total);
    render(false);
    setTimeout(() => { animating = false; }, 460);
  }

  btnPrev.addEventListener('click', () => goTo(current - 1));
  btnNext.addEventListener('click', () => goTo(current + 1));

  // Touch/swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) goTo(current + (dx < 0 ? 1 : -1));
  }, { passive: true });

  window.addEventListener('resize', () => render(true));

  render(true);
})();
