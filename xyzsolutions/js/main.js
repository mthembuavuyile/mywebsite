document.addEventListener('DOMContentLoaded', function() {
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('header nav');
  const chatbotContainer = document.getElementById('chatbot-container');
  const header = document.querySelector('header');
  let lastScrollY = window.pageYOffset;

  // --- Mobile Navigation ---
  if (burger && nav) {
    burger.addEventListener('click', () => {
      nav.classList.toggle('active');
    });

    document.querySelectorAll('header nav a').forEach(link => {
      link.addEventListener('click', () => {
        if (nav.classList.contains('active')) {
          nav.classList.remove('active');
        }
      });
    });
  }
  
  // --- Hide/Show Header on Scroll ---
  window.addEventListener('scroll', () => {
    const currentScrollY = window.pageYOffset;
    if (nav.classList.contains('active')) return;

    if (currentScrollY <= 80) {
      header.classList.remove('hide');
    } else if (currentScrollY > lastScrollY) {
      header.classList.add('hide');
    } else {
      header.classList.remove('hide');
    }
    lastScrollY = currentScrollY;
  });

  // --- Dynamically Load Chatbot ---
  if (chatbotContainer) {
    fetch('chatbot.html')
      .then(response => {
        if (!response.ok) {
          throw new Error('Chatbot HTML not found');
        }
        return response.text();
      })
      .then(data => {
        chatbotContainer.innerHTML = data;
        // The chatbot.js script, loaded next, will initialize the bot logic
        if (typeof initializeChatbot === 'function') {
          initializeChatbot();
        }
      })
      .catch(error => {
        console.error('Error loading chatbot:', error);
      });
  }
});