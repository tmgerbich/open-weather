let apiKey = `36e38746431ff296d2904cf5275b7b5d`;
let zipCode = '';
let apiCall = '';

// References the DOM 
let getWeatherBtn = document.getElementById('get-weather-btn');
let weatherDisplay = document.getElementById('weather-details');
let forecastDisplay = document.getElementById('forecast-details');

const weatherIcons = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Snow': '❄️',
    'Thunderstorm': '⛈️',
    'Drizzle': '🌦️',
};

const setWeatherColorScheme = (weather) => {
    let colorScheme = {
        'Clear': '#FFD700',
        'Clouds': '#B0C4DE',
        'Rain': '#4682B4',
        'Snow': '#ADD8E6',
        'Thunderstorm': '#8B0000',
        'Drizzle': '#87CEFA',
    };
    document.body.style.backgroundColor = colorScheme[weather] || '#FFFFFF';
};

getWeatherBtn.addEventListener('click', function(event) {
    event.preventDefault();

    // updateApiCall with zipcode
    zipCode = document.getElementById('zipcode').value;
    apiCall = `http://api.openweathermap.org/geo/1.0/zip?zip=${zipCode}&appid=${apiKey}`;
    
    // Make the API requests and get the weather data
    // API request to get lat/long from zipcode
    fetch(apiCall)
        .then(response => response.json())
        .then(data => {
            const lat = data.lat;
            const lon = data.lon;

            // update apicall to be based on lat/long
            apiCall = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
            // API request to get weather data from lat and long
            return fetch(apiCall);
        })
        .then(response => response.json())
        .then(data => {
            // Clear any existing displayed content
            weatherDisplay.innerHTML = '';

            // convert the timestamp to a Date
            const currentDate = new Date(data.dt * 1000); 

            // anonymous function to convert the kelvin temp to fahrenheit
            const kelvinToFar = function(kelvin) {
                return ((kelvin - 273.15) * 1.8 + 32).toFixed(2);
            }

            // get the first element of the weather array
            const weather = data.weather[0];

            // Set color scheme based on weather
            setWeatherColorScheme(weather.main);

            // Create HTML elements for the post
            const postElement = document.createElement('div');
            postElement.innerHTML = `
                <div class="city">${data.name}</div>
                <div class="date">${currentDate.toDateString()}</div>
                <div class="weather">
                    <p>Current Temperature: ${kelvinToFar(data.main.temp)} °F</p>
                    <p>Current Conditions: ${weather.main} (${weather.description}) ${weatherIcons[weather.main] || ''}</p>
                    <p>High Temperature: ${kelvinToFar(data.main.temp_max)} °F</p>
                    <p>Low Temperature: ${kelvinToFar(data.main.temp_min)} °F</p>
                </div>
            `;
            weatherDisplay.appendChild(postElement);

            // set new api call for 5-day forecast (every 3 hours)
            apiCall = `https://api.openweathermap.org/data/2.5/forecast?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${apiKey}`;
            return fetch(apiCall);
        })
        .then(response => response.json())
        .then(data => {
            // Clear any existing displayed content
            forecastDisplay.innerHTML = '';

            // anonymous function to convert the kelvin temp to fahrenheit
            const kelvinToFar = function(kelvin) {
                return ((kelvin - 273.15) * 1.8 + 32).toFixed(2);
            }

            // Filter data to get one forecast per day at the same time
            let dailyForecasts = {};
            data.list.forEach(forecast => {
                const date = new Date(forecast.dt * 1000);
                const day = date.toDateString();
                // Go through each forecast entry and if it is not already in the table and it is for noon then add it to the dailyForecasts
                if (!dailyForecasts[day] || date.getHours() === 12) {
                    dailyForecasts[day] = forecast;
                }
            });

            // iterate through displaying the forecast for the next 3 days
            Object.values(dailyForecasts).slice(1, 4).forEach(forecast => {
                // convert the timestamp to a Date
                const forecastDate = new Date(forecast.dt * 1000);

                const postElement = document.createElement('div');
                postElement.innerHTML = `
                    <div class="date">${forecastDate.toDateString()}</div>
                    <div class="weather">
                        <p>High Temperature: ${kelvinToFar(forecast.main.temp_max)} °F</p>
                        <p>Low Temperature: ${kelvinToFar(forecast.main.temp_min)} °F</p>
                        <p>Conditions: ${forecast.weather[0].main} (${forecast.weather[0].description}) ${weatherIcons[forecast.weather[0].main] || ''}</p>
                    </div>
                `;
                forecastDisplay.appendChild(postElement);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
});
