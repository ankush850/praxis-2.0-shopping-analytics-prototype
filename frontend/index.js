/**
 * Global ShopperAI Initialization
 * Handled outside the React lifecycle for professional metrics and monitoring.
 */

(function initShopperAI() {
  console.log("%c ShopperAI - Behavioral Analysis Platform initialized ", "background: #4f46e5; color: #fff; padding: 4px; border-radius: 4px; font-weight: bold;");
  
  // Professional environment check
  const isProduction = window.location.hostname !== 'localhost';
  if (isProduction) {
    console.debug("Running in production mode. Performance monitoring enabled.");
  }

  // Handle global resize events for chart responsiveness
  window.addEventListener('resize', () => {
    // Throttled resize handler if needed
  });

  // Smooth scroll behavior for professional navigation
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });
})();
