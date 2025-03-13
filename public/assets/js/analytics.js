/**
 * OFO Development Analytics Module
 * Provides comprehensive analytics tracking across the website
 */

(function () {
  "use strict";

  // Configuration
  const config = {
    // Set to true to enable console logging for debugging
    debug: false,
    // Whether to respect Do Not Track browser setting
    respectDoNotTrack: true,
    // Events to automatically track
    autoTrackEvents: {
      pageViews: true,
      outboundLinks: true,
      downloadLinks: true,
      formSubmissions: true,
      scrollDepth: true,
      footerInteractions: true,
    },
    // Scroll depth tracking thresholds (percentage of page)
    scrollDepthThresholds: [25, 50, 75, 100],
    // How long to wait after scroll stops before tracking (ms)
    scrollDebounceTime: 300,
  };

  // Analytics State
  const state = {
    initialized: false,
    pageViewTracked: false,
    scrollDepthMarkers: {},
    ticking: false,
    lastScrollY: 0,
  };

  /**
   * Initialize the analytics module
   */
  function init() {
    if (state.initialized) return;

    // Respect Do Not Track browser setting if enabled
    if (
      config.respectDoNotTrack &&
      (navigator.doNotTrack === "1" ||
        navigator.doNotTrack === "yes" ||
        window.doNotTrack === "1")
    ) {
      log("Analytics disabled due to Do Not Track setting");
      return;
    }

    // Set up automatic event tracking
    setupEventTracking();

    // Track initial page view
    if (config.autoTrackEvents.pageViews) {
      trackPageView();
    }

    state.initialized = true;
    log("Analytics initialized");
  }

  /**
   * Set up automatic event tracking
   */
  function setupEventTracking() {
    // Track outbound links
    if (config.autoTrackEvents.outboundLinks) {
      document.addEventListener("click", handleLinkClick);
    }

    // Track form submissions
    if (config.autoTrackEvents.formSubmissions) {
      document.addEventListener("submit", handleFormSubmit);
    }

    // Track scroll depth
    if (config.autoTrackEvents.scrollDepth) {
      window.addEventListener("scroll", handleScroll);

      // Setup initial scroll depth markers
      config.scrollDepthThresholds.forEach((threshold) => {
        state.scrollDepthMarkers[threshold] = false;
      });
    }

    // Track footer interactions
    if (config.autoTrackEvents.footerInteractions) {
      setupFooterTracking();
    }
  }

  /**
   * Track a page view
   */
  function trackPageView() {
    if (state.pageViewTracked) return;

    const pageData = {
      title: document.title,
      url: window.location.href,
      path: window.location.pathname,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
    };

    sendEvent("page_view", pageData);
    state.pageViewTracked = true;
  }

  /**
   * Track a custom event
   * @param {string} eventName - Name of the event
   * @param {object} eventData - Data associated with the event
   */
  function trackEvent(eventName, eventData = {}) {
    sendEvent(eventName, eventData);
  }

  /**
   * Track a user action
   * @param {string} category - Category of the action (e.g., 'Button', 'Link')
   * @param {string} action - Action taken (e.g., 'Click', 'Submit')
   * @param {string} label - Label for the action (e.g., button name, link text)
   * @param {object} additionalData - Additional data to include
   */
  function trackAction(category, action, label, additionalData = {}) {
    sendEvent("user_action", {
      category,
      action,
      label,
      ...additionalData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle link clicks
   * @param {Event} event - Click event
   */
  function handleLinkClick(event) {
    const link = findParentLink(event.target);

    if (!link) return;

    // Check if this is an outbound link
    const isOutbound = isOutboundLink(link);

    // Check if this is a download link
    const isDownload = isDownloadLink(link);

    if (isOutbound || isDownload) {
      const linkData = {
        url: link.href,
        text:
          link.textContent.trim() ||
          link.getAttribute("aria-label") ||
          "Unknown",
        isOutbound,
        isDownload,
      };

      if (isOutbound) {
        trackAction("Link", "Outbound Click", linkData.text, linkData);
      }

      if (isDownload && config.autoTrackEvents.downloadLinks) {
        trackAction("Link", "Download", linkData.text, linkData);
      }
    }
  }

  /**
   * Handle form submissions
   * @param {Event} event - Submit event
   */
  function handleFormSubmit(event) {
    const form = event.target;

    if (!form || form.tagName !== "FORM") return;

    const formData = {
      id: form.id || "unknown-form",
      name: form.getAttribute("name") || form.id || "unknown-form",
      action: form.action,
      method: form.method,
    };

    trackAction("Form", "Submit", formData.name, formData);
  }

  /**
   * Handle scroll events
   */
  function handleScroll() {
    state.lastScrollY = window.scrollY;

    if (!state.ticking) {
      window.requestAnimationFrame(() => {
        checkScrollDepth();
        state.ticking = false;
      });

      state.ticking = true;
    }
  }

  /**
   * Check scroll depth against thresholds
   */
  function checkScrollDepth() {
    // Get page height and viewport height
    const scrollHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.min(
      100,
      Math.floor((state.lastScrollY / scrollHeight) * 100)
    );

    // Check each threshold
    config.scrollDepthThresholds.forEach((threshold) => {
      if (!state.scrollDepthMarkers[threshold] && scrollPercent >= threshold) {
        state.scrollDepthMarkers[threshold] = true;

        trackAction("Scroll", "Depth", `${threshold}%`, {
          scrollDepth: threshold,
          pageHeight: scrollHeight,
          scrollPosition: state.lastScrollY,
        });
      }
    });
  }

  /**
   * Set up footer interaction tracking
   */
  function setupFooterTracking() {
    const footer = document.querySelector("footer");

    if (!footer) return;

    // Track footer link clicks
    const footerLinks = footer.querySelectorAll("a");
    footerLinks.forEach((link) => {
      link.addEventListener("click", () => {
        trackAction(
          "Footer",
          "Link Click",
          link.textContent.trim() || link.href,
          {
            linkUrl: link.href,
            linkSection: findFooterSection(link),
          }
        );
      });
    });

    // Track back-to-top button
    const backToTopButton = footer.querySelector('button[onclick*="scrollTo"]');
    if (backToTopButton) {
      backToTopButton.addEventListener("click", () => {
        trackAction("Footer", "Back to Top", "Back to Top Button");
      });
    }
  }

  /**
   * Find the section a footer link belongs to
   * @param {HTMLElement} linkElement - The link element
   * @returns {string} - Section name
   */
  function findFooterSection(linkElement) {
    // Find closest heading
    let currentElement = linkElement;
    let headingText = "Unknown Section";

    while (currentElement && currentElement.tagName !== "FOOTER") {
      if (
        currentElement.previousElementSibling &&
        (currentElement.previousElementSibling.tagName === "H4" ||
          currentElement.previousElementSibling.tagName === "H3")
      ) {
        headingText = currentElement.previousElementSibling.textContent.trim();
        break;
      }

      // Move up to parent
      currentElement = currentElement.parentElement;

      // Check if current element has a heading child
      const heading =
        currentElement?.querySelector("h4") ||
        currentElement?.querySelector("h3");
      if (heading) {
        headingText = heading.textContent.trim();
        break;
      }
    }

    return headingText;
  }

  /**
   * Find parent link element
   * @param {HTMLElement} element - The clicked element
   * @returns {HTMLElement|null} - The parent link element or null
   */
  function findParentLink(element) {
    let currentElement = element;

    while (currentElement && currentElement.tagName !== "A") {
      currentElement = currentElement.parentElement;
    }

    return currentElement;
  }

  /**
   * Check if a link is an outbound link
   * @param {HTMLAnchorElement} link - The link element
   * @returns {boolean} - True if outbound link
   */
  function isOutboundLink(link) {
    // Extract hostname from link
    const linkHostname = new URL(link.href).hostname;
    return linkHostname !== window.location.hostname && linkHostname !== "";
  }

  /**
   * Check if a link is a download link
   * @param {HTMLAnchorElement} link - The link element
   * @returns {boolean} - True if download link
   */
  function isDownloadLink(link) {
    // Check for download attribute
    if (link.hasAttribute("download")) return true;

    // Check file extensions
    const fileExtensions = [
      ".pdf",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
      ".ppt",
      ".pptx",
      ".zip",
      ".rar",
      ".7z",
      ".tar",
      ".gz",
      ".mp4",
      ".mov",
      ".avi",
      ".wmv",
      ".mp3",
      ".wav",
      ".aac",
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".svg",
    ];

    const href = link.href.toLowerCase();
    return fileExtensions.some((ext) => href.endsWith(ext));
  }

  /**
   * Send event data to analytics endpoint or console
   * @param {string} eventName - Name of the event
   * @param {object} eventData - Data associated with the event
   */
  function sendEvent(eventName, eventData) {
    const event = {
      event: eventName,
      data: eventData,
      clientTimestamp: new Date().toISOString(),
      page: {
        title: document.title,
        url: window.location.href,
        path: window.location.pathname,
      },
    };

    // In a real implementation, this would be sent to an analytics endpoint
    // For now, we'll log it to the console if debugging is enabled
    log("Analytics event:", event);

    // When implementing actual analytics tracking, uncomment and customize this:
    /*
    fetch('/analytics/collect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event),
      // Use beacon API for events right before page unload
      keepalive: true
    }).catch(error => {
      console.error('Analytics error:', error);
    });
    */
  }

  /**
   * Log debug messages to console
   * @param {...any} args - Console log arguments
   */
  function log(...args) {
    if (config.debug) {
      console.log("[Analytics]", ...args);
    }
  }

  // Export public API
  window.OFOAnalytics = {
    init,
    trackEvent,
    trackAction,
    trackPageView,
  };

  // Initialize when DOM is ready
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    setTimeout(init, 1);
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
