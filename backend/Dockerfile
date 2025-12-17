FROM python:3.11-slim

# Install system dependencies for Manim
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libcairo2-dev \
    libpango1.0-dev \
    texlive \
    texlive-latex-extra \
    texlive-fonts-extra \
    texlive-latex-recommended \
    texlive-science \
    tipa \
    libffi-dev \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
