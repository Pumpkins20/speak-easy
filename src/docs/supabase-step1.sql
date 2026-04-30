-- Step 1: Core persistence tables for SpeakEasy
-- Run this in Supabase SQL editor.

create extension if not exists "pgcrypto";

create table if not exists public.daily_topic_cache (
  id uuid primary key default gen_random_uuid(),
  topic_date date not null unique,
  title text not null,
  category text not null default 'daily-guided',
  starter_questions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.user_topic_history (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text not null,
  label text,
  is_today boolean,
  session_minutes integer not null default 0,
  vocabulary_log jsonb not null default '[]'::jsonb,
  grammar_error_rate numeric,
  avg_words_per_sentence numeric,
  created_at timestamptz not null default now()
);

create table if not exists public.leaderboard (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  display_name text not null,
  initials text,
  score integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_topic_history_user_id
  on public.user_topic_history(user_id, created_at desc);

create index if not exists idx_leaderboard_score
  on public.leaderboard(score desc);

-- Optional demo seed for local testing
insert into public.daily_topic_cache (topic_date, title, category, starter_questions)
values
  (current_date, 'Introducing yourself at work', 'daily-guided',
   '["How do you usually introduce yourself on your first day at work?", "What do you do in your role?", "What are you most excited to learn this month?"]'::jsonb)
on conflict (topic_date) do nothing;

insert into public.user_topic_history (user_id, title, label, is_today, session_minutes, vocabulary_log)
values
  ('demo-user', 'Introducing yourself at work', 'Hari ini', true, 14,
   '[{"word":"colleague","meaning":"rekan kerja","example":"I had lunch with my new colleague."}]'::jsonb),
  ('demo-user', 'Ordering food at a restaurant', 'Kemarin', false, 10,
   '[{"word":"menu","meaning":"daftar makanan"}]'::jsonb)
on conflict do nothing;

insert into public.leaderboard (user_id, display_name, initials, score)
values
  ('u-rizky', 'Rizky S.', 'RS', 1240),
  ('u-ayu', 'Ayu N.', 'AN', 1180),
  ('demo-user', 'Kamu', 'K', 870)
on conflict do nothing;
