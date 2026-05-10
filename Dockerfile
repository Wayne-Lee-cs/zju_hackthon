# Build frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Build backend
FROM python:3.10-slim
WORKDIR /app

# Create non-root user
RUN useradd -m -u 1000 user

# Create data directories before switching to user (so we can chmod as root)
# Use absolute paths and ensure parent directories are writable
RUN mkdir -p /app/data/chroma /app/data/graphs /app/backend/data/textbooks && chmod -R 777 /app/data

USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONPATH=/app

# Copy requirements first to leverage Docker cache
COPY --chown=user requirements.txt /app/requirements.txt

# Install backend dependencies
WORKDIR /app
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend files
COPY --chown=user backend/ /app/backend/
COPY --chown=user shared/ /app/shared/

# Copy frontend build artifacts
COPY --from=frontend-builder --chown=user /app/frontend/dist /app/backend/static

EXPOSE 7860

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]