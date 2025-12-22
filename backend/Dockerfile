FROM python:3.11-slim

# Install system dependencies for Manim including build tools
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libcairo2-dev \
    libpango1.0-dev \
    # texlive-full \
    texlive-base \
    texlive-latex-base \
    texlive-fonts-recommended \
    texlive-preview \

    libffi-dev \
    build-essential \
    gcc \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

# Create media directory
RUN mkdir -p /app/media/videos

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

