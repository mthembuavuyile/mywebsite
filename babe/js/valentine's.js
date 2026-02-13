/* =========================================
       PART 1: INTERACTIVE ASK LOGIC (Optimized)
       ========================================= */
    const cat = document.getElementById("cat");
    const catGroup = document.getElementById("cat-head-group");
    let currentStepId = 1;

    // Use efficient DOM updates
    const requestUpdate = (fn) => window.requestAnimationFrame(fn);

    function setMood(mood) {
        requestUpdate(() => {
            cat.setAttribute("data-mood", mood);
            if(mood === 'happy') catGroup.style.transform = "rotate(5deg)";
            else if(mood === 'shocked') catGroup.style.transform = "translateY(-5px)";
            else if(mood === 'sad') catGroup.style.transform = "translateY(5px) rotate(-5deg)";
            else if(mood === 'love') catGroup.style.transform = "rotate(5deg) scale(1.05)";
            else catGroup.style.transform = "none";
        });
    }

    function changeStep(id) {
        const currentStep = document.getElementById("step" + currentStepId);
        const nextStepEl = document.getElementById("step" + id);

        if (!currentStep || !nextStepEl) return;

        currentStep.classList.add("fading-out");
        currentStep.classList.remove("active");

        setTimeout(() => {
            currentStep.style.display = "none";
            currentStep.classList.remove("fading-out");

            nextStepEl.style.display = "flex";
            
            requestUpdate(() => {
                nextStepEl.classList.add("active");
            });
            
            currentStepId = id;
            updateMoodForStep(id);
        }, 400); 
    }

    function updateMoodForStep(id) {
        switch(id) {
            case 2: setMood("happy"); break;
            case 3: setMood("love"); break;
            case 4: setMood("shocked"); break;
            case 5: setMood("happy"); break;
            case 6: setMood("love"); break;
            default: setMood("normal");
        }
    }

    /* NO BUTTON DODGE LOGIC */
    const noBtn = document.getElementById("noBtn");
    const noTexts = ["No?", "Really?", "Please?", "Don't!", "Miss Click?", "Try Again!"];
    let noCount = 0;

    function dodgeBtn(e) {
        e.preventDefault(); 
        e.stopPropagation();
        
        const card = document.querySelector('.card-p1');
        const cardRect = card.getBoundingClientRect();
        const btnRect = noBtn.getBoundingClientRect();

        const maxX = cardRect.width - btnRect.width - 20;
        const maxY = cardRect.height - btnRect.height - 20;
        
        const randX = Math.max(10, Math.random() * maxX);
        const randY = Math.max(10, Math.random() * maxY);

        requestUpdate(() => {
            noBtn.style.position = "absolute";
            noBtn.style.left = randX + "px";
            noBtn.style.top = randY + "px";
            noBtn.innerText = noTexts[noCount % noTexts.length];
            noBtn.style.background = "#ff4d6d";
            noBtn.style.color = "white";
        });
        noCount++;
        
        setMood("sad");
        setTimeout(() => setMood("happy"), 1500);
    }

    noBtn.addEventListener('mouseenter', dodgeBtn);
    noBtn.addEventListener('touchstart', dodgeBtn, {passive: false});

    /* SUCCESS & CONFETTI */
    function acceptLove() {
        changeStep(7);
        setMood("love");
        
        fireConfetti();
        setTimeout(fireConfetti, 400);
        setTimeout(fireConfetti, 800);

        // Defer heavy DOM creation slightly to allow UI update
        setTimeout(createBouquet, 100);
    }

    /* CONFETTI SYSTEM */
    const canvas = document.getElementById("confetti-canvas");
    const ctx = canvas.getContext("2d");
    let confetti = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function fireConfetti() {
        const colors = ['#ff4d6d', '#ff8fa3', '#ffccd5', '#ffd700', '#fff'];
        const count = 100; // Reduced count slightly for mobile performance
        
        for (let i = 0; i < count; i++) {
            const x = canvas.width / 2;
            const y = canvas.height / 2;
            
            confetti.push({
                x: x,
                y: y,
                w: Math.random() * 8 + 5,
                h: Math.random() * 8 + 5,
                vx: (Math.random() - 0.5) * 25,
                vy: (Math.random() - 0.5) * 25 - 5, 
                color: colors[Math.floor(Math.random() * colors.length)],
                gravity: 0.25,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 15,
                opacity: 1
            });
        }
        if(confetti.length <= count) requestUpdate(animateConfetti);
    }

    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for(let i = 0; i < confetti.length; i++) {
            const p = confetti[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.rotation += p.rotationSpeed;
            p.opacity -= 0.008; // Fade out faster for performance

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.globalAlpha = Math.max(0, p.opacity);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();

            if (p.y > canvas.height || p.opacity <= 0) {
                confetti.splice(i, 1);
                i--;
            }
        }

        if (confetti.length > 0) requestUpdate(animateConfetti);
    }

    /* BOUQUET CREATION */
    const flowerColors = ['#ff5252', '#ffb142', '#34ace0', '#ff793f', '#706fd3', '#ffda79'];
    const bouquetContainer = document.getElementById('bouquet-container');
    const stemsLayer = document.getElementById('stems-layer');

    class Flower {
        constructor(pos, scale, delay) {
            this.n = 7 + Math.floor(Math.random() * 4);
            this.scale = scale;
            this.pos = pos;
            this.color = flowerColors[Math.floor(Math.random() * flowerColors.length)];
            this.delay = delay;
            this.createStem();
            this.createFlower();
        }

        createStem() {
            const stem = document.createElementNS("http://www.w3.org/2000/svg", "path");
            const startX = 150;
            const startY = 275;
            const pinchY = 240; 
            const d = `M ${startX} ${startY} L 150 ${pinchY} Q ${150} ${this.pos.y + 25} ${this.pos.x} ${this.pos.y}`;
            
            stem.setAttribute("d", d);
            stem.setAttribute("class", "stem");
            stem.style.animationDelay = `${this.delay * 0.5}s`;
            stemsLayer.appendChild(stem);
        }

        createFlower() {
            this.element = document.createElement('div');
            this.element.classList.add('flower');
            this.element.style.setProperty('--flower-color', this.color);
            this.element.style.setProperty('--scale', this.scale);
            this.element.style.left = `${this.pos.x - 10}px`;
            this.element.style.top = `${this.pos.y - 10}px`;
            this.element.style.animationDelay = `${1 + this.delay}s, ${1 + this.delay}s`;

            for (let i = 0; i < this.n; i++) {
                const petal = document.createElement('div');
                petal.classList.add('petal');
                petal.style.width = `16px`; 
                petal.style.height = `35px`; 
                const angle = (360 / this.n) * i;
                petal.style.transform = `rotate(${angle}deg)`;
                this.element.appendChild(petal);
            }

            const center = document.createElement('div');
            center.classList.add('center');
            this.element.appendChild(center);
            bouquetContainer.appendChild(this.element);
        }
    }

    function createBouquet() {
        const numFlowers = 22; // Reduced from 28 to 22 for better DOM performance
        for (let i = 0; i < numFlowers; i++) {
            const angle = (Math.random() * Math.PI) - Math.PI;
            const r = 50 + Math.random() * 75;
            const x = 150 + r * Math.cos(angle);
            const y = 150 + r * Math.sin(angle) * 0.6;
            const scale = 0.5 + Math.random() * 0.6;
            const delay = Math.random() * 1.5;
            new Flower({x, y}, scale, delay);
        }
    }


    /* =========================================
       TRANSITION LOGIC
       ========================================= */
    function transitionToGallery() {
        const p1 = document.getElementById('part1-wrapper');
        p1.classList.add('hidden');

        setTimeout(() => {
            p1.style.display = 'none';
            document.body.classList.add('dark-mode');

            const p2 = document.getElementById('part2-wrapper');
            p2.style.display = 'flex';
            void p2.offsetWidth; 
            p2.classList.add('visible');

            const musicControls = document.getElementById('music-controls');
            musicControls.style.display = 'flex';
            
            // Initialize carousel only when needed
            initCarousel();
        }, 1000); 
    }


    /* =========================================
       PART 2: CAROUSEL LOGIC (Data & Perf Optimized)
       ========================================= */
    const mediaItems = [
      { src: 'images/babe1.jpeg' },
      { src: 'videos/video (1).mp4' },
      { src: 'images/babe1.jpg' },
      { src: 'videos/video (1) (2).mp4' },
      { src: 'images/babe2.jpg' },
      { src: 'videos/video (1) (3).mp4' },
      { src: 'images/babe3.jpg' },
      { src: 'videos/video (1) (4).mp4' },
      { src: 'images/babe4.jpg' },
      { src: 'videos/video (1) (5).mp4' },
      { src: 'images/babe5.jpg' },
      { src: 'videos/video (1) (6).mp4' },
      { src: 'images/babe6.jpg' },
    ];

    const SLIDE_MS = 6000; // Increased to 6s to allow video buffering
    const START_DELAY_MS = 500;

    const carouselEl = document.getElementById('main-carousel');
    const loader = document.getElementById('loader');
    const loaderText = document.getElementById('loader-text');
    const hint = document.getElementById('hint');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const dragSurface = document.getElementById('drag-surface');

    let angleStep = 0;
    let radius = 0;
    let currentIndex = 0;
    let currentRotation = 0;
    let autoplayTimer = null;
    let isPaused = false;
    let isReady = false;

    function isVideoSrc(src){
      return /\.(mp4|webm|ogg)(\?.*)?$/i.test(src);
    }

    function clampIndex(i){
      const n = mediaItems.length;
      return (i % n + n) % n;
    }

    function setLoader(msg){
      loaderText.textContent = msg;
    }

    // DATA SAVER: Only preload images, ignore videos initially
    function preloadAll(items){
      const promises = items.map((item) => {
        if (isVideoSrc(item.src)) {
            // Do not download video data yet
            return Promise.resolve();
        } else {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = item.src;
                img.onload = resolve;
                img.onerror = resolve; // Continue even if error
            });
        }
      });
      return Promise.all(promises);
    }

    function buildCarousel(){
      carouselEl.innerHTML = "";
      angleStep = 360 / mediaItems.length;
      radius = Math.round((220 / 2) / Math.tan(Math.PI / mediaItems.length)) + 40;

      mediaItems.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = 'carousel-item';
        div.style.transform = `rotateY(${i * angleStep}deg) translateZ(${radius}px)`;

        const src = item.src;
        if (isVideoSrc(src)){
          const v = document.createElement('video');
          // LAZY LOAD: Store src in dataset, do not set v.src yet
          v.dataset.src = src; 
          v.muted = true;
          v.loop = false;
          v.playsInline = true;
          v.preload = 'none'; // Critical for data saving
          v.controls = false;
          div.appendChild(v);
        } else {
          const img = document.createElement('img');
          img.src = src;
          img.alt = "Memory";
          img.loading = "eager"; // We already preloaded these
          div.appendChild(img);
        }

        div.addEventListener('click', () => {
          goToIndex(i, { user:true });
        });

        carouselEl.appendChild(div);
      });
    }

    function updateActiveStyles(){
      const items = carouselEl.querySelectorAll('.carousel-item');
      items.forEach((el, i) => {
        el.classList.toggle('is-active', i === currentIndex);
      });
    }

    function pauseAllVideos(){
      const videos = carouselEl.querySelectorAll('video');
      videos.forEach(v => {
        try { v.pause(); } catch(e){}
      });
    }

    // INTELLIGENT VIDEO LOADER
    function playActiveVideoIfAny(){
      const activeItem = carouselEl.querySelectorAll('.carousel-item')[currentIndex];
      if (!activeItem) return;

      const v = activeItem.querySelector('video');
      if (!v) return;

      // Check if we need to load it for the first time
      if (!v.src || v.src === window.location.href) {
        v.src = v.dataset.src;
        v.load(); // Fetch data only now
      }

      try {
        v.currentTime = 0;
        const p = v.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      } catch(e){}
    }

    function applyRotation(){
      currentRotation = -(currentIndex * angleStep);
      carouselEl.style.transform = `rotateY(${currentRotation}deg)`;
      updateActiveStyles();
    }

    function scheduleNext(){
      clearTimeout(autoplayTimer);
      if (isPaused) return;

      autoplayTimer = setTimeout(() => {
        goToIndex(currentIndex + 1, { user:false });
      }, SLIDE_MS);
    }

    function goToIndex(index, { user }){
      if (!isReady) return;

      currentIndex = clampIndex(index);
      pauseAllVideos();
      applyRotation();
      
      // Delay play slightly to allow CSS 3D transform to start smoothly
      setTimeout(playActiveVideoIfAny, 100);
      
      scheduleNext();

      if (user) {
        hint.textContent = "Nice 😌 keep exploring — autoplay continues";
      }
    }

    function startAutoplay(){
      isPaused = false;
      pauseBtn.textContent = "Pause";
      goToIndex(currentIndex, { user:false });
    }

    function togglePause(){
      if (!isReady) return;
      isPaused = !isPaused;
      if (isPaused){
        clearTimeout(autoplayTimer);
        pauseAllVideos();
        pauseBtn.textContent = "Play";
        hint.textContent = "Paused — use arrows/drag to browse";
      } else {
        pauseBtn.textContent = "Pause";
        hint.textContent = "Auto-playing… use arrows, drag, or keyboard";
        playActiveVideoIfAny();
        scheduleNext();
      }
    }

    prevBtn.addEventListener('click', () => goToIndex(currentIndex - 1, { user:true }));
    nextBtn.addEventListener('click', () => goToIndex(currentIndex + 1, { user:true }));
    pauseBtn.addEventListener('click', togglePause);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') goToIndex(currentIndex - 1, { user:true });
      if (e.key === 'ArrowRight') goToIndex(currentIndex + 1, { user:true });
      if (e.key === ' ') { e.preventDefault(); togglePause(); }
    });

    (function enableDrag(){
      let dragging = false;
      let startX = 0;
      let lastX = 0;

      function onDown(x){
        dragging = true;
        startX = x;
        lastX = x;
        carouselEl.style.transition = 'none'; // Snappier drag
      }

      function onMove(x){
        if (!dragging) return;
        const dx = x - lastX;
        lastX = x;
        // Optional: Live rotation following finger (omitted for simple perf)
      }

      function onUp(){
        if (!dragging) return;
        dragging = false;
        carouselEl.style.transition = 'transform 0.85s cubic-bezier(0.25,0.1,0.25,1)'; // Restore smooth
        const dx = lastX - startX;
        const threshold = 35;
        if (Math.abs(dx) > threshold){
          if (dx > 0) goToIndex(currentIndex - 1, { user:true });
          else goToIndex(currentIndex + 1, { user:true });
        }
      }

      dragSurface.addEventListener('mousedown', (e) => onDown(e.clientX));
      window.addEventListener('mousemove', (e) => onMove(e.clientX));
      window.addEventListener('mouseup', onUp);

      dragSurface.addEventListener('touchstart', (e) => onDown(e.touches[0].clientX), { passive:true });
      dragSurface.addEventListener('touchmove', (e) => onMove(e.touches[0].clientX), { passive:true });
      dragSurface.addEventListener('touchend', onUp);
    })();

    /* MUSIC HANDLING */
    const music = document.getElementById('bg-music');
    const musicControls = document.getElementById('music-controls');
    const musicText = document.getElementById('music-text');

    function setMusicUI(on){
      musicControls.classList.toggle('playing', on);
      musicText.textContent = on ? "Music On" : "Music Off";
    }

    async function tryPlayMusic(){
      try {
        music.volume = 0.5; // Set volume to 50%
        await music.play();
        setMusicUI(true);
      } catch {
        setMusicUI(false);
      }
    }

    musicControls.addEventListener('click', async () => {
      if (music.paused){
        await tryPlayMusic();
      } else {
        music.pause();
        setMusicUI(false);
      }
    });

    // Initialize Carousel Logic
    async function initCarousel(){
      setLoader("Loading your moments…");
      await preloadAll(mediaItems); // Fast now (ignores videos)
      setLoader("Ready!");

      buildCarousel();

      await new Promise(r => setTimeout(r, START_DELAY_MS));

      loader.style.display = "none";
      isReady = true;
      
      tryPlayMusic();
      startAutoplay();
    }