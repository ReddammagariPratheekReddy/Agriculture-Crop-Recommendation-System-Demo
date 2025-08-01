import pickle

# Load the trained model
model_path = "crop_recommendation_model.pkl"  # Ensure this path is correct

try:
    with open(model_path, "rb") as file:
        model = pickle.load(file)
    print("✅ Model loaded successfully!")
    
    # Check the type of the loaded object
    print(f"🔍 Model Type: {type(model)}")
    
except Exception as e:
    print(f"❌ Error loading model: {e}")
