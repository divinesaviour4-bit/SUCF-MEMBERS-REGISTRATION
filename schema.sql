create table members (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null, email text not null, phone text not null,
  gender text not null check (gender in ('Male','Female')),
  dob date, address text, state text, church text,
  emergency text, guardian text,
  faculty text, dept text,
  level int not null check (level in (100,200,300,400,500,600)),
  born text, source text,
  current_units text[] default '{}', join_units text[] default '{}',
  wrong text, suggest text, photo_url text
);
alter table members enable row level security; -- no public policies: only the server (service key) can read/write
insert into storage.buckets (id, name, public) values ('photos','photos',true) on conflict do nothing;
