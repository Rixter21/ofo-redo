/**
 * Premium Services Page JavaScript
 * Handles all interactive functionality for the services page with premium features
 */

// Import component-specific JavaScript
import "./components/filter-buttons.js";
import "./components/faq-accordion.js";
import "./components/comparison-toggle.js";

// Initialize services page functionality
document.addEventListener("componentsLoaded", () => {
  console.log(
    "All components loaded, initializing premium services page functionality"
  );

  // Initialize premium functionality
  initServiceMetrics();
  initScrollAnimations();
  initParticlesBackground();
  initScrollIndicator();
  initBackToTop();
});

/**
 * Initialize service metrics counters with easing animation
 */
function initServiceMetrics() {
  const metricElements = document.querySelectorAll("[data-value]");

  if (metricElements.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const targetValue = parseInt(element.dataset.value, 10);
          const duration = 2500; // ms
          const frameDuration = 1000 / 60; // 60fps
          const totalFrames = Math.round(duration / frameDuration);
          let frame = 0;

          // Easing function for smoother animation
          const easeOutQuad = (t) => t * (2 - t);

          const animate = () => {
            frame++;
            const progress = easeOutQuad(frame / totalFrames);
            const currentValue = Math.round(progress * targetValue);

            element.textContent = currentValue;

            if (frame < totalFrames) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
          observer.unobserve(element);
        }
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -100px 0px" }
  );

  metricElements.forEach((element) => {
    observer.observe(element);
  });
}

/**
 * Initialize scroll animations for elements with animate-on-scroll class
 */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll(".animate-on-scroll");

  if (animatedElements.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animated");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
  );

  animatedElements.forEach((element) => {
    observer.observe(element);
  });
}

/**
 * Initialize enhanced particles background
 */
function initParticlesBackground() {
  const particlesContainer = document.getElementById("particles-js");
  if (!particlesContainer) return;

  // Add more dynamic particles
  for (let i = 0; i < 10; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.width = `${Math.random() * 5 + 2}px`;
    particle.style.height = particle.style.width;
    particle.style.opacity = `${Math.random() * 0.5 + 0.1}`;
    particle.style.animationDuration = `${Math.random() * 30 + 20}s`;
    particle.style.animationDelay = `${Math.random() * -20}s`;
    particlesContainer.appendChild(particle);
  }
}

/**
 * Initialize scroll indicator animation and behavior
 */
function initScrollIndicator() {
  const scrollIndicator = document.querySelector(".scroll-indicator");
  if (!scrollIndicator) return;

  // Hide scroll indicator when user scrolls down
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      scrollIndicator.style.opacity = "0";
    } else {
      scrollIndicator.style.opacity = "1";
    }
  });

  // Scroll down when indicator is clicked
  scrollIndicator.addEventListener("click", () => {
    const servicesSection = document.getElementById("service-cards-grid");
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({
        top: window.innerHeight,
        behavior: "smooth",
      });
    }
  });
}

/**
 * Initialize back to top button
 */
function initBackToTop() {
  // Create back to top button if it doesn't exist
  let backToTopBtn = document.querySelector(".back-to-top");

  if (!backToTopBtn) {
    backToTopBtn = document.createElement("button");
    backToTopBtn.className = "back-to-top";
    backToTopBtn.innerHTML = `
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
      </svg>
    `;
    document.body.appendChild(backToTopBtn);
  }

  // Show/hide button based on scroll position
  window.addEventListener("scroll", () => {
    if (window.scrollY > 500) {
      backToTopBtn.classList.add("visible");
    } else {
      backToTopBtn.classList.remove("visible");
    }
  });

  // Scroll to top when clicked
  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}
