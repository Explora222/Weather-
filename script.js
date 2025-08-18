// script.js

// Replace with your OpenWeatherMap API key
const API_KEY = 'YOUR_API_KEY'; // Replace with your actual key from https://openweathermap.org/
const BASE_URL = 'https://api.openweathermap.org/data/2.5/';

document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-btn');
    const cityName = document.getElementById('city-name');
    const temperature = document.getElementById('temperature');
    const description = document.getElementById('description');
    const humidity = document.getElementById('humidity');
    const wind = document.getElementById('wind');
    const weatherIcon = document.getElementById('weather-icon');
    const forecastItems = document.getElementById('forecast-items');

    // Get weather by city name or coordinates
    async function getWeather(cityOrCoords) {
        console.log('Fetching weather for:', cityOrCoords);
        try {
            let currentRes, forecastRes;
            if (typeof cityOrCoords === 'string') {
                // City name search
                const url = `${BASE_URL}weather?q=${encodeURIComponent(cityOrCoords)}&units=metric&appid=${API_KEY}`;
                console.log('City URL:', url);
                currentRes = await fetch(url);
            } else {
                // Coordinates search
                const { lat, lon } = cityOrCoords;
                const url = `${BASE_URL}weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
                console.log('Coords URL:', url);
                currentRes = await fetch(url);
            }

            if (!currentRes.ok) throw new Error(`HTTP error! Status: ${currentRes.status}`);
            const currentData = await currentRes.json();

            // Fetch forecast using the same method (city or coords)
            const forecastUrl = typeof cityOrCoords === 'string'
                ? `${BASE_URL}forecast?q=${encodeURIComponent(cityOrCoords)}&units=metric&appid=${API_KEY}`
                : `${BASE_URL}forecast?lat=${cityOrCoords.lat}&lon=${cityOrCoords.lon}&units=metric&appid=${API_KEY}`;
            console.log('Forecast URL:', forecastUrl);
            forecastRes = await fetch(forecastUrl);
            if (!forecastRes.ok) throw new Error(`Forecast HTTP error! Status: ${forecastRes.status}`);
            const forecastData = await forecastRes.json();

            displayCurrentWeather(currentData);
            displayForecast(forecastData);
        } catch (error) {
            console.error('Fetch error details:', error);
            alert(`Error: ${error.message}. Please ensure your API key is valid or try a different city.`);
            // Fallback to Johannesburg if initial fetch fails
            if (typeof cityOrCoords !== 'string') getWeather('Johannesburg');
        }
    }

    // Display current weather
    function displayCurrentWeather(data) {
        cityName.textContent = `${data.name}, ${data.sys.country}`;
        temperature.textContent = `Temperature: ${Math.round(data.main.temp)}°C`;
        description.textContent = data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1);
        humidity.textContent = `Humidity: ${data.main.humidity}%`;
        wind.textContent = `Wind Speed: ${data.wind.speed} m/s`;
        weatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

        // Change background based on weather
        const weatherMain = data.weather[0].main.toLowerCase();
        document.body.className = weatherMain;
    }

    // Display 5-day forecast (every 24 hours)
    function displayForecast(data) {
        forecastItems.innerHTML = '';
        const dailyData = data.list.filter((item, index) => index % 8 === 0); // Approx every 24 hours
        dailyData.slice(0, 5).forEach(item => {
            const date = new Date(item.dt * 1000).toLocaleDateString();
            const forecastItem = document.createElement('div');
            forecastItem.classList.add('forecast-item');
            forecastItem.innerHTML = `
                <p>${date}</p>
                <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="Forecast Icon">
                <p>Temp: ${Math.round(item.main.temp)}°C</p>
                <p>${item.weather[0].description}</p>
            `;
            forecastItems.appendChild(forecastItem);
        });
    }

    // Event listener for search
    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) getWeather(city);
    });

    // Default weather on load using geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            console.log(`Using geolocation: lat=${lat}, lon=${lon}`);
            getWeather({ lat, lon });
        }, () => {
            console.log('Geolocation denied, falling back to Johannesburg');
            getWeather('Johannesburg');
        });
    } else {
        console.log('Geolocation not supported, using Johannesburg');
        getWeather('Johannesburg');
    }
});