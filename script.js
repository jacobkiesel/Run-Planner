"use strict";

const input = document.getElementById("city");
const display = document.querySelector(".display");
// let coords;
// navigator.geolocation.getCurrentPosition((position) => {
//   let coords = [position.coords.latitude, position.coords.longitude];
//   return coords;
// });
// console.log(coords);

input.addEventListener("keypress", setQuery);

function setQuery(event) {
  if (event.keyCode == 13) {
    getData(input.value);

    console.log(input.value);
  }
}

const clear = () => (display.innerHTML = "");

const getData = async function (city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=3f3276c1b27dd09beafc7d957a95f2d5`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(data);
  displayResults(data);
};

const displayResults = function (weather) {
  clear();
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  display.innerHTML = `
  <h2 class="location">${weather.name}</h2>
  <h3 class="date">${now.toLocaleDateString("en-US", options)}</h3>
  <h1 class="current-temp">${weather.main.temp}°F</h1>
  <h2 class="weather">${weather.weather[0].description}</h2>
  <p class="high-low">${weather.main.temp_min}°F / ${
    weather.main.temp_max
  }°F</p>
  `;

  const map = L.map("map").setView([weather.coord.lat, weather.coord.lon], 13);

  L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "mapbox/streets-v11",
      tileSize: 512,
      zoomOffset: -1,
      accessToken:
        "pk.eyJ1IjoiamFjb2JraWVzZWwiLCJhIjoiY2tzaml3aWRvMTFrYTMxbnNnbXB3OW84NiJ9.QbxODbYekVtngTWDsKICTQ",
    }
  ).addTo(map);
};
