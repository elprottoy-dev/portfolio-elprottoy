// =======================
// Theme Toggle
// =======================
document.getElementById("theme-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark"));
});

// Load saved theme
if (localStorage.getItem("theme") === "true") {
  document.body.classList.add("dark");
}


// =======================
// GSAP Reveal Animations
// =======================
document.addEventListener("DOMContentLoaded", () => {
  gsap.utils.toArray(".reveal").forEach((elem) => {
    gsap.from(elem, {
      opacity: 0,
      y: 40,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: elem,
        start: "top 85%",
      }
    });
  });
});


// =======================
// Particle Background
// =======================
const canvas = document.getElementById("particle-canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];

for (let i = 0; i < 60; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2 + 1,
    dx: (Math.random() - 0.5) * 0.5,
    dy: (Math.random() - 0.5) * 0.5
  });
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = "#888";
    ctx.fill();

    p.x += p.dx;
    p.y += p.dy;

    if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
  });

  requestAnimationFrame(drawParticles);
}

drawParticles();


// Update canvas size on resize
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});


// =======================
// Vanilla Tilt (Project Cards)
// =======================
VanillaTilt.init(document.querySelectorAll(".project-card"), {
  max: 10,
  speed: 300
});
