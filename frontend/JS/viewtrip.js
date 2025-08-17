import appConfig from "./appConfig.js";
import logger from "./utils/logger.js";

document.addEventListener("DOMContentLoaded", async function () {
  const params = new URLSearchParams(window.location.search);
  const tripId = params.get("tripId");
  if (!tripId) {
    showMessage("Missing trip ID in URL", "error");
    return;
  }

  //Change this when collaborations are added
  const currentUser = localStorage.getItem("currentUser");

  if (!currentUser) {
    // Redirect to login if not authenticated
    window.location.href = "./auth.html";
    return;
  }

  try {
    // Fetch trip from backend
    const response = await fetch(`${appConfig.API_BASE}/trips/${tripId}`, {
      method: "GET",
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Trip not found");
    }

    let trip = await response.json();
    //console.log(trip);
    logger.info("Viewing trip:", trip);

    document.getElementById("trip-title").textContent =
      `${trip.tripName} | Travel Buddy`;
    document.getElementById("trip-name").textContent = trip.tripName;
    document.getElementById("trip-destination").textContent = trip.destination;
    document.getElementById("trip-start-date").textContent = formatDate(
      trip.startDate,
    );
    document.getElementById("trip-end-date").textContent = formatDate(
      trip.endDate,
    );
    document.getElementById("trip-budget").textContent = trip.budget;
    document.getElementById("trip-budget-range").textContent =
      trip.preferences.budgetRange;
    document.getElementById("trip-travel-style").textContent =
      trip.preferences.travelStyle;
    document.getElementById("trip-accommodation-style").textContent =
      trip.preferences.accommodationStyle;
    document.getElementById("trip-interests").textContent =
      trip.preferences.interests;
    document.getElementById("trip-status").textContent = trip.status;
    document.getElementById("last-updated").textContent = formatDate(
      trip.updatedAt,
    );
    document.getElementById("created-on").textContent = formatDate(
      trip.createdAt,
    );

    // Check for existing AI-generated content and display it
    displayExistingAIContent(trip);

    document.getElementById("return").addEventListener("click", function () {
      window.location.href = "./dashboard.html#trips";
    });

    document.getElementById("edit").addEventListener("click", function () {
      window.location.href = `./edittrip.html?tripId=${tripId}`;
    });

    document
      .getElementById("generate-ai-content")
      .addEventListener("click", async function () {
        try {
          // Check if AI content already exists
          const hasExistingContent = hasAnyAIContent(trip);

          if (hasExistingContent) {
            const existingContentTypes = [];
            if (
              trip.activities &&
              Array.isArray(trip.activities) &&
              trip.activities.length > 0
            ) {
              existingContentTypes.push("Itinerary");
            }
            if (
              trip.recommendations &&
              ((trip.recommendations.attractions &&
                trip.recommendations.attractions.length > 0) ||
                (trip.recommendations.restaurants &&
                  trip.recommendations.restaurants.length > 0) ||
                (trip.recommendations.experiences &&
                  trip.recommendations.experiences.length > 0))
            ) {
              existingContentTypes.push("Recommendations");
            }
            if (
              trip.travelTips &&
              Array.isArray(trip.travelTips) &&
              trip.travelTips.length > 0
            ) {
              existingContentTypes.push("Travel Tips");
            }

            const confirmMessage = `This trip already has AI-generated content:\n• ${existingContentTypes.join("\n• ")}\n\nDo you want to regenerate it? This will replace all existing AI content.`;

            const userConfirmed = confirm(confirmMessage);
            if (!userConfirmed) {
              return;
            }
          }

          showMessage(
            "Generating AI content... This may take a moment.",
            "info",
          );

          // Update button state
          const generateBtn = document.getElementById("generate-ai-content");
          const originalText = generateBtn.innerHTML;
          generateBtn.innerHTML =
            '<i class="fas fa-spinner fa-spin"></i><span>Generating...</span>';
          generateBtn.disabled = true;

          // Call the AI content generation endpoints
          // Generate the tips and recs first
          await Promise.all([
            fetch(
              `${appConfig.API_BASE}/trips/${tripId}/generate-recommendations`,
              { method: "POST" },
            ),
            fetch(`${appConfig.API_BASE}/trips/${tripId}/generate-tips`, {
              method: "POST",
            }),
          ]);
          // Generate the itinerary last
          await fetch(
            `${appConfig.API_BASE}/trips/${tripId}/generate-itinerary`,
            { method: "POST" },
          );

          // Fetch the updated trip data
          const response = await fetch(
            `${appConfig.API_BASE}/trips/${tripId}`,
            { method: "GET" },
          );

          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "Trip not found");
          }

          const updatedTrip = await response.json();

          // Update the global trip variable
          trip = updatedTrip;

          // Display the new AI content
          displayExistingAIContent(updatedTrip);

          showMessage("AI content generated successfully!", "success");

          // Reset button
          generateBtn.innerHTML = originalText;
          generateBtn.disabled = false;
        } catch (err) {
          showMessage("Error generating AI content: " + err.message, "error");
          logger.error("Error generating AI content: " + err.message);

          // Reset button on error
          const generateBtn = document.getElementById("generate-ai-content");
          generateBtn.innerHTML =
            '<i class="fas fa-robot"></i><span>Generate AI Content</span>';
          generateBtn.disabled = false;
        }
      });
  } catch (err) {
    showMessage("Could not load trip: " + err.message, "error");
    logger.error("Could not load trip: " + err.message);
  }
});

