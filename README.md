

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS, Framer Motion, Drizzle ORM |
| **Backend** | FastAPI, Python 3.12+, LangChain |
| **AI** | Google Gemini 1.5 Pro |
| **Vector DB** | Pinecone (RAG for Manim examples) |
| **Auth & Storage** | Supabase |
| **Animation** | Manim Community Edition |
| **Containerization** | Docker & Docker Compose |

---

## 🚀 Quick Start (Windows, Mac, Linux)

### Option 1: Using Docker (Easiest - Recommended)

**Prerequisites:**
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/movinglines.git
cd movinglines

# 2. Copy and configure environment file
cp env.example .env

# 3. Edit .env with your API keys (see "API Keys Setup" below)
# On Windows: notepad .env
# On Mac/Linux: nano .env

# 4. Start all services
docker-compose up --build

# Frontend runs at: http://localhost:3000
# Backend API at: http://localhost:8000
```

---

### Option 2: Manual Setup (Recommended for Development)

#### Prerequisites

1. **Python 3.10+** - [Download](https://www.python.org/downloads/)
   - ✅ During installation, check "Add Python to PATH"

2. **Node.js 18+** - [Download](https://nodejs.org/)

3. **FFmpeg** - Required for Manim rendering
   
   **Windows (using Chocolatey):**
   ```powershell
   choco install ffmpeg
   ```
   
   **Windows (manual):**
   - Download from https://ffmpeg.org/download.html
   - Extract to `C:\ffmpeg`
   - Add `C:\ffmpeg\bin` to your System PATH
   
   **Mac:**
   ```bash
   brew install ffmpeg
   ```
   
   **Linux:**
   ```bash
   sudo apt install ffmpeg libcairo2-dev libpango1.0-dev
   ```

4. **Git** - [Download](https://git-scm.com/download)

#### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/movinglines.git
cd movinglines
```

#### Step 2: Setup Backend

```bash
cd backend

# Windows
python -m venv venv
.\venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Verify FFmpeg
ffmpeg -version
```

Create `backend/.env`:
```bash
cp .env.example .env
```

Edit `backend/.env` with your API keys (see "API Keys Setup" below).

#### Step 3: Setup Supabase

Before running the backend, you MUST set up Supabase:

```bash
# Still in backend/ directory with venv activated
python -m scripts.seed_pinecone
```

#### Step 4: Setup Frontend

Open a **new terminal** and run:

```bash
cd frontend

# Install dependencies
npm install
# or if using Bun: bun install

# Create .env.local
cp .env.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Step 5: Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
.\venv\Scripts\activate  # or: source venv/bin/activate (Mac/Linux)
python -m uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# or: bun run dev
```

Open browser: **http://localhost:3000**

---

## 🔑 API Keys Setup

You'll need the following services. Follow each link to get free API keys:

### 1. Google Gemini API 🤖
1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Click "Get API Key" → "Create API key in new project"
3. Copy the key to your `.env`

```env
GOOGLE_API_KEY=your_key_here
```

