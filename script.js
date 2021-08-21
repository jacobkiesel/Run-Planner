"use strict";

const input = document.getElementById("city");
const display = document.querySelector(".display");
const map = document.querySelector("#map");
const mapContainer = document.querySelector(".map-container");
const reset = document.querySelector(".reset");
const workoutDisplay = document.querySelector(".workout-list");
const workoutDescription = document.querySelector(".modal");

const manualAdd = document.querySelector(".add-manual");

const getLog = [];

window.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    workoutDescription.innerHTML = "";
    workoutDescription.classList.add("hidden");
  }
});

// let coords;
// navigator.geolocation.getCurrentPosition((position) => {
//   let coords = [position.coords.latitude, position.coords.longitude];
//   return coords;
// });
// console.log(coords);

input.addEventListener("keypress", setQuery);
manualAdd.addEventListener("click", function () {
  workoutDescription.classList.toggle("hidden");
  populateModalManual();
  const manualSave = document.querySelector(".manual-save");
  manualSave.addEventListener("click", function () {
    saveManualLog();

    workoutDescription.classList.toggle("hidden");
  });
});

const pushToList = function (log) {
  workoutDisplay.insertAdjacentHTML(
    "afterbegin",
    `<li>
  <p>📆: ${log.date}</p>
  <p>🛣: ${log.distance} miles</p>
  <p>🌡: ${log.temp}°F</p>
  <p>🕰: ${log.time} Minutes</p>
  <p>⏱: ${log.pace} mph</p>
</li>`
  );
};

const populateModalManual = function () {
  workoutDescription.innerHTML = `
  <div><div class ="labels"><label for="date">📆: </label> <input type="text" class="man-date" name="date" placeholder="Date"></div>
  <div class ="labels"><label for="distance">🛣: </label> <input type="text" class="man-distance" name="distance" placeholder="Distance (miles)"></div>
  <div class ="labels"> <label for="temp">🌡: </label> <input type="text" class="man-temp" name="temp" placeholder="Temperature °F"></div>
  <div class ="labels"><label for="time">⏱: </label> <input type="text" class="man-time" name="time" placeholder="Time (minutes)"></div>
  <button class="manual-save">Save</button></div>
  `;
};

const saveManualLog = function () {
  const manualDate = document.querySelector(".man-date");
  const manualDistance = document.querySelector(".man-distance");
  const manualTemp = document.querySelector(".man-temp");
  const manualTime = document.querySelector(".man-time");
  const log = {
    distance: manualDistance.value,
    date: manualDate.value,
    temp: manualTemp.value,
    time: manualTime.value,
    pace: manualDistance.value / manualTime.value,
  };
  localStorage.setItem(localStorage.length, JSON.stringify(log));
  pushToList(log);
};

const clear = function () {
  display.innerHTML = "";
  mapContainer.innerHTML = `<div id="map"></div>`;
  map.remove();
};

const populateModal = function (weather, currentLine) {
  workoutDescription.innerHTML = `
  <div><p class="date">📆: ${now.toLocaleDateString("en-US", options)}</p>
  <p class="distance">🛣: ${(currentLine.distance * 0.000621).toFixed(
    2
  )} miles</p>
  <p class="weather">🌡: ${weather.main.temp}°F</p>
  <label for="time">⏱: </label> <input type="text" name="time" class="time" placeholder="Time in minutes">
  <br />
  <button id="add">Save</button>
  </div>
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
    workoutDescription.classList.toggle("hidden");
    populateModal(weather, currentLine);
    const add = document.getElementById("add");
    add.addEventListener("click", function () {
      saveLog(weather, currentLine);
      workoutDescription.innerHTML = ``;
      workoutDescription.classList.toggle("hidden");
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
  pushToList(log);
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
      pushToList(log);
    }
  });
};

const init = function () {
  generateLog();
  generateList(getLog);
};

init();
