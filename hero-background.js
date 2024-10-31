const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Mouse tracking
let mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 150
};

canvas.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

// Particle class with enhanced features
class Particle {
    constructor() {
        this.reset();
        this.life = Math.random() * 0.5 + 0.5;
        this.maxLife = this.life;
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.baseSpeed = Math.random() * 0.5 + 0.2;
        this.vx = (Math.random() - 0.5) * this.baseSpeed;
        this.vy = (Math.random() - 0.5) * this.baseSpeed;
        this.hue = Math.random() * 60 + 200; // Blue to purple range
        this.life = Math.random() * 0.5 + 0.5;
        this.maxLife = this.life;
    }

    update() {
        // Mouse interaction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            this.vx -= Math.cos(angle) * force * 0.2;
            this.vy -= Math.sin(angle) * force * 0.2;
        }

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Add some chaos
        this.vx += (Math.random() - 0.5) * 0.05;
        this.vy += (Math.random() - 0.5) * 0.05;

        // Damping
        this.vx *= 0.99;
        this.vy *= 0.99;

        // Contain within bounds
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        // Update life
        this.life -= 0.005;
        if (this.life <= 0) this.reset();
    }

    draw() {
        const lifeRatio = this.life / this.maxLife;
        const hue = this.hue + (1 - lifeRatio) * 30; // Shift hue as particle ages
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * lifeRatio, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 80%, 50%, ${lifeRatio})`;
        ctx.fill();
    }
}

// Create particle system
const particles = Array.from({ length: 200 }, () => new Particle());

// Connection line class
class Connection {
    draw(p1, p2, distance) {
        const opacity = 1 - (distance / 100);
        if (opacity > 0) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(150, 200, 255, ${opacity * 0.2})`;
            ctx.stroke();
        }
    }
}

const connection = new Connection();

// Animation loop with advanced rendering
function animate() {
    // Clear canvas with fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particles.forEach(particle => {
        particle.update();
        particle.draw();

        // Draw connections
        particles.forEach(otherParticle => {
            if (particle !== otherParticle) {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    connection.draw(particle, otherParticle, distance);
                }
            }
        });
    });

    // Draw mouse influence area
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(150, 200, 255, 0.2)';
    ctx.stroke();

    requestAnimationFrame(animate);
}
animate();