### 2. Supabase 🔐
1. Visit [supabase.com](https://supabase.com)
2. Sign up and create a new project
3. Go to Project Settings → API
4. Copy `Project URL` and `Anon Key`
5. Copy `Service Role Key` for backend

**For backend `.env`:**
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_BUCKET=manim-videos
```

**For frontend `.env.local`:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Database connection string for Drizzle ORM
# Get this from: Supabase Dashboard → Settings → Database → Connection string (URI)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

#### Setting up Supabase Database with Drizzle ORM

After adding your DATABASE_URL, run the migrations to create all necessary tables:

```bash
cd frontend
bun run lib/db/migrate.ts
```

This will create:
- `users` - User profiles
- `videos` - All generated animations with metadata
- `user_stats` - Aggregated statistics (video count, storage usage)
- `video_tags` - Optional tagging system

**📖 For detailed database documentation, see [DRIZZLE_GUIDE.md](DRIZZLE_GUIDE.md)**

### 3. Pinecone 📊
1. Visit [pinecone.io](https://www.pinecone.io/)
2. Create a new index named `manim-examples`
3. Set dimension to `768`
4. Copy your API key

```env
PINECONE_API_KEY=your_key_here
PINECONE_INDEX=manim-examples
```

---

## 🗄️ Supabase Configuration

### Create Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Click "New bucket"
3. Name: `manim-videos`
4. Make it **public** (uncheck "Private")

### Create Tables

In Supabase SQL Editor, run the following to create the necessary tables:

```sql
-- 1. Create users table (links to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create videos table
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  video_url TEXT NOT NULL,
  bucket_path TEXT NOT NULL,
  quality TEXT DEFAULT 'm',
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create chats table
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  quality TEXT NOT NULL,
  status TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  video_url TEXT,
  generated_script TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies (simplified for development)
CREATE POLICY "Users can view own videos" ON videos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own videos" ON videos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own chats" ON chats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chats" ON chats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own chats" ON chats FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## 🧪 Testing the Setup

```bash
# Test backend health
curl http://localhost:8000/health

# Test frontend (should see the homepage)
# Open http://localhost:3000 in browser
```

---

## 📝 Environment Files Reference

### Backend `.env` (Required)
```env
# Google Gemini
GOOGLE_API_KEY=your_google_api_key

# Pinecone
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX=manim-examples

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_BUCKET=manim-videos
```

### Frontend `.env.local` (Required)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# 1. Check Python version (should be 3.10+)
python --version

# 2. Reinstall dependencies
pip install --upgrade -r requirements.txt

# 3. Check if port 8000 is in use
# Windows: netstat -ano | findstr :8000
# Mac/Linux: lsof -i :8000
```

### Manim Errors
```bash
# Install missing dependencies
pip install pycairo
pip install pangocairo

# Verify FFmpeg is installed
ffmpeg -version
```

### Frontend Won't Start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Make sure .env.local has correct values
cat .env.local
```

### "Connection Refused" Errors
- ✅ Make sure both backend (port 8000) and frontend (port 3000) are running
- ✅ Check Windows Firewall isn't blocking the ports
- ✅ Verify `.env` and `.env.local` have correct API URLs

### Authentication Issues
- ✅ Clear browser cache: DevTools → Application → Storage → Clear Site Data
- ✅ Make sure Supabase URL and keys are correct
- ✅ Check that you're using the **Anon Key** in frontend, not Service Role Key

### Pinecone Not Seeding
```bash
# Make sure you're in backend folder with venv activated
cd backend
.\venv\Scripts\activate  # Windows
python -m scripts.seed_pinecone
```

---

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |

### Animations & Chats
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/animations/generate` | Generate animation from prompt |
| GET | `/api/animations/status/{task_id}` | Check generation status |
| GET | `/api/animations/videos` | List user's videos |
| GET | `/api/animations/chats` | List user's chat sessions |
| DELETE | `/api/animations/chats/{chat_id}` | Delete a chat session |
| GET | `/api/animations/chats/{chat_id}/history` | Get chat history (tasks) |
| GET | `/health` | Health check |

---

## 🎬 Video Quality Options

| Quality | Resolution | FPS | Use Case |
|---------|------------|-----|----------|
| `l` (low) | 480p | 15 | Preview/testing |
| `m` (medium) | 720p | 30 | Default, social media |
| `h` (high) | 1080p | 60 | Professional output |
| `k` (4K) | 4K (2160p) | 60 | Cinema quality |

---

## 📂 Project Structure

```
movinglines/
├── backend/                    # FastAPI server
│   ├── app/
│   │   ├── main.py            # FastAPI app setup
│   │   ├── config.py          # Configuration
│   │   ├── routers/           # API endpoints (animations, auth)
│   │   ├── services/          # Business logic (LLM, rendering, DB)
│   │   └── prompts/           # LLM prompts
│   ├── migrations/            # Database migrations
│   ├── scripts/
│   │   └── seed_pinecone.py   # RAG seeding
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                   # Next.js application
│   ├── app/                   # Next.js pages
│   ├── components/            # React components
│   ├── lib/                   # Utilities & DB schema
│   │   ├── db/                # Drizzle ORM setup
│   │   └── supabase.ts        # Supabase client
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Need Help?

- Check the [Troubleshooting](#-troubleshooting) section
- Open an issue on GitHub
- Check existing issues for solutions

---

**Happy Animating! 🎉**
