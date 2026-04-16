/* =====================================================
   MAKHASWA HOLDINGS — APP.JS
   Shared across index.html, about.html, services.html
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialise Lucide icons
    if (window.lucide) lucide.createIcons();

    // -------------------------------------------------------
    // Burger menu toggle
    // -------------------------------------------------------
    const burgerBtn = document.getElementById('burger-btn');
    const mobileNav = document.getElementById('mobile-nav');

    if (burgerBtn && mobileNav) {
        const burgerIcon = burgerBtn.querySelector('i');

        function openMobileNav() {
            mobileNav.classList.add('open');
            burgerBtn.setAttribute('aria-expanded', 'true');
            if (burgerIcon) {
                burgerIcon.setAttribute('data-lucide', 'x');
                lucide.createIcons();
            }
            document.body.style.overflow = 'hidden';
        }

        function closeMobileNav() {
            mobileNav.classList.remove('open');
            burgerBtn.setAttribute('aria-expanded', 'false');
            if (burgerIcon) {
                burgerIcon.setAttribute('data-lucide', 'menu');
                lucide.createIcons();
            }
            document.body.style.overflow = '';
        }

        burgerBtn.addEventListener('click', () => {
            mobileNav.classList.contains('open') ? closeMobileNav() : openMobileNav();
        });

        // Close on link click (mobile)
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMobileNav);
        });

        // Close drawer on resize to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) closeMobileNav();
        });
    }

    // -------------------------------------------------------
    // Smooth scroll for same-page anchor links
    // -------------------------------------------------------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const y = target.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        });
    });

    // -------------------------------------------------------
    // Animate stats on scroll (simple counter)
    // -------------------------------------------------------
    const statNumbers = document.querySelectorAll('.stat-number');
    let statsAnimated = false;

    function animateStats() {
        if (statsAnimated) return;
        const statsSection = document.querySelector('.stats-grid');
        if (!statsSection) return;
        const rect = statsSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            statsAnimated = true;
            statNumbers.forEach(el => {
                const text = el.textContent;
                const num = parseInt(text.replace(/[^0-9]/g, ''));
                if (isNaN(num)) return;
                const suffix = text.replace(/[0-9,]/g, '');
                let current = 0;
                const increment = Math.ceil(num / 40);
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= num) {
                        current = num;
                        clearInterval(timer);
                    }
                    el.textContent = current.toLocaleString() + suffix;
                }, 30);
            });
        }
    }

    window.addEventListener('scroll', animateStats);
    animateStats();

    // -------------------------------------------------------
    // Fade-in on scroll (IntersectionObserver)
    // -------------------------------------------------------
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animateTargets = [
        '.value-card', '.team-member', '.project-card',
        '.news-card', '.bbee-card', '.csi-card',
        '.download-item', '.leader-card', '.service-detail-card',
        '.compliance-card', '.stat-item'
    ].join(',');

    document.querySelectorAll(animateTargets).forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // -------------------------------------------------------
    // FAQ Accordion
    // -------------------------------------------------------
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const parent = question.parentElement;
            const wasActive = parent.classList.contains('active');
            
            // Close all other FAQs
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });

            // Toggle current FAQ
            if (!wasActive) {
                parent.classList.add('active');
            }
        });
    });
});
