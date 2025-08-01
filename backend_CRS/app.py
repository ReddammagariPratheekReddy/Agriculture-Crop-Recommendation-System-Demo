from fastapi import FastAPI
from pydantic import BaseModel
import pickle
import numpy as np
import requests
from fastapi.middleware.cors import CORSMiddleware

# ✅ STEP 1: Initialize app
app = FastAPI()
@app.get("/")
def root():
    return {"message": "Welcome to Agribot API. Use /recommend or /weather endpoints."}


# ✅ STEP 2: Allow CORS (so frontend like React can call this API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with ["http://localhost:3000"] for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ STEP 3: Load crop model
with open("crop_recommendation_model.pkl", "rb") as file:
    model = pickle.load(file)

# ✅ STEP 4: Crop prediction input
class CropInput(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

# ✅ STEP 5: Crop recommendation endpoint
@app.post("/recommend")
def recommend_crop(data: CropInput):
    try:
        input_data = np.array([[data.N, data.P, data.K, data.temperature, data.humidity, data.ph, data.rainfall]])
        prediction = model.predict(input_data)[0]
        return {"recommended_crop": prediction}
    except Exception as e:
        return {"error": str(e)}

# ✅ STEP 6: Weather API endpoint
@app.get("/weather")
def get_weather(city: str):
    try:
        API_KEY = "7e824475c696b4922b274245b1bf98cb"  
        url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"
        response = requests.get(url)

        if response.status_code == 200:
            data = response.json()
            return {
                "temperature": data["main"]["temp"],
                "humidity": data["main"]["humidity"],
                "description": data["weather"][0]["description"]
            }
        else:
            return {"error": "City not found or invalid API key"}
    except Exception as e:
        return {"error": str(e)}
