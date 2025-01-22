
        // Mobile menu toggle
        const menuToggle = document.getElementById('menuToggle');
        const navLinks = document.getElementById('navLinks');

        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

         // Close menu on window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                navLinks.classList.remove('active');
             } 
        });

         // Optimize performance by using requestAnimationFrame
        let rafId;
        const animatedBg = document.getElementById('animatedBg');

        function updateBackground(e) {
            cancelAnimationFrame(rafId);
            
            rafId = requestAnimationFrame(() => {
                const x = e.clientX / window.innerWidth;
                const y = e.clientY / window.innerHeight;
                animatedBg.style.background = `linear-gradient(${x * 360}deg, var(--color-primary), var(--color-secondary))`;
            });
        }

        // Add event listener with passive flag for better performance
        document.addEventListener('mousemove', updateBackground, { passive: true });

        // Cleanup function
        window.addEventListener('unload', () => {
            document.removeEventListener('mousemove', updateBackground);
            cancelAnimationFrame(rafId);
        });