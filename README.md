# AI Image Classification App

A stunning 3D-enhanced web application for real-time image classification using state-of-the-art neural networks (ResNet-50).

## Tech Stack
- **Frontend**: React, Vite, TailwindCSS (v4), Framer Motion, React Three Fiber (3D), Lucide React.
- **Backend**: FastAPI, TensorFlow/Keras (ResNet-50 pre-trained model on ImageNet).

## Instructions to Run

### 1. Run the Backend (FastAPI + TensorFlow)
Since this requires `tensorflow`, please ensure you are running **Python 3.10, 3.11, or 3.12** (TensorFlow is not fully supported on Python 3.14 yet).

Open a terminal and run:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install fastapi uvicorn tensorflow pillow python-multipart
python main.py
```
The backend will run on `http://localhost:8000`.

### 2. Run the Frontend
Open a **new** terminal and run:
```powershell
cd frontend
npm install
npm run dev
```
Open the provided URL (e.g., `http://localhost:5173`) in your browser to see the beautiful UI!

Enjoy the 3D animations and highly accurate object classification!
