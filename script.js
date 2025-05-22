const API_KEY = '85548261cbb59d0320841f4bf8d95789';
let hourlyChart, forecastChart;
let notifications = [];
let lastWeatherData = null;

// DOM Elements
const elements = {
    city: document.getElementById('city'),
    search: document.getElementById('search'),
    greet: document.getElementById('greet'),
    city_name: document.getElementById('city_name'),
    country_flag: document.getElementById('country_flag'),
    currentDateTime: document.getElementById('currentDateTime'),
    temp: document.getElementById('temp'),
    min_temp: document.getElementById('min_temp'),
    max_temp: document.getElementById('max_temp'),
    humidity: document.getElementById('humidity'),
    pressure: document.getElementById('pressure'),
    feels_like: document.getElementById('feels_like'),
    sunrise: document.getElementById('sunrise'),
    sunset: document.getElementById('sunset'),
    wind_speed: document.getElementById('wind_speed'),
    wind_degree: document.getElementById('wind_degree'),
    weather_main: document.getElementById('weather_main'),
    weather_description: document.getElementById('weather_description'),
    weather_icon: document.getElementById('weather_icon'),
    visibility: document.getElementById('visibility'),
    hourlyWeather: document.getElementById('hourlyWeather'),
    forecastWeather: document.getElementById('forecastWeather'),
    airQualityIndex: document.getElementById('airQualityIndex'),
    airQualityStatus: document.getElementById('airQualityStatus'),
    air_co: document.getElementById('air_co'),
    air_no: document.getElementById('air_no'),
    air_no2: document.getElementById('air_no2'),
    air_o3: document.getElementById('air_o3'),
    air_so2: document.getElementById('air_so2'),
    air_pm2_5: document.getElementById('air_pm2_5'),
    air_pm10: document.getElementById('air_pm10'),
    locationAlert: document.getElementById('locationAlert'),
    themeToggle: document.getElementById('themeToggle'),
    scrollTop: document.getElementById('scrollTop'),
    notificationBell: document.getElementById('notificationBell'),
    notificationBadge: document.getElementById('notificationBadge'),
    notificationPanel: document.getElementById('notificationPanel'),
    notificationList: document.getElementById('notificationList'),
    loader: document.querySelector('.loader'),
    toast: new bootstrap.Toast(document.getElementById('liveToast')),
    toastMessage: document.getElementById('toastMessage')
};

// Initialize the app
const initApp = () => {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    setupEventListeners();
    getUserLocation();
    checkForAlerts();
};

// Update current date and time
const updateDateTime = () => {
    const now = new Date();
    elements.currentDateTime.textContent = now.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
};

// Setup event listeners
const setupEventListeners = () => {
    elements.search.addEventListener('click', handleSearch);
    elements.themeToggle.addEventListener('click', toggleTheme);
    elements.scrollTop.addEventListener('click', scrollToTop);
    elements.notificationBell.addEventListener('click', toggleNotificationPanel);
    
    window.addEventListener('scroll', () => {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            elements.scrollTop.style.display = "block";
        } else {
            elements.scrollTop.style.display = "none";
        }
    });
    
    // Check for theme preference
    if (localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
};

// Handle search
const handleSearch = (e) => {
    e.preventDefault();
    const city = elements.city.value;
    if (city) {
        showLoader();
        getWeatherByCity(city);
    } else {
        showToast("Please enter a city name!");
    }
};

// Toggle theme
const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        elements.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
};

// Scroll to top
const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
};

// Toggle notification panel
const toggleNotificationPanel = () => {
    elements.notificationPanel.style.display = elements.notificationPanel.style.display === 'block' ? 'none' : 'block';
};

// Show loader
const showLoader = () => {
    elements.loader.style.display = 'flex';
};

// Hide loader
const hideLoader = () => {
    elements.loader.style.display = 'none';
};

// Show toast message
const showToast = (message) => {
    elements.toastMessage.textContent = message;
    elements.toast.show();
};

// Add notification
const addNotification = (message) => {
    const now = new Date();
    const notification = {
        message,
        time: now.toLocaleTimeString()
    };
    
    notifications.unshift(notification);
    elements.notificationBadge.textContent = notifications.length;
    
    // Update notification panel
    elements.notificationList.innerHTML = notifications.map(notif => `
        <div class="notification-item">
            <p>${notif.message}</p>
            <small class="notification-time">${notif.time}</small>
        </div>
    `).join('');
    
    // Show toast for new notification
    showToast(message);
};

