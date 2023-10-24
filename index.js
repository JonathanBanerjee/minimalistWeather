import { API_KEY, API_URL } from "./config.js";

const coordsRef = document.getElementById("coords");
const cityRef = document.getElementById("city");
const weatherRef = document.getElementById("weather");
const getLocation = document.getElementById("getLocation");
// Ask the user for permission to access their current position

getLocation.onclick = () => {
  navigator.geolocation.getCurrentPosition(success, error, {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  });

  function success({ coords }) {
    console.log("Location obtained", coords);
    getApiData(coords);
    getLocation.classList.add("hidden");
    //To go back to the beginning, add classList.remove("hidden")
  }

  function error({ message }) {
    coordsRef.innerHTML = `Location not available, reason: ${message}`;
  }
};

async function getApiData(coords) {
  try {
    const { data } = await axios.get(
      `${API_URL}/data/2.5/forecast?lat=${coords.latitude}&lon=${coords.longitude}&appid=${API_KEY}`
    );

    if (data && data.city) {
      // Check if 'city' property is defined
      const cityName = data.city.name;
      cityRef.innerHTML = `<h2> ${cityName}</h2>`;
    } else {
      // Handle the case where 'city' property is not defined
      cityRef.innerHTML = `<h2>Location name not available</h2>`;
    }

    //
    const noonDates = [];
    data.list.forEach((i) => {
      const iReading = i.dt * 1000;
      const iDate = new Date(iReading);
      const dateCheck = iDate.getUTCHours();
      let mainWeather = i.weather[0].main;
      let temperature = Math.round(i.main.temp - 273.15);

      if (dateCheck === 12) {
        console.log(iDate, dateCheck, mainWeather);
        noonDates.push({ date: iDate, weather: mainWeather, temperature });
      }
    });

    // for (let i = 0; i < data.list.length; i++) {
    //   const iReading = data.list[i].dt * 1000;
    //   const iDate = new Date(iReading);
    //   const dateCheck = iDate.getUTCHours();
    //   let mainWeather = data.list[i].weather[0].main;
    //   let temperature = Math.round(data.list[i].main.temp / 32);

    //   if (dateCheck === 12) {
    //     console.log(iDate, dateCheck, mainWeather);
    //     noonDates.push({ date: iDate, weather: mainWeather, temperature });
    //   }
    // }

    let weatherHTML = "";

    for (const item of noonDates) {
      let weatherIcon = "";

      switch (item.weather) {
        case "Clouds":
          weatherIcon = "cloudyLight.svg";
          break;
        case "Clear":
          weatherIcon = "sunshineLight.svg";
          break;
        case "Drizzle":
        case "Rain":
          weatherIcon = "rainLight.svg";
          break;
        case "Snow":
          weatherIcon = "snowLight.svg";
          break;
        default:
          weatherIcon = "locationDark.svg";
      }

      weatherHTML += `
        <h3>The weather on ${item.date} is ${item.weather}</h3>
        <p>Temperature: ${item.temperature}°C</p> 
        <img src="/images/${weatherIcon}" alt="${item.weather} Icon" height="100px" width="100px">
      `;
    }

    weatherRef.innerHTML = weatherHTML;
  } catch (error) {
    console.error(error);
  }
}
