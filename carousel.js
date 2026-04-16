/* carousel.js — flex track, infinite rotation */
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

  // Re-order cards in the DOM so current is always first,
  // then translate the track so the visible window shows slots 0-2.
  function render(instant) {
    // Re-order: put cards in order starting from current
    for (let i = 0; i < total; i++) {
      track.appendChild(cards[mod(current + i, total)]);
    }

    // Snap to position 0 instantly (cards are already in right order)
    track.style.transition = 'none';
    track.style.transform  = 'translateX(0)';

    dotsEl.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('carousel-dot--active', i === current);
      d.setAttribute('aria-selected', i === current ? 'true' : 'false');
    });

    btnPrev.disabled = false;
    btnNext.disabled = false;
  }

  function goTo(idx, direction) {
    if (animating) return;
    animating = true;

    const next = mod(idx, total);
    const dir  = direction ?? (mod(idx - current, total) <= total / 2 ? 1 : -1);

    // Re-order so current is first
    for (let i = 0; i < total; i++) {
      track.appendChild(cards[mod(current + i, total)]);
    }

    // Place next card off-screen in the direction of travel
    const cardW = track.parentElement.offsetWidth / 3;
    const gap   = 24;
    const step  = cardW + gap;

    if (dir > 0) {
      // Slide left: next card is already at slot 3 (off right), animate track left by one step
      track.style.transition = 'none';
      track.style.transform  = 'translateX(0)';
      // force reflow
      track.offsetHeight;
      track.style.transition = 'transform 420ms cubic-bezier(0.4,0,0.2,1)';
      track.style.transform  = `translateX(-${step}px)`;
    } else {
      // Slide right: move last card to front, start offset left, animate to 0
      const lastCard = cards[mod(current - 1, total)];
      track.insertBefore(lastCard, track.firstChild);
      track.style.transition = 'none';
      track.style.transform  = `translateX(-${step}px)`;
      track.offsetHeight;
      track.style.transition = 'transform 420ms cubic-bezier(0.4,0,0.2,1)';
      track.style.transform  = 'translateX(0)';
    }

    current = next;

    dotsEl.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('carousel-dot--active', i === current);
      d.setAttribute('aria-selected', i === current ? 'true' : 'false');
    });

    setTimeout(() => {
      // Re-order cleanly after animation
      for (let i = 0; i < total; i++) {
        track.appendChild(cards[mod(current + i, total)]);
      }
      track.style.transition = 'none';
      track.style.transform  = 'translateX(0)';
      animating = false;
    }, 430);
  }

  btnPrev.addEventListener('click', () => goTo(current - 1, -1));
  btnNext.addEventListener('click', () => goTo(current + 1,  1));

  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) goTo(current + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  }, { passive: true });

  render(true);
})();
