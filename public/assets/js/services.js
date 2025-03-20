/**
 * Services Page JavaScript
 * Handles interactions for the services.html page
 */

document.addEventListener("DOMContentLoaded", function () {
  // Get all service cards
  const serviceCards = document.querySelectorAll(".service-card");

  // Add click event listeners to each service card
  serviceCards.forEach((card) => {
    // Get the link URL from the parent anchor tag
    const parentLink = card.closest("a");
    const targetUrl = parentLink ? parentLink.getAttribute("href") : null;

    // Find the button inside the hover content
    const button = card.querySelector(".hover-content .btn");

    if (button && targetUrl) {
      // Add click event to the button
      button.addEventListener("click", function (e) {
        // Prevent the event from bubbling up to parent elements
        e.stopPropagation();

        // Navigate to the target URL
        window.location.href = targetUrl;
      });
    }
  });

  // Handle category filtering if Alpine.js is not available
  if (typeof Alpine === "undefined") {
    const filterButtons = document.querySelectorAll("[data-filter]");

    filterButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const category = this.getAttribute("data-filter");

        // Remove active class from all buttons
        filterButtons.forEach((btn) => btn.classList.remove("active"));

        // Add active class to clicked button
        this.classList.add("active");

        // Show/hide cards based on category
        serviceCards.forEach((card) => {
          if (
            category === "all" ||
            card.getAttribute("data-category") === category
          ) {
            card.style.display = ""; // Use default display value from CSS
          } else {
            card.style.display = "none";
          }
        });
      });
    });
  }
});
