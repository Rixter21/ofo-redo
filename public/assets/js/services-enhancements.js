/**
 * Services Enhancements JavaScript
 * Handles testimonial carousel, FAQ accordion, and other interactive elements
 */

document.addEventListener("DOMContentLoaded", function () {
  // Initialize FAQ Accordion
  const faqItems = document.querySelectorAll(".faq-item");

  if (faqItems.length > 0) {
    faqItems.forEach((item) => {
      const question = item.querySelector(".faq-question");

      question.addEventListener("click", () => {
        // Toggle active class on the clicked item
        item.classList.toggle("active");

        // Close other items
        faqItems.forEach((otherItem) => {
          if (otherItem !== item && otherItem.classList.contains("active")) {
            otherItem.classList.remove("active");
          }
        });
      });
    });
  }

  // Initialize Testimonial Carousel
  const testimonialContainer = document.querySelector(".testimonial-container");
  const testimonialCards = document.querySelectorAll(".testimonial-card");
  const prevButton = document.querySelector(".testimonial-prev");
  const nextButton = document.querySelector(".testimonial-next");

  if (testimonialContainer && testimonialCards.length > 0) {
    let currentIndex = 0;
    const cardWidth = testimonialCards[0].offsetWidth;
    const cardMargin = 16; // Gap between cards
    const visibleCards = window.innerWidth >= 768 ? 2 : 1;

    // Set initial position
    updateCarouselPosition();

    // Previous button click handler
    if (prevButton) {
      prevButton.addEventListener("click", () => {
        currentIndex = Math.max(currentIndex - 1, 0);
        updateCarouselPosition();
      });
    }

    // Next button click handler
    if (nextButton) {
      nextButton.addEventListener("click", () => {
        currentIndex = Math.min(
          currentIndex + 1,
          testimonialCards.length - visibleCards
        );
        updateCarouselPosition();
      });
    }

    // Update carousel position
    function updateCarouselPosition() {
      const translateX = -currentIndex * (cardWidth + cardMargin);
      testimonialContainer.style.transform = `translateX(${translateX}px)`;

      // Update button states
      if (prevButton) {
        prevButton.disabled = currentIndex === 0;
        prevButton.classList.toggle("opacity-50", currentIndex === 0);
      }

      if (nextButton) {
        nextButton.disabled =
          currentIndex === testimonialCards.length - visibleCards;
        nextButton.classList.toggle(
          "opacity-50",
          currentIndex === testimonialCards.length - visibleCards
        );
      }
    }

    // Handle window resize
    window.addEventListener("resize", () => {
      // Recalculate visible cards
      const newVisibleCards = window.innerWidth >= 768 ? 2 : 1;

      // Adjust current index if needed
      if (
        newVisibleCards !== visibleCards &&
        currentIndex > testimonialCards.length - newVisibleCards
      ) {
        currentIndex = testimonialCards.length - newVisibleCards;
      }

      // Update carousel position
      updateCarouselPosition();
    });
  }

  // Add micro-interaction to buttons
  const microButtons = document.querySelectorAll(".micro-btn");

  if (microButtons.length > 0) {
    microButtons.forEach((button) => {
      button.addEventListener("click", function (e) {
        // Create ripple effect
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement("span");
        ripple.classList.add("ripple");
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        button.appendChild(ripple);

        // Remove ripple after animation
        setTimeout(() => {
          ripple.remove();
        }, 1000);
      });
    });
  }

  // Optimize video background
  const videoBackground = document.querySelector(".premium-hero video");

  if (videoBackground) {
    // Check if the browser supports the video format
    const canPlayMP4 = videoBackground.canPlayType("video/mp4");

    if (canPlayMP4) {
      // Preload metadata only
      videoBackground.preload = "metadata";

      // Load video only when in viewport
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Start loading the video
              videoBackground.preload = "auto";
              videoBackground.load();
              observer.unobserve(videoBackground);
            }
          });
        },
        { threshold: 0.1 }
      );

      observer.observe(videoBackground);
    } else {
      // Fallback to poster image if video format is not supported
      videoBackground.style.display = "none";
    }
  }

  // Lazy load images
  const lazyImages = document.querySelectorAll(".lazy-image");

  if (lazyImages.length > 0) {
    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove("lazy-image");
            imageObserver.unobserve(img);
          }
        });
      },
      { threshold: 0.1 }
    );

    lazyImages.forEach((img) => {
      imageObserver.observe(img);
    });
  }

  // Service comparison tool
  const comparisonToggles = document.querySelectorAll(".comparison-toggle");

  if (comparisonToggles.length > 0) {
    comparisonToggles.forEach((toggle) => {
      toggle.addEventListener("click", function () {
        // Remove active class from all toggles
        comparisonToggles.forEach((btn) => {
          btn.classList.remove("active");
        });

        // Add active class to clicked toggle
        this.classList.add("active");

        const tier = this.getAttribute("value");
        const table = document.querySelector(".comparison-table");

        if (table) {
          // Hide all tier columns
          const tierColumns = table.querySelectorAll("[class^='tier-']");
          tierColumns.forEach((column) => {
            column.classList.add("hidden");
          });

          // Show selected tier column
          const selectedColumns = table.querySelectorAll(`.tier-${tier}`);
          if (selectedColumns.length > 0) {
            selectedColumns.forEach((col) => {
              col.classList.remove("hidden");
            });
          }
        }
      });
    });
  }

  // Premium Filter Buttons functionality
  const filterButtons = document.querySelectorAll(".premium-filter-button");
  const serviceCards = document.querySelectorAll(".service-card");

  if (filterButtons.length > 0 && serviceCards.length > 0) {
    // Initialize with "all" filter active
    let activeFilter = "all";

    // Add click event listeners to filter buttons
    filterButtons.forEach((button) => {
      button.addEventListener("click", function () {
        // Get the filter value
        const filterValue = this.getAttribute("data-filter");

        // Update active filter
        activeFilter = filterValue;

        // Remove active class from all buttons
        filterButtons.forEach((btn) => {
          btn.classList.remove("active");
        });

        // Add active class to clicked button
        this.classList.add("active");

        // Filter service cards
        filterServiceCards(filterValue);
      });
    });

    // Filter service cards based on category
    function filterServiceCards(filter) {
      serviceCards.forEach((card) => {
        const cardCategory = card.getAttribute("data-category");
        const cardElement = card.closest(".transform"); // Get the parent container

        if (filter === "all" || filter === cardCategory) {
          // Show card with animation
          cardElement.style.display = "block";
          setTimeout(() => {
            cardElement.style.opacity = "1";
            cardElement.style.transform = "scale(1)";
          }, 10);
        } else {
          // Hide card with animation
          cardElement.style.opacity = "0";
          cardElement.style.transform = "scale(0.95)";
          setTimeout(() => {
            cardElement.style.display = "none";
          }, 300);
        }
      });
    }
  }

  // Add analytics tracking for service card interactions
  if (serviceCards.length > 0) {
    serviceCards.forEach((card) => {
      card.addEventListener("click", function () {
        const category = this.getAttribute("data-category");
        const serviceName = this.querySelector("h2").textContent.trim();

        // Track service card click (if analytics.js is loaded)
        if (typeof trackEvent === "function") {
          trackEvent("service_click", {
            category: category,
            service_name: serviceName,
          });
        }
      });
    });
  }
});
