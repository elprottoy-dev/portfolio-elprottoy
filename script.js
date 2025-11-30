// Safe initialization & helpers
document.addEventListener('DOMContentLoaded', function () {
  // Smooth scrolling for internal links with data-scroll
  document.querySelectorAll('a[data-scroll]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var href = this.getAttribute('href');
      if (!href || href.charAt(0) !== '#') return;
      var target = document.querySelector(href);
      if (target) {
        var offset = 72; // navbar height
        var top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
        // close mobile nav if open
        document.getElementById('nav-links-wrapper').classList.remove('open');
      }
    });
  });

  // Mobile nav toggle
  var navToggle = document.getElementById('nav-toggle');
  var navWrap = document.getElementById('nav-links-wrapper');
  navToggle && navToggle.addEventListener('click', function () {
    navWrap.classList.toggle('open');
  });

  // Theme toggle (prefers-color-scheme + localStorage)
  var themeToggle = document.getElementById('theme-toggle');
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var stored = localStorage.getItem('site-theme');
  var isDark = stored ? (stored === 'dark') : prefersDark;
  setTheme(isDark ? 'dark' : 'light');
  themeToggle && themeToggle.addEventListener('click', function () {
    var current = document.documentElement.getAttribute('data-theme') || 'dark';
    var next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('site-theme', next);
  });
  function setTheme(name) {
    if (name === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.style.background = '#f8fafc';
      document.body.style.color = '#0b1220';
      themeToggle.textContent = '🌙';
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.style.background = '#0b0f1a';
      document.body.style.color = '#e6eef8';
      themeToggle.textContent = '☀️';
    }
  }

  // Contact form simple handler (no back-end)
  var contactForm = document.getElementById('contact-form');
  contactForm && contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    // Basic validation
    var name = document.getElementById('name').value.trim();
    var email = document.getElementById('email').value.trim();
    var message = document.getElementById('message').value.trim();
    if (!name || !email || !message) {
      alert('Please complete all fields before sending.');
      return;
    }
    // Simulate sending
    this.reset();
    alert('Thanks — your message was captured (this demo has no backend).');
  });

  // Minimal GSAP reveal setup (if GSAP loaded)
  try{
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      gsap.utils.toArray('.reveal').forEach(function(el){
        gsap.from(el, {
          opacity:0, y:30, duration:0.7, ease:'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
        });
      });
    }
  }catch(err){ console.warn('gsap init failed', err); }

  // Simple particle background (canvas) - lightweight
  (function initParticles(){
    var canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var w, h, particles = [];
    function resize(){ w=canvas.width=canvas.offsetWidth; h=canvas.height=canvas.offsetHeight; }
    window.addEventListener('resize', resize); resize();
    function rand(min,max){ return Math.random()*(max-min)+min; }
    for(var i=0;i<35;i++){ particles.push({x:rand(0,w), y:rand(0,h), r:rand(0.6,2.2), vx:rand(-0.2,0.2), vy:rand(-0.2,0.2)}); }
    function draw(){
      ctx.clearRect(0,0,w,h);
      ctx.fillStyle='rgba(125,211,252,0.04)';
      particles.forEach(function(p){
        p.x += p.vx; p.y += p.vy;
        if(p.x<0) p.x = w; if(p.x> w) p.x=0;
        if(p.y<0) p.y = h; if(p.y> h) p.y=0;
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
  })();

  // Vanilla-tilt initialization for project cards (if loaded)
  try{
    if (window.VanillaTilt) {
      document.querySelectorAll('.project-card').forEach(function(el){
        VanillaTilt.init(el, { max: 8, speed: 300, glare: true, 'max-glare':0.15 });
      });
    }
  }catch(e){console.warn('tilt failed',e);}

});
