document.addEventListener('DOMContentLoaded', () => {
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('header nav');
  const header = document.querySelector('header');
  const quoteForm = document.getElementById('quote-form');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav a');
  const chatbotContainer = document.getElementById('chatbot-container');
  let lastScrollY = window.pageYOffset;

  // --- Mobile Navigation ---
  if (burger && nav) {
    burger.addEventListener('click', () => {
      nav.classList.toggle('active');
      burger.setAttribute('aria-expanded', nav.classList.contains('active'));
    });

    document.querySelectorAll('header nav a').forEach(link => {
      link.addEventListener('click', () => {
        if (nav.classList.contains('active')) {
          nav.classList.remove('active');
          burger?.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  // --- Hide/Show Header on Scroll ---
  window.addEventListener('scroll', () => {
    const currentScrollY = window.pageYOffset;
    if (nav?.classList.contains('active')) return;

    if (currentScrollY <= 80) {
      header?.classList.remove('hide');
    } else if (currentScrollY > lastScrollY) {
      header?.classList.add('hide');
    } else {
      header?.classList.remove('hide');
    }
    lastScrollY = currentScrollY;
  });

  // --- Form Submission Microinteraction ---
  if (quoteForm) {
    quoteForm.addEventListener('submit', e => {
      e.preventDefault();
      const submitBtn = quoteForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;

      submitBtn.innerHTML = 'Sending...';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = 'Sent! <i class="fas fa-check"></i>';

        setTimeout(() => {
          submitBtn.innerHTML = originalBtnText;
          submitBtn.disabled = false;
          quoteForm.reset();
        }, 3000);
      }, 1500);
    });
  }

  // --- Active Section / Page Highlighting ---
  const handlePageHighlighting = () => {
    const currentPath = window.location.pathname.split('/').pop();
    if (currentPath === 'index.html' || currentPath === '') {
      const homeLink = document.querySelector('nav a[href*="index.html#home"]');
      homeLink?.classList.add('active');
    } else {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === currentPath);
      });
    }
  };

  const updateActiveLinkOnScroll = entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`nav a[href*="#${id}"]`);
        activeLink?.classList.add('active');
      }
    });
  };

  const observer = new IntersectionObserver(updateActiveLinkOnScroll, {
    root: null,
    rootMargin: '-50% 0px -50% 0px',
    threshold: 0,
  });

  handlePageHighlighting();
  sections.forEach(section => observer.observe(section));

  // --- Dynamically Load Chatbot ---
  if (chatbotContainer) {
    fetch('chatbot.html')
      .then(response => {
        if (!response.ok) throw new Error('Chatbot HTML not found');
        return response.text();
      })
      .then(data => {
        chatbotContainer.innerHTML = data;
        if (typeof initializeChatbot === 'function') {
          initializeChatbot();
        }
      })
      .catch(error => console.error('Error loading chatbot:', error));
  }
});
