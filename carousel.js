/* carousel.js — 3 equal cards, infinite rotating */
(function () {
  const track   = document.getElementById('carousel-track');
  const btnPrev = document.getElementById('carousel-prev');
  const btnNext = document.getElementById('carousel-next');
  const dotsEl  = document.getElementById('carousel-dots');
  if (!track || !btnPrev || !btnNext) return;

  const cards = Array.from(track.querySelectorAll('.project-card'));
  const total = cards.length;
  let current = 0; // index of the first visible card
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
    const gap = 24; // matches CSS gap: 1.5rem
    const cardW = (track.offsetWidth - gap * 2) / 3;
    const step  = cardW + gap;

    cards.forEach((card, i) => {
      const slot = mod(i - current, total); // 0,1,2 = visible; 3 = hidden
      let tx;
      if (slot < 3) {
        tx = slot * step;
      } else {
        tx = -step;
      }
      card.style.transition = instant ? 'none' : 'transform 420ms cubic-bezier(0.4,0,0.2,1)';
      card.style.transform  = `translateX(${tx}px)`;
      card.style.opacity    = '1';
      card.style.zIndex     = slot < 3 ? '1' : '0';
      card.style.pointerEvents = '';
    });

    dotsEl.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('carousel-dot--active', i === current);
      d.setAttribute('aria-selected', i === current ? 'true' : 'false');
    });

    btnPrev.disabled = false;
    btnNext.disabled = false;
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
