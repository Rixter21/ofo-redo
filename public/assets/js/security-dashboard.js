/**
 * Security Dashboard Interactive Features
 * Adds functionality to the Security Dashboard in CyberSecurity.html
 */

document.addEventListener("DOMContentLoaded", function () {
  // Initialize the dashboard
  initSecurityDashboard();
});

/**
 * Initialize the Security Dashboard
 */
function initSecurityDashboard() {
  // Show loading overlay
  showDashboardLoading();

  // Initialize components with a slight delay to show loading animation
  setTimeout(() => {
    initSecurityScore();
    initVulnerabilityStatus();
    initThreatDetection();
    initNetworkTraffic();
    initActionButtons();
    initTooltips();
    initToggleSwitches();
    initDashboardNavigation();

    // Hide loading overlay
    hideDashboardLoading();
  }, 800);

  // Set up refresh interval (every 30 seconds)
  setInterval(refreshDashboardData, 30000);
}

/**
 * Show dashboard loading overlay
 */
function showDashboardLoading() {
  const overlay = document.querySelector(".dashboard-loading-overlay");
  if (overlay) {
    overlay.classList.add("active");
  }
}

/**
 * Hide dashboard loading overlay
 */
function hideDashboardLoading() {
  const overlay = document.querySelector(".dashboard-loading-overlay");
  if (overlay) {
    overlay.classList.remove("active");
  }
}

/**
 * Initialize Security Score
 */
function initSecurityScore() {
  const scoreElement = document.querySelector(".security-score");
  const progressBar = document.querySelector(".score-progress");

  if (scoreElement && progressBar) {
    const score = parseInt(scoreElement.getAttribute("data-score") || "94");

    // Animate score counting up
    animateCounter(scoreElement, 0, score, 1500);

    // Animate progress bar
    setTimeout(() => {
      progressBar.style.width = `${score}%`;
    }, 300);
  }
}

/**
 * Initialize Vulnerability Status
 */
function initVulnerabilityStatus() {
  const secureSegment = document.querySelector(".vuln-segment-secure");
  const warningSegment = document.querySelector(".vuln-segment-warning");
  const riskSegment = document.querySelector(".vuln-segment-risk");

  if (secureSegment && warningSegment && riskSegment) {
    // Get percentages from data attributes or use defaults
    const securePercent = parseInt(
      secureSegment.getAttribute("data-percent") || "85"
    );
    const warningPercent = parseInt(
      warningSegment.getAttribute("data-percent") || "12"
    );
    const riskPercent = parseInt(
      riskSegment.getAttribute("data-percent") || "3"
    );

    // Animate segments
    setTimeout(() => {
      secureSegment.style.width = `${securePercent}%`;
      warningSegment.style.width = `${warningPercent}%`;
      riskSegment.style.width = `${riskPercent}%`;
    }, 300);
  }
}

/**
 * Initialize Threat Detection
 */
function initThreatDetection() {
  const detectionRate = document.querySelector(".detection-rate");

  if (detectionRate) {
    const rate = parseFloat(detectionRate.getAttribute("data-rate") || "99.9");

    // Animate counter
    animateCounter(detectionRate, 0, rate, 2000, 1);
  }

  // Initialize threat level indicator if present
  const threatLevelMarker = document.querySelector(".threat-level-marker");
  const threatLevelProgress = document.querySelector(".threat-level-progress");

  if (threatLevelMarker && threatLevelProgress) {
    const threatLevel = parseInt(
      threatLevelProgress.getAttribute("data-level") || "15"
    );

    // Set threat level (0-100)
    setTimeout(() => {
      threatLevelProgress.style.width = `${threatLevel}%`;
      threatLevelMarker.style.left = `${threatLevel}%`;
    }, 500);
  }
}

/**
 * Initialize Network Traffic
 */
function initNetworkTraffic() {
  // This would typically connect to a real-time data source
  // For demo purposes, we'll simulate network traffic updates
  const trafficValue = document.querySelector(".traffic-value");

  if (trafficValue) {
    // Start with the initial value
    const initialValue = parseFloat(
      trafficValue.getAttribute("data-value") || "1.2"
    );

    // Update traffic value periodically with small random changes
    setInterval(() => {
      const randomChange = Math.random() * 0.4 - 0.2; // Random value between -0.2 and 0.2
      const newValue = Math.max(0.1, initialValue + randomChange).toFixed(1);
      trafficValue.textContent = newValue;
    }, 5000);
  }
}

