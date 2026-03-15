/* ===============================
   components/components.js
================================== */
class SiteHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="site-header">
        <div class="container nav-container">
          <a href="/index.html" class="brand-logo">MRA ⚡</a>
          <nav aria-label="Primary">
            <ul class="nav-links">
              <li><a href="/index.html">Home</a></li>
              <li><a href="/about.html">About</a></li>
              <li><a href="/portfolio.html">Portfolio</a></li>
              <li><a href="/blog/index.html">Blog</a></li>
              <li><a href="/contact.html">Contact</a></li>
              <li><a href="https://vylex.co.za" target="_blank" rel="noopener">Company</a></li>
            </ul>
          </nav>
          <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Toggle Menu">
            <i class="fas fa-bars"></i>
          </button>
        </div>
      </header>

      <nav class="mobile-nav" id="mobileNav">
        <ul class="mobile-nav-links">
          <li><a href="/index.html">Home</a></li>
          <li><a href="/about.html">About</a></li>
          <li><a href="/portfolio.html">Portfolio</a></li>
          <li><a href="/blog/index.html">Blog</a></li>
          <li><a href="/contact.html">Contact</a></li>
          <li><a href="https://vylex.co.za" target="_blank" rel="noopener">Company</a></li>
        </ul>
      </nav>
    `;

    // Mobile Menu Logic
    const mobileBtn = this.querySelector('#mobileMenuBtn');
    const mobileNav = this.querySelector('#mobileNav');
    const mobileLinks = mobileNav.querySelectorAll('a');
    const icon = mobileBtn.querySelector('i');

    const toggleMenu = () => {
      mobileNav.classList.toggle('active');
      if (mobileNav.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
        document.body.style.overflow = 'hidden';
      } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
        document.body.style.overflow = '';
      }
    };

    mobileBtn.addEventListener('click', toggleMenu);
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (mobileNav.classList.contains('active')) toggleMenu();
      });
    });
  }
}

class SiteFooter extends HTMLElement {
  connectedCallback() {
    const currentYear = new Date().getFullYear();
    this.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <!-- Important Footer Links Injected Here -->
          <div class="footer-links">
            <a href="/index.html">Home</a> • 
            <a href="/about.html">About</a> • 
            <a href="/portfolio.html">Portfolio</a> • 
            <a href="/blog/index.html">Blog</a> • 
            <a href="/contact.html">Contact</a>
          </div>
          <p>&copy; ${currentYear} Avuyile Mthembu. All rights reserved.</p>
        </div>
      </footer>
    `;
  }
}

// Register the custom elements
customElements.define('site-header', SiteHeader);
customElements.define('site-footer', SiteFooter);