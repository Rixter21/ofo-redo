/**
 * Premium Particles Animation
 * Enhances the homepage with elegant particle effects for premium feel
 */

class ParticlesAnimation {
  constructor(selector, options) {
    this.container = document.querySelector(selector);
    if (!this.container) return;

    this.options = Object.assign(
      {
        particleCount: 80,
        particleColor: "rgba(255, 215, 0, 0.08)",
        particleSizeMin: 1,
        particleSizeMax: 2,
        connectionColor: "rgba(255, 215, 0, 0.05)",
        connectionDistance: 120,
        speed: 0.5,
        responsive: [
          {
            breakpoint: 768,
            options: {
              particleCount: 40,
              connectionDistance: 80,
            },
          },
        ],
      },
      options
    );

    this.particles = [];
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.width = 0;
    this.height = 0;
    this.dpr = window.devicePixelRatio || 1;
    this.init();
  }

  init() {
    this.container.appendChild(this.canvas);

    // Set canvas size
    this.resize();
    window.addEventListener("resize", () => this.resize());

    // Create particles
    this.createParticles();

    // Start animation loop
    this.animate();

    // Check for reduced motion preference
    this.checkReducedMotion();
    window
      .matchMedia("(prefers-reduced-motion: reduce)")
      .addEventListener("change", () => {
        this.checkReducedMotion();
      });
  }

  checkReducedMotion() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.options.speed = 0.1;
      // Reduce particle count for less intensive animation
      if (this.particles.length > 30) {
        this.particles = this.particles.slice(0, 30);
      }
    }
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    // Apply DPR for sharper rendering on high-density screens
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.scale(this.dpr, this.dpr);

    // Apply responsive options
    if (this.options.responsive) {
      for (const item of this.options.responsive) {
        if (window.innerWidth <= item.breakpoint) {
          this.options.particleCount = item.options.particleCount;
          this.options.connectionDistance = item.options.connectionDistance;
          break;
        }
      }
    }

    // Recreate particles when resizing
    if (this.particles.length) {
      this.particles = [];
      this.createParticles();
    }
  }

  createParticles() {
    for (let i = 0; i < this.options.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size:
          Math.random() *
            (this.options.particleSizeMax - this.options.particleSizeMin) +
          this.options.particleSizeMin,
        vx: (Math.random() - 0.5) * this.options.speed,
        vy: (Math.random() - 0.5) * this.options.speed,
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Update and draw particles
    for (const p of this.particles) {
      // Move particle
      p.x += p.vx;
      p.y += p.vy;

      // Bounce off edges
      if (p.x < 0 || p.x > this.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.height) p.vy *= -1;

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = this.options.particleColor;
      this.ctx.fill();
    }

    // Draw connections
    this.ctx.beginPath();
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.options.connectionDistance) {
          // Fade connections based on distance
          const opacity = 1 - distance / this.options.connectionDistance;
          this.ctx.strokeStyle = this.options.connectionColor.replace(
            "0.05",
            opacity * 0.05
          );
          this.ctx.lineWidth = 0.5;

          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
        }
      }
    }
    this.ctx.stroke();

    requestAnimationFrame(() => this.animate());
  }
}

// Initialize on DOM content loaded
document.addEventListener("DOMContentLoaded", function () {
  // Check if we're on the homepage by looking for the particles container
  const particlesContainer = document.querySelector(".particles-container");
  if (particlesContainer) {
    const goldParticles = new ParticlesAnimation(".particles-container", {
      particleColor: "rgba(245, 158, 11, 0.08)",
      connectionColor: "rgba(245, 158, 11, 0.03)",
    });
  }
});
