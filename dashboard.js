// Dashboard Page JavaScript

let userMap;
let barChart;
let pieChart;

// Check authentication
document.addEventListener("DOMContentLoaded", () => {
  checkAuthentication();
  initSidebar();
  initMap();
  initCharts();
  setupLogout();
});

// Check if user is authenticated
function checkAuthentication() {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    window.location.href = "index.html";
    return;
  }
}

// Initialize sidebar menu functionality
function initSidebar() {
  const menuButtons = document.querySelectorAll(".menu-button");

  menuButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const menuItem = button.closest(".menu-item");
      const submenu = menuItem.querySelector(".submenu");
      const arrow = button.querySelector("svg:last-child");

      // Toggle active state
      const isActive = button.classList.contains("active");

      // Close all other menus
      menuButtons.forEach((btn) => {
        if (btn !== button) {
          btn.classList.remove("active");
          btn
            .closest(".menu-item")
            .querySelector(".submenu")
            .classList.add("hidden");
          btn.querySelector("svg:last-child").style.transform = "rotate(0deg)";
        }
      });

      // Toggle current menu
      if (isActive) {
        button.classList.remove("active");
        submenu.classList.add("hidden");
        arrow.style.transform = "rotate(0deg)";
      } else {
        button.classList.add("active");
        submenu.classList.remove("hidden");
        arrow.style.transform = "rotate(180deg)";
      }
    });
  });
}

// Initialize user location map
function initMap() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // Wait for map container to be ready
  setTimeout(() => {
    if (!currentUser || !currentUser.location) {
      console.error("User location not found");
      // Initialize map with default location
      userMap = L.map("userMap").setView([40.7128, -74.006], 10);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(userMap);
      return;
    }

    const { latitude, longitude } = currentUser.location;

    // Initialize map centered on user location
    userMap = L.map("userMap").setView([latitude, longitude], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(userMap);

    // Add marker for user location
    const marker = L.marker([latitude, longitude]).addTo(userMap);
    // marker.bindPopup(`<b>User Location</b><br>Name: ${currentUser.name || 'User'}<br>Lat: ${latitude.toFixed(6)}<br>Lng: ${longitude.toFixed(6)}`).openPopup();
    marker
      .bindPopup(
        `<b>User Location</b><br>Name: ${
          currentUser.name || "User"
        }<br>Address: ${
          currentUser.location.address || "N/A"
        }<br>Lat: ${latitude.toFixed(6)}<br>Lng: ${longitude.toFixed(6)}`
      )
      .openPopup();

    // Add circle to show accuracy if available
    if (currentUser.location.accuracy) {
      L.circle([latitude, longitude], {
        radius: currentUser.location.accuracy,
        fillColor: "#3b82f6",
        fillOpacity: 0.2,
        color: "#2563eb",
        weight: 2,
      }).addTo(userMap);
    }

    // Invalidate size to ensure map renders correctly
    setTimeout(() => {
      if (userMap) {
        userMap.invalidateSize();
      }
    }, 200);
  }, 100);
}

// Initialize charts
function initCharts() {
  initBarChart();
  initPieChart();
}

// Initialize bar chart
function initBarChart() {
  const ctx = document.getElementById("barChart").getContext("2d");

  barChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["January", "February", "March", "April", "May", "June"],
      datasets: [
        {
          label: "Activity Count",
          data: [45, 59, 80, 81, 56, 55],
          backgroundColor: "rgba(59, 130, 246, 0.6)",
          borderColor: "rgba(59, 130, 246, 1)",
          borderWidth: 1,
        },
        {
          label: "Transactions",
          data: [28, 48, 40, 19, 86, 27],
          backgroundColor: "rgba(34, 197, 94, 0.6)",
          borderColor: "rgba(34, 197, 94, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 20,
          },
        },
      },
    },
  });
}

// Initialize pie chart
function initPieChart() {
  const ctx = document.getElementById("pieChart").getContext("2d");

  pieChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Active Users", "Pending", "Inactive", "Suspended"],
      datasets: [
        {
          label: "Distribution",
          data: [45, 25, 20, 10],
          backgroundColor: [
            "rgba(59, 130, 246, 0.8)",
            "rgba(34, 197, 94, 0.8)",
            "rgba(234, 179, 8, 0.8)",
            "rgba(239, 68, 68, 0.8)",
          ],
          borderColor: [
            "rgba(59, 130, 246, 1)",
            "rgba(34, 197, 94, 1)",
            "rgba(234, 179, 8, 1)",
            "rgba(239, 68, 68, 1)",
          ],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
        },
        title: {
          display: false,
        },
      },
    },
  });
}

// Setup logout functionality
function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");

  logoutBtn.addEventListener("click", () => {
    // Clear current user session
    localStorage.removeItem("currentUser");

    // Redirect to login page
    window.location.href = "index.html";
  });
}
