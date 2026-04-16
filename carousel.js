/* carousel.js — project card carousel */
(function () {
  const track   = document.getElementById('carousel-track');
  const btnPrev = document.getElementById('carousel-prev');
  const btnNext = document.getElementById('carousel-next');
  const dotsEl  = document.getElementById('carousel-dots');
  if (!track || !btnPrev || !btnNext) return;

  const cards = Array.from(track.querySelectorAll('.project-card'));
  const total = cards.length;

  // How many cards visible at once (mirrors CSS breakpoints)
  function visibleCount() {
    return window.innerWidth >= 768 ? 3 : 1;
  }

  let offset = 0; // index of first visible card

  // Build dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to project ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  function maxOffset() {
    return Math.max(0, total - visibleCount());
  }

  function goTo(idx) {
    offset = Math.max(0, Math.min(idx, maxOffset()));
    render();
  }

  function render() {
    const vis = visibleCount();
    const cardWidth = track.parentElement.offsetWidth / vis;

    track.style.transform = `translateX(-${offset * cardWidth}px)`;

    btnPrev.disabled = offset === 0;
    btnNext.disabled = offset >= maxOffset();

    // Update dots
    const dots = dotsEl.querySelectorAll('.carousel-dot');
    dots.forEach((d, i) => {
      const active = i >= offset && i < offset + vis;
      d.classList.toggle('carousel-dot--active', active);
      d.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  btnPrev.addEventListener('click', () => goTo(offset - 1));
  btnNext.addEventListener('click', () => goTo(offset + 1));

  // Touch/swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) goTo(offset + (dx < 0 ? 1 : -1));
  }, { passive: true });

  window.addEventListener('resize', () => render());

  render();
})();
