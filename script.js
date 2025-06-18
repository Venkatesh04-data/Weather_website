const apiKey = "a6bfc1217e8ba74976e0dc1e2fb814ed";

const homeSection = document.getElementById("homeSection");
const forecastSection = document.getElementById("forecastSection");
const aboutSection = document.getElementById("aboutSection");
const navLinks = document.querySelectorAll(".nav-link");

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const loading = document.getElementById("loading");
const weatherInfo = document.getElementById("weatherInfo");
const forecastContainer = document.getElementById("forecastContainer");

function showSection(section) {
  [homeSection, forecastSection, aboutSection].forEach((sec) => {
    sec.classList.remove("active");
  });

  section.classList.add("active");
}

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    navLinks.forEach((lnk) => lnk.classList.remove("active"));
    link.classList.add("active");
    const sectionName = link.getAttribute("data-section");

    if (sectionName === "home") showSection(homeSection);
    else if (sectionName === "forecast") {
      showSection(forecastSection);
      if (lastCity) fetchForecast(lastCity);
    }
    else if (sectionName === "about") showSection(aboutSection);
  });
});

let lastCity = "";

async function fetchCurrentWeather(city) {
  loading.hidden = false;
  weatherInfo.innerHTML = "";
  forecastContainer.innerHTML = "";

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`
    );
    if (!response.ok) throw new Error("City not found");
    const data = await response.json();

    lastCity = city;
    displayCurrentWeather(data);
  } catch (error) {
    weatherInfo.innerHTML = `<h2>Error</h2><p>${error.message}</p>`;
  } finally {
    loading.hidden = true;
  }
}

function displayCurrentWeather(data) {
  const { name, main, weather, sys, wind } = data;

  // Set background based on weather condition
  setBackground(weather[0].main);

  weatherInfo.innerHTML = `
    <h2>Weather in ${name}, ${sys.country}</h2>
    <p><strong>Temperature:</strong> ${main.temp} °C</p>
    <p><strong>Feels Like:</strong> ${main.feels_like} °C</p>
    <p><strong>Humidity:</strong> ${main.humidity} %</p>
    <p><strong>Wind Speed:</strong> ${wind.speed} m/s</p>
    <p><strong>Condition:</strong> ${weather[0].description}</p>
    <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="${weather[0].description}" />
  `;
}

async function fetchForecast(city) {
  loading.hidden = false;
  forecastContainer.innerHTML = "";

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`
    );
    if (!response.ok) throw new Error("City not found");
    const data = await response.json();

    displayForecast(data);
  } catch (error) {
    forecastContainer.innerHTML = `<p style="text-align:center; color:#ffaaaa;">${error.message}</p>`;
  } finally {
    loading.hidden = true;
  }
}

function displayForecast(data) {
  // Clear existing
  forecastContainer.innerHTML = "";

  // The API returns data every 3 hours (40 data points for 5 days)
  // We will take one forecast per day at around 12:00 PM
  const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00"));

  dailyData.forEach(day => {
    const date = new Date(day.dt * 1000);
    const dayName = date.toLocaleDateString(undefined, { weekday: "short" });
    const iconUrl = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;

    const card = document.createElement("div");
    card.className = "forecast-card";

    card.innerHTML = `
      <h3>${dayName}</h3>
      <img src="${iconUrl}" alt="${day.weather[0].description}" />
      <p><strong>${day.main.temp.toFixed(1)}°C</strong></p>
      <p>${day.weather[0].description}</p>
    `;

    forecastContainer.appendChild(card);
  });
}

function setBackground(condition) {
  // You can expand this with more weather conditions and better images
  let url = "";
  switch (condition.toLowerCase()) {
    case "clear":
      url = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80";
      break;
    case "clouds":
      url = "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80";
      break;
    case "rain":
    case "drizzle":
      url = "https://images.unsplash.com/photo-1526676039686-8f70e4f0447e?auto=format&fit=crop&w=1600&q=80";
      break;
    case "thunderstorm":
      url = "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1600&q=80";
      break;
    case "snow":
      url = "https://images.unsplash.com/photo-1607082342750-d7c96d24e2a0?auto=format&fit=crop&w=1600&q=80";
      break;
    case "mist":
    case "fog":
      url = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80"; // fallback
      break;
    default:
      url = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80";
  }

  document.body.style.backgroundImage = `url(${url})`;
}

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    fetchCurrentWeather(city);
  }
});

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});
