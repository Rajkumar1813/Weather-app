const API_KEY = '85548261cbb59d0320841f4bf8d95789';
        
        const getUserLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        document.getElementById('locationAlert').style.display = 'none'; 
                        const { latitude, longitude } = position.coords;
                        getWeatherByLocation(latitude, longitude); 
                    },
                    () => {
                        document.getElementById('locationAlert').style.display = 'block'; 
                        showModal("Location permission is required to fetch your local weather. Please enable location access.");
                    }
                );
            } else {
                showModal('Geolocation is not supported by your browser.');
            }
        };
        
        const getWeatherByLocation = (lat, lon) => {
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
                .then((res) => res.ok ? res.json() : Promise.reject('Unable to fetch weather data'))
                .then((data) => {
                    document.getElementById('city_name').innerText = data.name;
                    showWeatherData(data); 
                })
                .catch((err) => {
                    showModal('Unable to fetch weather data');
                    console.error(err);
                });
        };
        
        const getWeatherByCity = (city) => {
            fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`)
                .then((res) => res.ok ? res.json() : Promise.reject('Invalid city name'))
                .then((data) => {
                    document.getElementById('city_name').innerText = data.name;
                    showWeatherData(data); 
                })
                .catch(() => {
                    showModal('Please enter a valid city name!');
                });
        };
        
        const showWeatherData = (data) => {
            const { temp, temp_min, temp_max, humidity, pressure, feels_like } = data.main;
            const { sunrise, sunset } = data.sys;
            const { speed, deg } = data.wind;
            
            document.getElementById('temp').innerText = temp;
            document.getElementById('min_temp').innerText = temp_min;
            document.getElementById('max_temp').innerText = temp_max;
            document.getElementById('humidity').innerText = humidity;
            document.getElementById('pressure').innerText = pressure;
            document.getElementById('feels_like').innerText = feels_like;
            document.getElementById('sunrise').innerText = formatTime(sunrise);
            document.getElementById('sunset').innerText = formatTime(sunset);
            document.getElementById('wind_speed').innerText = speed;
            document.getElementById('wind_degree').innerText = degToCompass(deg);
        };
        
        const formatTime = (timestamp) => new Date(timestamp * 1000).toLocaleTimeString();
        const degToCompass = (deg) => ["N", "N-NE", "NE", "E-NE", "E", "E-SE", "SE", "S-SE", "S", "S-SW", "SW", "W-SW", "W", "W-NW", "NW", "N-NW"][Math.floor((deg / 22.5) + 0.5) % 16];
        
        const showModal = (message) => {
            document.getElementById("modalText").innerText = message;
            var modal = document.getElementById("myModal");
            modal.style.display = "block";
            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            }
            document.getElementsByClassName("close")[0].onclick = function() {
                modal.style.display = "none";
            }
        }
        
        document.getElementById('search').addEventListener('click', (e) => {
            e.preventDefault();
            const city = document.getElementById('city').value;
            if (city) {
                getWeatherByCity(city);
            } else {
                showModal("Please enter a city name!");
            }
        });
        
        document.getElementById('greet').innerText = (() => {
            const hours = new Date().getHours();
            if (hours < 12) return "Good Morning!";
            if (hours < 16) return "Good Afternoon!";
            return "Good Evening!";
        })();
        
        const scrollTopBtn = document.getElementById('scrollTop');
        window.onscroll = () => {
            if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
                scrollTopBtn.style.display = "block";
            } else {
                scrollTopBtn.style.display = "none";
            }
        };
        
        scrollTopBtn.addEventListener('click', () => {
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        });
        
        getUserLocation();
