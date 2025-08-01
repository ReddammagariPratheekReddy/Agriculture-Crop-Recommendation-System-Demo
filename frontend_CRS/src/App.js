import React, { useState } from "react";
import axios from "axios";
import "./App.css";
import logo from "./assets/logo.png";

function App() {
  const [formData, setFormData] = useState({
    N: "",
    P: "",
    K: "",
    temperature: "",
    humidity: "",
    ph: "",
    rainfall: "",
  });

  const [result, setResult] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [location, setLocation] = useState("");
  const [isLocationAuto, setIsLocationAuto] = useState(true);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchWeather = async () => {
    const apiKey = process.env.REACT_APP_WEATHER_API_KEY;

    if (!apiKey) {
      setError("API key not found. Please check your .env file.");
      return;
    }

    try {
      let weatherUrl = "";

      if (isLocationAuto) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const lat = position.coords.latitude;
              const lon = position.coords.longitude;
              weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
              console.log("Auto Location URL:", weatherUrl);
              const response = await axios.get(weatherUrl);
              handleWeatherData(response.data);
            },
            () => setError("Unable to fetch location.")
          );
        } else {
          setError("Geolocation not supported.");
        }
      } else {
        if (!location) {
          setError("Please enter a city name.");
          return;
        }
         weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;
        console.log("Manual Location URL:", weatherUrl);
        try {
          const response = await axios.get(weatherUrl);
          handleWeatherData(response.data);
        } catch (err) {
          setError("Failed to fetch weather data for the entered city.");
          console.error("Manual Weather Fetch Error:", err);
        }
      }
    } catch (err) {
      setError("Unexpected error occurred while fetching weather.");
      console.error("Weather Fetch Error:", err);
    }
  };

  const handleWeatherData = (data) => {
    setWeatherData(data);
    setFormData((prev) => ({
      ...prev,
      temperature: data.main.temp.toFixed(1),
      humidity: data.main.humidity,
      rainfall: (Math.random() * 100).toFixed(1), // Placeholder
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://agribot-jy5w.onrender.com/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          N: parseFloat(formData.N),
          P: parseFloat(formData.P),
          K: parseFloat(formData.K),
          temperature: parseFloat(formData.temperature),
          humidity: parseFloat(formData.humidity),
          ph: parseFloat(formData.ph),
          rainfall: parseFloat(formData.rainfall),
        }),
      });

      const data = await response.json();
      setResult(data.recommended_crop || "Error: Unexpected response");
    } catch (error) {
      setResult("Error: Unable to fetch recommendation.");
      console.error("Crop Recommendation Error:", error);
    }
  };

  return (
    <div className="App">
      <header className="header">
        <img src={logo} className="logo" alt="logo" />
        <h1 className="title">Agribot Crop Recommendation</h1>
      </header>

      <main className="main">
        <div className="left-panel">
          <form onSubmit={handleSubmit} className="form">
            {["N", "P", "K", "temperature", "humidity", "ph", "rainfall"].map((field) => (
              <div className="form-group" key={field}>
                <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                <input
                  type="number"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}

            <div className="form-group location-buttons">
              <button
                type="button"
                className="location-toggle"
                onClick={() => {
                  setIsLocationAuto(!isLocationAuto);
                  setError("");
                }}
              >
                {isLocationAuto ? "Switch to Manual Location" : "Switch to Auto Location"}
              </button>
              {!isLocationAuto && (
                <input
                  type="text"
                  name="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter city"
                />
              )}
              <button type="button" className="fetch-button" onClick={fetchWeather}>
                Fetch Weather
              </button>
            </div>

            <button type="submit" className="submit-button">Get Recommendation</button>
          </form>

          {error && <div className="error-message">{error}</div>}

          {result && (
            <div className="result">
              <h2>Recommended Crop: 🌱 {result}</h2>
            </div>
          )}
        </div>

        {weatherData && !error && (
          <div className="weather-box">
            <h3>🌤 Weather Info</h3>
            <p><strong>City:</strong> {weatherData.name}</p>
            <p><strong>Temp:</strong> {weatherData.main.temp}°C</p>
            <p><strong>Humidity:</strong> {weatherData.main.humidity}%</p>
            <p><strong>Condition:</strong> {weatherData.weather[0].description}</p>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>&copy; 2025 Agribot | All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
