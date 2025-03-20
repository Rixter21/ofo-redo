/**
 * Component Loader
 * Handles loading HTML components dynamically
 */

class ComponentLoader {
  /**
   * Load a single component
   * @param {string} elementId - The ID of the element to load the component into
   * @param {string} componentPath - The path to the component HTML file
   * @returns {Promise} - A promise that resolves when the component is loaded
   */
  static async loadComponent(elementId, componentPath) {
    try {
      const response = await fetch(componentPath);
      if (!response.ok) throw new Error(`Failed to load ${componentPath}`);
      const html = await response.text();
      document.getElementById(elementId).innerHTML = html;
    } catch (error) {
      console.error("Component loading error:", error);
    }
  }

  /**
   * Load all components on the page
   * @returns {Promise} - A promise that resolves when all components are loaded
   */
  static async loadAllComponents() {
    const componentElements = document.querySelectorAll("[data-component]");
    const loadPromises = Array.from(componentElements).map((element) => {
      const componentPath = element.getAttribute("data-component");
      return this.loadComponent(element.id, componentPath);
    });

    await Promise.all(loadPromises);
    // Trigger any initialization functions after components are loaded
    document.dispatchEvent(new CustomEvent("componentsLoaded"));
  }
}

// Initialize components when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  ComponentLoader.loadAllComponents();
});
