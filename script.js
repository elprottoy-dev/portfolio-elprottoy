/* Advanced script.js for Prottoy — Hybrid idnasser-like interactions
   Requirements: GSAP + ScrollTrigger (CDN recommended). VanillaTilt optional.
   Author: ChatGPT (adapted for your HTML)
*/

(function () {
  "use strict";

  // Helpers -----------------------------------------------------------
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const isTouchDevice = () => ("ontouchstart" in window) || navigator.maxTouchPoints > 0;

  // DOM ready ---------------------------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const navbar = $("#navbar");
    const navLinks = $$(".nav-links a");
    const navLinksContainer = $(".nav-links");
    const menuToggle = document.querySelector(".menu-toggle") || createMenuToggle();
    const themeToggle = document.getElementById("theme-toggle");
    const particleCanvas = document.getElementById("particle-canvas");
    const hero = $("#home");
    const heroRight = hero ? hero.querySelector(".hero-right") : null;
    const revealItems = $$(".reveal");
    const projectCards = $$(".project-card");
    const magneticTargets = $$("[data-magnetic]") || [];

    // 1) Smooth anchor scrolling (accounts for fixed navbar)
    function setupSmoothAnchors() {
      document.querySelectorAll('a[href^="#"]').forEach((a) => {
        // keep links that are hashes (and same-page)
        const href = a.getAttribute("href");
        if (!href || href.length === 1) return;
        a.addEventListener("click", (e) => {
          if (!href.startsWith("#")) return;
          const target = document.querySelector(href);
          if (!target) return;
          e.preventDefault();
          const navH = navbar ? navbar.offsetHeight : 72;
          const top = target.getBoundingClientRect().top + window.scrollY - navH - 12;
          window.scrollTo({ top, behavior: "smooth" });
          // close mobile nav if opened
          if (navLinksContainer && navLinksContainer.classList.contains("open")) {
            navLinksContainer.classList.remove("open");
          }
        });
      });
    }

    // 2) Mobile menu toggle (create button if not present)
    function createMenuToggle() {
      const btn = document.createElement("button");
      btn.className = "menu-toggle";
      btn.innerHTML = "☰";
      btn.setAttribute("aria-label", "Toggle menu");
      if (navbar) {
        // append to right side of navbar
        navbar.appendChild(btn);
      }
      return btn;
    }

    function setupMenuToggle() {
      if (!menuToggle || !navLinksContainer) return;
      menuToggle.addEventListener("click", () => {
        navLinksContainer.classList.toggle("open");
      });
      // clicking outside closes menu on mobile
      document.addEventListener("click", (ev) => {
        if (!navLinksContainer.classList.contains("open")) return;
        if (ev.target === menuToggle) return;
        if (navLinksContainer.contains(ev.target) || navbar.contains(ev.target)) return;
        navLinksContainer.classList.remove("open");
      });
    }

    // 3) Active nav highlighting on scroll (IntersectionObserver)
    function setupActiveNav() {
      const sections = $$("section[id]").map((s) => s);
      if (!("IntersectionObserver" in window) || sections.length === 0) {
        // fallback: basic scroll-based highlight
        window.addEventListener("scroll", throttle(highlightByScroll, 120));
        highlightByScroll();
        return;
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          const link = document.querySelector('.nav-links a[href="#' + id + '"]');
          if (!link) return;
          if (entry.isIntersecting) {
            // remove active from others
            navLinks.forEach((a) => a.classList.remove("active"));
            link.classList.add("active");
          }
        });
      }, {
        root: null,
        threshold: 0.5, // when 50% of section visible
      });

      sections.forEach((s) => observer.observe(s));
    }

    function highlightByScroll() {
      const scrollPos = window.scrollY + (navbar ? navbar.offsetHeight + 20 : 100);
      let current = null;
      $$("section[id]").forEach((s) => {
        if (s.offsetTop <= scrollPos) current = s;
      });
      if (!current) return;
      navLinks.forEach((a) => a.classList.remove("active"));
      const link = document.querySelector('.nav-links a[href="#' + current.id + '"]');
      if (link) link.classList.add("active");
    }

    // 4) Theme toggle with persistence
    function setupThemeToggle() {
      if (!themeToggle) return;
      const stored = localStorage.getItem("prottoy-theme");
      if (stored === "light") document.body.classList.add("light-theme");
      else if (stored === "dark") document.body.classList.remove("light-theme");
      else document.body.classList.remove("light-theme"); // default dark

      function setThemeLight(light) {
        if (light) {
          document.body.classList.add("light-theme");
          localStorage.setItem("prottoy-theme", "light");
          themeToggle.textContent = "🌙";
        } else {
          document.body.classList.remove("light-theme");
          localStorage.setItem("prottoy-theme", "dark");
          themeToggle.textContent = "☀️";
        }
      }

      themeToggle.addEventListener("click", () => {
        setThemeLight(!document.body.classList.contains("light-theme"));
      });

      // initial icon set
      themeToggle.textContent = document.body.classList.contains("light-theme") ? "🌙" : "☀️";
    }

    // 5) GSAP reveals & stagger (if GSAP available)
    function setupGsapReveals() {
      try {
        if (window.gsap && window.ScrollTrigger) {
          gsap.registerPlugin(ScrollTrigger);
          gsap.utils.toArray(".reveal").forEach((el, i) => {
            gsap.fromTo(el, {
              autoAlpha: 0,
              y: 28,
            }, {
              duration: 0.9,
              autoAlpha: 1,
              y: 0,
              ease: "power3.out",
              delay: i * 0.03,
              scrollTrigger: {
                trigger: el,
                start: "top 85%",
                toggleActions: "play none none none",
              }
            });
          });

          // staggered project card reveal
          const grid = document.querySelectorAll(".project-grid");
          grid.forEach((g) => {
            const cards = g.querySelectorAll(".project-card");
            if (cards.length) {
              gsap.from(cards, {
                opacity: 0,
                y: 18,
                stagger: 0.12,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: { trigger: g, start: "top 85%" }
              });
            }
          });

          // subtle hero intro animation
          const heroLeft = document.querySelector(".hero-left");
          if (heroLeft) {
            gsap.from(heroLeft, { y: 8, opacity: 0, duration: 1.1, ease: "power3.out", delay: 0.15 });
          }
        } else {
          // fallback: make reveal items visible
          revealItems.forEach((el) => el.style.opacity = 1);
        }
      } catch (err) {
        console.warn("GSAP reveals error:", err);
        revealItems.forEach((el) => el.style.opacity = 1);
      }
    }

    // 6) Particle background (DPR-aware, density adaptive)
    function setupParticles() {
      if (!particleCanvas) return;
      const ctx = particleCanvas.getContext("2d");
      let w = particleCanvas.offsetWidth;
      let h = particleCanvas.offsetHeight;
      const DPR = Math.min(window.devicePixelRatio || 1, 2);
      function resize() {
        w = particleCanvas.offsetWidth;
        h = particleCanvas.offsetHeight;
        particleCanvas.width = Math.floor(w * DPR);
        particleCanvas.height = Math.floor(h * DPR);
        particleCanvas.style.width = w + "px";
        particleCanvas.style.height = h + "px";
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      }
      window.addEventListener("resize", debounce(resize, 120));
      resize();

      const area = Math.max(0.00004, (w * h) / 1000000); // area factor
      const count = Math.max(18, Math.floor(30 * area));
      const parts = [];
      function rand(a, b) { return a + Math.random() * (b - a); }
      for (let i = 0; i < count; i++) {
        parts.push({
          x: rand(0, w),
          y: rand(0, h),
          r: rand(0.6, 1.9),
          vx: rand(-0.2, 0.2),
          vy: rand(-0.15, 0.15)
        });
      }

      function frame() {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = document.body.classList.contains("light-theme") ? "rgba(20,30,40,0.03)" : "rgba(125,211,252,0.04)";
        for (const p of parts) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < -10) p.x = w + 10;
          if (p.x > w + 10) p.x = -10;
          if (p.y < -10) p.y = h + 10;
          if (p.y > h + 10) p.y = -10;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        requestAnimationFrame(frame);
      }
      frame();
    }

    // 7) Parallax for hero-right (subtle, mouse-driven)
    function setupHeroParallax() {
      if (!hero || !heroRight) return;
      const el = heroRight;
      let w = window.innerWidth;
      window.addEventListener("resize", () => w = window.innerWidth);
      if (isTouchDevice()) return; // skip on touch devices
      hero.addEventListener("mousemove", (e) => {
        const rect = hero.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / rect.width;
        const dy = (e.clientY - cy) / rect.height;
        const tx = dx * 14; // translate range
        const ty = dy * 10;
        el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      });
      hero.addEventListener("mouseleave", () => { el.style.transform = `translate3d(0,0,0)`; });
    }

    // 8) Magnetic hover effect for elements with data-magnetic
    function setupMagnetic() {
      const targets = $$("[data-magnetic]");
      if (!targets.length || isTouchDevice()) return;
      targets.forEach((target) => {
        const strength = parseFloat(target.getAttribute("data-magnetic-strength")) || 20;
        target.style.transition = "transform 0.35s cubic-bezier(.2,.9,.3,1)";
        target.addEventListener("mousemove", (e) => {
          const rect = target.getBoundingClientRect();
          const relX = (e.clientX - rect.left) - rect.width / 2;
          const relY = (e.clientY - rect.top) - rect.height / 2;
          const tx = (relX / rect.width) * strength;
          const ty = (relY / rect.height) * (strength * 0.6);
          target.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(1.02)`;
        });
        target.addEventListener("mouseleave", () => {
          target.style.transform = "translate3d(0,0,0) scale(1)";
        });
      });
    }

    // 9) Custom cursor & trail (simple, lightweight)
    function setupCursorTrail() {
      if (isTouchDevice()) return;
      // create cursor element
      const cursor = document.createElement("div");
      cursor.id = "custom-cursor";
      cursor.style.position = "fixed";
      cursor.style.width = "12px";
      cursor.style.height = "12px";
      cursor.style.borderRadius = "50%";
      cursor.style.pointerEvents = "none";
      cursor.style.zIndex = 9999;
      cursor.style.left = "0px";
      cursor.style.top = "0px";
      cursor.style.transform = "translate(-50%,-50%)";
      cursor.style.background = "rgba(125,211,252,0.9)";
      cursor.style.boxShadow = "0 6px 26px rgba(96,165,250,0.28)";
      cursor.style.transition = "width .12s, height .12s, background .12s, box-shadow .12s";
      document.body.appendChild(cursor);

      let mouseX = 0, mouseY = 0, posX = 0, posY = 0;
      document.addEventListener("mousemove", (e) => { mouseX = e.clientX; mouseY = e.clientY; cursor.style.display = "block"; });
      function loop() {
        posX += (mouseX - posX) * 0.18;
        posY += (mouseY - posY) * 0.18;
        cursor.style.left = posX + "px"; cursor.style.top = posY + "px";
        requestAnimationFrame(loop);
      }
      loop();

      // scale cursor on interactive hover
      ["a", ".btn", ".project-card", ".card-inner"].forEach(sel => {
        document.addEventListener("mouseover", (ev) => {
          if (ev.target.closest(sel)) {
            cursor.style.transform = "translate(-50%,-50%) scale(1.9)";
            cursor.style.background = "rgba(29,185,84,0.95)";
            cursor.style.boxShadow = "0 12px 40px rgba(29,185,84,0.18)";
          }
        }, true);
        document.addEventListener("mouseout", (ev) => {
          if (ev.target.closest(sel)) {
            cursor.style.transform = "translate(-50%,-50%) scale(1)";
            cursor.style.background = "rgba(125,211,252,0.9)";
            cursor.style.boxShadow = "0 6px 26px rgba(96,165,250,0.28)";
          }
        }, true);
      });
    }

    // 10) VanillaTilt for .project-card fallback
    function setupVanillaTilt() {
      try {
        if (window.VanillaTilt && projectCards.length) {
          projectCards.forEach(p => {
            VanillaTilt.init(p, { max: 10, speed: 350, glare: true, "max-glare": 0.12 });
          });
        }
      } catch (err) {
        console.warn("VanillaTilt init error:", err);
      }
    }

    // Utility: throttle & debounce
    function throttle(fn, wait = 100) {
      let last = 0;
      return function (...args) {
        const now = Date.now();
        if (now - last >= wait) {
          last = now;
          fn.apply(this, args);
        }
      };
    }
    function debounce(fn, wait = 100) {
      let t;
      return function (...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
      };
    }

    // Initialize all
    setupSmoothAnchors();
    setupMenuToggle();
    setupActiveNav();
    setupThemeToggle();
    setupGsapReveals();
    setupParticles();
    setupHeroParallax();
    setupMagnetic();
    setupCursorTrail();
    setupVanillaTilt();

    // ensure animation updates when theme toggled (particle color)
    if (typeof MutationObserver !== "undefined") {
      const obs = new MutationObserver(() => { /* no-op: particles read theme each frame */ });
      obs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    }
  }); // DOMContentLoaded end

})(); // closure end
