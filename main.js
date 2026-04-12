// main.js — Developer Portfolio: Simeon Varghese

(function () {
  // Add js-loaded class so CSS can opt-in to the animation styles
  document.body.classList.add('js-loaded');

  // Respect prefers-reduced-motion — skip observer and show everything immediately
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document
      .querySelectorAll('#about, #projects, .project-card, footer#contact')
      .forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  // Set up IntersectionObserver for scroll-triggered fade-in
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  document
    .querySelectorAll('#about, #projects, .project-card, footer#contact')
    .forEach(function (el) { observer.observe(el); });
})();
