# Atmosphere — Weather, But Make It a Mood

An interactive, responsive weather experience built with HTML, CSS, and vanilla JavaScript.

## Run locally
Open `index.html` in a browser with internet access, or use VS Code Live Server. No installation or API key required.

## How it works
`script.js` requests current weather JSON from the [Open-Meteo Forecast API](https://open-meteo.com/en/docs). Weather codes and daylight are mapped to mood categories. These categories update the page colour palette, weather symbols, particle animations, and poetic descriptions. Temperature, humidity, wind and cloud cover also update. The page refreshes every 10 minutes.

## Interactions
1. Select Toronto, Delhi, London, Tokyo or Sydney.
2. Toggle Celsius / Fahrenheit.
3. Refresh live data on demand.

## GitHub Pages
1. Create a new public repository on GitHub.
2. Upload `index.html`, `style.css`, `script.js` (and this README) to the repository root.
3. Open Settings → Pages → Deploy from a branch → `main` / `(root)` → Save.
4. Wait for the site to deploy; copy the resulting GitHub Pages URL.
5. Add the repository and live URLs to slide 6 before submitting.

## Credits and notes
Weather data: [Open-Meteo](https://open-meteo.com/) (attribution required). Fonts: Google Fonts (DM Sans and Playfair Display). Weather artwork and animations are made in CSS and text; no external images are required. Conditions are model-derived current weather, not a physical sensor feed. An internet connection is needed. The site provides a friendly error state when the API is unavailable.
