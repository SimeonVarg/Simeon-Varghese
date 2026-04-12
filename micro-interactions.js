(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function injectStyle(css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  function initScrollBar() {
    const bar = document.createElement('div');
    bar.id = 'mi-scroll-bar';
    document.body.insertBefore(bar, document.body.firstChild);

    injectStyle(
      '#mi-scroll-bar{position:fixed;top:0;left:0;width:0%;height:3px;' +
      'background:var(--accent);z-index:9999;pointer-events:none}'
    );

    let ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () {
          const scrolled = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
          bar.style.width = scrolled * 100 + '%';
          ticking = false;
        });
      }
    });
  }

  function initScrambleText(reducedMotion, onComplete) {
    var accentSpan = document.querySelector('h1 .accent');
    if (!accentSpan) { if (onComplete) onComplete(); return; }

    if (reducedMotion) {
      if (onComplete) onComplete();
      return;
    }

    // Force the name onto its own line permanently — this prevents any
    // reflow during scramble regardless of random char widths
    injectStyle('h1 .accent{display:block}');

    var finalText = accentSpan.textContent;
    var totalChars = finalText.length;
    var startTime = null;

    function tick(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var result = '';
      var allResolved = true;

      for (var i = 0; i < totalChars; i++) {
        var resolveAt = i * (1800 / totalChars);
        if (elapsed >= resolveAt) {
          result += finalText[i];
        } else {
          result += String.fromCharCode(33 + Math.floor(Math.random() * 94));
          allResolved = false;
        }
      }

      accentSpan.textContent = result;

      if (allResolved) {
        if (onComplete) onComplete();
      } else {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  function initTypewriter(reducedMotion) {
    var el = document.querySelector('.hero-sub');
    if (!el) return;

    var fullText = el.textContent;

    if (reducedMotion) {
      el.textContent = fullText;
      return;
    }

    // Hide immediately so it's not visible during the scramble
    el.style.visibility = 'hidden';
    el.textContent = '';

    return function start() {
      el.style.visibility = 'visible';
      var index = 0;

      function typeNext() {
        if (index >= fullText.length) {
          // Done — remove cursor after a pause
          setTimeout(function () {
            el.textContent = fullText;
          }, 600);
          return;
        }

        index++;
        el.textContent = fullText.slice(0, index) + '|';

        var ch = fullText[index - 1];
        var delay;

        if (ch === '|' || ch === ',' || ch === ';') {
          delay = 60 + Math.random() * 40;
        } else if (ch === ' ') {
          delay = 20 + Math.random() * 20;
        } else {
          var burst = Math.random();
          if (burst < 0.08) {
            delay = 45 + Math.random() * 30;
          } else if (burst < 0.25) {
            delay = 22 + Math.random() * 15;
          } else {
            delay = 8 + Math.random() * 12;
          }
        }

        setTimeout(typeNext, delay);
      }

      typeNext();
    };
  }

  function initStaggeredEntrance(reducedMotion) {
    var cards = document.querySelectorAll('.project-card');
    if (!cards.length) return;

    // Neutralize main.js's .visible class by overriding the CSS transition on cards
    // We use inline styles (higher specificity than any class) so !important is not needed
    injectStyle(
      'body.js-loaded .project-card.visible{opacity:0;transform:scale(0.97) translateY(24px);transition:none}'
    );

    if (reducedMotion) {
      cards.forEach(function (card) {
        card.style.opacity = '1';
        card.style.transform = 'none';
        card.style.transition = 'none';
      });
      return;
    }

    // Set initial hidden state via inline styles (beats any class-based CSS)
    cards.forEach(function (card) {
      card.style.opacity = '0';
      card.style.transform = 'scale(0.97) translateY(24px)';
      card.style.transition = 'none';
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var card = entry.target;
          var index = Array.prototype.indexOf.call(cards, card);
          var delay = index * 120;
          // Use setTimeout for the delay so we can set transition after the initial paint
          setTimeout(function () {
            card.style.transition = 'opacity 500ms ease-out, transform 500ms ease-out';
            card.style.opacity = '1';
            card.style.transform = 'scale(0.97) translateY(0)';
          }, delay);
          observer.unobserve(card);
        }
      });
    }, { threshold: 0.15 });

    cards.forEach(function (card) {
      observer.observe(card);
    });
  }

  function initTagShimmer(reducedMotion) {
    if (reducedMotion) return;

    injectStyle(
      '@keyframes mi-tag-shimmer{' +
        '0%{background-color:rgba(191,87,0,0.12)}' +
        '50%{background-color:rgba(191,87,0,0.35)}' +
        '100%{background-color:rgba(191,87,0,0.12)}' +
      '}' +
      '.mi-tag-shimmer{animation:mi-tag-shimmer 600ms ease-in-out forwards}'
    );

    var firedCards = new Set();

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var card = entry.target;
          if (firedCards.has(card)) return;
          firedCards.add(card);

          var tags = card.querySelectorAll('.tag');
          tags.forEach(function (tag, tagIndex) {
            tag.style.animationDelay = (tagIndex * 60) + 'ms';
            tag.classList.add('mi-tag-shimmer');
          });

          observer.unobserve(card);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.project-card').forEach(function (card) {
      observer.observe(card);
    });
  }

  function initSpotlight() {
    injectStyle(
      '.project-card{overflow:hidden}' +
      '.mi-spotlight{' +
        'position:absolute;inset:0;pointer-events:none;' +
        'opacity:0;transition:opacity 300ms;' +
        'border-radius:inherit' +
      '}'
    );

    document.querySelectorAll('.project-card').forEach(function (card) {
      // Ensure position:relative so the absolute overlay is contained
      if (getComputedStyle(card).position === 'static') {
        card.style.position = 'relative';
      }

      var overlay = document.createElement('div');
      overlay.className = 'mi-spotlight';
      card.appendChild(overlay);

      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        overlay.style.background =
          'radial-gradient(circle 80px at ' + x + 'px ' + y + 'px, ' +
          'rgba(255,255,255,0.07) 0%, transparent 100%)';
        overlay.style.opacity = '1';
      });

      card.addEventListener('mouseleave', function () {
        overlay.style.opacity = '0';
      });
    });
  }

  function initTiltCards(reducedMotion) {
    var grid = document.querySelector('.projects-grid');
    if (grid) {
      grid.style.perspective = '800px';
    }

    // Disable the CSS :hover translateY so it doesn't fight the JS transform
    injectStyle('.project-card:hover{transform:none}');

    if (reducedMotion) return;

    document.querySelectorAll('.project-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        var ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        card.style.transition = 'transform 400ms ease';
        card.style.transform =
          'scale(1.01) rotateX(' + (-ny * 12) + 'deg) rotateY(' + (nx * 12) + 'deg)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transition = 'transform 400ms ease-out';
        card.style.transform = 'scale(0.97)';
      });
    });
  }

  function initMagneticButtons(reducedMotion) {
    var buttons = document.querySelectorAll('.footer-links a');
    if (!buttons.length || reducedMotion) return;

    var RADIUS = 28;
    var MAX = 8;

    // Store current lerped positions per button
    var positions = Array.prototype.map.call(buttons, function () {
      return { x: 0, y: 0, targetX: 0, targetY: 0 };
    });

    // Set transition once — always on, so there's never a snap
    buttons.forEach(function (btn) {
      btn.style.transition = 'transform 300ms ease-out, color 200ms ease';
    });

    document.body.addEventListener('mousemove', function (e) {
      var cx = e.clientX;
      var cy = e.clientY;

      buttons.forEach(function (btn, i) {
        var rect = btn.getBoundingClientRect();
        var bx = rect.left + rect.width / 2;
        var by = rect.top + rect.height / 2;
        var dx = cx - bx;
        var dy = cy - by;
        var distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= RADIUS) {
          // Scale pull strength by proximity (0 at edge, full at center)
          var strength = 1 - (distance / RADIUS);
          positions[i].targetX = Math.max(-MAX, Math.min(MAX, dx * strength * 0.6));
          positions[i].targetY = Math.max(-MAX, Math.min(MAX, dy * strength * 0.6));
        } else {
          positions[i].targetX = 0;
          positions[i].targetY = 0;
        }

        btn.style.transform = 'translate(' + positions[i].targetX + 'px, ' + positions[i].targetY + 'px)';
      });
    });
  }

  function initCustomCursor(reducedMotion) {
    // Guard: only initialize on pointer-fine (non-touch) devices
    if (!window.matchMedia('(pointer: fine)').matches) return;

    // Inject DOM elements
    var ring = document.createElement('div');
    ring.id = 'mi-cursor-ring';
    var dot = document.createElement('div');
    dot.id = 'mi-cursor-dot';
    document.body.appendChild(ring);
    document.body.appendChild(dot);

    // Inject CSS
    injectStyle(
      'body.mi-custom-cursor{cursor:none}' +
      '#mi-cursor-ring{' +
        'position:fixed;width:18px;height:18px;' +
        'border:1.5px solid var(--accent);background:transparent;' +
        'border-radius:50%;pointer-events:none;z-index:99999;' +
        'transform:translate(-50%,-50%);' +
        'transition:width 150ms,height 150ms,opacity 150ms' +
      '}' +
      '#mi-cursor-dot{' +
        'position:fixed;width:5px;height:5px;' +
        'background:var(--accent);border-radius:50%;' +
        'pointer-events:none;z-index:99999;' +
        'transform:translate(-50%,-50%)' +
      '}' +
      '#mi-cursor-ring.mi-cursor-hover{width:30px;height:30px;opacity:0.6}'
    );

    // Add class to body to hide default cursor
    document.body.classList.add('mi-custom-cursor');

    // Tracking state
    var mouseX = 0;
    var mouseY = 0;
    var dotX = 0;
    var dotY = 0;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // rAF loop
    function loop() {
      // Ring follows mouse exactly
      ring.style.left = mouseX + 'px';
      ring.style.top = mouseY + 'px';

      // Dot lerps toward ring position — faster factor = less lag
      dotX += (mouseX - dotX) * 0.25;
      dotY += (mouseY - dotY) * 0.25;
      dot.style.left = dotX + 'px';
      dot.style.top = dotY + 'px';

      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    // Hover state on interactive elements
    document.querySelectorAll('a, button').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        ring.classList.add('mi-cursor-hover');
      });
      el.addEventListener('mouseleave', function () {
        ring.classList.remove('mi-cursor-hover');
      });
    });

    // Hide/show when cursor leaves/enters the window
    document.addEventListener('mouseleave', function () {
      ring.style.visibility = 'hidden';
      dot.style.visibility = 'hidden';
    });
    document.addEventListener('mouseenter', function () {
      ring.style.visibility = 'visible';
      dot.style.visibility = 'visible';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initScrollBar();
    var startTypewriter = initTypewriter(reducedMotion);
    initScrambleText(reducedMotion, startTypewriter || function () {});
    initStaggeredEntrance(reducedMotion);
    initTiltCards(reducedMotion);
    initSpotlight();
    initTagShimmer(reducedMotion);
    initMagneticButtons(reducedMotion);
    initCustomCursor(reducedMotion);
  });
})();
