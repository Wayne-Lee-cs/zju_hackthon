# Build frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY src/frontend/package*.json ./
RUN npm ci
COPY src/frontend/ .
RUN npm run build

# Build backend
FROM python:3.10-slim
WORKDIR /app

# Create non-root user
RUN useradd -m -u 1000 user
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
COPY --chown=user src/backend/ /app/backend/

# Copy frontend build artifacts
COPY --from=frontend-builder --chown=user /app/frontend/dist /app/backend/static

# Create data directory
RUN mkdir -p /app/backend/data && chmod 755 /app/backend/data

EXPOSE 7860

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]