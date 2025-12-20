CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  quality TEXT NOT NULL CHECK (quality IN ('l', 'm', 'h', 'k')),
  status TEXT NOT NULL CHECK (status IN ('processing', 'generating_script', 'rendering', 'uploading', 'completed', 'failed')),
  progress INTEGER NOT NULL DEFAULT 0,
  video_url TEXT,
  generated_script TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX tasks_user_id_idx ON tasks(user_id);
CREATE INDEX tasks_status_idx ON tasks(status);
CREATE INDEX tasks_created_at_idx ON tasks(created_at);