// Get user location
const getUserLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                elements.locationAlert.style.display = 'none';
                const { latitude, longitude } = position.coords;
                getWeatherByLocation(latitude, longitude);
            },
            () => {
                elements.locationAlert.style.display = 'block';
                addNotification("Location permission denied. Using default location.");
                getWeatherByCity('London'); // Default city
            }
        );
    } else {
        addNotification("Geolocation not supported. Using default location.");
        getWeatherByCity('London'); // Default city
    }
};

// Get weather by location
const getWeatherByLocation = async (lat, lon) => {
    try {
        showLoader();
        const [weatherData, airQualityData] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`).then(res => res.json()),
            fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`).then(res => res.json())
        ]);
        
        const forecastData = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`).then(res => res.json());
        const hourlyData = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely,daily,alerts&appid=${API_KEY}`).then(res => res.json());
        
        processWeatherData(weatherData, forecastData, hourlyData, airQualityData);
    } catch (err) {
        console.error(err);
        showToast("Unable to fetch weather data");
    } finally {
        hideLoader();
    }
};

// Get weather by city
const getWeatherByCity = async (city) => {
    try {
        showLoader();
        const weatherData = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`).then(res => res.json());
        
        if (weatherData.cod !== 200) {
            throw new Error(weatherData.message || 'Invalid city name');
        }
        
        const [airQualityData, forecastData, hourlyData] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${API_KEY}`).then(res => res.json()),
            fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&units=metric&appid=${API_KEY}`).then(res => res.json()),
            fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&units=metric&exclude=minutely,daily,alerts&appid=${API_KEY}`).then(res => res.json())
        ]);
        
        processWeatherData(weatherData, forecastData, hourlyData, airQualityData);
    } catch (err) {
        console.error(err);
        showToast(err.message || "Please enter a valid city name!");
        hideLoader();
    }
};

// Process weather data
const processWeatherData = (weatherData, forecastData, hourlyData, airQualityData) => {
    // Check for significant weather changes
    if (lastWeatherData) {
        checkWeatherChanges(lastWeatherData, weatherData);
    }
    lastWeatherData = weatherData;
    
    // Update current weather
    updateCurrentWeather(weatherData);
    
    // Update forecast
    updateForecast(forecastData);
    
    // Update hourly data
    updateHourlyData(hourlyData);
    
    // Update air quality
    updateAirQuality(airQualityData);
    
    // Add notification for successful update
    addNotification(`Weather data updated for ${weatherData.name}`);
    
    hideLoader();
};

// Update current weather
const updateCurrentWeather = (data) => {
    const { temp, temp_min, temp_max, humidity, pressure, feels_like } = data.main;
    const { sunrise, sunset } = data.sys;
    const { speed, deg } = data.wind;
    const { main, description, icon } = data.weather[0];
    
    elements.city_name.textContent = data.name;
    elements.country_flag.innerHTML = getCountryFlag(data.sys.country);
    elements.temp.textContent = temp.toFixed(1);
    elements.min_temp.textContent = temp_min.toFixed(1);
    elements.max_temp.textContent = temp_max.toFixed(1);
    elements.humidity.textContent = humidity;
    elements.pressure.textContent = pressure;
    elements.feels_like.textContent = feels_like.toFixed(1);
    elements.sunrise.textContent = formatTime(sunrise);
    elements.sunset.textContent = formatTime(sunset);
    elements.wind_speed.textContent = speed.toFixed(1);
    elements.wind_degree.textContent = degToCompass(deg);
    elements.weather_main.textContent = main;
    elements.weather_description.textContent = description;
    elements.weather_icon.innerHTML = getWeatherIcon(icon);
    elements.visibility.textContent = data.visibility ? (data.visibility / 1000).toFixed(1) + ' km' : 'N/A';
    
    // Update greeting based on time
    const hours = new Date().getHours();
    elements.greet.textContent = hours < 12 ? "Good Morning!" : hours < 16 ? "Good Afternoon!" : "Good Evening!";
};

