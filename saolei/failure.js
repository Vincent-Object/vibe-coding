class FailureEffect {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'failureCanvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none'; // Allow clicking through if needed, but maybe we want to block interaction
        this.canvas.style.zIndex = '900'; // Below modal (1000)
        this.canvas.style.display = 'none';
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animationId = null;
        this.textScale = 0;
        this.active = false;

        window.addEventListener('resize', () => this.resize());
        this.resize();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    start() {
        if (this.active) return;
        this.active = true;
        this.canvas.style.display = 'block';
        this.particles = [];
        this.textScale = 0;
        
        // Initialize particles
        for (let i = 0; i < 100; i++) {
            this.particles.push(this.createParticle());
        }

        this.animate();
    }

    stop() {
        this.active = false;
        this.canvas.style.display = 'none';
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height - this.canvas.height, // Start above
            size: Math.random() * 20 + 5,
            speedY: Math.random() * 5 + 2,
            speedX: (Math.random() - 0.5) * 4,
            color: `hsl(${Math.random() * 360}, 70%, 50%)`,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2,
            shape: Math.random() > 0.5 ? 'rect' : 'circle'
        };
    }

    drawText() {
        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        
        // Animate scale
        if (this.textScale < 1) {
            this.textScale += 0.05;
        } else {
             // Pulse effect
             this.textScale = 1 + Math.sin(Date.now() / 200) * 0.05;
        }
        
        this.ctx.scale(this.textScale, this.textScale);
        
        this.ctx.font = 'bold 120px Arial, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Text Shadow
        this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetX = 5;
        this.ctx.shadowOffsetY = 5;

        // Draw "FAILURE"
        this.ctx.fillStyle = '#ff3333';
        this.ctx.fillText('FAILURE', 0, 0);
        
        // Stroke
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 3;
        this.ctx.strokeText('FAILURE', 0, 0);

        this.ctx.restore();
    }

    animate() {
        if (!this.active) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw particles
        this.particles.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX;
            p.rotation += p.rotationSpeed;

            // Reset if out of screen
            if (p.y > this.canvas.height) {
                p.y = -50;
                p.x = Math.random() * this.canvas.width;
            }

            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation);
            this.ctx.fillStyle = p.color;
            
            if (p.shape === 'rect') {
                this.ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
            } else {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size/2, 0, Math.PI * 2);
                this.ctx.fill();
            }
            this.ctx.restore();
        });

        this.drawText();

        this.animationId = requestAnimationFrame(() => this.animate());
    }
}
