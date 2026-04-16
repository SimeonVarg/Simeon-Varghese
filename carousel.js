/* carousel.js */
(function () {
  const outer   = document.querySelector('.carousel-track-outer');
  const track   = document.getElementById('carousel-track');
  const btnPrev = document.getElementById('carousel-prev');
  const btnNext = document.getElementById('carousel-next');
  const dotsEl  = document.getElementById('carousel-dots');
  if (!track || !btnPrev || !btnNext) return;

  const cards = Array.from(track.querySelectorAll('.project-card'));
  const N = cards.length;
  let cur = 0; // logical index of leftmost visible card
  let busy = false;

  // dots
  cards.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'carousel-dot';
    d.setAttribute('role', 'tab');
    d.setAttribute('aria-label', `Project ${i + 1}`);
    d.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(d);
  });

  function mod(n, m) { return ((n % m) + m) % m; }

  function setCardWidths() {
    const gap = 16;
    const cw  = (outer.offsetWidth - gap * 2) / 3;
    cards.forEach(c => { c.style.flex = `0 0 ${cw}px`; });
    return { cw, step: cw + gap };
  }

  function slide(px, animated) {
    track.style.transition = animated ? 'transform 420ms cubic-bezier(0.4,0,0.2,1)' : 'none';
    track.style.transform  = `translateX(${px}px)`;
  }

  function updateDots() {
    dotsEl.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('carousel-dot--active', i === cur);
    });
    btnPrev.disabled = false;
    btnNext.disabled = false;
  }

  function goTo(idx) {
    if (busy) return;
    busy = true;

    const { step } = setCardWidths();
    const dir = mod(idx - cur, N) <= N / 2 ? 1 : -1;
    const next = mod(idx, N);

    if (dir === 1) {
      // going right: animate track sliding left by one step
      slide(0, false);
      track.offsetHeight; // reflow
      slide(-step, true);
      setTimeout(() => {
        // move first card to end, reset translate
        track.appendChild(track.firstElementChild);
        slide(0, false);
        cur = next;
        updateDots();
        busy = false;
      }, 425);
    } else {
      // going left: move last card to front, start offset left, animate to 0
      track.insertBefore(track.lastElementChild, track.firstElementChild);
      slide(-step, false);
      track.offsetHeight;
      slide(0, true);
      setTimeout(() => {
        cur = next;
        updateDots();
        busy = false;
      }, 425);
    }
  }

  btnPrev.addEventListener('click', () => goTo(mod(cur - 1, N)));
  btnNext.addEventListener('click', () => goTo(mod(cur + 1, N)));

  let x0 = 0;
  track.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) {
      if (dx < 0) goTo(mod(cur + 1, N));
      else        goTo(mod(cur - 1, N));
    }
  }, { passive: true });

  window.addEventListener('resize', () => { setCardWidths(); slide(0, false); });

  setCardWidths();
  slide(0, false);
  updateDots();

  // Pre-resolve entrance animation on off-screen cards after all other scripts run.
  // Use requestAnimationFrame twice to ensure micro-interactions.js has already
  // set its inline styles, then override them.
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      cards.slice(3).forEach(function (card) {
        card.style.transition = 'none';
        card.style.opacity    = '1';
        card.style.transform  = 'none';
      });
    });
  });
})();
