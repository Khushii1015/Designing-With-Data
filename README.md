# Can I hang my laundry today?

Our group project for CCT360 (Data as Experience), by Varnan Goenka, Yuvika Vohra and Khushboo Gill.

Live site: https://khushii1015.github.io/Designing-With-Data/

A small weather page. It shows a clothesline in front of the sky of a chosen city and tells you if it's a good day to dry laundry outside. You can switch between five cities, switch between °C and °F, and click on any piece of clothing to take it off the line (there's a button to hang everything back).

## Features

- five city buttons, °C / °F toggle
- click the clothes to take them off, "Hang everything back" puts them on again
- verdict on the paper tag, a made up drying time and a best time to hang
- rain chart for the next 12 hours
- wind sound button (plays wind.mp3, louder when it's windier)
- data refreshes every 10 minutes

## What data changes what

- cloud cover: how grey the sky is and how visible the clouds are
- wind speed: how fast and how far the clothes swing (calm, breezy or windy), and the volume of the wind sound (wind / 40, max 1)
- precipitation: if it's above 0 raindrops fall and the sky gets darker, otherwise none
- is_day: day shows the sun, night turns the sky navy, shows the moon and the stars
- temperature: the day sky colour (icy blue under 0, blue 0-15, warmer bottom 15-25, warm orange to blue above 25)
- hourly rain chance: the bars in the rain chart (height = chance x 1.2 px, cobalt if 50% or more, teal if less)
- hourly rain chance + humidity: the "Best window" hour, which is the hour in the next 12 with the lowest rain chance (lower humidity wins a tie)
- rain, temperature, humidity and wind together: the text on the paper tag and the drying time guess (the formula is made up)
- the Today cards show temperature, humidity, wind and cloud cover

## How to run

Open index.html in a browser. It needs internet for the weather and the fonts. The wind sound only starts after you click the button because browsers block autoplay.

## Credits

- Weather data from Open-Meteo (https://open-meteo.com/)
- Fonts: Gloock and Atkinson Hyperlegible from Google Fonts
- wind.mp3: wind noise we generated ourselves with ffmpeg (filtered brown noise), so no outside audio was used
