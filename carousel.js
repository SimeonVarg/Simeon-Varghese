/* carousel.js */
(function () {
  const track   = document.getElementById('carousel-track');
  const btnPrev = document.getElementById('carousel-prev');
  const btnNext = document.getElementById('carousel-next');
  const dotsEl  = document.getElementById('carousel-dots');
  if (!track || !btnPrev || !btnNext) return;

  const cards = Array.from(track.querySelectorAll('.project-card'));
  const N = cards.length;
  let cur = 0; // index of leftmost visible card
  let busy = false;

  // dots
  cards.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'carousel-dot';
    d.setAttribute('role', 'tab');
    d.setAttribute('aria-label', `Project ${i + 1}`);
    d.addEventListener('click', () => go(i));
    dotsEl.appendChild(d);
  });

  function mod(n, m) { return ((n % m) + m) % m; }

  function slotOf(i) { return mod(i - cur, N); } // 0=left,1=mid,2=right,3=peek-right

  function applyStyles(instant) {
    cards.forEach((card, i) => {
      const slot = slotOf(i);
      card.style.transition = instant ? 'none' : 'opacity 350ms ease, transform 350ms ease';
      if (slot === 0 || slot === 1 || slot === 2) {
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
        card.style.order = slot;
        card.style.pointerEvents = '';
      } else if (slot === 3) {
        // right peek
        card.style.opacity = '0.45';
        card.style.transform = 'scale(0.9)';
        card.style.order = slot;
        card.style.pointerEvents = 'none';
      } else if (slot === N - 1) {
        // left peek (only visible when cur > 0 conceptually, but always positioned)
        card.style.opacity = '0.45';
        card.style.transform = 'scale(0.9)';
        card.style.order = -1;
        card.style.pointerEvents = 'none';
      } else {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.85)';
        card.style.order = slot;
        card.style.pointerEvents = 'none';
      }
    });

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
    applyStyles(false);
    setTimeout(() => { busy = false; }, 360);
  }

  btnPrev.addEventListener('click', () => go(cur - 1));
  btnNext.addEventListener('click', () => go(cur + 1));

  let x0 = 0;
  track.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1));
  }, { passive: true });

  applyStyles(true);
})();
