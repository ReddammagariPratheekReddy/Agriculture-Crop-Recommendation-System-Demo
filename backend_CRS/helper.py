from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Agribot backend is running!"}

@app.post("/recommend")  # This supports only POST
def recommend_crop(data: dict):
    return {"message": "Crop recommendation logic will go here", "input": data}
