/* ===========================
   Prottoy hybrid script
   - smooth section scroll
   - mobile nav toggle
   - theme toggle (persist)
   - GSAP reveals / ScrollTrigger
   - particle background (lightweight)
   - vanilla-tilt initialization
   =========================== */

/* Wait until DOM ready */
document.addEventListener('DOMContentLoaded', function () {

  /* ----- smooth section scrolling (for '#...' links) ----- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    // only smooth-scroll for same-page anchors
    const href = link.getAttribute('href');
    if (!href || href.length <= 1) return;
    link.addEventListener('click', function (e) {
      // if link points to other files, browser handles it
      if (!href.startsWith('#')) return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (!target) return;
      // space for fixed navbar
      const navHeight = document.querySelector('#navbar')?.offsetHeight || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;
      window.scrollTo({ top, behavior: 'smooth' });
      // close mobile nav when a link is clicked
      const navLinks = document.querySelector('.nav-links');
      if (navLinks && navLinks.classList.contains('open')) navLinks.classList.remove('open');
    });
  });

  /* ----- mobile nav toggle ----- */
  // create a small toggle button if not present
  if (!document.querySelector('.nav-toggle')) {
    const btn = document.createElement('button');
    btn.className = 'nav-toggle';
    btn.innerHTML = '☰';
    btn.setAttribute('aria-label','Open menu');
    const nav = document.querySelector('#navbar .nav-inner') || document.querySelector('#navbar');
    nav && nav.appendChild(btn);
  }
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  navToggle && navToggle.addEventListener('click', function () {
    if (!navLinks) return;
    navLinks.classList.toggle('open');
  });

  /* ----- active nav highlight on scroll ----- */
  const sections = Array.from(document.querySelectorAll('section[id]'));
  function onScrollActive() {
    const scrollPos = window.scrollY + (document.querySelector('#navbar')?.offsetHeight || 80) + 12;
    let current = sections[0];
    for (let s of sections) {
      if (s.offsetTop <= scrollPos) current = s;
    }
    // remove active
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    const selector = `.nav-links a[href="#${current.id}"]`;
    const activeLink = document.querySelector(selector);
    if (activeLink) activeLink.classList.add('active');
  }
  window.addEventListener('scroll', throttle(onScrollActive, 120));
  onScrollActive();

  /* ----- theme toggle with persistence ----- */
  const themeToggle = document.getElementById('theme-toggle');
  function setTheme(isLight) {
    if (isLight) {
      document.body.classList.add('light-theme');
      localStorage.setItem('prottoy-theme','light');
      if (themeToggle) themeToggle.textContent = '🌙';
    } else {
      document.body.classList.remove('light-theme');
      localStorage.setItem('prottoy-theme','dark');
      if (themeToggle) themeToggle.textContent = '☀️';
    }
  }
  // init from storage or prefers-color-scheme
  const stored = localStorage.getItem('prottoy-theme');
  if (stored === 'light') setTheme(true);
  else if (stored === 'dark') setTheme(false);
  else setTheme(false); // default dark-mode look

  themeToggle && themeToggle.addEventListener('click', function () {
    const isLight = document.body.classList.contains('light-theme');
    setTheme(!isLight);
  });

  /* ----- GSAP reveals (if available) ----- */
  try {
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      gsap.utils.toArray('.reveal').forEach(function (elem) {
        gsap.fromTo(elem, { autoAlpha: 0, y: 28 }, {
          duration: 0.9, y: 0, autoAlpha: 1, ease: 'power3.out',
          scrollTrigger: { trigger: elem, start: 'top 85%', toggleActions: 'play none none none' }
        });
      });
    } else {
      // fallback: remove reveal class after short delay so content becomes visible
      setTimeout(()=>document.querySelectorAll('.reveal').forEach(el=>el.style.opacity=1), 350);
    }
  } catch (e) {
    console.warn('GSAP reveals error', e);
  }

  /* ----- vanilla-tilt for project cards (if available) ----- */
  try {
    if (window.VanillaTilt) {
      document.querySelectorAll('.project-card').forEach(function (el) {
        VanillaTilt.init(el, { max: 8, speed: 350, glare: true, "max-glare": 0.14 });
      });
    }
  } catch (e) { console.warn('tilt init error', e); }

  /* ----- minimal particle canvas (lightweight) ----- */
  (function particleBackground() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.scale(DPR, DPR);
    }
    window.addEventListener('resize', debounce(resize, 150));
    resize();

    const N = Math.max(24, Math.floor(w * h / 90000)); // density adapt
    const parts = [];
    function rand(a,b){return a + Math.random()*(b-a)}
    for (let i=0;i<N;i++){
      parts.push({
        x: Math.random()*w,
        y: Math.random()*h,
        r: rand(0.6,1.8),
        vx: rand(-0.15,0.15),
        vy: rand(-0.15,0.15)
      });
    }

    function frame(){
      ctx.clearRect(0,0,w,h);
      ctx.fillStyle = (document.body.classList.contains('light-theme')) ? 'rgba(6,10,30,0.06)' : 'rgba(125,211,252,0.04)';
      for (const p of parts){
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    frame();
  })();

  /* ----- small helpers: throttle and debounce ----- */
  function throttle(fn, wait) {
    let last = 0;
    return function (...args) {
      const now = Date.now();
      if (now - last >= wait) {
        last = now;
        fn.apply(this, args);
      }
    };
  }
  function debounce(fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(()=>fn.apply(this, args), wait);
    };
  }

  /* ----- accessible focus assist (keyboard nav) ----- */
  window.addEventListener('keyup', function (e) {
    if (e.key === 'Tab') document.body.classList.add('show-focus');
  });

}); // DOMContentLoaded end
