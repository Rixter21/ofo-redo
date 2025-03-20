/**
 * Premium Services JavaScript
 * Handles particles.js initialization and service card filtering
 */

document.addEventListener("DOMContentLoaded", function () {
  // Initialize particles.js
  if (
    typeof particlesJS !== "undefined" &&
    document.getElementById("particles-js")
  ) {
    particlesJS("particles-js", {
      particles: {
        number: {
          value: 80,
          density: {
            enable: true,
            value_area: 800,
          },
        },
        color: {
          value: "#ffffff",
        },
        shape: {
          type: "circle",
          stroke: {
            width: 0,
            color: "#000000",
          },
          polygon: {
            nb_sides: 5,
          },
        },
        opacity: {
          value: 0.5,
          random: false,
          anim: {
            enable: false,
            speed: 1,
            opacity_min: 0.1,
            sync: false,
          },
        },
        size: {
          value: 3,
          random: true,
          anim: {
            enable: false,
            speed: 40,
            size_min: 0.1,
            sync: false,
          },
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: "#ffffff",
          opacity: 0.4,
          width: 1,
        },
        move: {
          enable: true,
          speed: 2,
          direction: "none",
          random: false,
          straight: false,
          out_mode: "out",
          bounce: false,
          attract: {
            enable: false,
            rotateX: 600,
            rotateY: 1200,
          },
        },
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: {
            enable: true,
            mode: "grab",
          },
          onclick: {
            enable: true,
            mode: "push",
          },
          resize: true,
        },
        modes: {
          grab: {
            distance: 140,
            line_linked: {
              opacity: 1,
            },
          },
          bubble: {
            distance: 400,
            size: 40,
            duration: 2,
            opacity: 8,
            speed: 3,
          },
          repulse: {
            distance: 200,
            duration: 0.4,
          },
          push: {
            particles_nb: 4,
          },
          remove: {
            particles_nb: 2,
          },
        },
      },
      retina_detect: true,
    });
  }

  // Service card filtering
  const filterButtons = document.querySelectorAll(".premium-filter-button");
  const serviceCards = document.querySelectorAll(".service-card");

  if (filterButtons.length > 0) {
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        // Remove active class from all buttons
        filterButtons.forEach((btn) => btn.classList.remove("active"));

        // Add active class to clicked button
        button.classList.add("active");

        // Get filter value
        const filterValue = button.getAttribute("data-filter");

        // Filter service cards
        serviceCards.forEach((card) => {
          const cardCategory = card.getAttribute("data-category");

          if (filterValue === "all" || filterValue === cardCategory) {
            card.closest(".transform").style.display = "block";
          } else {
            card.closest(".transform").style.display = "none";
          }
        });
      });
    });
  }

  // Animate metrics counter
  const metricCards = document.querySelectorAll(".premium-metric-card");

  if (metricCards.length > 0) {
    const animateCounter = (counter, target, duration = 2000) => {
      let startTime = null;
      const startValue = parseInt(counter.textContent);

      const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const value = Math.floor(progress * (target - startValue) + startValue);
        counter.textContent = value;

        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };

      window.requestAnimationFrame(step);
    };

    // Intersection Observer to trigger counter animation when in view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const card = entry.target;
            const counter = card.querySelector(".counter");
            const targetValue = parseInt(card.getAttribute("data-value"));

            animateCounter(counter, targetValue);
            observer.unobserve(card);
          }
        });
      },
      { threshold: 0.5 }
    );

    metricCards.forEach((card) => {
      observer.observe(card);
    });
  }

  // Scroll indicator animation
  const scrollIndicator = document.querySelector(".scroll-indicator");
  if (scrollIndicator) {
    window.addEventListener("scroll", () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 100) {
        scrollIndicator.classList.add("hidden");
      } else {
        scrollIndicator.classList.remove("hidden");
      }
    });
  }

  // Animate elements on scroll
  const animateElements = document.querySelectorAll(".animate-on-scroll");

  if (animateElements.length > 0) {
    const animateObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animated");

            if (entry.target.getAttribute("data-once") === "true") {
              animateObserver.unobserve(entry.target);
            }
          } else if (!entry.target.getAttribute("data-once")) {
            entry.target.classList.remove("animated");
          }
        });
      },
      { threshold: 0.2 }
    );

    animateElements.forEach((element) => {
      animateObserver.observe(element);
    });
  }
});
