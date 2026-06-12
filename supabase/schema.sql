-- Cases table
create table if not exists cases (
  id uuid primary key default gen_random_uuid(),
  case_code text unique not null,
  title text not null,
  client_name text not null,
  contact_number text,
  address text,
  description text,
  importance text not null default 'medium' check (importance in ('low', 'medium', 'high')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Events table
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  event_description text not null,
  event_date date not null,
  importance text not null default 'medium' check (importance in ('low', 'medium', 'high')),
  internal_remark text,
  final_remark text,
  created_at timestamptz not null default now()
);

-- Attachments table
create table if not exists attachments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  file_name text not null,
  file_type text not null,
  file_url text not null,
  created_at timestamptz not null default now()
);

-- Auto-update updated_at on cases
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger cases_updated_at
  before update on cases
  for each row execute function update_updated_at();

-- RLS Policies
alter table cases enable row level security;
alter table events enable row level security;
alter table attachments enable row level security;

-- Public read access for case pages
create policy "Public can read cases" on cases for select using (true);
create policy "Public can read events" on events for select using (true);
create policy "Public can read attachments" on attachments for select using (true);

-- Authenticated admin write access
create policy "Admin can insert cases" on cases for insert to authenticated with check (true);
create policy "Admin can update cases" on cases for update to authenticated using (true);
create policy "Admin can delete cases" on cases for delete to authenticated using (true);

create policy "Admin can insert events" on events for insert to authenticated with check (true);
create policy "Admin can update events" on events for update to authenticated using (true);
create policy "Admin can delete events" on events for delete to authenticated using (true);

create policy "Admin can insert attachments" on attachments for insert to authenticated with check (true);
create policy "Admin can delete attachments" on attachments for delete to authenticated using (true);

-- Storage bucket for case files
insert into storage.buckets (id, name, public) values ('case-files', 'case-files', true)
  on conflict do nothing;

create policy "Public read case files" on storage.objects for select using (bucket_id = 'case-files');
create policy "Admin upload case files" on storage.objects for insert to authenticated with check (bucket_id = 'case-files');
create policy "Admin delete case files" on storage.objects for delete to authenticated using (bucket_id = 'case-files');
