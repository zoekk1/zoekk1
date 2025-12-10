

  // <!--This part is displayed weather information vertically-->
  function getWeather() {
    const lat = 53.3498006;
    const lon = -6.2602964;
    fetch(`/weather/${lat}/${lon}`)
      .then(response => response.json())
      .then(data => {
        const forecast = data.list;
        const currentTemp = data.list[0].main.temp;
        const currentWeatherMain = data.list[0].weather[0].main;
        const currentWeatherIcon = data.list[0].weather[0].icon;
  
        // code to display current weather data
        const weatherDiv = document.getElementById("weather");
        weatherDiv.classList.add("animated-bg");
  
        // Add weather condition class to the weather div
        if (currentWeatherMain.includes('Cloud')) {
          weatherDiv.classList.add('cloudy');
        } else if (currentWeatherMain.includes('Rain')) {
          weatherDiv.classList.add('rainy');
        } else if (currentWeatherMain.includes('Snow')) {
          weatherDiv.classList.add('snowy');
        } else if (currentWeatherMain.includes('Clear')) {
          weatherDiv.classList.add('sunny');
        }
  
        weatherDiv.innerHTML = `
          <div class="weather-border">
            <div class="weather-content">
              <img src="https://openweathermap.org/img/wn/${currentWeatherIcon}@2x.png" alt="${currentWeatherMain}" class="icon">
              ${currentTemp} &#8451;, ${currentWeatherMain}
            </div>
          </div>
          <div class="dropdown">
            <button class="dropbtn">Few Hours Forecast</button>
            <div class="dropdown-content">
              ${forecast.slice(0, 6).map((data) => {
                const time = new Date(data.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const temp = data.main.temp;
                const weatherMain = data.weather[0].main;
                const weatherIcon = data.weather[0].icon;
                return `
                  <div style="font-size: 20px;" class="weather-content">
                    <div>${time}</div>
                    <img src="https://openweathermap.org/img/wn/${weatherIcon}.png" alt="${weatherMain}">
                    <div>${temp} &#8451;, ${weatherMain}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
          <!--  More details part-->
          <div class="dropdown">
            <button class="dropbtn">Current Weather More Details</button>
              <div class="dropdown-content">
                <a href="#">Temperature: ${currentTemp} &#8451;</a>
                <a href="#" class="details">Feels Like: ${forecast[0].main.feels_like} &#8451;</a>
                <a href="#" class="details">Humidity: ${forecast[0].main.humidity}%</a>
                <a href="#" class="details">Wind Direction: ${forecast[0].wind.deg} deg</a>
                <a href="#" class="details">Wind Speed: ${forecast[0].wind.speed} m/s</a>
              </div>
            </div>
          <!-- 5-day forecast-->
          <div class="dropdown">
            <button class="dropbtn">5-Day Forecast</button>
            <div class="dropdown-content five-day">
              ${forecast.map((data, index) => {
                if (index % 8 === 0) {
                  const date = new Date(data.dt_txt).toLocaleDateString();
                  const temp = data.main.temp;
                  const weatherMain = data.weather[0].main;
                  const weatherIcon = data.weather[0].icon;
                  return `
                    <a href="#" class = "weather-date">${date}</a>
                    <div class="weather-content">
                      <img src="https://openweathermap.org/img/wn/${weatherIcon}.png" alt="${weatherMain}">
                      <a href="#" class="details">Temperature: ${temp} &#8451;</a>
                      <a href="#" class="details">Weather: ${weatherMain}</a>
                    </div>
                  `;
                }
              }).join('')}
            </div>
          </div>`;
        const dropdowns = document.querySelectorAll(".dropdown");
        const details = document.querySelectorAll(".details");
  
        dropdowns.forEach(dropdown => {
          dropdown.addEventListener("click", function() {
            this.nextElementSibling.classList.toggle("show");
          });
        });
  
        details.forEach(detail => {
          detail.addEventListener("click", function(event) {
            event.stopPropagation();
          });
        });
  
        window.onclick = function(event) {
          if (!event.target.matches('.dropbtn')) {
            const dropdownContent = document.querySelectorAll(".dropdown-content");
            dropdownContent.forEach(content => {
              if (content.classList.contains('show')) {
                content.classList.remove('show');
              }
            });
          }
        };
      });
  }

  