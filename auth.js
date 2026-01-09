// Authentication Page JavaScript

// Initialize map background
let map;
function initMap() {
  map = L.map("map").setView([40.7128, -74.006], 10); // Default to NYC, will be updated with user location

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
    maxZoom: 19,
  }).addTo(map);

  // Try to get user location for map center
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.setView([latitude, longitude], 10);
      },
      () => {
        // If geolocation fails, keep default location
        console.log("Could not get location for map background");
      }
    );
  }
}

// Initialize map when page loads
document.addEventListener("DOMContentLoaded", () => {
  initMap();
  setupAuthTabs();
  setupLoginForm();
  setupRegisterForm();
});

// Tab switching functionality
function setupAuthTabs() {
  const loginTab = document.getElementById("loginTab");
  const registerTab = document.getElementById("registerTab");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  loginTab.addEventListener("click", () => {
    loginTab.classList.add("text-blue-600", "border-blue-600");
    loginTab.classList.remove("text-gray-500");
    registerTab.classList.add("text-gray-500");
    registerTab.classList.remove("text-blue-600", "border-blue-600");
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
  });

  registerTab.addEventListener("click", () => {
    registerTab.classList.add("text-blue-600", "border-blue-600");
    registerTab.classList.remove("text-gray-500");
    loginTab.classList.add("text-gray-500");
    loginTab.classList.remove("text-blue-600", "border-blue-600");
    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
  });
}

// Login form functionality
function setupLoginForm() {
  const loginBtn = document.getElementById("loginBtn");
  const loginError = document.getElementById("loginError");

  loginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    loginError.classList.add("hidden");
    loginError.textContent = "";

    if (!email || !password) {
      loginError.textContent = "Please fill in all fields";
      loginError.classList.remove("hidden");
      return;
    }

    // Check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      // Store current user session
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          email: user.email,
          name: user.name,
          location: user.location,
        })
      );

      // Redirect to dashboard
      window.location.href = "dashboard.html";
    } else {
      loginError.textContent = "Invalid email or password";
      loginError.classList.remove("hidden");
    }
  });
}

// Register form functionality with geolocation
function setupRegisterForm() {
  const registerBtn = document.getElementById("registerBtn");
  const registerError = document.getElementById("registerError");
  const registerSuccess = document.getElementById("registerSuccess");

  registerBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    registerError.classList.add("hidden");
    registerSuccess.classList.add("hidden");
    registerError.textContent = "";
    registerSuccess.textContent = "";

    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById(
      "registerConfirmPassword"
    ).value;
    const locationPermission =
      document.getElementById("locationPermission").checked;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      registerError.textContent = "Please fill in all fields";
      registerError.classList.remove("hidden");
      return;
    }

    if (password !== confirmPassword) {
      registerError.textContent = "Passwords do not match";
      registerError.classList.remove("hidden");
      return;
    }

    if (password.length < 6) {
      registerError.textContent = "Password must be at least 6 characters";
      registerError.classList.remove("hidden");
      return;
    }

    if (!locationPermission) {
      registerError.textContent = "Please grant location permission to proceed";
      registerError.classList.remove("hidden");
      return;
    }

    // Check if user already exists
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.find((u) => u.email === email)) {
      registerError.textContent = "User with this email already exists";
      registerError.classList.remove("hidden");
      return;
    }

    // Get user location
    registerBtn.disabled = true;
    registerBtn.textContent = "Registering...";

    try {
      const location = await getUserLocation();

      // Store user data
      const newUser = {
        name,
        email,
        password, // In production, this should be hashed
        location,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));

      // Store current user session
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          email: newUser.email,
          name: newUser.name,
          location: newUser.location,
        })
      );

      registerSuccess.textContent = "Registration successful! Redirecting...";
      registerSuccess.classList.remove("hidden");

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1500);
    } catch (error) {
      registerBtn.disabled = false;
      registerBtn.textContent = "Create Account";
      registerError.textContent = `Failed to get location: ${error.message}`;
      registerError.classList.remove("hidden");
    }
  });
}

// Get user location using Geolocation API
// function getUserLocation() {
//   return new Promise((resolve, reject) => {
//     if (!navigator.geolocation) {
//       reject(new Error("Geolocation is not supported by your browser"));
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         const location = {
//           latitude: position.coords.latitude,
//           longitude: position.coords.longitude,
//           accuracy: position.coords.accuracy,
//           timestamp: new Date().toISOString(),
//         };
//         resolve(location);
//       },
//       (error) => {
//         let errorMessage = "Failed to retrieve location";
//         switch (error.code) {
//           case error.PERMISSION_DENIED:
//             errorMessage = "Location permission denied by user";
//             break;
//           case error.POSITION_UNAVAILABLE:
//             errorMessage = "Location information is unavailable";
//             break;
//           case error.TIMEOUT:
//             errorMessage = "Location request timed out";
//             break;
//         }
//         reject(new Error(errorMessage));
//       },
//       {
//         enableHighAccuracy: true,
//         timeout: 10000,
//         maximumAge: 0,
//       }
//     );
//   });
// }

function getUserLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        const address = await getAddressFromCoordinates(latitude, longitude);

        // update map with popup
        L.marker([latitude, longitude])
          .addTo(map)
          .bindPopup(address)
          .openPopup();

        resolve({
          latitude,
          longitude,
          address,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString(),
        });
      },
      (err) => reject(new Error("Location error"))
    );
  });
}

async function getAddressFromCoordinates(lat, lon) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
    {
      headers: {
        Accept: "application/json",
        "User-Agent": "AuthMapDemo/1.0",
      },
    }
  );

  if (!res.ok) throw new Error("Address fetch failed");

  const data = await res.json();
  //return data.display_name;

  const addr = data.address;
  const fullAddress = `${addr.house_number || ""} ${addr.road || ""}, ${
    addr.suburb || ""
  }, ${addr.city || addr.town || addr.village || ""}, ${addr.state || ""}, ${
    addr.postcode || ""
  }, ${addr.country || ""}`
    .replace(/ ,/g, ",") // remove empty commas
    .replace(/^,|,$/g, "") // trim commas
    .trim();

  return fullAddress || data.display_name;
}
