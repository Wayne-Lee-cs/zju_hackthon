# Stage 1: Build frontend
FROM node:18-slim AS frontend

WORKDIR /build

# Copy only package files first
COPY src/frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy source and build
COPY src/frontend/ ./
RUN npm run build

# Stage 2: Python backend
FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY src/backend/ ./src/backend/
COPY src/frontend/dist ./src/frontend/dist

ENV PYTHONPATH=/app

EXPOSE 7860

CMD ["uvicorn", "src.backend.main:app", "--host", "0.0.0.0", "--port", "7860"]