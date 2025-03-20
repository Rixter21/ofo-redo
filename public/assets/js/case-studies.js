/**
 * Case Studies JavaScript - OFO Development
 * This file contains the JavaScript functionality for the Case Studies page
 */

document.addEventListener("DOMContentLoaded", function () {
  // Initialize all components
  initializeFilters();
  initializeAdvancedFilters();
  initializeSearch();
  initializeComparison();
  initializeAnimations();
});

/**
 * Initialize the basic category filters
 */
function initializeFilters() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const caseStudyItems = document.querySelectorAll(".case-study-item");

  // Add click event to filter buttons
  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active class from all buttons
      filterButtons.forEach((btn) => {
        btn.classList.remove("active", "bg-blue-700");
        btn.classList.add("bg-blue-900/50");
      });

      // Add active class to clicked button
      this.classList.add("active", "bg-blue-700");
      this.classList.remove("bg-blue-900/50");

      // Get filter value
      const filterValue = this.getAttribute("data-filter");

      // Filter case study items
      caseStudyItems.forEach((item) => {
        if (
          filterValue === "all" ||
          item.getAttribute("data-category") === filterValue
        ) {
          item.style.display = "block";
          // Add animation
          setTimeout(() => {
            item.style.opacity = "1";
            item.style.transform = "translateY(0)";
          }, 50);
        } else {
          item.style.opacity = "0";
          item.style.transform = "translateY(20px)";
          setTimeout(() => {
            item.style.display = "none";
          }, 300);
        }
      });
    });
  });

  // Initialize with "All" filter active
  if (filterButtons.length > 0) {
    document.querySelector('.filter-btn[data-filter="all"]').click();
  }
}

/**
 * Initialize the advanced filtering system
 */
function initializeAdvancedFilters() {
  const advancedFilterSection = document.querySelector(
    ".advanced-filter-section"
  );
  if (!advancedFilterSection) return;

  const filterCheckboxes = document.querySelectorAll(".filter-checkbox");
  const caseStudyItems = document.querySelectorAll(".case-study-item");

  // Add change event to filter checkboxes
  filterCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      applyAdvancedFilters();
    });
  });

  // Apply all active filters
  function applyAdvancedFilters() {
    // Get all checked filters by group
    const activeFilters = {};

    filterCheckboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        const filterGroup = checkbox.getAttribute("data-filter-group");
        const filterValue = checkbox.getAttribute("data-filter-value");

        if (!activeFilters[filterGroup]) {
          activeFilters[filterGroup] = [];
        }

        activeFilters[filterGroup].push(filterValue);
      }
    });

    // Filter case study items
    caseStudyItems.forEach((item) => {
      let shouldShow = true;

      // Check if item matches all filter groups
      for (const group in activeFilters) {
        if (activeFilters[group].length > 0) {
          const itemValue = item.getAttribute(`data-${group}`);
          const itemValues = itemValue ? itemValue.split(",") : [];

          // Check if any of the item's values match any of the active filters for this group
          const hasMatch = activeFilters[group].some((filter) =>
            itemValues.includes(filter)
          );

          if (!hasMatch) {
            shouldShow = false;
            break;
          }
        }
      }

      // Show or hide the item
      if (shouldShow) {
        item.style.display = "block";
        setTimeout(() => {
          item.style.opacity = "1";
          item.style.transform = "translateY(0)";
        }, 50);
      } else {
        item.style.opacity = "0";
        item.style.transform = "translateY(20px)";
        setTimeout(() => {
          item.style.display = "none";
        }, 300);
      }
    });
  }
}

/**
 * Initialize the search functionality
 */
function initializeSearch() {
  const searchInput = document.querySelector(".search-input");
  if (!searchInput) return;

  const caseStudyItems = document.querySelectorAll(".case-study-item");

  searchInput.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase().trim();

    if (searchTerm === "") {
      // If search is empty, show all items or respect current filters
      document.querySelector(".filter-btn.active").click();
      return;
    }

    // Filter items based on search term
    caseStudyItems.forEach((item) => {
      const title = item.querySelector("h3").textContent.toLowerCase();
      const description = item.querySelector("p").textContent.toLowerCase();
      const tags = Array.from(item.querySelectorAll(".tech-tag"))
        .map((tag) => tag.textContent.toLowerCase())
        .join(" ");

      const content = `${title} ${description} ${tags}`;

      if (content.includes(searchTerm)) {
        item.style.display = "block";
        setTimeout(() => {
          item.style.opacity = "1";
          item.style.transform = "translateY(0)";
        }, 50);
      } else {
        item.style.opacity = "0";
        item.style.transform = "translateY(20px)";
        setTimeout(() => {
          item.style.display = "none";
        }, 300);
      }
    });
  });

  // Clear search when user clicks the clear button
  const clearSearchButton = document.querySelector(".clear-search-btn");
  if (clearSearchButton) {
    clearSearchButton.addEventListener("click", function () {
      searchInput.value = "";
      searchInput.dispatchEvent(new Event("input"));
    });
  }
}

/**
 * Initialize the case study comparison feature
 */
