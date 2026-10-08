const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const country = document.getElementById("country");
const city = document.getElementById("city");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const visibility = document.getElementById("visibility");
const pressure = document.getElementById("pressure");
const forecastGrid = document.getElementById("forecastGrid");
const errorMessage = document.getElementById("errorMessage");
const searchBtn = document.getElementById("searchBtn");

function clearWeather() {
  city.textContent = "";
  country.textContent = "";
  temperature.textContent = "";
  description.textContent = "";
  feelsLike.textContent = "";
  humidity.textContent = "";
  wind.textContent = "";
  visibility.textContent = "";
  pressure.textContent = "";
  weatherIcon.textContent = "";
  forecastGrid.innerHTML = "";
}
async function getLocation(cityName) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=en&format=json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch location");
  }
  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error("City not found");
  }
  const location = data.results[0];
  return location;
}
async function getWeather(latitude, longitude) {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,apparent_temperature,surface_pressure,visibility,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min`;
  const weatherResponse = await fetch(weatherUrl);

  if (!weatherResponse.ok) {
    throw new Error("Failed to fetch weather");
  }

  const weatherData = await weatherResponse.json();
  return weatherData
}
function displayCurrentWeather(current, location) {
  temperature.textContent = `${Math.round(current.temperature_2m)}°C`;

  humidity.textContent = `${current.relative_humidity_2m}%`;
  wind.textContent = `${current.wind_speed_10m} km/h`;
  feelsLike.textContent = `${Math.round(current.apparent_temperature)}°C`;
  pressure.textContent = `${current.surface_pressure} hPa`;
  visibility.textContent = `${current.visibility / 1000} km`;
  city.textContent = location.name;
  country.textContent = location.country;
  const descriptionText = weatherDescription[current.weather_code];
  description.textContent = descriptionText;
  weatherIcon.textContent = weatherIcons[current.weather_code];
}
  const weatherDescription = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      61: "Rain",
      63: "Moderate rain",
      65: "Heavy rain",
      71: "Light snow",
      73: "Moderate snow",
      75: "Heavy snow",
      80: "Rain showers",
      81: "Moderate rain showers",
      82: "Heavy rain showers",
      95: "Thunderstorm",
      96: "Thunderstorm with hail",
      99: "Thunderstorm with heavy hail",
    };


    // weather
    const weatherIcons = {
      0: "☀️",
      1: "🌤️",
      2: "⛅",
      3: "☁️",
      45: "🌫️",
      48: "🌫️",
      51: "🌦️",
      53: "🌦️",
      55: "🌧️",
      61: "🌧️",
      63: "🌧️",
      65: "🌧️",
      71: "🌨️",
      73: "❄️",
      75: "❄️",
      80: "🌦️",
      81: "🌦️",
      82: "🌧️",
      95: "⛈️",
      96: "⛈️",
      99: "⛈️",
    };
searchForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  searchBtn.textContent = "Searching...";
  searchBtn.disabled = true;
  const cityName = cityInput.value.trim();
  if (cityName === "") {
    errorMessage.textContent = "Please enter a city";
    searchBtn.textContent = "Search";
    return;
  }
  errorMessage.textContent = "";
  try {
    const location = await getLocation(cityName);
    const weatherData=await getWeather(
      location.latitude,
      location.longitude
    );
   displayCurrentWeather(weatherData.current, location);

    // 5 day info
    const daily = weatherData.daily;
    const forecastData = daily.time.map((date, index) => {
      const forecast = {
        date: date,
        code: daily.weather_code[index],
        max: daily.temperature_2m_max[index],
        min: daily.temperature_2m_min[index],
      };
      return forecast;
    });

    forecastGrid.innerHTML = "";

    forecastGrid.innerHTML = "";
    forecastData.forEach((forecast) => {
      const card = document.createElement("div");
      card.classList.add("forecast-card");

      const date = new Date(forecast.date);
      const formattedDate = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      const dateElement = document.createElement("p");
      dateElement.classList.add("forecast-day");
      dateElement.textContent = formattedDate;
      card.append(dateElement);

      const icon = document.createElement("div");
      icon.classList.add("forecast-icon");
      icon.textContent = weatherIcons[forecast.code];
      card.append(icon);

      const temp = document.createElement("strong");
      temp.textContent = Math.round(forecast.max) + "°C";
      card.append(temp);

      const tempMin = document.createElement("span");
      tempMin.textContent = Math.round(forecast.min) + "°C";
      card.append(tempMin);
      forecastGrid.append(card);

      const descriptionElement = document.createElement("p");
      descriptionElement.textContent = weatherDescription[forecast.code];
      card.append(descriptionElement);
    });
  } catch (error) {
    console.error(error);
    errorMessage.textContent = error.message;
    errorMessage.style.display="block";
    clearWeather();
  }
  searchBtn.textContent = "Search";
  searchBtn.disabled = false;
});
