/**
 * FAQ Accordion Component
 * Handles the accordion functionality for the FAQ section
 */

// Initialize FAQ accordion when components are loaded
document.addEventListener("componentsLoaded", () => {
  initFaqAccordion();
});

/**
 * Initialize FAQ accordion functionality
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");

  if (faqItems.length === 0) return;

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    const toggle = item.querySelector(".faq-toggle");

    if (!question || !answer) return;

    // Set initial state
    answer.style.maxHeight = "0px";
    answer.style.opacity = "0";
    answer.style.transform = "translateY(-10px)";

    // Add click event to question
    question.addEventListener("click", () => {
      // Check if this item is already active
      const isActive = item.classList.contains("active");

      // Close all accordions
      faqItems.forEach((otherItem) => {
        const otherAnswer = otherItem.querySelector(".faq-answer");
        const otherToggle = otherItem.querySelector(".faq-toggle");

        otherItem.classList.remove("active");
        if (otherAnswer) {
          otherAnswer.style.maxHeight = "0px";
          otherAnswer.style.opacity = "0";
          otherAnswer.style.transform = "translateY(-10px)";
        }
        if (otherToggle) {
          otherToggle.style.transform = "rotate(0deg)";
        }
      });

      // Toggle current accordion
      if (!isActive) {
        item.classList.add("active");
        answer.style.maxHeight = `${answer.scrollHeight}px`;
        answer.style.opacity = "1";
        answer.style.transform = "translateY(0)";

        if (toggle) {
          toggle.style.transform = "rotate(180deg)";
        }
      }
    });
  });

  // Open the first FAQ item by default
  if (faqItems.length > 0) {
    const firstItem = faqItems[0];
    const firstAnswer = firstItem.querySelector(".faq-answer");
    const firstToggle = firstItem.querySelector(".faq-toggle");

    firstItem.classList.add("active");
    if (firstAnswer) {
      firstAnswer.style.maxHeight = `${firstAnswer.scrollHeight}px`;
      firstAnswer.style.opacity = "1";
      firstAnswer.style.transform = "translateY(0)";
    }
    if (firstToggle) {
      firstToggle.style.transform = "rotate(180deg)";
    }
  }
}

export default initFaqAccordion;
