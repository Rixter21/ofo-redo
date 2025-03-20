# Services Page Component-Based Restructuring Plan

## Overview

This document outlines the plan for breaking down the large `services.html` file into smaller, more manageable components using a component-based approach. This restructuring will improve maintainability, performance, and code organization.

## Current Structure Analysis

The `services.html` file currently contains:

1. **Head section** - Meta tags, SEO information, schema.org markup, and stylesheets
2. **Navigation** - Main navigation bar and mobile menu
3. **Main content sections**:
   - Services Hero section
   - Premium Filter Buttons
   - Service Cards Grid (12 service cards)
   - Capabilities Section
   - Our Approach Section
   - FAQ Section
   - Service Comparison Table
4. **Footer** - Site footer with links and contact information

## Proposed Component Structure

```
public/
├── components/
│   ├── head/
│   │   ├── meta-tags.html
│   │   ├── schema-markup.html
│   │   └── stylesheets.html
│   ├── navigation/
│   │   ├── navbar.html
│   │   └── mobile-menu.html
│   ├── services/
│   │   ├── hero-section.html
│   │   ├── filter-buttons.html
│   │   ├── service-cards/
│   │   │   ├── card-template.html
│   │   │   ├── core-services/
│   │   │   │   ├── custom-software.html
│   │   │   │   ├── web-development.html
│   │   │   │   ├── mobile-app.html
│   │   │   │   ├── ai-machine-learning.html
│   │   │   │   ├── cloud-solutions.html
│   │   │   │   ├── ecommerce-solutions.html
│   │   │   │   └── devops-solutions.html
│   │   │   └── specialized-services/
│   │   │       ├── ui-ux-design.html
│   │   │       ├── cybersecurity.html
│   │   │       ├── blockchain-development.html
│   │   │       ├── data-analytics.html
│   │   │       └── iot-solutions.html
│   │   ├── capabilities-section.html
│   │   ├── approach-section.html
│   │   ├── faq-section.html
│   │   └── comparison-table.html
│   └── footer/
│       └── footer.html
├── services.html (main file that includes components)
└── assets/
    ├── css/
    │   ├── components/
    │   │   ├── navbar.css
    │   │   ├── service-cards.css
    │   │   ├── capabilities.css
    │   │   ├── faq.css
    │   │   └── comparison-table.css
    │   └── services.css (imports component CSS)
    └── js/
        ├── components/
        │   ├── filter-buttons.js
        │   ├── faq-accordion.js
        │   └── comparison-toggle.js
        └── services.js (imports component JS)
```

## Implementation Strategy

1. **Create Component Directory Structure**:

   - Create the directory structure as outlined above
   - Set up the component files with appropriate HTML snippets

2. **Extract Components**:

   - Extract each section from services.html into its respective component file
   - Ensure each component is self-contained and reusable

3. **Implement Component Inclusion System**:

   - Create a JavaScript-based component loader
   - Use data attributes to specify which components to load

4. **Refactor CSS and JavaScript**:

   - Split CSS into component-specific files
   - Create modular JavaScript files for each interactive component
   - Use import/export pattern for JavaScript modules

5. **Update Main services.html**:
   - Replace content with component placeholders
   - Ensure proper loading order of components

## Component Loader Implementation

```javascript
// components.js
class ComponentLoader {
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
```

## Main services.html Structure After Refactoring

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Enterprise Software Services & Solutions | OFO Development</title>

    <!-- Component: Head Meta Tags -->
    <div id="meta-tags" data-component="components/head/meta-tags.html"></div>

    <!-- Component: Schema Markup -->
    <div
      id="schema-markup"
      data-component="components/head/schema-markup.html"
    ></div>

    <!-- Component: Stylesheets -->
    <div
      id="stylesheets"
      data-component="components/head/stylesheets.html"
    ></div>

    <!-- Component Loader Script -->
    <script src="assets/js/components.js"></script>
  </head>
  <body class="bg-gray-900 text-white">
    <!-- Component: Navigation -->
    <div id="navbar" data-component="components/navigation/navbar.html"></div>

    <!-- Main Content -->
    <main id="main-content" class="pt-24">
      <!-- Component: Services Hero Section -->
      <div
        id="services-hero"
        data-component="components/services/hero-section.html"
      ></div>

      <!-- Component: Filter Buttons -->
      <div
        id="filter-buttons"
        data-component="components/services/filter-buttons.html"
      ></div>

      <!-- Component: Service Cards Grid -->
      <div
        id="service-cards"
        data-component="components/services/service-cards-grid.html"
      ></div>

      <!-- Component: Capabilities Section -->
      <div
        id="capabilities-section"
        data-component="components/services/capabilities-section.html"
      ></div>

      <!-- Component: Our Approach Section -->
      <div
        id="approach-section"
        data-component="components/services/approach-section.html"
      ></div>

      <!-- Component: FAQ Section -->
      <div
        id="faq-section"
        data-component="components/services/faq-section.html"
      ></div>

      <!-- Component: Service Comparison Table -->
      <div
        id="comparison-table"
        data-component="components/services/comparison-table.html"
      ></div>
    </main>

    <!-- Component: Footer -->
    <div id="footer" data-component="components/footer/footer.html"></div>

    <!-- Services Page JavaScript -->
    <script src="assets/js/services.js" type="module"></script>
  </body>
</html>
```

## Benefits of This Approach

1. **Improved Maintainability**: Each component can be edited independently
2. **Better Performance**: Smaller files load faster and are easier to cache
3. **Code Reusability**: Components can be reused across multiple pages
4. **Parallel Development**: Team members can work on different components simultaneously
5. **Easier Testing**: Components can be tested in isolation
6. **Simplified Debugging**: Issues can be isolated to specific components

## Implementation Steps

1. Create the directory structure
2. Create the component loader JavaScript file
3. Extract each section from services.html into its component file
4. Update the main services.html file to use the component loader
5. Test the component loading system
6. Refactor CSS and JavaScript files to match the component structure
