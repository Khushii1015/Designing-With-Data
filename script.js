// laundry weather project, uses open-meteo

let cities = [
  { id: "btn-mississauga", name: "Mississauga", lat: 43.589, lon: -79.644 },
  { id: "btn-toronto", name: "Toronto", lat: 43.653, lon: -79.383 },
  { id: "btn-vancouver", name: "Vancouver", lat: 49.283, lon: -123.121 },
  { id: "btn-mumbai", name: "Mumbai", lat: 19.076, lon: 72.878 },
  { id: "btn-london", name: "London", lat: 51.507, lon: -0.128 }
];

let currentCity = 0;
let useFahrenheit = false;
let tempC = 0;
let hasData = false;
let soundOn = false;

// these three decide the body class
let lastWindClass = "calm";
let isNight = false;
let isRaining = false;

async function getWeather() {
  let city = cities[currentCity];
  let url = "https://api.open-meteo.com/v1/forecast?latitude=" + city.lat +
    "&longitude=" + city.lon +
    "&current=temperature_2m,relative_humidity_2m,precipitation,cloud_cover,wind_speed_10m,is_day" +
    "&hourly=precipitation_probability,temperature_2m,relative_humidity_2m&forecast_days=2&timezone=auto";

  try {
    let response = await fetch(url);
    if (!response.ok) {
      throw new Error("Weather request failed: " + response.status);
    }
    let data = await response.json();
    let w = data.current;

    tempC = w.temperature_2m;
    hasData = true;

    showSky(w.cloud_cover, w.is_day);
    showWind(w.wind_speed_10m);
    showRain(w.precipitation);
    showVerdict(w);
    showNumbers(w);
    showChart(data);
    setVolume(w.wind_speed_10m);
  } catch (error) {
    console.log(error);
    document.getElementById("verdict").textContent = "Couldn't get the weather. Try again?";
    document.getElementById("dryTime").textContent = "";
    document.getElementById("bestTime").textContent = "";
  }
}

function updateBodyClass() {
  let c = lastWindClass;
  if (isNight) {
    c = c + " night";
  }
  if (isRaining) {
    c = c + " raining";
  }
  document.body.className = c;
}

function showSky(cloudCover, isDay) {
  let sky = document.getElementById("sky");

  let opacity = cloudCover / 100;
  document.getElementById("cloud1").style.opacity = opacity;
  document.getElementById("cloud2").style.opacity = opacity;

  // is_day is 1 or 0
  if (isDay === 1) {
    isNight = false;
    sky.style.filter = "grayscale(" + cloudCover + "%)";
    showSkyColor();
  } else {
    isNight = true;
    sky.style.filter = "none";
    sky.style.background = "#1b2a4a";
  }
  updateBodyClass();
}

// temperature changes the day sky colour
function showSkyColor() {
  let sky = document.getElementById("sky");
  if (tempC < 0) {
    sky.style.background = "#cfe6f0";
  } else if (tempC < 15) {
    sky.style.background = "#9fd3e8";
  } else if (tempC < 25) {
    sky.style.background = "linear-gradient(to bottom, #8ccbe6 50%, #efe3b8 100%)";
  } else {
    sky.style.background = "linear-gradient(to top, #f6c99a, #9fd3e8)";
  }
}

function showWind(speed) {
  if (speed > 25) {
    lastWindClass = "windy";
  } else if (speed > 10) {
    lastWindClass = "breezy";
  } else {
    lastWindClass = "calm";
  }
  updateBodyClass();

  // wind makes the clothes swing faster
  let duration = Math.max(0.6, 4 - speed / 8);
  for (let i = 0; i < 5; i++) {
    let item = document.getElementById("item" + i);
    item.style.animationDuration = duration + "s";
  }
}

function showRain(precipitation) {
  let rain = document.getElementById("rain");
  rain.innerHTML = "";

  if (precipitation > 0) {
    isRaining = true;
    for (let i = 0; i < 40; i++) {
      let drop = document.createElement("div");
      drop.className = "drop";
      drop.style.left = Math.floor(Math.random() * 100) + "%";
      drop.style.animationDelay = Math.random() * 2 + "s";
      rain.appendChild(drop);
    }
  } else {
    isRaining = false;
  }
  updateBodyClass();
}

function showVerdict(w) {
  let verdict = "";

  if (w.precipitation > 0) {
    verdict = "Nope. Bring it inside.";
  } else if (w.temperature_2m < 3) {
    verdict = "It'll freeze stiff. Use the dryer.";
  } else if (w.relative_humidity_2m > 80) {
    verdict = "Hang it, but it'll take forever.";
  } else if (w.wind_speed_10m > 25) {
    verdict = "Yes! But peg everything down.";
  } else {
    verdict = "Perfect drying day.";
  }

  // made up formula for drying time
  let hours = 4;
  if (w.relative_humidity_2m > 70) {
    hours = hours + 2;
  }
  if (w.wind_speed_10m > 15) {
    hours = hours - 1;
  }
  if (w.cloud_cover > 60) {
    hours = hours + 1;
  }
  hours = Math.max(1, hours);

  document.getElementById("verdict").textContent = verdict;
  if (hours === 1) {
    document.getElementById("dryTime").textContent = "Drying time: about 1 hour";
  } else {
    document.getElementById("dryTime").textContent = "Drying time: about " + hours + " hours";
  }
}

