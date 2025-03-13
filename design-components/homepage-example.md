# Premium Homepage Example Implementation

This document provides a practical example of implementing a section of the homepage using the modular approach to avoid duplication.

## Hero Section Example

```html
<!-- Premium Hero Section -->
<section
  id="main-content"
  class="hero-section relative min-h-screen flex items-center overflow-hidden"
>
  <!-- Standard Background Video Component -->
  <div class="hero-bg">
    <div class="hero-bg__overlay absolute inset-0 z-0 bg-black/20"></div>
    <div class="hero-bg__particles absolute inset-0 z-1">
      <div class="particles-container h-full w-full opacity-15"></div>
    </div>
    <div class="hero-bg__video absolute inset-0 z-2 overflow-hidden">
      <video
        autoplay
        muted
        loop
        playsinline
        class="hero-bg__video-element w-full h-full object-cover scale-110 transition-transform duration-[4000ms] ease-out filter brightness-90 contrast-105"
        style="transform: translate3d(0, 0, 0); will-change: transform"
        aria-hidden="true"
      >
        <source src="assets/media/ofo-hero.mp4" type="video/mp4" />
      </video>
    </div>
    <div
      class="hero-bg__gradient-overlay absolute inset-0 z-3 bg-gradient-to-b from-gray-900/95 via-gray-900/80 to-gray-900"
    ></div>
    <div
      class="hero-bg__light-effect absolute inset-0 z-5 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-200/5 via-transparent to-transparent pointer-events-none"
    ></div>
  </div>

  <!-- Hero Content -->
  <div class="container mx-auto px-6 relative z-10">
    <div class="flex flex-col md:flex-row items-center md:space-x-8">
      <!-- Left Column: Value Proposition -->
      <div
        class="md:w-1/2 text-left md:pr-8 space-y-10 animate-on-scroll fade-up"
        data-once="true"
      >
        <!-- Premium Badge Component -->
        <div
          class="premium-badge inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-700/20 backdrop-blur-sm border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wider mb-6 shadow-lg animate-pulse"
        >
          <svg
            class="premium-badge__icon w-3.5 h-3.5 mr-1.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <!-- Icon path -->
            <path
              fill-rule="evenodd"
              d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
              clip-rule="evenodd"
            />
          </svg>
          PREMIUM SOLUTIONS
        </div>

        <!-- Heading Component -->
        <div>
          <h1
            class="hero-heading text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6"
          >
            <span
              class="hero-heading__primary text-white drop-shadow-[0_5px_15px_rgba(255,255,255,0.15)]"
              >Enterprise-Grade</span
            ><br />
            <span
              class="hero-heading__gradient bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 bg-clip-text text-transparent"
              >Software Solutions</span
            >
          </h1>

          <p
            class="hero-description text-xl md:text-2xl text-gray-300 leading-relaxed font-light tracking-wide"
          >
            Transforming businesses through
            <span class="hero-description__highlight font-medium text-white"
              >bespoke technology solutions</span
            >
            that drive growth and innovation.
          </p>
        </div>

        <!-- Credentials Component -->
        <div
          class="credentials-card bg-gray-900/30 backdrop-blur-2xl p-6 rounded-2xl border border-white/10 flex flex-wrap gap-6 items-center mt-8 shadow-2xl shadow-black/30 group hover:border-amber-500/30 transition-all duration-500"
        >
          <!-- Credential Item Component (reused 3 times) -->
          <div
            class="credentials-card__item text-center px-4 border-r border-gray-700 group-hover:border-amber-600/30 transition-colors duration-500"
          >
            <div
              class="counter-value text-3xl font-bold bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent"
              data-count="25"
              data-suffix="+"
            >
              0+
            </div>
            <div
              class="credentials-card__label text-sm text-gray-300 font-medium mt-1"
            >
              Years Experience
            </div>
          </div>

          <div
            class="credentials-card__item text-center px-4 border-r border-gray-700 group-hover:border-amber-600/30 transition-colors duration-500"
          >
            <div
              class="counter-value text-3xl font-bold bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent"
              data-count="500"
              data-suffix="+"
            >
              0+
            </div>
            <div
              class="credentials-card__label text-sm text-gray-300 font-medium mt-1"
            >
              Projects Delivered
            </div>
          </div>

          <div class="credentials-card__item text-center px-4">
            <div
              class="counter-value text-3xl font-bold bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent"
              data-count="98"
              data-suffix="%"
            >
              0%
            </div>
            <div
              class="credentials-card__label text-sm text-gray-300 font-medium mt-1"
            >
              Client Satisfaction
            </div>
          </div>
        </div>

        <!-- Features List Component -->
        <div
          class="features-list bg-gray-900/20 backdrop-blur-xl rounded-xl p-6 border border-white/5 shadow-inner"
        >
          <h3
            class="features-list__heading text-lg font-medium text-white mb-4 flex items-center"
          >
            <svg
              class="features-list__icon w-5 h-5 mr-2 text-amber-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            Enterprise Advantage
          </h3>
          <ul class="features-list__items space-y-3">
            <!-- Feature Item Component (reused multiple times) -->
            <li class="features-list__item flex items-start">
              <svg
                class="features-list__icon w-5 h-5 text-amber-400 mt-0.5 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span class="features-list__text text-gray-300">
                End-to-end
                <span class="features-list__highlight text-white"
                  >bespoke development</span
                >
                services
              </span>
            </li>

            <li class="features-list__item flex items-start">
              <svg
                class="features-list__icon w-5 h-5 text-amber-400 mt-0.5 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span class="features-list__text text-gray-300">
                Military-grade
                <span class="features-list__highlight text-white"
                  >security protocols</span
                >
              </span>
            </li>

            <li class="features-list__item flex items-start">
              <svg
                class="features-list__icon w-5 h-5 text-amber-400 mt-0.5 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span class="features-list__text text-gray-300">
                Dedicated
                <span class="features-list__highlight text-white"
                  >24/7 premium support</span
                >
              </span>
            </li>
          </ul>
        </div>

        <!-- CTA Buttons Component -->
        <div class="cta-container flex flex-col sm:flex-row gap-5 pt-4">
          <a
            href="contact.html"
            class="cta-primary group relative flex items-center justify-center px-8 py-4 overflow-hidden text-white rounded-lg transition-all duration-500 ease-out hover:ring-4 hover:ring-amber-400/30 shadow-xl shadow-amber-900/20"
          >
            <span
              class="cta-primary__bg absolute inset-0 w-full h-full bg-gradient-to-r from-amber-500 to-amber-700 animate-gradient-shine bg-[length:200%_100%]"
            ></span>
            <span
              class="cta-primary__shine absolute right-0 -mt-12 h-32 w-8 translate-x-12 bg-white/30 rotate-12 transition-all duration-1000 ease-out group-hover:-translate-x-96 group-hover:opacity-50"
            ></span>
            <span
              class="cta-primary__text relative z-10 flex items-center font-bold text-lg tracking-wide drop-shadow-md"
            >
              <svg
                class="cta-primary__icon w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Get Started
            </span>
          </a>

          <a
            href="services.html"
            class="cta-secondary group relative flex items-center justify-center px-8 py-4 font-medium text-white border border-white/20 rounded-lg hover:border-amber-400/60 hover:text-amber-300 transition-all duration-300 backdrop-blur-sm bg-white/5 shadow-lg"
          >
            <span
              class="cta-secondary__bg absolute inset-0 bg-gradient-to-r from-amber-600/0 via-amber-600/5 to-amber-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            ></span>
            <span
              class="cta-secondary__text relative z-10 flex items-center font-bold text-lg tracking-wide"
            >
              <svg
                class="cta-secondary__icon w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
              Explore Services
            </span>
          </a>
        </div>
      </div>

      <!-- Right Column: Visual Element (desktop only) -->
      <div
        class="dashboard-preview hidden lg:block lg:w-1/2 animate-on-scroll fade-right"
        data-once="true"
        data-delay="300"
      >
        <!-- Dashboard preview content -->
        <div class="relative">
          <div
            class="absolute inset-0 rounded-full bg-gradient-to-r from-amber-300/10 via-amber-500/20 to-amber-700/10 blur-3xl opacity-30 animate-pulse"
          ></div>

          <div
            class="relative bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-5"
          >
            <!-- Dashboard content -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex space-x-2">
                <div class="w-3 h-3 rounded-full bg-red-500"></div>
                <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div class="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div class="flex items-center space-x-2">
                <div class="h-4 w-24 rounded-md bg-gray-700/70"></div>
                <svg
                  class="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </div>
            </div>

            <!-- Dashboard content continues -->
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

## CSS Component Implementation

```css
/* Hero Section Base Styles */
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}

