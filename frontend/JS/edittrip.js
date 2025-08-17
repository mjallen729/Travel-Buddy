import appConfig from "./appConfig.js";
import logger from "./utils/logger.js";

document.addEventListener("DOMContentLoaded", async function () {
  const params = new URLSearchParams(window.location.search);
  const tripId = params.get("tripId");

  if (!tripId) {
    showMessage("Missing trip ID in URL", "error");
    return;
  }

  const currentUser = localStorage.getItem("currentUser");

  if (!currentUser) {
    // Redirect to login if not authenticated
    window.location.href = "./auth.html";
    return;
  }

  // Fetch trip from backend
  try {
    const response = await fetch(`${appConfig.API_BASE}/trips/${tripId}`, {
      method: "GET",
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Trip not found");
    }

    const trip = await response.json();
    document.getElementById("trip-title").textContent =
      "Editing " + trip.tripName;
    document.getElementById("trip-name").value = trip.tripName;
    document.getElementById("trip-destination").value = trip.destination;
    document.getElementById("trip-start-date").value =
      trip.startDate.split("T")[0];
    document.getElementById("trip-end-date").value = trip.endDate.split("T")[0];
    document.getElementById("trip-budget").value = trip.budget;
    document.getElementById("trip-budget-range").value =
      trip.preferences.budgetRange;
    document.getElementById("trip-travel-style").value =
      trip.preferences.travelStyle;
    document.getElementById("trip-accommodation-style").value =
      trip.preferences.accommodationStyle;
    const interests = document.querySelectorAll(
      '#trip-interests input[type="checkbox"]',
    );
    interests.forEach((checkbox) => {
      if (trip.preferences.interests.includes(checkbox.value)) {
        checkbox.checked = true;
      }
    });
    document.getElementById("trip-status").value = trip.status;
    document.getElementById("return").addEventListener("click", function () {
      window.location.href = `./viewtrip.html?tripId=${tripId}`;
    });

    //Update trip with new fields
    document
      .getElementById("trip-form")
      .addEventListener("submit", async function (e) {
        e.preventDefault();

        const start = new Date(
          document.getElementById("trip-start-date").value,
        );
        const end = new Date(document.getElementById("trip-end-date").value);

        if (start >= end) {
          showMessage("End date must be after start date", "error");
          return;
        }

        const tripName = document.getElementById("trip-name").value;
        const destination = document.getElementById("trip-destination").value;
        const startDate = new Date(
          document.getElementById("trip-start-date").value,
        );
        const endDate = new Date(
          document.getElementById("trip-end-date").value,
        );
        const budget = document.getElementById("trip-budget").value;
        const status = document.getElementById("trip-status").value;
        const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const budgetRange = document.getElementById("trip-budget-range").value;
        const travelStyle = document.getElementById("trip-travel-style").value;
        const accommodationStyle = document.getElementById(
          "trip-accommodation-style",
        ).value;
        const interests = Array.from(
          document.querySelectorAll(
            '#trip-interests input[type="checkbox"]:checked',
          ),
        ).map((cb) => cb.value);
        const updatedTrip = {
          tripName: tripName,
          destination: destination,
          startDate: startDate,
          endDate: endDate,
          duration: duration,
          budget: budget,
          status: status,
          preferences: {
            travelStyle: travelStyle,
            interests: interests,
            budgetRange: budgetRange,
            accommodationStyle: accommodationStyle,
          },
        };
        //console.log(updatedTrip)
        try {
          const updateRes = await fetch(
            `${appConfig.API_BASE}/trips/${tripId}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updatedTrip),
            },
          );
          if (!updateRes.ok) {
            const err = await updateRes.json();
            throw new Error(err.error || "Failed to update trip");
          }
          const updatedTripResponse = await updateRes.json();
          showMessage("Trip updated successfully!", "success");
          logger.info("Trip updated successfully!");
          setTimeout(() => {
            window.location.href = "./viewtrip.html?tripId=" + tripId;
          }, 1500);
        } catch (err) {
          showMessage("Update failed: " + err.message, "error");
          logger.error("Update failed: " + err.message);
        }
      });

    //Delete trip
    document
      .getElementById("delete-trip")
      .addEventListener("click", async function () {
        if (!confirm("Are you sure you want to delete this trip permanently?"))
          return;
        try {
          const deleteRes = await fetch(
            `${appConfig.API_BASE}/trips/${tripId}`,
            { method: "DELETE" },
          );
          if (!deleteRes.ok) {
            const err = await deleteRes.json();
            throw new Error(err.error || "Failed to delete trip");
          }

          const deletedTripResponse = await deleteRes.json();
          showMessage("Trip deleted successfully!", "success");
          logger.info("Trip deleted successfully!");
          setTimeout(() => {
            window.location.href = "./dashboard.html#trips";
          }, 1500);
        } catch (err) {
          showMessage("Delete failed: " + err.message, "error");
          logger.error("Delete failed: " + err.message);
        }
      });
  } catch (err) {
    showMessage("Could not load trip: " + err.message, "error");
    logger.error("Could not load trip: " + err.message);
  }
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
