-- Formcraft drafts are private to each Supabase Auth user, including anonymous users.
create table if not exists public.formcraft_forms (
  id uuid primary key,
  owner_id uuid not null references auth.users (id) on delete cascade,
  form jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists formcraft_forms_owner_updated_idx
  on public.formcraft_forms (owner_id, updated_at desc);

alter table public.formcraft_forms enable row level security;
revoke all on public.formcraft_forms from anon, authenticated;
grant select, insert, update, delete on public.formcraft_forms to authenticated;

create policy "Owners can read forms"
  on public.formcraft_forms for select to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Owners can create forms"
  on public.formcraft_forms for insert to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "Owners can update forms"
  on public.formcraft_forms for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Owners can delete forms"
  on public.formcraft_forms for delete to authenticated
  using ((select auth.uid()) = owner_id);