/* Background Components */
.hero-bg__overlay {
  @apply absolute inset-0 z-0 bg-black/20;
}

.hero-bg__gradient-overlay {
  @apply absolute inset-0 bg-gradient-to-b from-gray-900/95 via-gray-900/80 to-gray-900;
}

.hero-bg__light-effect {
  @apply absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-200/5 via-transparent to-transparent pointer-events-none;
}

/* Premium Badge Component */
.premium-badge {
  @apply inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-700/20 backdrop-blur-sm border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wider mb-6 shadow-lg animate-pulse;
}

.premium-badge__icon {
  @apply w-3.5 h-3.5 mr-1.5;
}

/* Hero Heading Components */
.hero-heading {
  @apply text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6;
}

.hero-heading__primary {
  @apply text-white drop-shadow-[0_5px_15px_rgba(255,255,255,0.15)];
}

.hero-heading__gradient {
  @apply bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 bg-clip-text text-transparent;
}

/* Hero Description */
.hero-description {
  @apply text-xl md:text-2xl text-gray-300 leading-relaxed font-light tracking-wide;
}

.hero-description__highlight {
  @apply font-medium text-white;
}

/* Credentials Card */
.credentials-card {
  @apply bg-gray-900/30 backdrop-blur-2xl p-6 rounded-2xl border border-white/10 flex flex-wrap gap-6 items-center mt-8 shadow-2xl shadow-black/30 group hover:border-amber-500/30 transition-all duration-500;
}

