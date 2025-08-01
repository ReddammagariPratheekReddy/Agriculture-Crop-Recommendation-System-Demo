from flask import Flask, request, jsonify
import requests
import joblib  # For loading ML model
import speech_recognition as sr
from gtts import gTTS
import os

app = Flask(__name__)

# Load trained crop recommendation model
crop_model = joblib.load("crop_model.pkl")

# OpenWeather API Key
WEATHER_API_KEY = "your_api_key_here"
WEATHER_URL = "http://api.openweathermap.org/data/2.5/weather"

# Function to get weather data
def get_weather(city):
    params = {"q": city, "appid": WEATHER_API_KEY, "units": "metric"}
    response = requests.get(WEATHER_URL, params=params)
    if response.status_code == 200:
        data = response.json()
        return {
            "temperature": data["main"]["temp"],
            "humidity": data["main"]["humidity"],
            "weather": data["weather"][0]["description"]
        }
    return {"error": "City not found"}

# Crop recommendation API
@app.route("/recommend_crop", methods=["POST"])
def recommend_crop():
    data = request.json
    city = data.get("city")
    weather_data = get_weather(city)
    if "error" in weather_data:
        return jsonify({"error": "Invalid city"})
    
    # Get soil data
    features = [[
        data["N"], data["P"], data["K"], data["ph"], data["rainfall"],
        weather_data["temperature"], weather_data["humidity"]
    ]]
    prediction = crop_model.predict(features)[0]
    return jsonify({"recommended_crop": prediction, "weather": weather_data})

# Voice assistant API
@app.route("/voice_input", methods=["POST"])
def voice_input():
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        audio = recognizer.listen(source)
    try:
        text = recognizer.recognize_google(audio)
        return jsonify({"text": text})
    except sr.UnknownValueError:
        return jsonify({"error": "Could not understand audio"})

# Text-to-Speech response
@app.route("/speak", methods=["POST"])
def speak():
    text = request.json.get("text")
    tts = gTTS(text)
    tts.save("response.mp3")
    os.system("mpg321 response.mp3")
    return jsonify({"status": "Success"})

if __name__ == "__main__":
    app.run(port=5000, debug=True)
