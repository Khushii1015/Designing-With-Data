// Atmosphere: live weather becomes colour, motion, and language.
const cities = { // Coordinates and time zone for each city button
  toronto: { name: 'Toronto', lat: 43.6532, lon: -79.3832, zone: 'America/Toronto' },
  delhi: { name: 'Delhi', lat: 28.6139, lon: 77.2090, zone: 'Asia/Kolkata' },
  london: { name: 'London', lat: 51.5072, lon: -0.1276, zone: 'Europe/London' },
  tokyo: { name: 'Tokyo', lat: 35.6762, lon: 139.6503, zone: 'Asia/Tokyo' },
  sydney: { name: 'Sydney', lat: -33.8688, lon: 151.2093, zone: 'Australia/Sydney' }
};
let selectedCity = 'toronto', unit = 'C', currentWeather = null, requestController = null; // App state
const $ = id => document.getElementById(id); // Shortcut for getElementById
const setText = texts => Object.entries(texts).forEach(([id, text]) => $(id).textContent = text); // Fills several elements at once, keyed by id

const weatherTypes = [ // Open-Meteo weather codes grouped into moods, checked in order
  { codes: [95, 96, 99], mood: 'stormy', icon: '⛈', condition: 'Thunderstorm', title: 'The sky has something to say.', description: 'A dramatic atmosphere, with thunder in the forecast. Stay cozy and let the sky do the talking.' },
  { codes: [71, 73, 75, 77, 85, 86], mood: 'snowy', icon: '❄', condition: 'Snowy', title: 'The world slows down.', description: 'Soft winter light and falling snow turn ordinary moments into something quieter.' },
  { codes: [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82], mood: 'rainy', icon: '☂', condition: 'Rainy', title: 'A day for slower moments.', description: 'Rain paints the city in softer colours. A good day to find your favourite window.' },
  { codes: [45, 48], mood: 'cloudy', icon: '≋', condition: 'Foggy', title: 'A little mystery in the air.', description: 'The city disappears into a soft haze. Everything feels a little more dreamlike.' },
  { codes: [2, 3], mood: 'cloudy', icon: '☁', condition: 'Cloudy', title: 'Somewhere between light and shade.', description: 'Clouds soften the skyline and make room for a gentler kind of day.' }
];

function interpretWeather(code, isDay) { // Turns a weather code into mood, icon and words
  const match = weatherTypes.find(type => type.codes.includes(code));
  if (match) return match;
  const mood = isDay ? 'sunny' : 'clear-night'; // Clear skies change with day and night
  if (code === 1) return isDay ? { mood, icon: '◐', condition: 'Mostly clear', title: 'A little light goes a long way.', description: 'A few clouds drift past, but the sky still feels open.' } : { mood, icon: '☾', condition: 'Mostly clear', title: 'The city is winding down.', description: 'A peaceful night under a mostly clear sky.' };
  return isDay ? { mood, icon: '☀', condition: 'Clear skies', title: 'The day is glowing.', description: 'Warm light stretches across the city. Take a moment to enjoy it.' } : { mood, icon: '☾', condition: 'Clear night', title: 'A sky full of possibility.', description: 'The sky is clear and the world feels a little quieter.' };
}

const convert = celsius => Math.round(unit === 'C' ? celsius : celsius * 9 / 5 + 32); // Celsius to the selected unit
const temperatureText = celsius => Number.isFinite(celsius) ? `${convert(celsius)}°${unit}` : '—'; // Number with unit, or a dash if missing
const renderTemperatures = () => setText({ temperature: convert(currentWeather.temperature_2m), unitSymbol: `°${unit}`, feelsLike: temperatureText(currentWeather.apparent_temperature) }); // Used on load and by the unit toggle
const updateClock = () => $('localTime').textContent = new Intl.DateTimeFormat('en-US', { timeZone: cities[selectedCity].zone, weekday: 'long', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date()) + ' local time'; // City's local time

function createParticles(mood) { // Adds rain or snow to the background
  const area = $('particles');
  area.replaceChildren();
  if (!['rainy', 'snowy', 'stormy'].includes(mood)) return;
  const snowy = mood === 'snowy';
  for (let i = 0; i < (snowy ? 30 : 55); i++) {
    const particle = document.createElement('span');
    particle.className = snowy ? 'flake' : 'drop';
    if (snowy) particle.textContent = '✳';
    Object.assign(particle.style, { left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * -12}s`, animationDuration: `${snowy ? 8 + Math.random() * 8 : 1.2 + Math.random() * 1.5}s` }); // Random position and speed
    area.appendChild(particle);
  }
}

function displayWeather(data) { // Puts the API response on the page
  const weather = data.current;
  if (!weather || !Number.isFinite(weather.temperature_2m)) throw new Error('Weather data is unavailable.');
  currentWeather = weather;
  const { mood, icon, condition, title, description } = interpretWeather(weather.weather_code, weather.is_day === 1);
  document.body.dataset.mood = mood; // Switches the CSS palette
  createParticles(mood);
  renderTemperatures();
  setText({ cityName: cities[selectedCity].name, weatherIcon: icon, conditionText: condition, moodTitle: title, moodDescription: description, humidity: `${weather.relative_humidity_2m}%`, wind: `${Math.round(weather.wind_speed_10m)} km/h`, cloudCover: `${weather.cloud_cover}%`, status: '● LIVE WEATHER', updated: `Weather observation: ${weather.time.replace('T', ' ')} (local) · Open-Meteo` });
  updateClock();
}

async function loadWeather() { // Fetches current conditions for the selected city
  if (requestController) requestController.abort(); // Cancels an older request still in progress
  const controller = requestController = new AbortController();
  const cityKey = selectedCity, city = cities[cityKey];
  $('status').textContent = '◌ LOADING';
  $('refresh').disabled = true;
  const params = new URLSearchParams({ latitude: city.lat, longitude: city.lon, current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,cloud_cover,wind_speed_10m', timezone: city.zone });
  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (selectedCity === cityKey) displayWeather(data); // Ignores the result if the user already switched city
  } catch (error) {
    if (error.name === 'AbortError') return;
    console.error('Weather request failed:', error);
    setText({ status: '● OFFLINE', updated: 'Unable to load live data. Check your connection and press Refresh.', moodTitle: 'The sky is taking a moment.', moodDescription: 'Live weather could not be reached. Please try again.' });
  } finally {
    if (requestController === controller) { requestController = null; $('refresh').disabled = false; }
  }
}

document.querySelectorAll('.city').forEach(button => button.addEventListener('click', () => { // City buttons
  selectedCity = button.dataset.city;
  document.querySelectorAll('.city').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', b === button); }); // Highlights the chosen city
  $('cityName').textContent = cities[selectedCity].name;
  updateClock();
  loadWeather();
}));

$('unitToggle').addEventListener('click', () => { // Switches between °C and °F
  unit = unit === 'C' ? 'F' : 'C';
  $('unitToggle').textContent = unit === 'C' ? '°C / °F' : '°F / °C';
  if (currentWeather) renderTemperatures();
});

$('refresh').addEventListener('click', loadWeather);
updateClock();
setInterval(updateClock, 60000); // Updates the clock every minute
setInterval(loadWeather, 600000); // Requests updated conditions every 10 minutes
loadWeather();