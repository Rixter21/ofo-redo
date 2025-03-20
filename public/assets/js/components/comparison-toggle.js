/**
 * Comparison Toggle Component
 * Handles toggling between different service tiers in the comparison table
 */

// Initialize comparison toggle when components are loaded
document.addEventListener("componentsLoaded", () => {
  initComparisonToggle();
});

/**
 * Initialize comparison toggle functionality
 */
function initComparisonToggle() {
  const toggleButtons = document.querySelectorAll(".comparison-toggle");

  if (toggleButtons.length === 0) return;

  // Get all tier columns
  const standardColumns = document.querySelectorAll(".tier-standard");
  const professionalColumns = document.querySelectorAll(".tier-professional");
  const enterpriseColumns = document.querySelectorAll(".tier-enterprise");

  // Add click event to each toggle button
  toggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons
      toggleButtons.forEach((btn) => btn.classList.remove("active"));

      // Add active class to clicked button
      button.classList.add("active");

      // Get tier value
      const tierValue = button.getAttribute("value");

      // Hide all tier columns
      standardColumns.forEach((col) => {
        col.classList.add("hidden");
      });

      professionalColumns.forEach((col) => {
        col.classList.add("hidden");
      });

      enterpriseColumns.forEach((col) => {
        col.classList.add("hidden");
      });

      // Show selected tier columns
      switch (tierValue) {
        case "standard":
          standardColumns.forEach((col) => {
            col.classList.remove("hidden");
          });
          break;
        case "professional":
          professionalColumns.forEach((col) => {
            col.classList.remove("hidden");
          });
          break;
        case "enterprise":
          enterpriseColumns.forEach((col) => {
            col.classList.remove("hidden");
          });
          break;
      }
    });
  });

  // Set initial state (standard active)
  const standardButton = document.querySelector(
    '.comparison-toggle[value="standard"]'
  );
  if (standardButton) {
    standardButton.classList.add("active");

    // Show standard columns, hide others
    standardColumns.forEach((col) => {
      col.classList.remove("hidden");
    });

    professionalColumns.forEach((col) => {
      col.classList.add("hidden");
    });

    enterpriseColumns.forEach((col) => {
      col.classList.add("hidden");
    });
  }
}

export default initComparisonToggle;
