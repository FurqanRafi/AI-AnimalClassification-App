# Stage 1: Build Frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy package files and install dependencies
COPY frontend/package*.json ./
RUN npm install


#Hows doing 
# Copy the rest of the frontend code and build
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend and Final Image
FROM python:3.10-slim

# Hugging Face Spaces require a non-root user
RUN useradd -m -u 1000 user
USER user

# Set environment variables for the user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR /home/user/app/backend

# Copy and install backend requirements
COPY --chown=user backend/requirements.txt .
# Adding extra-index-url here avoids issues with Windows CRLF line endings in requirements.txt
RUN pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu -r requirements.txt

# Copy backend code
COPY --chown=user backend/ ./

# Copy frontend build from Stage 1 to the location expected by main.py
# main.py expects frontend at os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist')
COPY --chown=user --from=frontend-builder /app/frontend/dist /home/user/app/frontend/dist

# Expose the default port for Hugging Face Spaces
EXPOSE 7860

# Run FastAPI on port 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
