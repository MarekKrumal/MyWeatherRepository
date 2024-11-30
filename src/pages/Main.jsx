import React, { useState } from "react";
import axios from "axios";
import {
  FaSun,
  FaCloud,
  FaCloudRain,
  FaSnowflake,
  FaWind,
} from "react-icons/fa"; // Import ikon
import olomoucweather from "../olomoucweather.jpg";

export default function WeatherApp() {
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState("");

  const apiKey = "9c197a44d7104339af9a603dee81ec94"; // Váš API klíč

  const fetchWeather = async () => {
    try {
      setError(""); // Vymazat předchozí chyby

      // Krok 1: Získat aktuální počasí pro získání šířky a délky
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather`,
        {
          params: {
            q: location,
            appid: apiKey,
            units: "metric", // Použít metrické jednotky (Celsium)
          },
        }
      );

      const { coord } = response.data; // Získat šířku a délku
      setWeather(response.data);

      // Krok 2: Získat 5-denní předpověď
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast`,
        {
          params: {
            lat: coord.lat,
            lon: coord.lon,
            appid: apiKey,
            units: "metric", // Použít metrické jednotky (Celsium)
          },
        }
      );

      // Filtrovat předpovědi na následujících 5 dní
      const filteredForecast = [];
      let days = new Set(); // Set pro uchování unikátních dnů (datum)

      // Projdeme všechny záznamy a vybereme první pro každý den
      forecastResponse.data.list.forEach((day) => {
        const dayDate = new Date(day.dt * 1000);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1); // Nastavit zítřek

        // Pokud záznam patří do následujících 5 dní a je nový den
        if (dayDate > tomorrow && !days.has(dayDate.toLocaleDateString())) {
          days.add(dayDate.toLocaleDateString()); // Přidat den do Setu
          filteredForecast.push(day); // Přidat první záznam pro tento den
        }

        // Zastavíme, jakmile máme 5 dní
        if (filteredForecast.length === 5) {
          return;
        }
      });

      setForecast(filteredForecast); // Uložit data předpovědi
    } catch (err) {
      setWeather(null);
      setForecast(null);
      setError(
        "Nepodařilo se načíst data o počasí. Zkontrolujte název města a zkuste to znovu."
      );
      console.error("Chyba při načítání dat:", err);
    }
  };

  // Funkce pro přeložení anglických popisů počasí na české
  const translateWeatherDescription = (description) => {
    const weatherTranslations = {
      "clear sky": "Jasno",
      "few clouds": "Malá oblačnost",
      "scattered clouds": "Polojasno",
      "broken clouds": "Zataženo",
      "overcast clouds": "Zataženo",
      "shower rain": "Přeháňky",
      rain: "Déšť",
      thunderstorm: "Bouřka",
      snow: "Sníh",
      mist: "Mlha",
      haze: "Opar",
      fog: "Hustá mlha",
      dust: "Prašno",
      sand: "Písečný vítr",
      wind: "Vítr",
    };
    return weatherTranslations[description] || description; // Pokud neexistuje překlad, použijeme původní
  };

  // Renderovat ikonu počasí na základě popisu
  const renderWeatherIcon = (description) => {
    if (description.includes("clear"))
      return <FaSun className="text-white text-6xl mx-auto" />;
    if (description.includes("clouds") && description.includes("scattered"))
      return <FaCloud className="text-white text-6xl mx-auto" />;
    if (description.includes("clouds") && description.includes("overcast"))
      return <FaCloud className="text-white text-6xl mx-auto" />;
    if (description.includes("rain"))
      return <FaCloudRain className="text-white text-6xl mx-auto" />;
    if (description.includes("snow"))
      return <FaSnowflake className="text-white text-6xl mx-auto" />;
    return <FaWind className="text-white text-6xl mx-auto" />;
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen"
      style={{
        backgroundImage: `url(${olomoucweather})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg p-8 w-full max-w-xl text-center shadow-lg">
        <h1 className="text-3xl font-semibold text-white">Počasí Aplikace</h1>

        {/* Sekce pro zadání města a tlačítko */}
        <div className="m-5">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Zadejte město"
            className="p-3 w-4/5 rounded-md text-lg text-white bg-transparent border border-white placeholder-white opacity-80 mb-4"
            style={{ fontFamily: "Arial, sans-serif", fontStyle: "italic" }}
          />
          <button
            onClick={fetchWeather}
            className="p-3 bg-transparent text-white border border-white rounded-lg w-4/5 focus:outline-none hover:bg-transparent/15 hover:text-white transition-all"
          >
            Získat počasí
          </button>
        </div>

        {/* Chybová zpráva */}
        {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}

        {/* Karta aktuálního počasí */}
        {weather && (
          <div className="mt-6 bg-white bg-opacity-30 backdrop-blur-lg rounded-lg p-6 shadow-md focus:bg-sky-100 hover:bg-transparent/15">
            <h2 className="text-2xl font-semibold text-white">
              {weather.name}
            </h2>
            <div className="flex justify-center items-center mt-2">
              {renderWeatherIcon(weather.weather[0].description)}
            </div>
            <p className="text-white">
              {translateWeatherDescription(weather.weather[0].description)}
            </p>
            <p className="text-white">Teplota: {weather.main.temp}°C</p>
            <p className="text-white">Vlhkost: {weather.main.humidity}%</p>
            <p className="text-white">
              Rychlost větru: {weather.wind.speed} m/s
            </p>
          </div>
        )}

        {/* Sekce 5-denní předpovědi */}
        {forecast && (
          <div className="mt-8">
            <h2 className="text-xl text-white">5denní předpověď</h2>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {forecast.map((day, index) => (
                <div
                  key={index}
                  className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg p-4 w-28 text-center shadow-md hover:scale-105 transition-transform duration-300"
                >
                  {/* Použití 'weekday: "long"' pro celé názvy dní */}
                  <p className="text-white">
                    {new Date(day.dt * 1000).toLocaleDateString("cs-CZ", {
                      weekday: "long", // Plné názvy dní (např. "Pondělí")
                    })}
                  </p>
                  {renderWeatherIcon(day.weather[0].description)}
                  <p className="text-white">
                    {translateWeatherDescription(day.weather[0].description)}
                  </p>
                  <p className="text-white">Teplota: {day.main.temp}°C</p>
                  <p className="text-white">Vlhkost: {day.main.humidity}%</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
