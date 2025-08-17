// Main JavaScript functionality for Travel Buddy
import logger from "./utils/logger.js";

document.addEventListener("DOMContentLoaded", function () {
  logger.debug("Initializing main application");

  // Mobile Navigation Toggle
  const navToggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navbar = document.getElementById("navbar");

  navToggle.addEventListener("click", function () {
    logger.debug("Mobile navigation toggled");
    navMenu.classList.toggle("active");
    navToggle.classList.toggle("active");
  });

  // Close mobile menu when clicking on a link
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      logger.debug("Mobile navigation link clicked, closing menu");
      navMenu.classList.remove("active");
      navToggle.classList.remove("active");
    });
  });

  // Navbar scroll effect
  window.addEventListener("scroll", function () {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
      logger.debug("Navbar scrolled state activated");
    } else {
      navbar.classList.remove("scrolled");
      logger.debug("Navbar scrolled state deactivated");
    }
  });

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const target = document.querySelector(targetId);
      if (target) {
        logger.debug("Smooth scrolling to section", { targetId });
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else {
        logger.warn("Scroll target not found", { targetId });
      }
    });
  });

  // Feature cards hover effects and animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate");
        logger.debug("Feature card animated", {
          element: entry.target.className,
        });
      }
    });
  }, observerOptions);

  // Observe feature cards
  document.querySelectorAll(".feature-card").forEach((card) => {
    observer.observe(card);
  });

  logger.info("Feature card animations initialized");

  // Testimonial slider functionality
  const testimonialCards = document.querySelectorAll(".testimonial-card");
  const dots = document.querySelectorAll(".dot");
  let currentSlide = 0;

  function showSlide(index) {
    logger.debug("Changing testimonial slide", {
      previousSlide: currentSlide,
      newSlide: index,
    });

    // Remove active class from all cards and dots
    testimonialCards.forEach((card) => card.classList.remove("active"));
    dots.forEach((dot) => dot.classList.remove("active"));

    // Add active class to current slide
    testimonialCards[index].classList.add("active");
    dots[index].classList.add("active");
    currentSlide = index;
  }

  // Add click listeners to dots
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      logger.debug("Testimonial dot clicked", { dotIndex: index });
      showSlide(index);
    });
  });

  // Auto-slide testimonials every 5 seconds
  setInterval(() => {
    const nextSlide = (currentSlide + 1) % testimonialCards.length;
    showSlide(nextSlide);
  }, 5000);

  logger.info("Testimonial slider initialized");

  // Social media links (placeholder functionality)
  document.querySelectorAll(".social-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const platform = this.getAttribute("aria-label");
      logger.info("Social media link clicked", { platform });
      console.log(
        `Opening ${platform} - functionality would be implemented here`,
      );
    });
  });

  logger.info("Main application initialization complete");
});

// Utility function for smooth animations
function animateOnScroll(selector, animationClass = "animate") {
  const elements = document.querySelectorAll(selector);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(animationClass);
          logger.debug("Element animated on scroll", {
            selector,
            element: entry.target.className,
          });
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    },
  );

  elements.forEach((el) => observer.observe(el));
  logger.debug("Scroll animations initialized", { selector });
}

// Initialize animations when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  logger.debug("Initializing scroll animations");
  animateOnScroll(".hero-content");
  animateOnScroll(".section-header");
  animateOnScroll(".testimonial-card");
  logger.info("Scroll animations setup complete");
});
