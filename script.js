const apiKey = "1d3847fad20fc4eea38c3231896e4191"; // Replace with your API key

const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const voiceBtn = document.getElementById("voice-btn");
const cityNameEl = document.getElementById("city-name");
const tempEl = document.getElementById("temp");
const descriptionEl = document.getElementById("description");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const pressureEl = document.getElementById("pressure");
const weatherIconEl = document.getElementById("weather-icon");
const forecastCards = document.getElementById("forecast-cards");
const aqiEl = document.getElementById("aqi");
const saveBtn = document.getElementById("save-btn");
const favoriteList = document.getElementById("favorite-list");
const themeToggle = document.getElementById("theme-toggle");

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// ========================
// Theme Toggle
// ========================
themeToggle.addEventListener("click", () => {
    if(document.body.classList.contains("day")) {
        document.body.classList.replace("day", "night");
        localStorage.setItem("theme", "night");
    } else {
        document.body.classList.replace("night", "day");
        localStorage.setItem("theme", "day");
    }
});

if(localStorage.getItem("theme") === "night") {
    document.body.classList.add("night");
} else {
    document.body.classList.add("day");
}

// ========================
// Favorites
// ========================
function renderFavorites() {
    favoriteList.innerHTML = "";
    favorites.forEach(city => {
        const btn = document.createElement("button");
        btn.textContent = city;
        btn.addEventListener("click", () => getWeather(city));
        favoriteList.appendChild(btn);
    });
}
renderFavorites();

saveBtn.addEventListener("click", () => {
    const city = cityNameEl.textContent;
    if(city && !favorites.includes(city)) {
        favorites.push(city);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        renderFavorites();
    }
});

// ========================
// Fetch Weather
// ========================
async function getWeather(city) {
    try {
        // Current Weather
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        const data = await res.json();
        if(data.cod !== 200){ alert(data.message); return; }

        cityNameEl.textContent = data.name;
        tempEl.textContent = `Temperature: ${data.main.temp}°C`;
        descriptionEl.textContent = `Condition: ${data.weather[0].description}`;
        humidityEl.textContent = `Humidity: ${data.main.humidity}%`;
        windEl.textContent = `Wind: ${data.wind.speed} m/s`;
        pressureEl.textContent = `Pressure: ${data.main.pressure} hPa`;
        weatherIconEl.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

        // AQI
        const lat = data.coord.lat;
        const lon = data.coord.lon;
        const aqiRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);
        const aqiData = await aqiRes.json();
        const aqiValue = aqiData.list[0].main.aqi;
        const aqiMap = ["Good ✅","Fair 🙂","Moderate 😐","Poor 😷","Very Poor 🚨"];
        aqiEl.textContent = `Air Quality Index: ${aqiMap[aqiValue-1]}`;

        // 5-Day Forecast Horizontal
        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
        const forecastData = await forecastRes.json();
        forecastCards.innerHTML = "";
        const forecastList = forecastData.list.filter(f => f.dt_txt.includes("12:00:00"));
        forecastList.forEach(f => {
            const card = document.createElement("div");
            card.classList.add("forecast-card");
            card.innerHTML = `
                <p>${new Date(f.dt_txt).toLocaleDateString()}</p>
                <img src="http://openweathermap.org/img/wn/${f.weather[0].icon}@2x.png" alt="">
                <p>${f.main.temp}°C</p>
                <p>${f.weather[0].description}</p>
            `;
            forecastCards.appendChild(card);
        });

        // Dynamic Background
        const mainWeather = data.weather[0].main.toLowerCase();
        if(mainWeather.includes("cloud")) document.body.style.background="linear-gradient(to top, #bdc3c7, #2c3e50)";
        else if(mainWeather.includes("rain")) document.body.style.background="linear-gradient(to top, #4b79a1, #283e51)";
        else if(mainWeather.includes("clear")) document.body.style.background="linear-gradient(to top, #fbc2eb, #a6c1ee)";
        else if(mainWeather.includes("snow")) document.body.style.background="linear-gradient(to top, #e6e9f0, #eef1f5)";
        else document.body.style.background="linear-gradient(to top, #87ceeb, #ffffff)";

    } catch(err){
        console.error(err);
        alert("Error fetching weather data");
    }
}

// ========================
// Search Button
// ========================
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if(city) getWeather(city);
});

// ========================
// Voice Search
// ========================
voiceBtn.addEventListener("click", () => {
    if('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.start();
        recognition.onresult = (event) => {
            const spokenCity = event.results[0][0].transcript;
            cityInput.value = spokenCity;
            getWeather(spokenCity);
        }
    } else {
        alert("Voice search not supported in this browser.");
    }
});

// ========================
// Detect User Location
// ========================
window.addEventListener("load", () => {
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(pos => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
                .then(res => res.json())
                .then(data => getWeather(data.name));
        });
    } else {
        getWeather("Chennai"); // fallback
    }
});