.credentials-card__item {
  @apply text-center px-4 border-r border-gray-700 group-hover:border-amber-600/30 transition-colors duration-500 last:border-r-0;
}

.credentials-card__label {
  @apply text-sm text-gray-300 font-medium mt-1;
}

/* Features List */
.features-list {
  @apply bg-gray-900/20 backdrop-blur-xl rounded-xl p-6 border border-white/5 shadow-inner;
}

.features-list__heading {
  @apply text-lg font-medium text-white mb-4 flex items-center;
}

.features-list__items {
  @apply space-y-3;
}

.features-list__item {
  @apply flex items-start;
}

.features-list__icon {
  @apply w-5 h-5 text-amber-400 mt-0.5 mr-3 flex-shrink-0;
}

.features-list__text {
  @apply text-gray-300;
}

.features-list__highlight {
  @apply text-white;
}

/* CTA Buttons */
.cta-container {
  @apply flex flex-col sm:flex-row gap-5 pt-4;
}

.cta-primary {
  @apply group relative flex items-center justify-center px-8 py-4 overflow-hidden text-white rounded-lg transition-all duration-500 ease-out hover:ring-4 hover:ring-amber-400/30 shadow-xl shadow-amber-900/20;
}

.cta-primary__bg {
  @apply absolute inset-0 w-full h-full bg-gradient-to-r from-amber-500 to-amber-700 animate-gradient-shine bg-[length:200%_100%];
}

.cta-primary__shine {
  @apply absolute right-0 -mt-12 h-32 w-8 translate-x-12 bg-white/30 rotate-12 transition-all duration-1000 ease-out group-hover:-translate-x-96 group-hover:opacity-50;
}

.cta-primary__text {
  @apply relative z-10 flex items-center font-bold text-lg tracking-wide drop-shadow-md;
}

.cta-secondary {
  @apply group relative flex items-center justify-center px-8 py-4 font-medium text-white border border-white/20 rounded-lg hover:border-amber-400/60 hover:text-amber-300 transition-all duration-300 backdrop-blur-sm bg-white/5 shadow-lg;
}

.cta-secondary__bg {
  @apply absolute inset-0 bg-gradient-to-r from-amber-600/0 via-amber-600/5 to-amber-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500;
}

.cta-secondary__text {
  @apply relative z-10 flex items-center font-bold text-lg tracking-wide;
}
```

## JavaScript Modularization Example

```javascript
// animation.js - Handles all animation functionality
function initAnimations() {
  const animatedElements = document.querySelectorAll(".animate-on-scroll");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.classList.add("visible");

            // Only unobserve if we should animate once
            if (entry.target.dataset.once === "true") {
              observer.unobserve(entry.target);
            }
          }, delay);
        }
      });
    },
    {
      threshold: 0.1,
    }
  );

  animatedElements.forEach((element) => {
    observer.observe(element);
  });
}

// counters.js - Handles counter animations
function initCounters() {
  const counters = document.querySelectorAll(".counter-value");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const targetValue = parseInt(counter.dataset.count, 10);
          const suffix = counter.dataset.suffix || "";
          let currentValue = 0;
          const duration = 2000; // ms
          const step = targetValue / (duration / 16); // 60fps

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
    },
    {
      threshold: 0.5,
    }
  );

  counters.forEach((counter) => {
    observer.observe(counter);
  });
}

// Main initialization
document.addEventListener("DOMContentLoaded", () => {
  initAnimations();
  initCounters();
  // Other initializations...
});
```

By restructuring the homepage with this component-based approach, we create a more maintainable codebase that avoids duplication. Each component has a clear structure and responsibility, with standardized CSS classes and JavaScript functionality.

This approach makes it easier to:

1. Maintain consistent styling across components
2. Reuse components in different sections
3. Update components without duplicating code
4. Add new components that follow the established patterns
5. Test components in isolation
6. Document the component library for future reference

Additionally, this structure supports a design system approach, allowing for systematic improvements and updates to the website over time.
