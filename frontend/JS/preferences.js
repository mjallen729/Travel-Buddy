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
    const travelStyleSelect = document.getElementById("select-travel-style");
    travelStyleSelect.value = user.travelPreferences.travelStyle;
  }

  if (user.travelPreferences.accommodationStyle) {
    const travelAccommodationSelect = document.getElementById(
      "select-accommodation-style",
    );
    travelAccommodationSelect.value = user.travelPreferences.accommodationStyle;
  }

  if (user.travelPreferences.budgetRange) {
    const travelBudgetSelect = document.getElementById("select-budget-range");
    travelBudgetSelect.value = user.travelPreferences.budgetRange;
  }

  user.travelPreferences.interests.forEach((interest) => {
    //console.log(interest);
    const checkbox = document.querySelector(
      `#select-interests input[type="checkbox"][value="${interest}"]`,
    );
    if (checkbox) {
      checkbox.checked = true;
    }
  });
});

document
  .getElementById("preferencesForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = e.target;

    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      // Redirect to login if not authenticated
      window.location.href = "./auth.html";
      return;
    }
    const user = JSON.parse(currentUser);
    const userId = user._id;
    //console.log(userId)
    const data = {
      travelPreferences: {
        travelStyle: form.travelStyle.value,
        budgetRange: form.budgetRange.value,
        accommodationStyle: form.accommodationStyle.value,
        interests: Array.from(
          form.querySelectorAll(
            '#select-interests input[type="checkbox"]:checked',
          ),
        ).map((i) => i.value),
      },
    };

    try {
      const response = await fetch(
        `${appConfig.API_BASE}/users/profile/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      const result = await response.json();

      if (response.ok) {
        document.getElementById("successMsg").style.display = "block";
        //Refresh localstorage so new preferences apply to the create a trip page
        //console.log('✅ Preferences saved:', JSON.stringify(result))
        logger.info("✅ Preferences saved:", JSON.stringify(result));
        localStorage.setItem("currentUser", JSON.stringify(result));
      } else {
        //console.error('❌ Server error:', result.error);
        logger.error("❌ Server error:", result.error);
        alert(result.error || "Failed to save preferences.");
      }
    } catch (error) {
      //console.error('❌ Network error:', error);
      logger.error("❌ Network error:", error);
      alert("Network error. Please try again.");
    }
  });
