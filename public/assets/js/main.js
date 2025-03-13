/**
 * Global JavaScript Functions for OFO Development Website
 */

document.addEventListener("DOMContentLoaded", function () {
  // Initialize all common functionality
  initReadingProgressIndicator();
  initLazyLoading();
  initScrollAnimations();
  initDarkModeToggle();
  initStatsCounters();
  initMobileMenu();

  // Update copyright year
  updateCopyrightYear();
});

/**
 * Reading Progress Indicator
 * Shows reading progress as user scrolls down the page
 */
function initReadingProgressIndicator() {
  // Create progress bar element
  const progressBar = document.createElement("div");
  progressBar.className =
    "reading-progress fixed top-0 left-0 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 z-50 transition-all duration-100";
  document.body.appendChild(progressBar);

  // Update progress bar width on scroll
  window.addEventListener("scroll", () => {
    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const scrollPercent = (scrollTop / scrollHeight) * 100;

    progressBar.style.width = `${scrollPercent}%`;

    // Add shadow when scrolled to make it more visible
    if (scrollPercent > 0) {
      progressBar.classList.add("shadow-md");
    } else {
      progressBar.classList.remove("shadow-md");
    }
  });
}

/**
 * Lazy Loading
 * Enhances native lazy loading with IntersectionObserver for older browsers
 */
function initLazyLoading() {
  // Check if IntersectionObserver is supported
  if ("IntersectionObserver" in window) {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          observer.unobserve(img);
        }
      });
    });

    lazyImages.forEach((img) => {
      imageObserver.observe(img);
    });
  }
}

/**
 * Scroll Animations
 * Animates elements when they enter the viewport
 */
function initScrollAnimations() {
  // Check if IntersectionObserver is supported
  if ("IntersectionObserver" in window) {
    const animatedElements = document.querySelectorAll(".animate-on-scroll");

    const animationObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animated");
            // Optional: unobserve after animation is triggered
            if (entry.target.dataset.once === "true") {
              observer.unobserve(entry.target);
            }
          } else if (entry.target.dataset.once !== "true") {
            // Remove animation class when element leaves viewport
            // unless it's meant to animate only once
            entry.target.classList.remove("animated");
          }
        });
      },
      {
        threshold: 0.1, // Trigger when at least 10% of the element is visible
        rootMargin: "0px 0px -50px 0px", // Slightly offset to trigger before element is fully in view
      }
    );

    animatedElements.forEach((element) => {
      animationObserver.observe(element);
    });
  }
}

/**
 * Dark/Light Mode Toggle
 * Allows users to switch between dark and light mode
 */
function initDarkModeToggle() {
  // Create toggle button
  const darkModeToggle = document.createElement("button");
  darkModeToggle.className =
    "dark-mode-toggle fixed bottom-24 right-8 p-3 bg-gray-800 dark:bg-gray-200 rounded-full shadow-lg hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors z-40";
  darkModeToggle.innerHTML = `
    <svg class="w-6 h-6 text-yellow-400 dark:text-gray-800 dark-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
    </svg>
    <svg class="w-6 h-6 text-yellow-500 hidden light-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path>
    </svg>
  `;
  document.body.appendChild(darkModeToggle);

  // Check for saved color scheme preference or use preferred color scheme
  const savedTheme = localStorage.getItem("color-theme");
  const prefersDarkMode = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  // Set initial theme
  if (savedTheme === "dark" || (!savedTheme && prefersDarkMode)) {
    document.documentElement.classList.add("dark");
    updateDarkModeIcon(true);
  } else {
    document.documentElement.classList.remove("dark");
    updateDarkModeIcon(false);
  }

  // Toggle theme on button click
  darkModeToggle.addEventListener("click", () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("color-theme", "light");
      updateDarkModeIcon(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("color-theme", "dark");
      updateDarkModeIcon(true);
    }
  });

  function updateDarkModeIcon(isDark) {
    const darkIcon = darkModeToggle.querySelector(".dark-icon");
    const lightIcon = darkModeToggle.querySelector(".light-icon");

    if (isDark) {
      darkIcon.classList.remove("hidden");
      lightIcon.classList.add("hidden");
    } else {
      darkIcon.classList.add("hidden");
      lightIcon.classList.remove("hidden");
    }
  }
}

