from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from PIL import Image
import io
import torch
import torchvision.transforms as transforms
from torchvision.models import resnet50, ResNet50_Weights

app = FastAPI(title="Image Classification API", description="AI Model to classify images using PyTorch ResNet50")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Loading PyTorch ResNet50 model...")
# Initialize model with weights
weights = ResNet50_Weights.IMAGENET1K_V1
model = resnet50(weights=weights)
model.eval() # Set model to evaluation mode

# Initialize preprocessing transforms
preprocess = weights.transforms()

# Get the ImageNet class labels
categories = weights.meta["categories"]
print("Model loaded successfully!")

@app.get("/")
def read_root():
    return {"message": "Welcome to the PyTorch Image Classification API! Send a POST request to /predict"}

@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File provided is not an image.")

    try:
        # Read the image file
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert('RGB')
        
        # Preprocess the image
        batch = preprocess(image).unsqueeze(0)
        
        # Make prediction
        with torch.no_grad():
            prediction = model(batch).squeeze(0).softmax(0)
            
        # Get top 3 predictions
        top3_prob, top3_catid = torch.topk(prediction, 3)
        
        # Format the results
        results = []
        for i in range(top3_prob.size(0)):
            prob = top3_prob[i].item()
            catid = top3_catid[i].item()
            label = categories[catid]
            results.append({
                "label": label.title(),
                "confidence": float(prob)
            })
            
        return JSONResponse(content={"predictions": results})
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
