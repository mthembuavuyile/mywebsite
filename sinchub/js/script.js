// 1. Define Reusable Components
const components = {
    navbar: `
        <nav class="navbar">
            <div class="container nav-flex">
                <a href="index.html" class="logo">
                    <img src="images/sih-transparent-logo.png" alt="Sandanezwe Logo" class="logo-img">
                </a>
                <div class="nav-links">
                    <a href="index.html">Home</a>
                    <a href="about.html">About</a>
                    <a href="services.html">Services</a>
                    <a href="contact.html">Contact</a>
                </div>
                <div class="hamburger">
                    <span class="bar"></span>
                    <span class="bar"></span>
                    <span class="bar"></span>
                </div>
            </div>
        </nav>
    `,
    footer: `
        <footer>
            <div class="container footer-grid">
                <div>
                    <h3>Sandanezwe Hub</h3>
                    <p>Building inclusive economic systems and empowering youth in rural communities.</p>
                    <p><i class="fas fa-envelope" style="color: var(--secondary);"></i> info@sinchub.co.za</p>
                    <p><i class="fas fa-phone" style="color: var(--secondary);"></i> 071 234 5678</p>
                </div>
                <div>
                    <h3>Quick Links</h3>
                    <p><a href="index.html">Home</a></p>
                    <p><a href="about.html">About Us</a></p>
                    <p><a href="services.html">Services</a></p>
                    <p><a href="contact.html">Contact</a></p>
                </div>
                <div>
                    <h3>Connect With Us</h3>
                    <p>Stay updated with our latest initiatives and impact stories.</p>
                    <div class="footer-socials">
                        <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                        <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                        <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
                    </div>
                </div>
            </div>
            <div class="container footer-bottom">
                <p>&copy; <span id="current-year"></span> Sandanezwe Incubation Hub. All rights reserved.</p>
            </div>
        </footer>
    `
};

document.addEventListener('DOMContentLoaded', () => {
    // 2. Inject Components
    document.getElementById('nav-placeholder').innerHTML = components.navbar;
    document.getElementById('footer-placeholder').innerHTML = components.footer;

    // 3. Auto-Highlight Current Page Navigation
    // Gets the current file name (e.g., 'about.html'). Defaults to 'index.html' if empty.
    let currentPath = window.location.pathname.split('/').pop();
    if (currentPath === '') currentPath = 'index.html'; 
    
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('current');
        }
    });

    // 4. Auto-Update Footer Year
    const yearSpan = document.getElementById('current-year');
    if(yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // 5. Mobile Hamburger Menu Logic
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");

    if (hamburger && navLinks) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navLinks.classList.toggle("active");
        });
    }
});