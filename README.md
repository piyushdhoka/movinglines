# Manim Animation Generator

Generate beautiful mathematical animations from text prompts using AI.

## Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, Framer Motion
- **Backend**: FastAPI, LangChain, Google Gemini
- **Vector DB**: Pinecone (RAG for Manim examples)
- **Auth & Storage**: Supabase
- **Rendering**: Manim Community Edition
- **Containerization**: Docker Compose

## Quick Start

### 1. Clone and Setup Environment

```bash
# Copy environment file
cp env.example .env

# Fill in your API keys in .env
```

### 2. Setup Backend (Local Development)

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn app.main:app --reload
```

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

### 4. Using Docker (Recommended)

```bash
# Build and run all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

## Supabase Setup

1. Create a new Supabase project
2. Create a storage bucket named `manim-videos` (public)
3. Create a `videos` table:

```sql
CREATE TABLE videos (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  prompt TEXT NOT NULL,
  video_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Policy for users to see their own videos
CREATE POLICY "Users can view own videos" ON videos
  FOR SELECT USING (auth.uid() = user_id);
```

## Pinecone Setup

1. Create a Pinecone account and index named `manim-examples`
2. Set dimension to 768 (for Google embeddings)
3. Seed with examples:

```bash
cd backend
python -m scripts.seed_pinecone
```

## API Endpoints

- `POST /api/animations/generate` - Generate animation from prompt
- `GET /api/animations/status/{task_id}` - Check generation status
- `GET /api/animations/videos` - List user's videos
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Sign in

## Video Quality Options

| Flag | Resolution | FPS |
|------|------------|-----|
| -ql  | 480p       | 15  |
| -qm  | 720p       | 30  |
| -qh  | 1080p      | 60  |
| -qk  | 4K         | 60  |

