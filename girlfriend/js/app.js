/* js/app.js */

document.addEventListener('DOMContentLoaded', () => {
    const iframe = document.getElementById('app-frame');
    const loader = document.getElementById('iframe-loader');
    const navItems = document.querySelectorAll('.nav-item[data-target], .menu-item[data-target]');
    const moreMenuBtn = document.getElementById('more-menu-btn');
    const moreMenu = document.getElementById('more-menu');

    // Global Music Player
    const audio = document.getElementById('global-audio');
    const playBtn = document.getElementById('global-play-btn');
    const playIcon = playBtn.querySelector('i');
    const playerContainer = document.querySelector('.global-music-player');

    let isPlaying = false;

    // Toggle Music
    function toggleMusic() {
        if (isPlaying) {
            audio.pause();
            playIcon.classList.remove('fa-pause');
            playIcon.classList.add('fa-play');
            playerContainer.classList.remove('playing');
        } else {
            audio.play().catch(e => console.log("Autoplay blocked:", e));
            playIcon.classList.remove('fa-play');
            playIcon.classList.add('fa-pause');
            playerContainer.classList.add('playing');
        }
        isPlaying = !isPlaying;
    }

    playBtn.addEventListener('click', toggleMusic);

    // Navigation Routing
    function navigateTo(targetUrl) {
        // Show loader, hide iframe
        iframe.classList.remove('loaded');
        loader.style.zIndex = '2'; // Bring loader to front

        // Wait for fade out
        setTimeout(() => {
            iframe.src = targetUrl;
        }, 200);

        // Update active states
        navItems.forEach(item => item.classList.remove('active'));
        
        // Find the matching nav item or menu item
        const activeItem = Array.from(navItems).find(item => item.dataset.target === targetUrl);
        if (activeItem) {
            activeItem.classList.add('active');
            // If it's a menu item, also highlight the "More" button
            if (activeItem.classList.contains('menu-item')) {
                moreMenuBtn.classList.add('active');
            }
        }
    }

    // Attach click listeners to all nav items
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = item.dataset.target;
            if (target) {
                navigateTo(target);
            }
            // Close menu if it's open
            if (moreMenuBtn.classList.contains('open')) {
                moreMenuBtn.classList.remove('open');
            }
        });
    });

    // Iframe Load Event
    iframe.addEventListener('load', () => {
        loader.style.zIndex = '-1'; // Hide loader
        iframe.classList.add('loaded'); // Fade in iframe
        
        // Try to sync iframe internal navigation with our app shell
        try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            
            // Intercept links inside iframe
            const iframeLinks = iframeDoc.querySelectorAll('a[href]');
            iframeLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    const href = link.getAttribute('href');
                    if (href && !href.startsWith('http') && !href.startsWith('#')) {
                        e.preventDefault();
                        navigateTo(href);
                    }
                });
            });

            // If a page has its own music (like her-ai or my-heart), pause global music
            const iframeAudio = iframeDoc.querySelector('audio');
            if (iframeAudio) {
                iframeAudio.addEventListener('play', () => {
                    if (isPlaying) {
                        toggleMusic(); // Pause global music so they don't overlap
                    }
                });
            }

        } catch (e) {
            console.log("Cross-origin or iframe access error:", e);
        }
    });

    // More Menu Toggle
    moreMenuBtn.addEventListener('click', (e) => {
        // Prevent click from immediately closing it due to document listener
        e.stopPropagation(); 
        
        // Don't toggle if we clicked a child menu item
        if (e.target.closest('.menu-item')) return;
        
        moreMenuBtn.classList.toggle('open');
    });

    // Close More menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!moreMenuBtn.contains(e.target)) {
            moreMenuBtn.classList.remove('open');
        }
    });
});
