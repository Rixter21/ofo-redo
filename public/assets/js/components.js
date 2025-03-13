/**
 * OFO Development - Components.js
 * Modular JavaScript for Homepage Components
 *
 * This file follows a modular pattern to handle component-specific functionality
 * Each component has its own module with clear responsibilities
 */

// Main initialization
document.addEventListener("DOMContentLoaded", () => {
  // Initialize all components
  AnimationModule.init();
  CounterModule.init();
  ParticlesModule.init();
  ScrollModule.init();
  AccordionModule.init();
  NavbarModule.init();
});

/**
 * Animation Module
 * Handles scroll-triggered animations with IntersectionObserver
 */
const AnimationModule = (() => {
  // Private variables
  let observer;
  const animationClasses = {
    "fade-up": "animate__fadeInUp",
    "fade-down": "animate__fadeInDown",
    "fade-left": "animate__fadeInLeft",
    "fade-right": "animate__fadeInRight",
    "zoom-in": "animate__zoomIn",
    bounce: "animate__bounce",
  };

  // Private methods
  const handleIntersection = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const delay = element.dataset.delay || 0;

        setTimeout(() => {
          element.classList.add("visible");

          // Only unobserve if we should animate once
          if (element.dataset.once === "true") {
            observer.unobserve(element);
          }
        }, delay);
      } else if (!entry.target.dataset.once) {
        // If not set to once, remove visible class when out of view
        entry.target.classList.remove("visible");
      }
    });
  };

  // Public methods
  return {
    init: function () {
      const animatedElements = document.querySelectorAll(".animate-on-scroll");

      if (animatedElements.length === 0) return;

      observer = new IntersectionObserver(handleIntersection, {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px",
      });

      animatedElements.forEach((element) => {
        observer.observe(element);
      });

      // Check for reduced motion preference
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        animatedElements.forEach((element) => {
          element.classList.add("visible");
          observer.unobserve(element);
        });
      }
    },

    destroy: function () {
      if (observer) {
        observer.disconnect();
      }
    },
  };
})();

/**
 * Navbar Module
 * Handles navbar dropdown and mobile menu functionality
 */
const NavbarModule = (() => {
  // Private methods
  const setupDropdowns = () => {
    const dropdowns = document.querySelectorAll(".dropdown-trigger");

    dropdowns.forEach((dropdown) => {
      // Get the associated dropdown menu
      const dropdownId = dropdown.id.replace("-button", "");
      const menu = document.getElementById(dropdownId);

      // Toggle dropdown on click
      dropdown.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Get current expanded state
        const isExpanded = dropdown.getAttribute("aria-expanded") === "true";

        // Close all other dropdowns
        document.querySelectorAll(".dropdown-trigger").forEach((item) => {
          if (item !== dropdown) {
            item.setAttribute("aria-expanded", "false");
          }
        });

        document.querySelectorAll(".dropdown-menu").forEach((item) => {
          if (item !== menu) {
            item.classList.remove("active");
          }
        });

        // Toggle current dropdown
        dropdown.setAttribute("aria-expanded", !isExpanded);
        if (menu) {
          menu.classList.toggle("active");
        }
      });
    });

    // Close dropdowns when clicking outside
    document.addEventListener("click", () => {
      document.querySelectorAll(".dropdown-trigger").forEach((dropdown) => {
        dropdown.setAttribute("aria-expanded", "false");
      });

      document.querySelectorAll(".dropdown-menu").forEach((menu) => {
        menu.classList.remove("active");
      });
    });
  };

  const setupMobileMenu = () => {
    const mobileMenuButton = document.querySelector(
      "[data-mobile-menu-button]"
    );
    const mobileMenu = document.getElementById("mobile-menu");

    if (!mobileMenuButton || !mobileMenu) return;

    mobileMenuButton.addEventListener("click", () => {
      const isExpanded =
        mobileMenuButton.getAttribute("aria-expanded") === "true";

      mobileMenuButton.setAttribute("aria-expanded", !isExpanded);
      mobileMenu.classList.toggle("active");

      // Toggle hamburger/close icon
      const iconPath = mobileMenuButton.querySelector("path");
      if (iconPath) {
        if (!isExpanded) {
          // Change to X icon
          iconPath.setAttribute("d", "M6 18L18 6M6 6l12 12");
        } else {
          // Change to hamburger icon
          iconPath.setAttribute("d", "M4 6h16M4 12h16M4 18h16");
        }
      }
    });

    // Mobile services dropdown
    const mobileServicesButton = document.getElementById(
      "mobile-services-button"
    );
    const mobileServicesMenu = document.getElementById("mobile-services-menu");

    if (mobileServicesButton && mobileServicesMenu) {
      mobileServicesButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Toggle the mobile services dropdown
        mobileServicesMenu.classList.toggle("active");

        // Toggle the icon rotation
        const icon = mobileServicesButton.querySelector("svg");
        if (icon) {
          if (mobileServicesMenu.classList.contains("active")) {
            icon.style.transform = "rotate(180deg)";
          } else {
            icon.style.transform = "rotate(0deg)";
          }
        }
      });
    }
  };

  const handleNavbarScroll = () => {
    const navbar = document.querySelector("nav");
    if (!navbar) return;

    // Add scroll event to make navbar more opaque on scroll
    window.addEventListener("scroll", () => {
      if (window.scrollY > 10) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    });
  };

  // Public methods
  return {
    init: function () {
      setupDropdowns();
      setupMobileMenu();
      handleNavbarScroll();
    },
  };
})();

/**
 * Counter Module
 * Handles animated number counters
 */
