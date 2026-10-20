alter table public.tasks
add column if not exists due_at timestamptz;
