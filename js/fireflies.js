/* js/fireflies.js */
(() => {
    const canvas = document.createElement('canvas');
    const firefliesCanvasContainer = document.querySelector('.fireflies-canvas');
    if (!firefliesCanvasContainer) return;

    firefliesCanvasContainer.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let width, height;
    let fireflies = [];
    const maxFireflies = 80;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    class Firefly {
        constructor() {
            this.reset();
            this.y = Math.random() * height; // initial random spread
        }

        reset() {
            this.x = Math.random() * width;
            this.y = height + Math.random() * 100;
            this.size = Math.random() * 6 + 2; // 2px - 8px
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = Math.random() * -0.6 - 0.2;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.fadeSpeed = (Math.random() * 0.02) + 0.005;
            this.fadeDir = Math.random() > 0.5 ? 1 : -1;

            const colors = ['#FFD700', '#F5E6A8', '#A8E6A0']; // Gold, Soft Gold, Pale Green
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            this.opacity += this.fadeSpeed * this.fadeDir;
            if (this.opacity >= 1) {
                this.opacity = 1;
                this.fadeDir = -1;
            } else if (this.opacity <= 0.2) {
                this.opacity = 0.2;
                this.fadeDir = 1;
            }

            if (this.y < -50 || this.x < -50 || this.x > width + 50) {
                this.reset();
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.shadowBlur = this.size * 3;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.globalAlpha = 1; // reset alpha
            ctx.shadowBlur = 0; // reset shadow
        }
    }

    for (let i = 0; i < maxFireflies; i++) {
        fireflies.push(new Firefly());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        for (let firefly of fireflies) {
            firefly.update();
            firefly.draw();
        }

        requestAnimationFrame(animate);
    }

    animate();
})();