const CounterModule = (() => {
  // Private variables
  let observer;

  // Private methods
  const handleIntersection = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const targetValue = parseInt(counter.dataset.count, 10);
        const suffix = counter.dataset.suffix || "";
        let currentValue = 0;
        const duration = 2000; // ms
        const step = targetValue / (duration / 16); // ~60fps

        // Only animate once
        observer.unobserve(counter);

        // Animation function
        const updateCounter = () => {
          currentValue += step;
          if (currentValue < targetValue) {
            counter.textContent = Math.floor(currentValue) + suffix;
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = targetValue + suffix;
          }
        };

        requestAnimationFrame(updateCounter);
      }
    });
  };

  // Public methods
  return {
    init: function () {
      const counters = document.querySelectorAll(".counter-value");

      if (counters.length === 0) return;

      observer = new IntersectionObserver(handleIntersection, {
        threshold: 0.5,
      });

      counters.forEach((counter) => {
        observer.observe(counter);
      });
    },

    destroy: function () {
      if (observer) {
        observer.disconnect();
      }
    },
  };
})();

/**
 * Particles Module
 * Handles particle animation effects
 */
const ParticlesModule = (() => {
  // Private variables
  let canvas,
    ctx,
    particles = [],
    animationFrame;
  let width, height;
  const particleCount = 80; // Default count, will be adjusted based on screen size
  const particleBaseSize = 2;
  const connectionDistance = 150;
  const colors = [
    "rgba(245, 158, 11, 0.5)",
    "rgba(217, 119, 6, 0.5)",
    "rgba(180, 83, 9, 0.5)",
  ];

  // Configuration options
  const options = {
    speed: 0.5,
    particleSize: particleBaseSize,
    lineWidth: 0.5,
    connectionOpacity: 0.15,
  };

  // Private methods
  const createParticles = () => {
    // Clear existing particles
    particles = [];

    // Adjust particle count based on screen size
    let adjustedCount = particleCount;
    if (width < 768) {
      adjustedCount = Math.floor(particleCount * 0.5); // 50% for mobile
    } else if (width < 1024) {
      adjustedCount = Math.floor(particleCount * 0.75); // 75% for tablet
    }

    // Create particles
    for (let i = 0; i < adjustedCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * options.particleSize + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.random() * options.speed * 2 - options.speed,
        speedY: Math.random() * options.speed * 2 - options.speed,
      });
    }
  };

  const drawParticles = () => {
    ctx.clearRect(0, 0, width, height);

    // Draw particles and connections
    particles.forEach((particle, i) => {
      // Move particle
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      // Bounce off edges
      if (particle.x < 0 || particle.x > width) particle.speedX *= -1;
      if (particle.y < 0 || particle.y > height) particle.speedY *= -1;

      // Draw particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();

      // Draw connections to nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const otherParticle = particles[j];
        const dx = particle.x - otherParticle.x;
        const dy = particle.y - otherParticle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < connectionDistance) {
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(otherParticle.x, otherParticle.y);
          ctx.strokeStyle = `rgba(245, 158, 11, ${
            options.connectionOpacity * (1 - distance / connectionDistance)
          })`;
          ctx.lineWidth = options.lineWidth;
          ctx.stroke();
        }
      }
    });

    animationFrame = requestAnimationFrame(drawParticles);
  };

  const handleResize = () => {
    // Update canvas dimensions
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Adjust particle count for new dimensions
    createParticles();
  };

  // Public methods
  return {
    init: function () {
      canvas = document.getElementById("particles-canvas");
      if (!canvas) return;

      ctx = canvas.getContext("2d");
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      // Check for reduced motion preference
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        canvas.style.display = "none";
        return;
      }

      // Create initial particles
      createParticles();

      // Start animation
      drawParticles();

      // Add resize handler
      window.addEventListener("resize", handleResize);
    },

    destroy: function () {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      window.removeEventListener("resize", handleResize);
    },
  };
})();

/**
 * Scroll Module
 * Handles smooth scrolling and scroll-based effects
 */
const ScrollModule = (() => {
  // Private methods
  const handleScrollLinks = () => {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();

        const targetId = this.getAttribute("href");
        if (targetId === "#") return;

        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;

        window.scrollTo({
          top: targetElement.offsetTop - 80, // Account for fixed header
          behavior: "smooth",
        });
      });
    });
  };

  // Public methods
  return {
    init: function () {
      handleScrollLinks();
    },
  };
})();

/**
 * Accordion Module
 * Handles accordion/FAQ functionality
 */
const AccordionModule = (() => {
  // Private methods
  const setupAccordions = () => {
    const accordionItems = document.querySelectorAll(".faq-item");

    accordionItems.forEach((item) => {
      const question = item.querySelector(".faq-question");
      const answer = item.querySelector(".faq-answer");
      const icon = item.querySelector(".faq-icon");

      question.addEventListener("click", () => {
        // Get current state
        const isOpen =
          answer.style.maxHeight !== "0px" && answer.style.maxHeight !== "";

        // Close all other accordions
        document.querySelectorAll(".faq-answer").forEach((el) => {
          el.style.maxHeight = "0px";
        });
        document.querySelectorAll(".faq-icon").forEach((el) => {
          el.style.transform = "rotate(0deg)";
        });

        // Toggle current accordion
        if (!isOpen) {
          answer.style.maxHeight = answer.scrollHeight + "px";
          icon.style.transform = "rotate(180deg)";
        }
      });
    });

    // Initialize all accordions as closed
    document.querySelectorAll(".faq-answer").forEach((el) => {
      el.style.maxHeight = "0px";
    });
  };

  // Public methods
  return {
    init: function () {
      const faqItems = document.querySelectorAll(".faq-item");
      if (faqItems.length === 0) return;

      setupAccordions();
    },
  };
})();