// rain chart + best time to hang, both use the next 12 hours
function showChart(data) {
  let chart = document.getElementById("chart");
  chart.innerHTML = "";

  let times = data.hourly.time;
  let probs = data.hourly.precipitation_probability;
  let humidity = data.hourly.relative_humidity_2m;

  // find the current hour, e.g. "2026-11-23T14"
  let nowHour = data.current.time.substring(0, 13);
  let start = -1;
  for (let i = 0; i < times.length; i++) {
    if (times[i].substring(0, 13) === nowHour) {
      start = i;
    }
  }
  if (start === -1) {
    document.getElementById("bestTime").textContent = "";
    return;
  }

  let bestIndex = -1;
  for (let i = start + 1; i <= start + 12 && i < times.length; i++) {
    let hourLabel = times[i].substring(11, 13);

    let col = document.createElement("div");
    col.className = "barCol";

    let bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = probs[i] * 1.2 + "px";
    bar.title = probs[i] + " %";
    if (probs[i] >= 50) {
      bar.style.background = "#3c5cbf";
    } else {
      bar.style.background = "#29a19c";
    }

    let label = document.createElement("div");
    label.className = "barLabel";
    label.textContent = hourLabel + "h";

    col.appendChild(bar);
    col.appendChild(label);
    chart.appendChild(col);

    // lowest rain chance wins, tie goes to lower humidity
    if (bestIndex === -1) {
      bestIndex = i;
    } else if (probs[i] < probs[bestIndex]) {
      bestIndex = i;
    } else if (probs[i] === probs[bestIndex] && humidity[i] < humidity[bestIndex]) {
      bestIndex = i;
    }
  }

  if (bestIndex !== -1) {
    document.getElementById("bestTime").textContent = "Best window: around " + times[bestIndex].substring(11, 13) + "h";
  }
}

function showTemp() {
  if (!hasData) {
    return;
  }
  if (useFahrenheit) {
    let f = Math.round(tempC * 9 / 5 + 32);
    document.getElementById("temp").textContent = f + " °F";
  } else {
    document.getElementById("temp").textContent = Math.round(tempC) + " °C";
  }
}

function showNumbers(w) {
  showTemp();
  document.getElementById("humidity").textContent = w.relative_humidity_2m + " %";
  document.getElementById("wind").textContent = w.wind_speed_10m + " km/h";
  document.getElementById("cloud").textContent = w.cloud_cover + " %";
  document.getElementById("updated").textContent = new Date().toLocaleTimeString();
}

// louder wind sound when the wind is stronger
function setVolume(speed) {
  let sound = document.getElementById("windSound");
  sound.volume = Math.min(1, speed / 40);
}

function toggleSound() {
  let sound = document.getElementById("windSound");
  let btn = document.getElementById("soundBtn");
  if (soundOn) {
    soundOn = false;
    sound.pause();
    btn.textContent = "Play wind ♪";
  } else {
    soundOn = true;
    sound.play();
    btn.textContent = "Stop wind";
  }
}

function makeStars() {
  let stars = document.getElementById("stars");
  for (let i = 0; i < 25; i++) {
    let star = document.createElement("div");
    star.className = "star";
    star.style.left = Math.floor(Math.random() * 98) + "%";
    star.style.top = Math.floor(Math.random() * 50) + "%";
    stars.appendChild(star);
  }
}

function chooseCity(index) {
  currentCity = index;
  for (let i = 0; i < cities.length; i++) {
    document.getElementById(cities[i].id).className = "";
  }
  document.getElementById(cities[index].id).className = "active";
  restoreClothes();
  getWeather();
}

function toggleUnit() {
  let btn = document.getElementById("unitBtn");
  if (useFahrenheit) {
    useFahrenheit = false;
    btn.textContent = "Show °F";
  } else {
    useFahrenheit = true;
    btn.textContent = "Show °C";
  }
  showTemp();
}

function takeOff(id) {
  document.getElementById(id).style.visibility = "hidden";
}

function restoreClothes() {
  for (let i = 0; i < 5; i++) {
    document.getElementById("item" + i).style.visibility = "visible";
  }
}

// buttons
document.getElementById("btn-mississauga").addEventListener("click", function () {
  chooseCity(0);
});
document.getElementById("btn-toronto").addEventListener("click", function () {
  chooseCity(1);
});
document.getElementById("btn-vancouver").addEventListener("click", function () {
  chooseCity(2);
});
document.getElementById("btn-mumbai").addEventListener("click", function () {
  chooseCity(3);
});
document.getElementById("btn-london").addEventListener("click", function () {
  chooseCity(4);
});

document.getElementById("unitBtn").addEventListener("click", toggleUnit);
document.getElementById("soundBtn").addEventListener("click", toggleSound);
document.getElementById("restoreBtn").addEventListener("click", restoreClothes);

for (let i = 0; i < 5; i++) {
  document.getElementById("item" + i).addEventListener("click", function () {
    takeOff("item" + i);
  });
}

makeStars();
getWeather();
// refresh every 10 min
setInterval(getWeather, 600000);
