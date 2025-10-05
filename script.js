const apiKey = "f3437fa91caeb6b10f5aac10a85ac503"; // 🔹 Replace with your OpenWeather key

// Elements
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const cityName = document.getElementById("cityName");
const dateText = document.getElementById("dateText");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const weatherIcon = document.getElementById("weatherIcon");
const infoBanner = document.getElementById("infoBanner");
const realFeel = document.getElementById("realFeel");
const windSpeed = document.getElementById("windSpeed");
const humidity = document.getElementById("humidity");
const pressure = document.getElementById("pressure");
const forecast = document.getElementById("forecast");
const aqiValue = document.getElementById("aqiValue");
const aqiStatus = document.getElementById("aqiStatus");
const voiceBtn = document.getElementById("voiceBtn");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

// ====== Date Time ======
setInterval(() => {
  const now = new Date();
  document.getElementById("datetime").textContent = now.toUTCString();
}, 1000);

// ====== Fetch Weather ======
async function fetchWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.cod !== 200) {
    infoBanner.textContent = "City not found.";
    return;
  }

  // Convert country code to full country name
  const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
  const countryName = regionNames.of(data.sys.country);

  cityName.textContent = `${data.name}, ${countryName}`;
  dateText.textContent = new Date().toDateString();
  temperature.textContent = `${Math.round(data.main.temp)}°C`;
  description.textContent = data.weather[0].description;
  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  realFeel.textContent = `${Math.round(data.main.feels_like)}°C`;
  windSpeed.textContent = `${data.wind.speed} km/h`;
  humidity.textContent = `${data.main.humidity}%`;
  pressure.textContent = `${data.main.pressure} hPa`;
  infoBanner.textContent = `Today in ${data.name}: ${data.weather[0].description} with ${data.main.temp}°C, Wind ${data.wind.speed} km/h, Humidity ${data.main.humidity}%.`;

  fetchForecast(data.coord.lat, data.coord.lon);
  fetchAQI(data.coord.lat, data.coord.lon);
}

// ====== Fetch Forecast ======
async function fetchForecast(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  const res = await fetch(url);
  const data = await res.json();

  forecast.innerHTML = "";
  const daily = {};
  data.list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (!daily[date]) daily[date] = item;
  });

  const daysOfWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const dateKeys = Object.keys(daily).slice(0, 5);

  dateKeys.forEach((date, index) => {
    const item = daily[date];
    let dayLabel = "";
    if(index === 0) dayLabel = "Today";
    else if(index === 1) dayLabel = "Tomorrow";
    else dayLabel = daysOfWeek[new Date(date).getDay()];

    forecast.innerHTML += `
      <div class="forecast-day">
        <h4>${dayLabel}</h4>
        <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" />
        <p>${Math.round(item.main.temp_min)}°C / ${Math.round(item.main.temp_max)}°C</p>
      </div>
    `;
  });
}

// ====== Fetch AQI ======
async function fetchAQI(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  const aqi = data.list[0].main.aqi;

  const aqiLevels = ["Good ✅", "Fair 🙂", "Moderate 😐", "Poor 😷", "Very Poor ☠️"];
  aqiValue.textContent = aqi;
  aqiStatus.textContent = aqiLevels[aqi - 1];
}

// ====== Detect Location ======
window.onload = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
    }, () => fetchWeather("Trichy"));
  } else fetchWeather("Trichy");
};

async function fetchWeatherByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  const res = await fetch(url);
  const data = await res.json();
  fetchWeather(data.name);
}

// ====== Search ======
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) fetchWeather(city);
});

// ====== Voice Search ======
voiceBtn.addEventListener("click", () => {
  if(!('webkitSpeechRecognition' in window)) {
    alert("Voice search not supported in this browser.");
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();
  voiceBtn.classList.add("listening");
  infoBanner.textContent = "🎤 Listening...";

  recognition.onresult = function(event) {
    const city = event.results[0][0].transcript;
    cityInput.value = city;
    fetchWeather(city);
  };

  recognition.onspeechend = function() {
    recognition.stop();
    voiceBtn.classList.remove("listening");
    infoBanner.textContent = `Searching weather for "${cityInput.value}"...`;
  };

  recognition.onerror = function(event) {
    voiceBtn.classList.remove("listening");
    infoBanner.textContent = "Voice recognition error. Try again.";
    console.error("Speech recognition error:", event.error);
  };
});

// ====== Theme Toggle ======
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
  if(document.body.classList.contains("light")){
    themeIcon.classList.replace('fa-moon','fa-sun');
  } else {
    themeIcon.classList.replace('fa-sun','fa-moon');
  }
});
