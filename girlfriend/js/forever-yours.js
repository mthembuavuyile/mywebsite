/* ============================================
   FOR NOSIPHO — Forever Yours Scripts
   ============================================ */

// ---- ENTRANCE GATE ----
const enterBtn = document.getElementById('enterBtn');
const gate = document.getElementById('entranceGate');
const mainSite = document.getElementById('mainSite');

if (enterBtn && gate && mainSite) {
  enterBtn.addEventListener('click', () => {
    gate.classList.add('hidden');
    mainSite.style.opacity = '1';
    setTimeout(() => { gate.style.display = 'none'; }, 900);
  });

  // Hide main site until gate opens
  mainSite.style.opacity = '0';
  mainSite.style.transition = 'opacity 1s ease 0.3s';
}

// ---- FLOATING NAV ACTIVE STATE ----
const sections = document.querySelectorAll('.section, .hero');
const navDots = document.querySelectorAll('.nav-dot');

if (navDots.length > 0) {
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
}

// ---- REASONS CAROUSEL ----
const reasonsCarousel = document.getElementById('reasonsCarousel');
const prevBtn = document.getElementById('reasonsPrev');
const nextBtn = document.getElementById('reasonsNext');
const carouselDots = document.getElementById('carouselDots');

if (reasonsCarousel && prevBtn && nextBtn && carouselDots) {
  const reasonCards = reasonsCarousel.querySelectorAll('.reason-card');
  let currentReasonIndex = 0;

  // Create dots
  reasonCards.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => goToReason(i));
    carouselDots.appendChild(dot);
  });

  const dots = carouselDots.querySelectorAll('.carousel-dot');

  function updateCarousel() {
    reasonCards.forEach((card, i) => {
      card.classList.toggle('active', i === currentReasonIndex);
      dots[i].classList.toggle('active', i === currentReasonIndex);
    });
  }

  function goToReason(index) {
    currentReasonIndex = index;
    updateCarousel();
  }

  prevBtn.addEventListener('click', () => {
    currentReasonIndex = (currentReasonIndex - 1 + reasonCards.length) % reasonCards.length;
    updateCarousel();
  });

  nextBtn.addEventListener('click', () => {
    currentReasonIndex = (currentReasonIndex + 1) % reasonCards.length;
    updateCarousel();
  });
}

// ---- COUNTDOWN TIMER ----
const cdDays = document.getElementById('cd-days');
if (cdDays) {
  // Anniversary: November 1, 2026
  const anniversaryDate = new Date('2026-11-01T00:00:00');
  // Met date: November 1, 2025
  const metDate = new Date('2025-11-01T00:00:00');
  const totalDuration = anniversaryDate - metDate;

  function updateCountdown() {
    const now = new Date();
    const diff = anniversaryDate - now;

    if (diff <= 0) {
      document.getElementById('cd-days').textContent = '🎉';
      document.getElementById('cd-hours').textContent = '00';
      document.getElementById('cd-mins').textContent = '00';
      document.getElementById('cd-secs').textContent = '00';
      const msgWrap = document.querySelector('.countdown-message p');
      if (msgWrap) msgWrap.textContent = 'Happy 1 Year Anniversary, my love! 🎉💍❤️';
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

    const elapsed = now - metDate;
    const percent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    const milestoneFill = document.getElementById('milestoneFill');
    if (milestoneFill) milestoneFill.style.width = percent.toFixed(1) + '%';
    const milestonePercent = document.getElementById('milestonePercent');
    if (milestonePercent) milestonePercent.textContent = percent.toFixed(1);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// ---- DAILY LOVE NOTE ----
const loveNoteText = document.getElementById('loveNoteText');
const loveNoteDate = document.getElementById('loveNoteDate');
const newNoteBtn = document.getElementById('newNoteBtn');

if (loveNoteText && newNoteBtn && loveNoteDate) {
  const loveNotes = [
    "You are the best thing that ever happened to me.",
    "Every day I love you a little more than the day before.",
    "Your smile is my favorite sight in the world.",
    "I'm so incredibly lucky to call you mine.",
    "Just thinking about you makes my whole day better.",
    "You are my absolute favorite person in the universe.",
    "I can't wait for all the memories we're going to make.",
    "You make my heart smile.",
    "My life is so much better with you in it.",
    "I love you more than words could ever say."
  ];

  function setLoveNote() {
    const randomNote = loveNotes[Math.floor(Math.random() * loveNotes.length)];
    loveNoteText.textContent = randomNote;
    const today = new Date();
    loveNoteDate.textContent = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  setLoveNote();
  newNoteBtn.addEventListener('click', () => {
    loveNoteText.style.opacity = '0';
    setTimeout(() => {
      setLoveNote();
      loveNoteText.style.opacity = '1';
    }, 300);
  });
  
  loveNoteText.style.transition = 'opacity 0.3s ease';
}

// ---- VIRTUAL HUG ----
const hugBtn = document.getElementById('hugBtn');
const hugMessage = document.getElementById('hugMessage');
const hugCount = document.getElementById('hugCount');

if (hugBtn && hugMessage && hugCount) {
  let hugs = localStorage.getItem('nosipho_hugs') ? parseInt(localStorage.getItem('nosipho_hugs')) : 0;
  hugCount.textContent = hugs;

  hugBtn.addEventListener('mousedown', startHug);
  hugBtn.addEventListener('touchstart', startHug);
  hugBtn.addEventListener('mouseup', endHug);
  hugBtn.addEventListener('touchend', endHug);
  hugBtn.addEventListener('mouseleave', endHug);

  let hugTimer;
  let isHugging = false;

  function startHug(e) {
    e.preventDefault();
    if (isHugging) return;
    isHugging = true;
    hugBtn.style.transform = 'scale(0.95)';
    
    hugTimer = setTimeout(() => {
      hugs++;
      localStorage.setItem('nosipho_hugs', hugs);
      hugCount.textContent = hugs;
      hugMessage.style.opacity = '1';
      hugMessage.style.transform = 'translateY(0)';
    }, 1000); // Hold for 1 second to send a hug
  }

  function endHug() {
    if (!isHugging) return;
    isHugging = false;
    clearTimeout(hugTimer);
    hugBtn.style.transform = '';
    setTimeout(() => {
      hugMessage.style.opacity = '0';
      hugMessage.style.transform = 'translateY(10px)';
    }, 3000);
  }
  
  // Set initial styles for hug message
  hugMessage.style.opacity = '0';
  hugMessage.style.transform = 'translateY(10px)';
  hugMessage.style.transition = 'all 0.4s ease';
}

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
  const backP = box.querySelector('.surprise-back p');
  if (backP) backP.textContent = msg;

  box.addEventListener('click', () => {
    box.classList.toggle('flipped');
  });
});

// ---- HEARTS CANVAS ----
const canvas = document.getElementById('hearts-canvas');
if (canvas) {
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

  for (let i = 0; i < 30; i++) {
    const h = new Heart();
    h.y = Math.random() * canvas.height;
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
}

// ---- FOOTER YEAR ----
const footerYear = document.getElementById('footerYear');
if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}