// Update forecast
const updateForecast = (data) => {
    // Filter to get one forecast per day (around noon)
    const dailyForecasts = data.list.filter(item => {
        const date = new Date(item.dt * 1000);
        return date.getHours() === 12;
    }).slice(0, 5);
    
    // Update forecast cards
    elements.forecastWeather.innerHTML = dailyForecasts.map(day => {
        const date = new Date(day.dt * 1000);
        return `
            <div class="col-md-2 col-6">
                <div class="card weather-card">
                    <div class="card-header bg-primary text-white">
                        ${date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div class="card-body text-center">
                        ${getWeatherIcon(day.weather[0].icon)}
                        <h5>${day.main.temp.toFixed(1)}&deg;C</h5>
                        <p class="small">${day.weather[0].main}</p>
                        <div class="d-flex justify-content-between small">
                            <span>H: ${day.main.temp_max.toFixed(1)}&deg;</span>
                            <span>L: ${day.main.temp_min.toFixed(1)}&deg;</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Update forecast chart
    updateForecastChart(data);
};

// Update hourly data
const updateHourlyData = (data) => {
    const hourly = data.hourly.slice(0, 24);
    
    // Update hourly weather cards
    elements.hourlyWeather.innerHTML = hourly.map(hour => {
        const date = new Date(hour.dt * 1000);
        return `
            <div class="hour-item">
                <div>${date.getHours()}:00</div>
                ${getWeatherIcon(hour.weather[0].icon, '1.5rem')}
                <div class="fw-bold">${hour.temp.toFixed(1)}&deg;</div>
                <div class="small">${hour.weather[0].main}</div>
            </div>
        `;
    }).join('');
    
    // Update hourly chart
    updateHourlyChart(hourly);
};

// Update air quality - FIXED VERSION
const updateAirQuality = (data) => {
    if (!data || !data.list || data.list.length === 0) {
        console.error("Invalid air quality data:", data);
        elements.airQualityIndex.textContent = "N/A";
        elements.airQualityStatus.textContent = "Data unavailable";
        elements.air_co.textContent = "N/A";
        elements.air_no.textContent = "N/A";
        elements.air_no2.textContent = "N/A";
        elements.air_o3.textContent = "N/A";
        elements.air_so2.textContent = "N/A";
        elements.air_pm2_5.textContent = "N/A";
        elements.air_pm10.textContent = "N/A";
        return;
    }

    const aqi = data.list[0].main.aqi;
    const components = data.list[0].components;
    
    elements.airQualityIndex.textContent = aqi;
    elements.air_co.textContent = components.co ? components.co.toFixed(2) : "N/A";
    elements.air_no.textContent = components.no ? components.no.toFixed(2) : "N/A";
    elements.air_no2.textContent = components.no2 ? components.no2.toFixed(2) : "N/A";
    elements.air_o3.textContent = components.o3 ? components.o3.toFixed(2) : "N/A";
    elements.air_so2.textContent = components.so2 ? components.so2.toFixed(2) : "N/A";
    elements.air_pm2_5.textContent = components.pm2_5 ? components.pm2_5.toFixed(2) : "N/A";
    elements.air_pm10.textContent = components.pm10 ? components.pm10.toFixed(2) : "N/A";
    
    // Set AQI color and status
    let aqiStatus = '';
    let aqiColor = '';
    
    switch(aqi) {
        case 1:
            aqiStatus = 'Good';
            aqiColor = '#4CAF50';
            break;
        case 2:
            aqiStatus = 'Fair';
            aqiColor = '#8BC34A';
            break;
        case 3:
            aqiStatus = 'Moderate';
            aqiColor = '#FFEB3B';
            break;
        case 4:
            aqiStatus = 'Poor';
            aqiColor = '#FF9800';
            break;
        case 5:
            aqiStatus = 'Very Poor';
            aqiColor = '#F44336';
            break;
        default:
            aqiStatus = 'Unknown';
            aqiColor = '#9E9E9E';
    }
    
    elements.airQualityIndex.style.background = `conic-gradient(${aqiColor} 0% 100%)`;
    elements.airQualityStatus.textContent = aqiStatus;
    elements.airQualityStatus.style.color = aqiColor;
};

// Update hourly chart
const updateHourlyChart = (hourlyData) => {
    const ctx = document.getElementById('hourlyChart').getContext('2d');
    
    const labels = hourlyData.map(hour => {
        return new Date(hour.dt * 1000).toLocaleTimeString([], { hour: '2-digit' });
    });
    
    const temps = hourlyData.map(hour => hour.temp);
    const pops = hourlyData.map(hour => hour.pop * 100); // Convert to percentage
    
    if (hourlyChart) {
        hourlyChart.destroy();
    }
    
    hourlyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: temps,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Precipitation (%)',
                    data: pops,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    tension: 0.4,
                    type: 'bar',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                title: {
                    display: true,
                    text: '24-Hour Forecast'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.dataset.label.includes('Temperature') ? 
                                    context.parsed.y.toFixed(1) + '°C' : 
                                    context.parsed.y.toFixed(0) + '%';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    max: 100,
                    title: {
                        display: true,
                        text: 'Precipitation (%)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
};

// Update forecast chart
const updateForecastChart = (forecastData) => {
    const ctx = document.getElementById('forecastChart').getContext('2d');
    
    // Group by day
    const dailyData = {};
    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString([], { weekday: 'short' });
        
        if (!dailyData[day]) {
            dailyData[day] = {
                temps: [],
                dates: []
            };
        }
        
        dailyData[day].temps.push(item.main.temp);
        dailyData[day].dates.push(date);
    });
    
    const labels = Object.keys(dailyData);
    const avgTemps = labels.map(day => {
        const temps = dailyData[day].temps;
        return temps.reduce((a, b) => a + b, 0) / temps.length;
    });
    
    const minTemps = labels.map(day => Math.min(...dailyData[day].temps));
    const maxTemps = labels.map(day => Math.max(...dailyData[day].temps));
    
    if (forecastChart) {
        forecastChart.destroy();
    }
    
    forecastChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Avg Temp',
                    data: avgTemps,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Min Temp',
                    data: minTemps,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    tension: 0.4,
                    fill: '-1'
                },
                {
                    label: 'Max Temp',
                    data: maxTemps,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    tension: 0.4,
                    fill: '-1'
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '5-Day Forecast'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}°C`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                }
            }
        }
    });
};

