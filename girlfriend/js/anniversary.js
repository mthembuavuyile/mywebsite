/* ============================================
   FOR NOSIPHO — Anniversary Page Scripts
   ============================================ */

// ---- ENTRANCE GATE ----
const enterBtn = document.getElementById('enterBtn');
const gate = document.getElementById('entranceGate');
const mainSite = document.getElementById('mainSite');

enterBtn.addEventListener('click', () => {
  gate.classList.add('hidden');
  mainSite.style.opacity = '1';
  setTimeout(() => { gate.style.display = 'none'; }, 900);
});

// Hide main site until gate opens
mainSite.style.opacity = '0';
mainSite.style.transition = 'opacity 1s ease 0.3s';

// ---- COUNTDOWN TIMER ----
// Anniversary: November 1, 2026
const anniversaryDate = new Date('2026-11-01T00:00:00');
// Met date: November 1, 2025
const metDate = new Date('2025-11-01T00:00:00');
const totalDuration = anniversaryDate - metDate; // Total ms in the year

function updateCountdown() {
  const now = new Date();
  const diff = anniversaryDate - now;

  if (diff <= 0) {
    document.getElementById('cd-days').textContent = '🎉';
    document.getElementById('cd-hours').textContent = '00';
    document.getElementById('cd-mins').textContent = '00';
    document.getElementById('cd-secs').textContent = '00';
    document.querySelector('.countdown-message p').textContent =
      'Happy 1 Year Anniversary, my love! 🎉💍❤️';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  document.getElementById('cd-days').textContent = String(days).padStart(3, '0');
  document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('cd-mins').textContent = String(mins).padStart(2, '0');
  document.getElementById('cd-secs').textContent = String(secs).padStart(2, '0');

  // Milestone progress
  const elapsed = now - metDate;
  const percent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  document.getElementById('milestoneFill').style.width = percent.toFixed(1) + '%';
  document.getElementById('milestonePercent').textContent = percent.toFixed(1);
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ---- SCROLL REVEAL ----
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, parseInt(delay));
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal-card').forEach(el => {
  revealObserver.observe(el);
});

// ---- SURPRISE BOXES ----
document.querySelectorAll('.surprise-box').forEach(box => {
  const msg = box.dataset.surprise;
  box.querySelector('.surprise-back p').textContent = msg;

  box.addEventListener('click', () => {
    box.classList.toggle('flipped');
  });
});

// ---- FLOATING NAV ACTIVE STATE ----
const sections = document.querySelectorAll('.section, .hero');
const navDots = document.querySelectorAll('.nav-dot');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navDots.forEach(dot => {
        dot.classList.toggle('active', dot.getAttribute('href') === '#' + id);
      });
    }
  });
}, { threshold: 0.35 });

sections.forEach(sec => navObserver.observe(sec));

// ---- HEARTS CANVAS ----
const canvas = document.getElementById('hearts-canvas');
const ctx = canvas.getContext('2d');
let hearts = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Heart {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + 20;
    this.size = Math.random() * 12 + 6;
    this.speedY = Math.random() * 0.6 + 0.2;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.opacity = Math.random() * 0.25 + 0.05;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.02;
  }

  update() {
    this.y -= this.speedY;
    this.x += this.speedX + Math.sin(this.y * 0.008) * 0.3;
    this.rotation += this.rotSpeed;

    if (this.y < -30) this.reset();
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = '#ff4d6d';
    ctx.beginPath();

    const s = this.size;
    ctx.moveTo(0, s * 0.3);
    ctx.bezierCurveTo(-s * 0.5, -s * 0.3, -s, s * 0.1, 0, s);
    ctx.bezierCurveTo(s, s * 0.1, s * 0.5, -s * 0.3, 0, s * 0.3);
    ctx.fill();
    ctx.restore();
  }
}

// Create hearts
for (let i = 0; i < 30; i++) {
  const h = new Heart();
  h.y = Math.random() * canvas.height; // stagger initial positions
  hearts.push(h);
}

function animateHearts() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  hearts.forEach(h => {
    h.update();
    h.draw();
  });
  requestAnimationFrame(animateHearts);
}

animateHearts();

// ---- FOOTER YEAR ----
document.getElementById('footerYear').textContent = new Date().getFullYear();
