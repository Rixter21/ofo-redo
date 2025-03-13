/**
 * Script to implement reduced motion preference support
 * This improves accessibility for users with vestibular disorders
 * or those who simply prefer less animation
 *
 * Usage: Include this script in all HTML pages or add to main.js
 */

(function () {
  // Configuration
  const REDUCED_MOTION_CLASS = "reduced-motion";
  const TOGGLE_BUTTON_ID = "motion-preference-toggle";
  const STORAGE_KEY = "user-prefers-reduced-motion";

  // Element that will hold the toggle button
  const toggleContainer = document.createElement("div");
  toggleContainer.className = "motion-preference-container";

  // Main function to initialize reduced motion support
  function initReducedMotionSupport() {
    // Check if user has a system-level preference for reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Check if user has a stored preference that overrides system setting
    const storedPreference = localStorage.getItem(STORAGE_KEY);

    // Determine if we should use reduced motion
    const useReducedMotion =
      storedPreference !== null
        ? storedPreference === "true"
        : prefersReducedMotion;

    // Apply the appropriate motion setting
    applyMotionPreference(useReducedMotion);

    // Add a toggle button to the page if it doesn't exist
    createToggleButton(useReducedMotion);

    // Listen for changes to the system preference
    window
      .matchMedia("(prefers-reduced-motion: reduce)")
      .addEventListener("change", (event) => {
        // Only apply if user hasn't set a manual preference
        if (localStorage.getItem(STORAGE_KEY) === null) {
          applyMotionPreference(event.matches);
          updateToggleButton(event.matches);
        }
      });
  }

  // Function to apply reduced motion preference
  function applyMotionPreference(reduceMotion) {
    // Add or remove the reduced-motion class on the document element
    if (reduceMotion) {
      document.documentElement.classList.add(REDUCED_MOTION_CLASS);
    } else {
      document.documentElement.classList.remove(REDUCED_MOTION_CLASS);
    }

    // Update all animations on the page
    updateAnimations(reduceMotion);
  }

  // Function to create the toggle button
  function createToggleButton(isReduced) {
    // Check if the button already exists
    if (document.getElementById(TOGGLE_BUTTON_ID)) {
      updateToggleButton(isReduced);
      return;
    }

    // Create toggle button container
    toggleContainer.innerHTML = `
      <button id="${TOGGLE_BUTTON_ID}" class="motion-toggle" aria-pressed="${isReduced}">
        <span class="toggle-icon">${isReduced ? "🚫" : "✓"}</span>
        <span class="toggle-text">${
          isReduced ? "Animations Off" : "Animations On"
        }</span>
      </button>
    `;

    // Style the button
    const style = document.createElement("style");
    style.textContent = `
      .motion-preference-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
      }
      
      .motion-toggle {
        display: flex;
        align-items: center;
        padding: 10px 15px;
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        border: none;
        border-radius: 30px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        transition: background-color 0.2s ease;
      }
      
      .motion-toggle:hover {
        background-color: rgba(0, 0, 0, 0.8);
      }
      
      .toggle-icon {
        margin-right: 8px;
        font-size: 16px;
      }
      
      /* Adjust button based on theme */
      .dark-mode .motion-toggle {
        background-color: rgba(255, 255, 255, 0.2);
      }
      
      .dark-mode .motion-toggle:hover {
        background-color: rgba(255, 255, 255, 0.3);
      }
      
      /* Reduced motion CSS adjustments */
      .${REDUCED_MOTION_CLASS} * {
        animation-duration: 0.001s !important;
        transition-duration: 0.001s !important;
        scroll-behavior: auto !important;
      }
      
      /* Hide animations completely when reduced motion is enabled */
      .${REDUCED_MOTION_CLASS} .animate-on-scroll,
      .${REDUCED_MOTION_CLASS} .fade-in,
      .${REDUCED_MOTION_CLASS} .slide-in,
      .${REDUCED_MOTION_CLASS} .zoom-in,
      .${REDUCED_MOTION_CLASS} [data-animation] {
        opacity: 1 !important;
        transform: none !important;
        transition: none !important;
        animation: none !important;
      }
      
      /* Ensure counter animations finish immediately */
      .${REDUCED_MOTION_CLASS} .counter-animation {
        transition: none !important;
        animation: none !important;
      }
      
      /* Disable hover animations */
      .${REDUCED_MOTION_CLASS} [class*="hover"] {
        transition: none !important;
      }
    `;

    // Add the style and button to the document
    document.head.appendChild(style);
    document.body.appendChild(toggleContainer);

    // Add click event listener to the button
    document
      .getElementById(TOGGLE_BUTTON_ID)
      .addEventListener("click", toggleMotionPreference);
  }

  // Function to update the toggle button state
  function updateToggleButton(isReduced) {
    const button = document.getElementById(TOGGLE_BUTTON_ID);
    if (!button) return;

    button.setAttribute("aria-pressed", isReduced);
    const iconSpan = button.querySelector(".toggle-icon");
    const textSpan = button.querySelector(".toggle-text");

    if (iconSpan) iconSpan.textContent = isReduced ? "🚫" : "✓";
    if (textSpan)
      textSpan.textContent = isReduced ? "Animations Off" : "Animations On";
  }

  // Function to toggle the motion preference
  function toggleMotionPreference() {
    const isCurrentlyReduced =
      document.documentElement.classList.contains(REDUCED_MOTION_CLASS);
    const newPreference = !isCurrentlyReduced;

    // Save the new preference to localStorage
    localStorage.setItem(STORAGE_KEY, newPreference);

    // Apply the new preference
    applyMotionPreference(newPreference);

    // Update the toggle button
    updateToggleButton(newPreference);
  }

  // Function to update animations on the page based on preference
  function updateAnimations(reduceMotion) {
    // If the site uses IntersectionObserver for animations, update those
    if (window.animationObserver) {
      // Adjust threshold for immediate activation when reduced motion is enabled
      window.animationObserver.disconnect();

      const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: reduceMotion ? 0.01 : 0.1, // Lower threshold for reduced motion
      };

      window.animationObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // For reduced motion, we still want to show the content, just without animation
            if (reduceMotion) {
              entry.target.classList.add("visible");
              // Immediately set final state for counters
              if (entry.target.classList.contains("counter-value")) {
                const finalValue = entry.target.getAttribute("data-target");
                if (finalValue) entry.target.textContent = finalValue;
              }
            } else {
              // Regular animation
              entry.target.classList.add("animate");
            }

            // Stop observing after animation
            window.animationObserver.unobserve(entry.target);
          }
        });
      }, observerOptions);

      // Re-observe animations
      document
        .querySelectorAll(".animate-on-scroll, [data-animation]")
        .forEach((el) => {
          window.animationObserver.observe(el);
        });
    }

    // Handle counter animations
    if (reduceMotion) {
      document.querySelectorAll(".counter-value").forEach((counter) => {
        const finalValue = counter.getAttribute("data-target");
        if (finalValue) counter.textContent = finalValue;
      });
    }

    // Update any custom animation durations
    document.querySelectorAll("[data-animation-duration]").forEach((el) => {
      if (reduceMotion) {
        el.style.animationDuration = "0.001s";
        el.style.transitionDuration = "0.001s";
      } else {
        const duration = el.getAttribute("data-animation-duration");
        if (duration) {
          el.style.animationDuration = duration;
          el.style.transitionDuration = duration;
        }
      }
    });
  }

  // Initialize on DOM content loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initReducedMotionSupport);
  } else {
    initReducedMotionSupport();
  }
})();
