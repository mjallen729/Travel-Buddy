// Backend integration for Travel Buddy Frontend
import appConfig from "./appConfig.js";
import logger from "./utils/logger.js";

logger.debug("Initializing app with config", {
  apiBase: appConfig.API_BASE,
  isProduction: appConfig.USE_PRODUCTION_API,
});

// Optional ping check to verify backend connectivity
fetch(`${appConfig.API_BASE}/ping`)
  .then((res) => res.json())
  .then((data) => {
    logger.info("Backend connection established", { message: data.message });
  })
  .catch((err) => {
    logger.error("Backend connection failed", {
      error: err.message,
      apiBase: appConfig.API_BASE,
    });
  });

// Check if user is logged in and display appropriate UI
document.addEventListener("DOMContentLoaded", function () {
  logger.debug("Checking user authentication state");

  const currentUser = localStorage.getItem("currentUser");

  if (currentUser) {
    const user = JSON.parse(currentUser);
    logger.info("User session found", {
      userId: user._id,
      username: user.username,
    });

    // Update navigation to show user info and dashboard link
    const navAuth = document.querySelector(".nav-auth");
    const navCta = document.querySelector(".nav-cta");

    if (navAuth && navCta) {
      navAuth.textContent = `Welcome, ${user.firstName || user.username}`;
      navAuth.href = "./Pages/dashboard.html";
      navCta.textContent = "Dashboard";
      navCta.href = "./Pages/dashboard.html";

      logger.debug("Navigation updated for authenticated user");
    } else {
      logger.warn("Navigation elements not found");
    }
  } else {
    logger.debug("No user session found");
  }

  // Highlight nav link on scroll
  const hero = document.querySelector(".hero");
  if (hero) {
    const sections = document.querySelectorAll("section[id]");
    window.addEventListener("scroll", function () {
      let scrollY = window.pageYOffset;

      sections.forEach((current) => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 50;
        let sectionId = current.getAttribute("id");

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          document
            .querySelector(".nav-menu a[href*=" + sectionId + "]")
            .classList.add("active");
        } else {
          document
            .querySelector(".nav-menu a[href*=" + sectionId + "]")
            .classList.remove("active");
        }
      });
    });
  }
});
