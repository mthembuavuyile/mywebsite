document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.bubbles-container');
  if (!container) return;

  const createBubble = () => {
    const bubble = document.createElement('div');
    const size = Math.random() * 60 + 20; 
    bubble.classList.add('bubble');
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 100}%`;

    const duration = 6 + Math.random() * 4; // 6s to 10s
    bubble.style.setProperty('--animation-duration', `${duration}s`);

    const maxOpacity = Math.random() * 0.4 + 0.4; // 0.4 – 0.8
    bubble.style.setProperty('--max-opacity', maxOpacity);

    bubble.style.setProperty('--wobble-x', `${Math.random() * 80 - 40}px`);

    const highlight = document.createElement('div');
    highlight.classList.add('bubble-highlight');
    bubble.appendChild(highlight);

    const reflection = document.createElement('div');
    reflection.classList.add('bubble-reflection');
    bubble.appendChild(reflection);

    bubble.addEventListener('animationend', () => bubble.remove());
    container.appendChild(bubble);
  };

  const startTime = Date.now();
  const spawnBubble = () => {
    if (Date.now() - startTime < 10000) { // 10 seconds
      createBubble();
      const randomDelay = Math.random() * 500 + 200;
      setTimeout(spawnBubble, randomDelay);
    }
  };

  spawnBubble();
});
