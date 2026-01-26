# Production-ready Dockerfile for Azure
FROM python:3.11-slim

# Ensure logs are streamed in real-time
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies for Manim
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libcairo2-dev \
    libpango1.0-dev \
    texlive-base \
    texlive-latex-base \
    texlive-fonts-recommended \
    texlive-latex-recommended \
    texlive-latex-extra \
    libffi-dev \
    build-essential \
    gcc \
    pkg-config \
    libjemalloc2 \
    && rm -rf /var/lib/apt/lists/*

# Optimize memory allocation for long-running Manim processes
ENV LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libjemalloc.so.2

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create persistent/temp directories
RUN mkdir -p /app/media/videos

EXPOSE 8000

# Use uvicorn with worker management
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2", "--log-level", "info"]
