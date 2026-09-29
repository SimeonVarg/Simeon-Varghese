/* featured.js: the featured video plays only while it is on screen, muted by default, with a sound toggle. */
(function () {
  var video = document.getElementById('featured-video');
  var btn = document.getElementById('featured-sound');
  if (!video) return;

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {           // poster + native controls, no autoplay
    video.removeAttribute('autoplay');
    video.pause();
    video.controls = true;
    return;
  }

  video.muted = true;

  function setSound(on) {
    video.muted = !on;
    if (!btn) return;
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-label', on ? 'Turn sound off' : 'Turn sound on');
    var label = btn.querySelector('.featured-sound-label');
    if (label) label.textContent = on ? 'Sound on' : 'Sound off';
  }

  if (btn) {
    btn.addEventListener('click', function () {
      setSound(video.muted);
      if (video.paused) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
    });
  }

  function play() { var p = video.play(); if (p && p.catch) p.catch(function () {}); }

  if (typeof IntersectionObserver === 'undefined') { play(); return; }

  new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        play();
      } else {
        video.pause();
        if (!video.muted) setSound(false);   // never leave audio on after scrolling away
      }
    });
  }, { threshold: 0.35 }).observe(video);
})();