/**
 * Initialize Action Buttons
 */
function initActionButtons() {
  // Scan Now button
  const scanButton = document.querySelector(".action-button.action-yellow");
  if (scanButton) {
    scanButton.addEventListener("click", function () {
      showDashboardLoading();

      // Simulate scan process
      setTimeout(() => {
        hideDashboardLoading();

        // Update last scan time
        const lastScanElement = document.querySelector(".last-scan-time");
        if (lastScanElement) {
          lastScanElement.textContent = "Just now";
        }

        // Show notification
        showNotification("Security scan completed successfully");
      }, 2000);
    });
  }

  // Update button
  const updateButton = document.querySelector(".action-button.action-blue");
  if (updateButton) {
    updateButton.addEventListener("click", function () {
      showDashboardLoading();

      // Simulate update process
      setTimeout(() => {
        hideDashboardLoading();

        // Update security score
        const scoreElement = document.querySelector(".security-score");
        const progressBar = document.querySelector(".score-progress");

        if (scoreElement && progressBar) {
          const newScore = Math.min(
            100,
            parseInt(scoreElement.textContent) + 1
          );
          scoreElement.textContent = newScore;
          progressBar.style.width = `${newScore}%`;

          // Update score change indicator
          const scoreChange = document.querySelector(".score-change");
          if (scoreChange) {
            scoreChange.textContent = "+3.5%";
          }
        }

        // Show notification
        showNotification("Security definitions updated successfully");
      }, 1500);
    });
  }

  // Schedule button
  const scheduleButton = document.querySelector(".action-button.action-purple");
  if (scheduleButton) {
    scheduleButton.addEventListener("click", function () {
      // Show a modal or tooltip with scheduling options
      alert("Schedule security scans: Daily, Weekly, or Custom");
    });
  }
}

/**
 * Initialize tooltips
 */
function initTooltips() {
  const tooltips = document.querySelectorAll(".tooltip");

  tooltips.forEach((tooltip) => {
    // Add hover listeners if needed
    // Most functionality is handled by CSS
  });
}

/**
 * Initialize toggle switches
 */
function initToggleSwitches() {
  const toggles = document.querySelectorAll(".toggle-switch input");

  toggles.forEach((toggle) => {
    toggle.addEventListener("change", function () {
      const featureName = this.getAttribute("data-feature");
      const isEnabled = this.checked;

      // Show notification
      if (isEnabled) {
        showNotification(`${featureName} enabled`);
      } else {
        showNotification(`${featureName} disabled`);
      }
    });
  });
}

/**
 * Refresh dashboard data
 */
function refreshDashboardData() {
  // In a real application, this would fetch new data from an API
  // For demo purposes, we'll just update the timestamp

  const timestampElement = document.querySelector(".dashboard-timestamp span");
  if (timestampElement) {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    timestampElement.textContent = `${hours}:${minutes}`;
  }

  // Randomly update recent activity
  updateRecentActivity();
}

/**
 * Update recent activity with a new random event
 */
function updateRecentActivity() {
  const activityList = document.querySelector(".activity-list");
  if (!activityList) return;

  // Possible activities
  const activities = [
    { text: "Firewall rules updated", type: "green", time: "Just now" },
    { text: "Unusual login attempt blocked", type: "yellow", time: "Just now" },
    { text: "System scan completed", type: "green", time: "Just now" },
    { text: "Security patches installed", type: "blue", time: "Just now" },
    { text: "Backup completed successfully", type: "purple", time: "Just now" },
    { text: "New device connected to network", type: "blue", time: "Just now" },
    { text: "Potential malware detected", type: "red", time: "Just now" },
  ];

  // Select random activity
  const randomActivity =
    activities[Math.floor(Math.random() * activities.length)];

  // Create new activity item
  const newActivityItem = document.createElement("div");
  newActivityItem.className = "activity-item";
  newActivityItem.innerHTML = `
        <span class="activity-indicator activity-${randomActivity.type}"></span>
        <span class="activity-text">${randomActivity.text}</span>
        <span class="activity-time">${randomActivity.time}</span>
    `;

  // Add to top of list
  activityList.prepend(newActivityItem);

  // Remove oldest item if more than 5
  const activityItems = activityList.querySelectorAll(".activity-item");
  if (activityItems.length > 5) {
    activityList.removeChild(activityItems[activityItems.length - 1]);
  }

  // Highlight new item
  newActivityItem.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
  setTimeout(() => {
    newActivityItem.style.backgroundColor = "transparent";
  }, 2000);
}