// Helper function to check if the trip has any AI-generated content
function hasAnyAIContent(trip) {
  return (
    trip.activities &&
    Array.isArray(trip.activities) &&
    trip.activities.length > 0
  );
}

// Helper function to display existing AI content
function displayExistingAIContent(trip) {
  const aiContentDiv = document.getElementById("ai-content");
  aiContentDiv.innerHTML = ""; // Clear existing content

  let hasContent = false;

  // Display Itinerary
  if (trip.activities) {
    try {
      const activities =
        typeof trip.activities === "string"
          ? JSON.parse(trip.activities)
          : trip.activities;
      if (activities && activities.length > 0) {
        let itineraryHtml =
          '<div class="ai-section"><h3><i class="fas fa-calendar-alt"></i> Itinerary</h3>';
        activities.forEach((day) => {
          itineraryHtml += `<div class="day-section"><h4>Day ${day.day} - ${formatDate(day.date)}</h4>`;
          if (day.items && day.items.length > 0) {
            day.items.forEach((item) => {
              itineraryHtml += `<div class="activity-item">
                <strong>${item.time}:</strong> ${item.title} 
                <span class="activity-type">(${item.type})</span>
              </div>`;
            });
          }
          itineraryHtml += "</div>";
        });
        itineraryHtml += "</div>";
        aiContentDiv.innerHTML += itineraryHtml;
        hasContent = true;
      }
    } catch (err) {
      console.error("Error parsing activities:", err);
    }
  }

  // Display Recommendations
  if (trip.recommendations) {
    try {
      const recommendations =
        typeof trip.recommendations === "string"
          ? JSON.parse(trip.recommendations)
          : trip.recommendations;
      if (
        recommendations &&
        (recommendations.attractions ||
          recommendations.restaurants ||
          recommendations.experiences)
      ) {
        let recsHtml =
          '<div class="ai-section"><h3><i class="fas fa-star"></i> Recommendations</h3>';

        if (
          recommendations.attractions &&
          recommendations.attractions.length > 0
        ) {
          recsHtml +=
            '<div class="recommendation-category"><h4><i class="fas fa-map-marker-alt"></i> Attractions</h4>';
          recommendations.attractions.forEach((item) => {
            recsHtml += `<div class="recommendation-item">
              <strong>${item.name}</strong>
              <p>${item.description}</p>
              ${item.location ? `<small><i class="fas fa-location-dot"></i> ${item.location}</small>` : ""}
              ${item.rating ? `<div class="rating">Rating: ${item.rating}/5</div>` : ""}
            </div>`;
          });
          recsHtml += "</div>";
        }

        if (
          recommendations.restaurants &&
          recommendations.restaurants.length > 0
        ) {
          recsHtml +=
            '<div class="recommendation-category"><h4><i class="fas fa-utensils"></i> Restaurants</h4>';
          recommendations.restaurants.forEach((item) => {
            recsHtml += `<div class="recommendation-item">
              <strong>${item.name}</strong>
              <p>${item.description}</p>
              ${item.location ? `<small><i class="fas fa-location-dot"></i> ${item.location}</small>` : ""}
              ${item.rating ? `<div class="rating">Rating: ${item.rating}/5</div>` : ""}
            </div>`;
          });
          recsHtml += "</div>";
        }

        if (
          recommendations.experiences &&
          recommendations.experiences.length > 0
        ) {
          recsHtml +=
            '<div class="recommendation-category"><h4><i class="fas fa-heart"></i> Experiences</h4>';
          recommendations.experiences.forEach((item) => {
            recsHtml += `<div class="recommendation-item">
              <strong>${item.name}</strong>
              <p>${item.description}</p>
              ${item.location ? `<small><i class="fas fa-location-dot"></i> ${item.location}</small>` : ""}
              ${item.rating ? `<div class="rating">Rating: ${item.rating}/5</div>` : ""}
            </div>`;
          });
          recsHtml += "</div>";
        }

        recsHtml += "</div>";
        aiContentDiv.innerHTML += recsHtml;
        hasContent = true;
      }
    } catch (err) {
      console.error("Error parsing recommendations:", err);
    }
  }

  // Display Travel Tips
  if (trip.travelTips) {
    try {
      const travelTips =
        typeof trip.travelTips === "string"
          ? JSON.parse(trip.travelTips)
          : trip.travelTips;
      if (travelTips && travelTips.length > 0) {
        let tipsHtml =
          '<div class="ai-section"><h3><i class="fas fa-lightbulb"></i> Travel Tips</h3>';
        travelTips.forEach((tip) => {
          tipsHtml += `<div class="tip-item">
            <h5>${tip.title}</h5>
            <p>${tip.content}</p>
            ${tip.category ? `<span class="tip-category">${tip.category}</span>` : ""}
          </div>`;
        });
        tipsHtml += "</div>";
        aiContentDiv.innerHTML += tipsHtml;
        hasContent = true;
      }
    } catch (err) {
      console.error("Error parsing travel tips:", err);
    }
  }

  // Show empty state if no content
  if (!hasContent) {
    aiContentDiv.innerHTML = `
      <div class="ai-content-empty">
        <i class="fas fa-robot"></i>
        <h4>No AI Content Generated Yet</h4>
        <p>Click the "Generate AI Content" button to create a personalized itinerary, recommendations, and travel tips for your trip.</p>
      </div>
    `;
  }
}

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

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
