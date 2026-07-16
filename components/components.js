/* ===============================
   components/components.js
================================== */

class SiteHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="site-header">
        <div class="container nav-container">
          <a href="/index.html" class="brand-logo">MRA ⚡</a>
          <nav aria-label="Primary" class="desktop-nav">
            <ul class="nav-links">
              <li><a href="/index.html" data-nav="home">Home</a></li>
              <li><a href="/about.html" data-nav="about">About</a></li>
              <li><a href="/portfolio.html" data-nav="portfolio">Portfolio</a></li>
              <li><a href="/blog/index.html" data-nav="blog">Blog</a></li>
              <li><a href="/contact.html" data-nav="contact">Contact</a></li>
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
          <li><a href="/index.html" data-nav="home">Home</a></li>
          <li><a href="/about.html" data-nav="about">About</a></li>
          <li><a href="/portfolio.html" data-nav="portfolio">Portfolio</a></li>
          <li><a href="/blog/index.html" data-nav="blog">Blog</a></li>
          <li><a href="/contact.html" data-nav="contact">Contact</a></li>
          <li><a href="https://vylex.co.za" target="_blank" rel="noopener">Company</a></li>
        </ul>
      </nav>
    `;

    // Highlight active link based on current path
    const path = window.location.pathname;
    let activeNav = '';
    
    if (path === '/' || path.endsWith('/index.html') && !path.includes('/blog/')) {
      activeNav = 'home';
    } else if (path.includes('/about.html')) {
      activeNav = 'about';
    } else if (path.includes('/portfolio.html')) {
      activeNav = 'portfolio';
    } else if (path.includes('/blog/')) {
      activeNav = 'blog';
    } else if (path.includes('/contact.html')) {
      activeNav = 'contact';
    }

    if (activeNav) {
      this.querySelectorAll(`[data-nav="${activeNav}"]`).forEach(link => {
        link.classList.add('active');
        link.style.color = 'var(--color-accent)';
        link.style.fontWeight = '700';
      });
    }

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
          <div class="footer-links">
            <a href="/index.html">Home</a> • 
            <a href="/about.html">About</a> • 
            <a href="/portfolio.html">Portfolio</a> • 
            <a href="/blog/index.html">Blog</a> • 
            <a href="/contact.html">Contact</a>
          </div>
          <div class="footer-socials">
            <a href="https://github.com/mthembuavuyile" target="_blank" rel="noopener" aria-label="GitHub"><i class="fab fa-github"></i></a>
            <a href="https://www.linkedin.com/in/mthembuavuyile" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
            <a href="https://x.com/MthembuAvuyile" target="_blank" rel="noopener" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
            <a href="https://instagram.com/mthembu_avuyile_sa" target="_blank" rel="noopener" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
            <a href="https://web.facebook.com/people/Avuyile-Mthembu/100070277396863/" target="_blank" rel="noopener" aria-label="Facebook"><i class="fab fa-facebook"></i></a>
            <a href="https://www.tiktok.com/@mthembu_avuyile_sa" target="_blank" rel="noopener" aria-label="TikTok"><i class="fab fa-tiktok"></i></a>
          </div>
          <p class="copyright">&copy; ${currentYear} Avuyile Mthembu. All rights reserved.</p>
        </div>
      </footer>
    `;
  }
}

class AuthorSection extends HTMLElement {
  connectedCallback() {
    const name = this.getAttribute('name') || 'Avuyile Mthembu';
    const avatar = this.getAttribute('avatar') || '/assets/images/avuyile2.jpg';
    const bio = this.getAttribute('bio') || 'Aspiring full-stack software engineer and monetary economics enthusiast exploring blockchain technologies, digital assets, and the future of decentralized finance. Passionate about the intersection of tech and economic systems.';

    this.innerHTML = `
      <section class="author-section">
        <div class="author-content">
          <div class="author-avatar" style="background-image: url('${avatar}');"></div>
          <div class="author-info">
            <h3>${name}</h3>
            <p class="author-bio">${bio}</p>
          </div>
        </div>
      </section>
    `;
  }
}

class NewsletterSection extends HTMLElement {
  connectedCallback() {
    const title = this.getAttribute('title') || 'Subscribe to My Newsletter';
    const desc = this.getAttribute('desc') || 'Get the latest insights on AI, programming, and technology delivered to your inbox.';
    const endpoint = this.getAttribute('endpoint') || 'YOUR_NEWSLETTER_ENDPOINT';

    this.innerHTML = `
      <section class="newsletter-section">
        <div class="newsletter-section-content">
          <h2 class="newsletter-section-title">${title}</h2>
          <p class="newsletter-section-desc">${desc}</p>
          <form class="newsletter-section-form" action="${endpoint}" method="POST">
            <label for="newsletterEmailField" class="sr-only">Email Address</label>
            <input type="email" id="newsletterEmailField" name="email" class="newsletter-section-input" placeholder="Enter your email address" required>
            <button type="submit" class="newsletter-section-btn">Subscribe</button>
          </form>
        </div>
      </section>
    `;
  }
}

// Register the custom elements
customElements.define('site-header', SiteHeader);
customElements.define('site-footer', SiteFooter);
customElements.define('author-section', AuthorSection);
customElements.define('newsletter-section', NewsletterSection);