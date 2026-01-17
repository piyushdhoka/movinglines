<div align="center">
  <img src="frontend/public/logo.png" alt="MovingLines Logo" width="200"/>

  # 🎬 MovingLines
  
  **The ultimate AI-powered Manim animation generator.**
  
  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-05998b?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![Manim](https://img.shields.io/badge/Manim-Community-2e2e2e?style=for-the-badge&logo=python)](https://www.manim.community/)
  [![Gemini](https://img.shields.io/badge/Google-Gemini%201.5%20Pro-4285F4?style=for-the-badge&logo=google-gemini)](https://aistudio.google.com/)
  [![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

  MovingLines transforms your text prompts into beautiful, mathematical animations using Manim and Google Gemini. Experience the power of RAG-enhanced animation scripts.
</div>

---

## ✨ Features

- 🧠 **AI-Powered Scripting**: Leverages Google Gemini 1.5 Pro to write precise Manim code.
- 📚 **RAG Integration**: Optimized with Pinecone vector database for high-quality Manim examples.
- ⚡ **Real-time Generation**: Watch your animations come to life with a modern, responsive UI.
- 🎥 **Quality Controls**: Choose from 480p up to 4K cinematic quality.
- ☁️ **Cloud Storage**: Seamlessly sync your animations with Supabase.
- 🐳 **Docker Ready**: Easy deployment with containerized services.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Auth & Storage**: [Supabase](https://supabase.com/)

### Backend
- **API Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Engine**: [Manim Community Edition](https://www.manim.community/)
- **AI Orchestration**: [LangChain](https://www.langchain.com/)
- **Vector DB**: [Pinecone](https://www.pinecone.io/) (via RAG)

---

## � Quick Start

### 🐳 Option 1: Docker (Easiest)

1. **Clone & Enter**:
   ```bash
   git clone https://github.com/piyushdhoka/movinglines.git
   cd movinglines
   ```

2. **Configure Environment**:
   ```bash
   cp env.example .env
   # Edit .env with your API keys
   ```

3. **Launch**:
   ```bash
   docker-compose up --build
   ```

---

### � Option 2: Manual Setup (Development)

#### Prerequisites
- Python 3.10+
- Node.js 18+
- [FFmpeg](https://ffmpeg.org/download.html) (Required for Manim)

#### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Seed Pinecone
python -m scripts.seed_pinecone
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Run migrations
npm run db:migrate
```

#### 3. Run Development Servers
- **Backend**: `python -m uvicorn app.main:app --reload --port 8000`
- **Frontend**: `npm run dev`

---

## 📂 Project Structure

```mermaid
graph TD
    A[MovingLines] --> B[Frontend - Next.js]
    A --> C[Backend - FastAPI]
    C --> D[Manim Engine]
    C --> E[Gemini API]
    C --> F[Pinecone - RAG]
    B --> G[Supabase Auth/DB]
```

```text
movinglines/
├── backend/            # FastAPI, Manim logic, AI prompts
├── frontend/           # Next.js UI, Drizzle schema, Supabase client
├── docker-compose.yml  # Orchestration
└── README.md           # This file
```

---

## 🎬 Video Quality Options

| Quality | Resolution | FPS | Best For |
|---------|------------|-----|----------|
| `l` | 480p | 15 | Quick Previews |
| `m` | 720p | 30 | Standard Sharing |
| `h` | 1080p | 60 | High Definition |
| `k` | 4K | 60 | Cinematic Output |

---

## 🤝 Contributing

Contributions make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## � Star History

[![Star History Chart](https://api.star-history.com/svg?repos=piyushdhoka/movinglines&type=date&legend=top-left)](https://www.star-history.com/#piyushdhoka/movinglines&type=date&legend=top-left)

<div align="center">
  Made with ❤️ by Piyush Dhoka
</div>
