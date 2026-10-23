(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var OPEN_DATE = new Date('2026-10-26T00:00:00+07:00');
  var DEADLINE = new Date('2026-12-04T23:59:59+07:00');

  var header = document.getElementById('siteHeader');
  var progressFill = document.getElementById('progressFill');
  var backToTop = document.getElementById('backToTop');

  /* ---------- Header state, scroll progress, back-to-top ---------- */
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 20);
    backToTop.classList.toggle('is-visible', y > 700);
    if (y < 200) document.querySelectorAll('[data-nav].is-active').forEach(function (a) { a.classList.remove('is-active'); });
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progressFill.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');
  function setNav(open) {
    navToggle.setAttribute('aria-expanded', String(open));
    mainNav.classList.toggle('is-open', open);
  }
  navToggle.addEventListener('click', function () {
    setNav(navToggle.getAttribute('aria-expanded') !== 'true');
  });
  mainNav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setNav(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setNav(false);
  });

  /* ---------- Active nav link ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('[data-nav]'));
  var sections = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  if ('IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { if (s) navObserver.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { revealObserver.observe(el); });

    // A fast scroll can jump an element past the viewport before the observer
    // sees it intersect; reveal anything already scrolled past.
    var sweep = function () {
      reveals.forEach(function (el) {
        if (!el.classList.contains('is-in') && el.getBoundingClientRect().bottom < 0) {
          el.classList.add('is-in');
        }
      });
    };
    window.addEventListener('scroll', sweep, { passive: true });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Countdown: to opening, then to deadline ---------- */
  var countdownLabel = document.getElementById('countdownLabel');
  var cd = {};
  document.querySelectorAll('[data-cd]').forEach(function (el) { cd[el.getAttribute('data-cd')] = el; });
  function pad(n) { return String(n).padStart(2, '0'); }
  function tickCountdown() {
    var now = new Date();
    var target;
    if (now < OPEN_DATE) {
      target = OPEN_DATE;
      countdownLabel.textContent = 'Applications open in';
    } else if (now < DEADLINE) {
      target = DEADLINE;
      countdownLabel.textContent = 'Applications close in';
    } else {
      countdownLabel.textContent = 'Applications are now closed';
      cd.d.textContent = cd.h.textContent = cd.m.textContent = cd.s.textContent = '00';
      return;
    }
    var diff = Math.max(0, target - now);
    cd.d.textContent = pad(Math.floor(diff / 864e5));
    cd.h.textContent = pad(Math.floor(diff / 36e5) % 24);
    cd.m.textContent = pad(Math.floor(diff / 6e4) % 60);
    cd.s.textContent = pad(Math.floor(diff / 1e3) % 60);
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);

  /* ---------- Apply links: disable after the deadline ---------- */
  if (new Date() > DEADLINE) {
    document.querySelectorAll('[data-apply]').forEach(function (a) {
      a.removeAttribute('href');
      a.setAttribute('aria-disabled', 'true');
      a.textContent = 'Applications closed';
    });
  }

  /* ---------- Submission guideline tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.guide-tab'));
  function selectTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab); });
    tab.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      selectTab(next);
      next.focus();
    });
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    // The open/close animation needs a single child to collapse.
    var inner = document.createElement('div');
    inner.className = 'faq-a-inner';
    while (a.firstChild) inner.appendChild(a.firstChild);
    a.appendChild(inner);

    q.addEventListener('click', function () {
      var open = !item.classList.contains('is-open');
      item.classList.toggle('is-open', open);
      q.setAttribute('aria-expanded', String(open));
    });
  });
})();
