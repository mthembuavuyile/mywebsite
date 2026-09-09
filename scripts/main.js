
        // Mobile menu toggle (if present on legacy pages)
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            navLinks.classList.remove('active');
        } 
    });
}

// Interactive background (if present)
const animatedBg = document.getElementById('animatedBg');
if (animatedBg) {
    let rafId;

    function updateBackground(e) {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            const x = e.clientX / window.innerWidth;
            animatedBg.style.background = `linear-gradient(${x * 360}deg, var(--color-primary), var(--color-secondary))`;
        });
    }

    document.addEventListener('mousemove', updateBackground, { passive: true });

    window.addEventListener('unload', () => {
        document.removeEventListener('mousemove', updateBackground);
        cancelAnimationFrame(rafId);
    });
}