// Check for weather alerts
const checkForAlerts = () => {
    // This would be more comprehensive with actual alert data from the API
    // For demo purposes, we'll check every 30 minutes
    setInterval(() => {
        if (lastWeatherData) {
            // Check for rain
            if (lastWeatherData.weather[0].main.toLowerCase().includes('rain')) {
                addNotification(`Rain alert: ${lastWeatherData.weather[0].description} in ${lastWeatherData.name}`);
            }
            
            // Check for extreme temperatures
            if (lastWeatherData.main.temp > 30) {
                addNotification(`High temperature alert: ${lastWeatherData.main.temp}°C in ${lastWeatherData.name}`);
            } else if (lastWeatherData.main.temp < 5) {
                addNotification(`Low temperature alert: ${lastWeatherData.main.temp}°C in ${lastWeatherData.name}`);
            }
        }
    }, 30 * 60 * 1000); // 30 minutes
};

// Check for significant weather changes
const checkWeatherChanges = (oldData, newData) => {
    // Temperature change > 5 degrees
    if (Math.abs(oldData.main.temp - newData.main.temp) > 5) {
        addNotification(`Significant temperature change: ${oldData.main.temp.toFixed(1)}°C → ${newData.main.temp.toFixed(1)}°C`);
    }
    
    // Weather condition change
    if (oldData.weather[0].main !== newData.weather[0].main) {
        addNotification(`Weather change: ${oldData.weather[0].main} → ${newData.weather[0].main}`);
    }
};

// Helper functions
const formatTime = (timestamp) => new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const degToCompass = (deg) => {
    const val = Math.floor((deg / 22.5) + 0.5);
    const arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return arr[(val % 16)];
};

const getWeatherIcon = (iconCode, size = '3rem') => {
    const iconMap = {
        '01d': 'sun',
        '01n': 'moon',
        '02d': 'cloud-sun',
        '02n': 'cloud-moon',
        '03d': 'cloud',
        '03n': 'cloud',
        '04d': 'cloud',
        '04n': 'cloud',
        '09d': 'cloud-rain',
        '09n': 'cloud-rain',
        '10d': 'cloud-sun-rain',
        '10n': 'cloud-moon-rain',
        '11d': 'bolt',
        '11n': 'bolt',
        '13d': 'snowflake',
        '13n': 'snowflake',
        '50d': 'smog',
        '50n': 'smog'
    };
    
    return `<i class="fas fa-${iconMap[iconCode] || 'cloud'}" style="font-size: ${size}"></i>`;
};

const getCountryFlag = (countryCode) => {
    if (!countryCode) return '';
    const flag = String.fromCodePoint(...[...countryCode.toUpperCase()].map(c => 0x1F1A5 + c.charCodeAt(0)));
    return `<span class="flag">${flag}</span>`;
};

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
