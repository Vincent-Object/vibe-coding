class Fireworks {
    constructor() {
        this.canvas = document.getElementById('fireworksCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.rockets = [];
        this.active = true;
        this.animationId = null;
        this.launchInterval = null;
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Stop on any interaction
        document.addEventListener('mousedown', () => this.stop());
        document.addEventListener('keydown', () => this.stop());
        
        // Start animation loop
        this.animate();
        
        // Launch initial fireworks
        this.autoLaunch();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    autoLaunch() {
        // Launch fireworks for the first 3 seconds
        let count = 0;
        this.launchInterval = setInterval(() => {
            if (!this.active) return;
            this.launchRocket();
            count++;
            if (count > 10) { // Launch about 10 rockets
                clearInterval(this.launchInterval);
            }
        }, 300);
    }

    stop() {
        if (!this.active) return;
        this.active = false;
        
        if (this.launchInterval) {
            clearInterval(this.launchInterval);
        }
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles = [];
        this.rockets = [];
    }

    launchRocket() {
        if (!this.active) return;
        const x = Math.random() * this.canvas.width;
        const targetY = (Math.random() * this.canvas.height) * 0.5; // Top half of screen
        // Start from bottom
        const startY = this.canvas.height;
        
        this.rockets.push(new Rocket(x, startY, targetY));
    }

    createExplosion(x, y, color) {
        if (!this.active) return;
        const particleCount = 50;
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    animate() {
        if (!this.active) return;
        
        this.animationId = requestAnimationFrame(() => this.animate());
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw rockets
        for (let i = this.rockets.length - 1; i >= 0; i--) {
            const rocket = this.rockets[i];
            rocket.update();
            rocket.draw(this.ctx);

            if (rocket.exploded) {
                this.createExplosion(rocket.x, rocket.y, rocket.color);
                this.rockets.splice(i, 1);
            }
        }

        // Update and draw particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update();
            p.draw(this.ctx);

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
}

class Rocket {
    constructor(x, y, targetY) {
        this.x = x;
        this.y = y;
        this.targetY = targetY;
        this.speed = 8 + Math.random() * 4;
        this.angle = -Math.PI / 2; // Straight up
        this.exploded = false;
        
        // Random bright color
        const hue = Math.floor(Math.random() * 360);
        this.color = `hsl(${hue}, 100%, 50%)`;
    }

    update() {
        this.y -= this.speed;
        if (this.y <= this.targetY) {
            this.exploded = true;
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 6 + 2;
        this.vx = Math.cos(angle) * velocity;
        this.vy = Math.sin(angle) * velocity;
        this.gravity = 0.1;
        this.friction = 0.95;
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.015;
    }

    update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Fireworks();
});
