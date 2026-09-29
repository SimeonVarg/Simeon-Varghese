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

/* Kiro's LinkedIn post: a plain link always, the embed only once it is wired, and only when it is about to scroll into view. */
(function () {
  var box = document.getElementById('kiro-origin');
  if (!box) return;
  var postUrl = box.getAttribute('data-post-url') || '';
  var embedSrc = box.getAttribute('data-embed-src') || '';
  var height = parseInt(box.getAttribute('data-embed-height'), 10) || 720;
  var link = document.getElementById('kiro-post-link');
  var slot = document.getElementById('kiro-embed');

  if (postUrl && link) { link.href = postUrl; link.hidden = false; }
  if (!embedSrc || !slot) {
    if (postUrl && slot) slot.hidden = true;        // link only: no empty box
    return;
  }

  var done = false;
  function insert() {
    if (done) return;
    done = true;
    var f = document.createElement('iframe');
    f.src = embedSrc;
    f.title = "Kiro's LinkedIn post about Austin 3D Explorer";
    f.loading = 'lazy';
    f.height = String(height);
    f.setAttribute('frameborder', '0');
    f.setAttribute('allowfullscreen', '');
    slot.innerHTML = '';
    slot.appendChild(f);
    slot.classList.add('has-embed');
  }

  if (typeof IntersectionObserver === 'undefined') { insert(); return; }
  var io = new IntersectionObserver(function (entries) {
    if (entries.some(function (e) { return e.isIntersecting; })) { insert(); io.disconnect(); }
  }, { rootMargin: '600px 0px' });
  io.observe(slot);
})();
