-- Keep updated_at current: runs before every update on activities.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
new.updated_at = now();
return new;
end;
$$;

create trigger activities_set_updated_at
before update on public.activities
for each row execute function public.set_updated_at();