/**
 * Animated Statistics Counters
 * Animates counting up to statistics numbers when they scroll into view
 */
function initStatsCounters() {
  if ("IntersectionObserver" in window) {
    const counterElements = document.querySelectorAll(".counter-value");

    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const counterElement = entry.target;
            const targetValue = parseInt(
              counterElement.getAttribute("data-count"),
              10
            );
            const duration = 2000; // animation duration in milliseconds
            const frameDuration = 1000 / 60; // 60fps
            const totalFrames = Math.round(duration / frameDuration);

            let frame = 0;
            const countTo = targetValue / totalFrames;

            // Only animate if not already animated
            if (!counterElement.classList.contains("counted")) {
              const counter = setInterval(() => {
                frame++;
                const value = countTo * frame;

                if (counterElement.getAttribute("data-prefix")) {
                  counterElement.textContent =
                    counterElement.getAttribute("data-prefix") +
                    Math.floor(value);
                } else if (counterElement.getAttribute("data-suffix")) {
                  counterElement.textContent =
                    Math.floor(value) +
                    counterElement.getAttribute("data-suffix");
                } else {
                  counterElement.textContent = Math.floor(value);
                }

                if (frame === totalFrames) {
                  clearInterval(counter);
                  counterElement.classList.add("counted");
                }
              }, frameDuration);
            }

            // Unobserve after starting animation
            observer.unobserve(counterElement);
          }
        });
      },
      {
        threshold: 0.5,
      }
    );

    counterElements.forEach((counter) => {
      counterObserver.observe(counter);
    });
  }
}

/**
 * Mobile Menu Functionality
 * Handles the toggle functionality of the mobile menu
 */
function initMobileMenu() {
  const mobileMenuButton = document.querySelector("[data-mobile-menu-button]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  if (mobileMenuButton && mobileMenu) {
    let isMenuOpen = false;

    mobileMenuButton.addEventListener("click", () => {
      isMenuOpen = !isMenuOpen;

      // Update button aria attributes
      mobileMenuButton.setAttribute("aria-expanded", isMenuOpen);

      // Toggle menu visibility
      if (isMenuOpen) {
        mobileMenu.classList.remove("max-h-0");
        mobileMenu.classList.add("max-h-[500px]");
      } else {
        mobileMenu.classList.remove("max-h-[500px]");
        mobileMenu.classList.add("max-h-0");
      }
    });

    // Close menu when clicking outside
    document.addEventListener("click", (event) => {
      if (
        isMenuOpen &&
        !mobileMenuButton.contains(event.target) &&
        !mobileMenu.contains(event.target)
      ) {
        isMenuOpen = false;
        mobileMenuButton.setAttribute("aria-expanded", "false");
        mobileMenu.classList.remove("max-h-[500px]");
        mobileMenu.classList.add("max-h-0");
      }
    });
  }

  // Services accordion in mobile menu
  const servicesButton = document.querySelector("[data-services-button]");
  const servicesContent = document.querySelector("[data-services-content]");

  if (servicesButton && servicesContent) {
    let isServicesOpen = false;

    servicesButton.addEventListener("click", () => {
      isServicesOpen = !isServicesOpen;

      // Update aria attributes
      servicesButton.setAttribute("aria-expanded", isServicesOpen);

      // Toggle content visibility
      if (isServicesOpen) {
        servicesContent.classList.remove("max-h-0");
        servicesContent.classList.add("max-h-[500px]");
        servicesButton
          .querySelector(".dropdown-icon")
          .classList.add("rotate-180");
      } else {
        servicesContent.classList.remove("max-h-[500px]");
        servicesContent.classList.add("max-h-0");
        servicesButton
          .querySelector(".dropdown-icon")
          .classList.remove("rotate-180");
      }
    });
  }
}

/**
 * Update Copyright Year
 * Sets the current year in copyright information
 */
function updateCopyrightYear() {
  const yearElements = document.querySelectorAll(".current-year");
  const currentYear = new Date().getFullYear();

  yearElements.forEach((element) => {
    element.textContent = currentYear;
  });
}
