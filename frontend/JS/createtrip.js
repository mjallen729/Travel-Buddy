// Auth page functionality with backend integration
import appConfig from "./appConfig.js";
import logger from "./utils/logger.js";

document.addEventListener("DOMContentLoaded", function () {
  const currentUser = localStorage.getItem("currentUser");

  if (!currentUser) {
    // Redirect to login if not authenticated
    window.location.href = "./auth.html";
    return;
  }

  const user = JSON.parse(currentUser);

  if (user.travelPreferences.travelStyle) {
    const travelStyleSelect = document.getElementById("create-travel-style");
    travelStyleSelect.value = user.travelPreferences.travelStyle;
  }

  if (user.travelPreferences.accommodationStyle) {
    const travelAccommodationSelect = document.getElementById(
      "create-accommodation-style",
    );
    travelAccommodationSelect.value = user.travelPreferences.accommodationStyle;
  }

  if (user.travelPreferences.budgetRange) {
    const travelBudgetSelect = document.getElementById("create-budget-range");
    travelBudgetSelect.value = user.travelPreferences.budgetRange;
  }

  user.travelPreferences.interests.forEach((interest) => {
    const checkbox = document.querySelector(
      `#create-interests input[type="checkbox"][value="${interest}"]`,
    );
    if (checkbox) {
      checkbox.checked = true;
    }
  });

  // Get DOM elements
  const tripForm = document.getElementById("trip-form");

  // Backend signup integration
  tripForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Get Trip Details
    const tripname = document.getElementById("create-tripname").value;
    const destination = document.getElementById("create-destination").value;
    const startdate = document.getElementById("create-start-date").value;
    const enddate = document.getElementById("create-end-date").value;
    const status = document.getElementById("create-status").value;

    // Travel Preferences
    const budget = document.getElementById("create-budget").value;
    const budgetRange = document.getElementById("create-budget-range").value;
    const travelStyle = document.getElementById("create-travel-style").value;
    const accommodationStyle = document.getElementById(
      "create-accommodation-style",
    ).value;
    const interests = Array.from(
      document.querySelectorAll(
        '#create-interests input[type="checkbox"]:checked',
      ),
    ).map((cb) => cb.value);

    // Basic validation
    if (
      !tripname ||
      !destination ||
      !startdate ||
      !enddate ||
      !budget ||
      !status
    ) {
      logger.warn("Trip creation failed - invalid dates", {
        tripname,
        destination,
        startdate,
        enddate,
        budget,
        status,
      });

      return;
    }

    const start = new Date(startdate);
    const end = new Date(enddate);

    if (start >= end) {
      logger.warn("Trip creation failed - invalid dates", {
        startdate,
        enddate,
      });
    }

    if (start < new Date()) {
      logger.warn("Trip creation failed - past start date", {
        startdate,
      });
    }

    const preferences = {
      travelStyle,
      interests,
      budgetRange,
      accommodationStyle,
    };

    logger.info("Creating new trip...", {
      tripname,
      destination,
      startdate,
      enddate,
      budget,
      status,
      preferences: {
        travelStyle,
        interests,
        budgetRange,
        accommodationStyle,
      },
    });

    // Call backend signup endpoint
    try {
      const response = await fetch(`${appConfig.API_BASE}/trips/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          tripName: tripname,
          destination: destination,
          startDate: start,
          endDate: end,
          duration: Math.ceil((end - start) / (1000 * 60 * 60 * 24)),
          budget: budget,
          status: status,
          preferences: preferences,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw errData.error || "Trip creation failed";
      }

      const data = await response.json();
      logger.info(
        "Trip created successfully! View your trip on the dashboard!",
      );

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = "./dashboard.html#trips";
      }, 1500);
    } catch (err) {
      logger.error("Trip creation error:", err);
    }
  });
});

// Message display function
function showMessage(message, type = "info") {
  // Remove existing message
  const existingMessage = document.querySelector(".auth-message");
  if (existingMessage) {
    existingMessage.remove();
  }

  // Create message element
  const messageEl = document.createElement("div");
  messageEl.className = `auth-message ${type}`;
  messageEl.textContent = message;

  // Add styles
  messageEl.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    font-weight: 500;
    z-index: 10000;
    animation: slideIn 0.3s ease;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;

  // Set colors based on type
  switch (type) {
    case "success":
      messageEl.style.backgroundColor = "#27ae60";
      messageEl.style.color = "white";
      break;
    case "error":
      messageEl.style.backgroundColor = "#e74c3c";
      messageEl.style.color = "white";
      break;
    case "info":
    default:
      messageEl.style.backgroundColor = "#365359";
      messageEl.style.color = "white";
      break;
  }

  document.body.appendChild(messageEl);

  // Auto remove after 4 seconds
  setTimeout(() => {
    if (messageEl.parentElement) {
      messageEl.style.animation = "slideOut 0.3s ease forwards";
      setTimeout(() => {
        if (messageEl.parentElement) {
          messageEl.remove();
        }
      }, 300);
    }
  }, 4000);
}

// Add CSS animations for messages
const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
