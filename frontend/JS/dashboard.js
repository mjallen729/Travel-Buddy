// Dashboard functionality
import appConfig from "./appConfig.js";
import logger from "./utils/logger.js";

document.addEventListener("DOMContentLoaded", function () {
  logger.debug("Initializing dashboard");

  // Check if user is logged in
  const currentUser = localStorage.getItem("currentUser");

  if (!currentUser) {
    logger.warn("Unauthorized access attempt to dashboard");
    // Redirect to login if not authenticated
    window.location.href = "./auth.html";
    return;
  }

  const user = JSON.parse(currentUser);
  logger.info("User loaded dashboard", { userId: user._id });

  // Update user name in welcome message
  const userNameElement = document.getElementById("user-name");
  if (userNameElement) {
    userNameElement.textContent = user.firstName || user.username;
  }

  // Load user data
  loadUserData(user._id);

  // Setup event listeners
  setupEventListeners();

  // Highlight nav link on scroll
  const dashboardHero = document.querySelector(".dashboard-hero");
  if (dashboardHero) {
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

// Load user trips and collaborations
async function loadUserData(userId) {
  try {
    logger.debug("Loading user data", { userId });

    const tripResponse = await fetch(
      `${appConfig.API_BASE}/trips/user/${userId}`,
    );
    const collabResponse = await fetch(
      `${appConfig.API_BASE}/collaboration/user/${userId}`,
    );

    const trips = await tripResponse.json();
    const collaborations = await collabResponse.json();

    logger.info("User data loaded", {
      userId,
      tripCount: trips.length,
      collaborationCount: collaborations.length,
    });

    // Update stats
    updateStats(trips, collaborations);

    // Render trips
    renderTrips(trips, false);

    // Render collaborations
    renderCollaborations(collaborations);
  } catch (error) {
    logger.error("Failed to load user data", {
      userId,
      error: error.message,
    });
    showError("Failed to load your data. Please try again.");
  }
}

// Update dashboard statistics
function updateStats(trips, collaborations) {
  logger.debug("Updating dashboard statistics");

  const tripsCount = document.getElementById("trips-count");
  const collabsCount = document.getElementById("collabs-count");
  const destinationsCount = document.getElementById("destinations-count");

  if (tripsCount) tripsCount.textContent = trips.length || 0;
  if (collabsCount) collabsCount.textContent = collaborations.length || 0;

  // Count unique destinations
  const destinations = new Set();
  trips.forEach((trip) => {
    if (trip.destination) destinations.add(trip.destination);
  });
  if (destinationsCount) destinationsCount.textContent = destinations.size || 0;

  logger.info("Dashboard statistics updated", {
    trips: trips.length,
    collaborations: collaborations.length,
    uniqueDestinations: destinations.size,
  });
}

// Render trips in the trips grid
function renderTrips(trips, query) {
  logger.debug("Rendering trips grid", { tripCount: trips.length });

  const tripsGrid = document.getElementById("trips-grid");
  if (!tripsGrid) {
    logger.warn("Trips grid element not found");
    return;
  }

  if (trips.length === 0 && !query) {
    logger.info("No trips to display");
    tripsGrid.innerHTML = `
      <div class="loading-card">
        <i class="fas fa-plane"></i>
        <h3>No trips yet</h3>
        <p>Start planning your first adventure!</p>
      </div>
    `;
    return;
  }

  if (trips.length === 0 && query) {
    logger.info("No trips to display");
    tripsGrid.innerHTML = `
      <div class="empty-query">
      </div>
      <div class="empty-query">
        <h1>No Trips Found!</h1>
      </div>
      <div class="empty-query">
      </div>
    `;
    return;
  }

  tripsGrid.innerHTML = trips
    .map(
      (trip) => `
    <div class="trip-card">
      <div class="trip-header">
        <div class="trip-title">${trip.tripName}</div>
        <div class="trip-destination">${trip.destination}</div>
      </div>
      <div class="trip-body">
        <div class="trip-dates">
          <span>${formatDate(trip.startDate)}</span>
          <span>${formatDate(trip.endDate)}</span>
        </div>
        <div class="trip-budget">Budget: $${trip.budget?.toLocaleString() || "N/A"}</div>
        <div class="trip-status ${trip.status}">${trip.status}</div>
        <div class="trip-actions">
          <button class="trip-btn primary" onclick="viewTrip('${trip._id}')">
            <i class="fas fa-eye"></i> View
          </button>
          <button class="trip-btn secondary" onclick="editTrip('${trip._id}')">
            <i class="fas fa-edit"></i> Edit
          </button>
        </div>
      </div>
    </div>
  `,
    )
    .join("");

  logger.info("Trips grid rendered", { tripCount: trips.length });
}

// Render collaborations in the collaborations grid
function renderCollaborations(collaborations) {
  logger.debug("Rendering collaborations grid", {
    collaborationCount: collaborations.length,
  });

  const collabsGrid = document.getElementById("collaborations-grid");
  if (!collabsGrid) {
    logger.warn("Collaborations grid element not found");
    return;
  }

  if (collaborations.length === 0) {
    logger.info("No collaborations to display");
    collabsGrid.innerHTML = `
      <div class="loading-card">
        <i class="fas fa-users"></i>
        <h3>No collaborations yet</h3>
        <p>When friends share trips with you, they'll appear here.</p>
      </div>
    `;
    return;
  }

  collabsGrid.innerHTML = collaborations
    .map(
      (collab) => `
    <div class="collab-card">
      <div class="collab-header">
        <div class="collab-avatar">
          <i class="fas fa-user"></i>
        </div>
        <div class="collab-info">
          <h3>Shared Trip</h3>
          <p>Trip ID: ${collab.tripId}</p>
        </div>
      </div>
      <div class="collab-role">${collab.role}</div>
      <p>Status: ${collab.status}</p>
      <button class="trip-btn primary" onclick="viewCollaboration('${collab._id}')">
        <i class="fas fa-eye"></i> View Trip
      </button>
    </div>
  `,
    )
    .join("");

  logger.info("Collaborations grid rendered", {
    collaborationCount: collaborations.length,
  });
}

// Setup event listeners
function setupEventListeners() {
  logger.debug("Setting up dashboard event listeners");

  // Logout button
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  // Create trip button
  const createTripBtn = document.getElementById("create-trip-btn");
  if (createTripBtn) {
    createTripBtn.addEventListener("click", createNewTrip);
  }

  // Quick action buttons
  const planTripBtn = document.getElementById("plan-trip-btn");
  if (planTripBtn) {
    planTripBtn.addEventListener("click", createNewTrip);
  }

  const shareTripBtn = document.getElementById("share-trip-btn");
  if (shareTripBtn) {
    shareTripBtn.addEventListener("click", () => {
      logger.info("Share trip button clicked");
      showMessage("Share trip functionality coming soon!", "info");
    });
  }

  const findInspirationBtn = document.getElementById("find-inspiration-btn");
  if (findInspirationBtn) {
    findInspirationBtn.addEventListener("click", () => {
      logger.info("Find inspiration button clicked");
      showMessage("Inspiration feature coming soon!", "info");
    });
  }

  const viewStatsBtn = document.getElementById("view-stats-btn");
  if (viewStatsBtn) {
    viewStatsBtn.addEventListener("click", () => {
      logger.info("View stats button clicked");
      showMessage("Travel statistics coming soon!", "info");
    });
  }

  // Search Listener
  const currentUser = localStorage.getItem("currentUser");
  const user = JSON.parse(currentUser);
  const searchForm = document.getElementById("search-form");

  searchForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const query = document.getElementById("trip-search").value;
    const startRange = document.getElementById("trip-start-date").value;
    const endRange = document.getElementById("trip-end-date").value;

    const start = new Date(startRange);
    const end = new Date(endRange);

    if (end) {
      if (start >= end) {
        logger.error("Trip query failed - invalid date range", {
          startRange,
          endRange,
        });
      }
    }

    if (startRange) {
      if (startRange < new Date()) {
        logger.error("Trip query failed - past start date", {
          startRange,
        });
      }
    }

    if (!query && !startRange && !endRange) {
      loadUserData(user._id);
    } else {
      try {
        let parts = [query || "", startRange || "", endRange || ""];

        const newQuery = parts.join(";");

        const tripResponse = await fetch(
          `${appConfig.API_BASE}/trips/search/${encodeURIComponent(newQuery)}?${encodeURIComponent(user._id)}`,
        );

        if (!tripResponse.ok) throw "Failed to fetch";

        const trips = await tripResponse.json();
        renderTrips(trips, true);
      } catch (e) {
        logger.error("Trip search failed", { error: e });
        showError(e);
      }
    }
  });

  logger.info("Dashboard event listeners setup complete");
}

// Logout function
function logout() {
  logger.info("User logging out");
  localStorage.removeItem("currentUser");
  window.location.href = "../index.html";
}

// Create new trip
function createNewTrip() {
  logger.info("Create new trip requested");
  window.location.href = "./createtrip.html";
}

// View trip details
function viewTrip(tripId) {
  logger.info("View trip requested", { tripId });
  window.location.href = `./viewtrip.html?tripId=${tripId}`;
  return;
}

// Edit trip
function editTrip(tripId) {
  logger.info("Edit trip requested", { tripId });
  window.location.href = `./edittrip.html?tripId=${tripId}`;
  return;
}

// View collaboration
function viewCollaboration(collabId) {
  logger.info("View collaboration requested", { collabId });
  showMessage(
    `Viewing collaboration ${collabId} - details coming soon!`,
    "info",
  );
}

// Utility functions
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

function showMessage(message, type = "info") {
  logger.debug("Showing dashboard message", { type, message });

  // Create message element
  const messageEl = document.createElement("div");
  messageEl.className = `dashboard-message ${type}`;
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

function showError(message) {
  showMessage(message, "error");
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
window.viewTrip = viewTrip;
window.editTrip = editTrip;