/**
 * Show notification
 * @param {string} message - Notification message
 */
function showNotification(message) {
  // Check if notification container exists, create if not
  let notificationContainer = document.querySelector(
    ".dashboard-notifications"
  );

  if (!notificationContainer) {
    notificationContainer = document.createElement("div");
    notificationContainer.className = "dashboard-notifications";
    notificationContainer.style.position = "fixed";
    notificationContainer.style.top = "20px";
    notificationContainer.style.right = "20px";
    notificationContainer.style.zIndex = "1000";
    document.body.appendChild(notificationContainer);
  }

  // Create notification element
  const notification = document.createElement("div");
  notification.className = "dashboard-notification";
  notification.style.backgroundColor = "rgba(17, 24, 39, 0.95)";
  notification.style.color = "#d1d5db";
  notification.style.padding = "12px 16px";
  notification.style.borderRadius = "6px";
  notification.style.marginBottom = "10px";
  notification.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.3)";
  notification.style.borderLeft = "3px solid #eab308";
  notification.style.transform = "translateX(100%)";
  notification.style.opacity = "0";
  notification.style.transition = "all 0.3s ease";

  notification.textContent = message;

  // Add to container
  notificationContainer.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
    notification.style.opacity = "1";
  }, 10);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = "translateX(100%)";
    notification.style.opacity = "0";

    // Remove from DOM after animation
    setTimeout(() => {
      notificationContainer.removeChild(notification);
    }, 300);
  }, 3000);
}

/**
 * Animate counter from start to end value
 * @param {Element} element - Element to update
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} duration - Animation duration in ms
 * @param {number} decimals - Number of decimal places
 */
function animateCounter(element, start, end, duration, decimals = 0) {
  const startTime = performance.now();

  function updateCounter(timestamp) {
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function for smoother animation
    const easeOutQuad = progress * (2 - progress);

    const currentValue = start + (end - start) * easeOutQuad;

    // Format with specified decimal places
    element.textContent = currentValue.toFixed(decimals);

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = end.toFixed(decimals);
    }
  }

  requestAnimationFrame(updateCounter);
}

/**
 * Initialize circular progress
 * @param {Element} element - Circular progress element
 * @param {number} percent - Percentage (0-100)
 */
function initCircularProgress(element, percent) {
  if (!element) return;

  const circle = element.querySelector(".progress-fill");
  const text = element.querySelector(".circular-progress-text");

  if (circle && text) {
    // Calculate circle properties
    const radius = circle.getAttribute("r");
    const circumference = 2 * Math.PI * radius;

    // Set stroke-dasharray and stroke-dashoffset
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset =
      circumference - (percent / 100) * circumference;

    // Update text
    text.textContent = `${percent}%`;
  }
}

/**
 * Initialize Dashboard Navigation
 * Handles navigation between different dashboard sections
 */
function initDashboardNavigation() {
  const navItems = document.querySelectorAll(".dashboard-nav-item");

  if (navItems.length === 0) return;

  // Add click event listeners to each nav item
  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Get the section to show from data attribute
      const sectionName = this.getAttribute("data-section");
      if (!sectionName) return;

      // Remove active class from all nav items
      navItems.forEach((navItem) => {
        navItem.classList.remove("active");
      });

      // Add active class to clicked nav item
      this.classList.add("active");

      // Show loading overlay during transition
      showDashboardLoading();

      // Simulate loading data for the selected section
      setTimeout(() => {
        // In a real application, this would load different content
        // For demo purposes, we'll just show a notification
        hideDashboardLoading();
        showNotification(
          `${
            sectionName.charAt(0).toUpperCase() + sectionName.slice(1)
          } section loaded`
        );

        // Update dashboard title based on section
        const dashboardTitle = document.querySelector(".mockup-title");
        if (dashboardTitle) {
          switch (sectionName) {
            case "overview":
              dashboardTitle.textContent = "Security Posture Overview";
              break;
            case "threats":
              dashboardTitle.textContent = "Threat Intelligence Dashboard";
              break;
            case "compliance":
              dashboardTitle.textContent = "Compliance Status & Reporting";
              break;
            case "reports":
              dashboardTitle.textContent = "Security Reports & Analytics";
              break;
            default:
              dashboardTitle.textContent = "Security Dashboard";
          }
        }
      }, 600);
    });
  });
}
