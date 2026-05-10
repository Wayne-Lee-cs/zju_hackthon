# Multi-stage build for smaller final image
FROM node:18-slim AS frontend-builder

WORKDIR /frontend

COPY src/frontend/package*.json ./
RUN npm ci

COPY src/frontend/ ./
RUN npm run build

# Python backend
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Copy built frontend
COPY --from=frontend-builder /frontend/dist ./src/frontend/dist

ENV PYTHONPATH=/app

# ModelScope uses port 7860
EXPOSE 7860

CMD ["uvicorn", "src.backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
