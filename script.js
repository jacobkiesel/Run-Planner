"use strict";

const input = document.getElementById("city");
const display = document.querySelector(".display");
const map = document.querySelector("#map");
const mapContainer = document.querySelector(".map-container");
const reset = document.querySelector(".reset");
const workoutDisplay = document.querySelector(".workout-list");
const workoutDescription = document.querySelector(".modal");

const getLog = [];

// let coords;
// navigator.geolocation.getCurrentPosition((position) => {
//   let coords = [position.coords.latitude, position.coords.longitude];
//   return coords;
// });
// console.log(coords);

input.addEventListener("keypress", setQuery);

const clear = function () {
  display.innerHTML = "";
  mapContainer.innerHTML = `<div id="map"></div>`;
  map.remove();
};

const populateModal = function (weather, currentLine) {
  workoutDescription.innerHTML = `
  <p class="date">Date: ${now.toLocaleDateString("en-US", options)}</p>
  <p class="distance">Distance: ${(currentLine.distance * 0.000621).toFixed(
    2
  )}</p>
  <p class="weather">Temperature: ${weather.main.temp}</p>
  <input type="text" class="time" placeholder="Time in minutes">
  <button id="add">Save</button>
  `;
};

reset.addEventListener("click", function () {
  clear();
});

function setQuery(event) {
  if (event.keyCode == 13) {
    mapContainer.innerHTML = `<div id="map"></div>`;
    getData(input.value);
  }
}

const getData = async function (city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=3f3276c1b27dd09beafc7d957a95f2d5`;
  const res = await fetch(url);
  const data = await res.json();
  displayResults(data);
};

const options = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};
const now = new Date();

const displayResults = function (weather) {
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
  const mapOptions = {
    unit: "landmiles",
    measureControlLabel: `🏃‍♂️`,
  };

  L.control.polylineMeasure(mapOptions).addTo(map);
  map.on("polylinemeasure:finish", (currentLine) => {
    workoutDescription.classList.remove("hidden");
    populateModal(weather, currentLine);
    const add = document.getElementById("add");
    add.addEventListener("click", function () {
      saveLog(weather, currentLine);
      workoutDescription.innerHTML = ``;
    });
  });
};

const saveLog = function (weather, currentLine) {
  const timeRan = document.querySelector(".time");
  const log = {
    distance: (currentLine.distance * 0.000621).toFixed(2),
    date: now.toLocaleDateString("en-US", options),
    temp: weather.main.temp,
    time: timeRan.value,
    pace: (
      timeRan.value / (currentLine.distance * 0.000621).toFixed(2)
    ).toFixed(2),
  };
  localStorage.setItem(localStorage.length, JSON.stringify(log));
  getLog.unshift(log);
};

const generateLog = function () {
  for (const log in localStorage) {
    getLog.unshift(JSON.parse(localStorage.getItem(log)));
  }
};

const generateList = function (log) {
  console.log(log);
  log.forEach((log) => {
    if (log != null) {
      workoutDisplay.insertAdjacentHTML(
        "afterbegin",
        `<li>
      <p>📆: ${log.date}</p>
      <p>🛣: ${log.distance} miles</p>
      <p>⛅️: ${log.temp}°F</p>
      <p>🕰: ${log.time} Minutes</p>
      <p>⏱: ${log.pace} mph</p>
    </li>`
      );
    }
  });
};

const init = function () {
  generateLog();
  generateList(getLog);
};

init();
