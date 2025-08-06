// weather_app/script.js
// Simple weather app using OpenWeatherMap API
// and an AI suggestion feature (placeholder for now)
import { OPENWEATHER_KEY as apiKey, OPENAI_KEY as openaiKey } from './config.js';
const cityInput  = document.getElementById("city");
const btn        = document.getElementById("getWeather");
const resultEl   = document.getElementById("weatherResult");
const aiEl       = document.getElementById("aiSuggestion");
const spinner    = document.getElementById("spinner");

// Allow Enter key to trigger search
cityInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") btn.click();
});

btn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) {
    alert("Please enter a city");
    return;
  }
  aiEl.innerHTML = "";
  fetchWeather(city);
});

async function fetchWeather(city) {
  spinner.style.display = "block";
  resultEl.innerHTML    = "";
  try {
    const res  = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
    );
    const data = await res.json();
    spinner.style.display = "none";

    if (data.cod !== 200) {
      resultEl.innerHTML = `<p>City not found</p>`;
      return;
    }

    const { name, sys, main, weather, dt } = data;
    const iconUrl = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
    const time    = new Date(dt * 1000).toLocaleTimeString();

    const tempC = main.temp;
    const tempF = (tempC * 9/5 + 32).toFixed(1);

    resultEl.innerHTML = `
      <p><strong>${name}, ${sys.country}</strong> <small>as of ${time}</small></p>
      <img src="${iconUrl}" alt="${weather[0].description}" />
      <p>${tempC.toFixed(1)}°C — ${tempF}°F</p>
      <p>${weather[0].description}</p>
      <p>Humidity: ${main.humidity}% | Wind: ${data.wind.speed} m/s</p>
    `;

    fetchAISuggestion(name, weather[0].description, tempF);
  } catch (err) {
    spinner.style.display = "none";
    resultEl.innerHTML    = `<p>Unable to retrieve data.</p>`;
    console.error(err);
  }
}

async function fetchAISuggestion(city, desc, tempF) {
  aiEl.textContent = "Thinking…";
  try {
    const messages = [
      {
        role: "system",
        content: [
          "You are a concise, friendly weather assistant that names the user's city.",
          "Always reply in no more than two sentences."
        ].join(" ")
      },
      {
        role: "user",
        content: `I'm in ${city}. The weather is "${desc}" and the temperature is ${tempF}°F. Suggest what I should wear and what activity to do today, in no more than two sentences.`
      }
    ];

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`
      },
      body: JSON.stringify({ model: "gpt-4o-mini", messages })
    });

    const json = await res.json();
    const rawSuggestion = json.choices[0].message.content.trim();

    const sentences = rawSuggestion.match(/[^\.?!]+[\.?!]+/g) || [rawSuggestion];
    const brief = sentences.slice(0, 2).join(" ").trim();

    renderAISuggestion(brief);
  } catch (err) {
    aiEl.textContent = "AI suggestion failed.";
    console.error(err);
  }
}

function renderAISuggestion(text) {
  aiEl.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "ai-persona";

  const avatar = document.createElement("div");
  avatar.className = "ai-avatar";
  avatar.textContent = "🤖";

  const content = document.createElement("div");
  content.className = "ai-content";

  const label = document.createElement("div");
  label.className = "ai-label";
  label.textContent = "WeatherBot says:";
  content.appendChild(label);

  const p = document.createElement("p");
  p.textContent = text;
  content.appendChild(p);

  wrapper.appendChild(avatar);
  wrapper.appendChild(content);
  aiEl.appendChild(wrapper);
}
