-- Backfill chats for tasks without chat_id and backfill videos from completed tasks
-- Also add useful indexes. Safe and idempotent.

-- 1) Helpful indexes
CREATE INDEX IF NOT EXISTS chats_user_id_title_idx ON public.chats (user_id, title);
CREATE INDEX IF NOT EXISTS tasks_chat_id_idx ON public.tasks (chat_id);
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON public.tasks (user_id);
CREATE INDEX IF NOT EXISTS videos_user_id_idx ON public.videos (user_id);

-- 2) Backfill chats and link tasks without chat_id
WITH pu AS (
  SELECT pu.id  AS public_user_id,
         pu.email,
         au.id  AS auth_user_id
  FROM public.users pu
  LEFT JOIN auth.users au ON au.email = pu.email
),
t_missing AS (
  SELECT t.id AS task_id,
         t.user_id AS public_user_id,
         LEFT(COALESCE(t.prompt, 'Untitled'), 80) AS title
  FROM public.tasks t
  WHERE t.chat_id IS NULL
),
ins AS (
  INSERT INTO public.chats (user_id, title)
  SELECT pu.auth_user_id, tm.title
  FROM t_missing tm
  JOIN pu ON pu.public_user_id = tm.public_user_id
  WHERE pu.auth_user_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.chats c
      WHERE c.user_id = pu.auth_user_id
        AND c.title = tm.title
    )
  RETURNING id, user_id, title
)
UPDATE public.tasks t
SET chat_id = c.id,
    updated_at = now()
FROM t_missing tm
JOIN pu ON pu.public_user_id = tm.public_user_id
JOIN public.chats c
  ON c.user_id = pu.auth_user_id
 AND c.title   = tm.title
WHERE t.id = tm.task_id
  AND t.chat_id IS NULL;

-- 3) Backfill videos table from completed tasks that have a video_url
INSERT INTO public.videos (
  user_id, prompt, video_url, bucket_path, quality, duration, file_size, status, generated_script, error_message, created_at, updated_at
)
SELECT
  t.user_id,
  t.prompt,
  t.video_url,
  COALESCE(
    NULLIF(regexp_replace(t.video_url, '^.*/object/public/([^?]+).*$', '\1'), ''),
    t.video_url
  ) AS bucket_path,
  t.quality,
  NULL::integer AS duration,
  NULL::integer AS file_size,
  'completed'::text AS status,
  t.generated_script,
  t.error_message,
  now(),
  now()
FROM public.tasks t
LEFT JOIN public.videos v ON v.video_url = t.video_url
WHERE t.status = 'completed'
  AND t.video_url IS NOT NULL
  AND t.video_url <> ''
  AND v.id IS NULL;
