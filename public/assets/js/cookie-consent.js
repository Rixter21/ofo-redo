/**
 * Cookie Consent Banner
 * Loads and initializes the cookie consent banner on all pages
 */

document.addEventListener("DOMContentLoaded", function () {
  // Check if user has already accepted cookies
  if (localStorage.getItem("cookiesAccepted")) {
    return; // Don't show banner if already accepted
  }

  // Create cookie consent element
  const cookieConsent = document.createElement("div");
  cookieConsent.id = "cookie-consent";
  cookieConsent.className =
    "fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50";
  cookieConsent.innerHTML = `
    <div class="container mx-auto flex flex-col md:flex-row items-center justify-between">
      <p class="mb-4 md:mb-0">
        We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
      </p>
      <div class="flex space-x-4">
        <button id="accept-cookies" class="px-4 py-2 bg-amber-500 text-white hover:bg-amber-600 transition-colors">
          Accept
        </button>
        <a href="/privacy-policy.html" class="px-4 py-2 border border-white text-white hover:bg-white/10 transition-colors">
          Learn More
        </a>
      </div>
    </div>
  `;

  // Add to document
  document.body.appendChild(cookieConsent);

  // Handle accept button click
  document
    .getElementById("accept-cookies")
    .addEventListener("click", function () {
      localStorage.setItem("cookiesAccepted", "true");
      cookieConsent.style.display = "none";
    });
});