function initializeComparison() {
  const comparisonContainer = document.querySelector(".comparison-container");
  if (!comparisonContainer) return;

  const addToCompareButtons = document.querySelectorAll(".add-to-compare");
  const compareSelectedButton = document.querySelector(".compare-selected");
  const clearComparisonButton = document.querySelector(".clear-comparison");
  const comparisonTable = document.querySelector(".comparison-table");
  const comparisonSection = document.querySelector(".comparison-section");

  let selectedCaseStudies = [];

  // Add click event to "Add to Compare" buttons
  addToCompareButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const caseStudyId = this.getAttribute("data-case-study-id");
      const caseStudyCard = document.querySelector(
        `.case-study-item[data-id="${caseStudyId}"]`
      );

      if (this.classList.contains("active")) {
        // Remove from comparison
        this.classList.remove("active");
        this.textContent = "Add to Compare";

        selectedCaseStudies = selectedCaseStudies.filter(
          (id) => id !== caseStudyId
        );
      } else {
        // Add to comparison (limit to 3)
        if (selectedCaseStudies.length >= 3) {
          alert("You can compare up to 3 case studies at a time.");
          return;
        }

        this.classList.add("active");
        this.textContent = "Remove from Compare";

        selectedCaseStudies.push(caseStudyId);
      }

      // Update the comparison button state
      updateCompareButtonState();
    });
  });

  // Add click event to "Compare Selected" button
  if (compareSelectedButton) {
    compareSelectedButton.addEventListener("click", function () {
      if (selectedCaseStudies.length < 2) {
        alert("Please select at least 2 case studies to compare.");
        return;
      }

      // Show loading state
      comparisonTable.innerHTML = `
        <div class="loading-container">
          <div class="loading-spinner"></div>
        </div>
      `;

      // Show the comparison section
      comparisonSection.classList.remove("hidden");

      // Scroll to the comparison section
      comparisonSection.scrollIntoView({ behavior: "smooth" });

      // Simulate loading (in a real app, this would fetch data)
      setTimeout(() => {
        buildComparisonTable();
      }, 800);
    });
  }

  // Add click event to "Clear Comparison" button
  if (clearComparisonButton) {
    clearComparisonButton.addEventListener("click", function () {
      // Clear selected case studies
      selectedCaseStudies = [];

      // Reset all "Add to Compare" buttons
      addToCompareButtons.forEach((button) => {
        button.classList.remove("active");
        button.textContent = "Add to Compare";
      });

      // Hide the comparison section
      comparisonSection.classList.add("hidden");

      // Update the comparison button state
      updateCompareButtonState();
    });
  }

  // Update the state of the "Compare Selected" button
  function updateCompareButtonState() {
    if (!compareSelectedButton) return;

    if (selectedCaseStudies.length >= 2) {
      compareSelectedButton.removeAttribute("disabled");
      compareSelectedButton.classList.remove(
        "opacity-50",
        "cursor-not-allowed"
      );
    } else {
      compareSelectedButton.setAttribute("disabled", "disabled");
      compareSelectedButton.classList.add("opacity-50", "cursor-not-allowed");
    }

    // Update the button text to show how many are selected
    compareSelectedButton.textContent = `Compare Selected (${selectedCaseStudies.length})`;
  }

  // Build the comparison table
  function buildComparisonTable() {
    if (!comparisonTable) return;

    // Get the case study data
    const caseStudies = selectedCaseStudies.map((id) => {
      const card = document.querySelector(`.case-study-item[data-id="${id}"]`);
      return {
        id: id,
        title: card.querySelector("h3").textContent,
        category: card.getAttribute("data-category"),
        technologies: Array.from(card.querySelectorAll(".tech-tag")).map(
          (tag) => tag.textContent
        ),
        metrics: card.getAttribute("data-metrics")
          ? JSON.parse(card.getAttribute("data-metrics"))
          : {},
      };
    });

    // Build the table header
    let tableHTML = `
      <table class="comparison-table">
        <thead>
          <tr>
            <th>Feature</th>
            ${caseStudies.map((study) => `<th>${study.title}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
    `;

    // Add category row
    tableHTML += `
      <tr>
        <td class="comparison-feature">Category</td>
        ${caseStudies
          .map(
            (study) =>
              `<td>${
                study.category.charAt(0).toUpperCase() + study.category.slice(1)
              }</td>`
          )
          .join("")}
      </tr>
    `;

    // Add technologies row
    tableHTML += `
      <tr>
        <td class="comparison-feature">Technologies</td>
        ${caseStudies
          .map((study) => `<td>${study.technologies.join(", ")}</td>`)
          .join("")}
      </tr>
    `;

    // Add metrics rows
    const allMetrics = new Set();
    caseStudies.forEach((study) => {
      Object.keys(study.metrics).forEach((metric) => allMetrics.add(metric));
    });

    allMetrics.forEach((metric) => {
      tableHTML += `
        <tr>
          <td class="comparison-feature">${metric}</td>
          ${caseStudies
            .map((study) => {
              const value = study.metrics[metric];
              return `<td>${value !== undefined ? value : "-"}</td>`;
            })
            .join("")}
        </tr>
      `;
    });

    // Close the table
    tableHTML += `
        </tbody>
      </table>
    `;

    // Update the comparison table
    comparisonTable.innerHTML = tableHTML;
  }

  // Initialize the comparison button state
  updateCompareButtonState();
}

/**
 * Initialize scroll animations
 */
function initializeAnimations() {
  // Only run if IntersectionObserver is supported
  if ("IntersectionObserver" in window) {
    const animatedElements = document.querySelectorAll(".animate-on-scroll");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fadeInUp");

            // If the element should only animate once, unobserve it
            if (entry.target.getAttribute("data-once") === "true") {
              observer.unobserve(entry.target);
            }
          } else {
            // If the element should animate every time it enters the viewport
            if (entry.target.getAttribute("data-once") !== "true") {
              entry.target.classList.remove("animate-fadeInUp");
            }
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
}

/**
 * Initialize the reading progress indicator
 */
function initializeReadingProgress() {
  const progressBar = document.querySelector(".reading-progress");
  if (!progressBar) return;

  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
    progressBar.style.width = `${scrollPercentage}%`;
  });
}
