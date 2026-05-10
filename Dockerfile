# Stage 1: Build frontend
FROM node:18-slim AS frontend-builder

WORKDIR /build/frontend

# Copy package files
COPY src/frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy source and build
COPY src/frontend/ ./
RUN npm run build

# Copy built files
RUN cp -r dist /frontend-dist

# Stage 2: Python backend
FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY src/backend/ ./src/backend/

# Copy built frontend from stage 1
COPY --from=frontend-builder /build/frontend/dist ./src/frontend/dist

ENV PYTHONPATH=/app

EXPOSE 7860

CMD ["uvicorn", "src.backend.main:app", "--host", "0.0.0.0", "--port", "7860"]