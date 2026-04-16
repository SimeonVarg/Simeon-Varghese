/* carousel.js — infinite loop via cloned bookend cards */
(function () {
  const track   = document.getElementById('carousel-track');
  const btnPrev = document.getElementById('carousel-prev');
  const btnNext = document.getElementById('carousel-next');
  const dotsEl  = document.getElementById('carousel-dots');
  if (!track || !btnPrev || !btnNext) return;

  const origCards = Array.from(track.querySelectorAll('.project-card'));
  const total = origCards.length;

  // Clone last card to front, first card to back — enables seamless wrap
  const cloneFirst = origCards[0].cloneNode(true);
  const cloneLast  = origCards[total - 1].cloneNode(true);
  track.appendChild(cloneFirst);
  track.insertBefore(cloneLast, track.firstChild);

  // All slots: [cloneLast, card0, card1, card2, card3, cloneFirst]
  const allCards = Array.from(track.querySelectorAll('.project-card'));
  // Real cards start at index 1
  let pos = 1; // current slot index (1 = first real card)
  let animating = false;

  // Build dots for real cards only
  origCards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to project ${i + 1}`);
    dot.addEventListener('click', () => goTo(i + 1));
    dotsEl.appendChild(dot);
  });

  function step() {
    const cw = origCards[0].offsetWidth;
    const g  = parseInt(getComputedStyle(track).gap) || 16;
    return cw + g;
  }

  function setPos(idx, instant) {
    track.style.transition = instant ? 'none' : 'transform 420ms cubic-bezier(0.4,0,0.2,1)';
    track.style.transform  = `translateX(-${idx * step()}px)`;
  }

  function updateDots() {
    // pos 1..total map to dots 0..total-1; clones map to last/first
    const dotIdx = pos <= total ? pos - 1 : 0;
    dotsEl.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('carousel-dot--active', i === ((pos - 1 + total) % total));
    });
  }

  function goTo(idx) {
    if (animating) return;
    animating = true;
    pos = idx;
    setPos(pos, false);
    updateDots();

    setTimeout(() => {
      // Silent jump: if on a clone, snap to the real equivalent
      if (pos === 0) {
        pos = total;
        setPos(pos, true);
      } else if (pos === total + 1) {
        pos = 1;
        setPos(pos, true);
      }
      animating = false;
    }, 430);
  }

  btnPrev.addEventListener('click', () => goTo(pos - 1));
  btnNext.addEventListener('click', () => goTo(pos + 1));

  let tx0 = 0;
  track.addEventListener('touchstart', e => { tx0 = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx0;
    if (Math.abs(dx) > 50) goTo(pos + (dx < 0 ? 1 : -1));
  }, { passive: true });

  window.addEventListener('resize', () => setPos(pos, true));

  // Init: show from first real card
  setPos(pos, true);
  updateDots();
})();
