-- A teacher can mark an activity as shared. Off by default.
alter table public.activities
add column if not exists is_public boolean not null default false;

-- Anyone (including logged-out students) can READ a shared activity.
-- Changing and deleting still need the owner (the existing policies).
create policy "anyone reads shared" on public.activities
for select to anon, authenticated
using (is_public = true);