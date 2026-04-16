/* carousel.js */
(function () {
  const outer  = document.querySelector('.carousel-track-outer');
  const track  = document.getElementById('carousel-track');
  const btnPrev = document.getElementById('carousel-prev');
  const btnNext = document.getElementById('carousel-next');
  const dotsEl  = document.getElementById('carousel-dots');
  if (!track || !btnPrev || !btnNext) return;

  const cards = Array.from(track.querySelectorAll('.project-card'));
  const total = cards.length;
  let current = 0; // leftmost visible card index

  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to project ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  function cardWidth() {
    return cards[0].offsetWidth;
  }

  function gap() {
    // read computed gap from the flex container
    return parseInt(getComputedStyle(track).gap) || 16;
  }

  function render() {
    const cw = cardWidth();
    const g  = gap();
    const step = cw + g;

    // Peek amount: show 15% of the adjacent card
    const peek = cw * 0.18;

    // When current > 0, shift left by (current * step - peek) so prev card peeks
    // When current === 0, no left peek, just show from start
    let offset = current * step;
    if (current > 0) offset -= peek;

    track.style.transform = `translateX(-${offset}px)`;

    // Style cards: active 3 full, peek cards slightly scaled/faded
    cards.forEach((card, i) => {
      const dist = i - current;
      if (dist === -1) {
        // left peek
        card.style.opacity   = '0.5';
        card.style.transform = 'scale(0.92)';
      } else if (dist >= 0 && dist <= 2) {
        // visible
        card.style.opacity   = '1';
        card.style.transform = 'scale(1)';
      } else if (dist === 3) {
        // right peek
        card.style.opacity   = '0.5';
        card.style.transform = 'scale(0.92)';
      } else {
        card.style.opacity   = '0';
        card.style.transform = 'scale(0.9)';
      }
    });

    dotsEl.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('carousel-dot--active', i === current);
    });

    btnPrev.disabled = current === 0;
    btnNext.disabled = current + 3 >= total;
  }

  function goTo(i) {
    current = Math.max(0, Math.min(i, total - 3));
    render();
  }

  btnPrev.addEventListener('click', () => goTo(current - 1));
  btnNext.addEventListener('click', () => goTo(current + 1));

  let tx0 = 0;
  track.addEventListener('touchstart', e => { tx0 = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - tx0;
    if (Math.abs(dx) > 50) goTo(current + (dx < 0 ? 1 : -1));
  }, { passive: true });

  window.addEventListener('resize', render);
  render();
})();
