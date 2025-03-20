/**
 * Filter Buttons Component
 * Handles filtering of service cards based on category
 */

// Initialize filter buttons when components are loaded
document.addEventListener("componentsLoaded", () => {
  initFilterButtons();
});

/**
 * Initialize filter buttons functionality
 */
function initFilterButtons() {
  const filterButtons = document.querySelectorAll(".premium-filter-button");
  const serviceCards = document.querySelectorAll(".service-card");

  if (filterButtons.length === 0 || serviceCards.length === 0) return;

  // Add click event to each filter button
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
        const cardContainer = card.closest(".transform");

        if (filterValue === "all" || filterValue === cardCategory) {
          cardContainer.style.display = "block";
          // Add animation
          setTimeout(() => {
            cardContainer.style.opacity = "1";
            cardContainer.style.transform = "translateY(0)";
          }, 10);
        } else {
          // Add animation
          cardContainer.style.opacity = "0";
          cardContainer.style.transform = "translateY(20px)";
          setTimeout(() => {
            cardContainer.style.display = "none";
          }, 300);
        }
      });
    });
  });

  // Set initial state (all active)
  const allButton = document.querySelector(
    '.premium-filter-button[data-filter="all"]'
  );
  if (allButton) {
    allButton.classList.add("active");
  }
}

export default initFilterButtons;
