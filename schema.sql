-- Create tables for the time clock application

-- Enable RLS (Row Level Security)
alter table "public"."users" enable row level security;
alter table "public"."time_entries" enable row level security;

-- Create users table
create table if not exists "public"."users" (
  "id" uuid references auth.users on delete cascade not null primary key,
  "email" text not null,
  "role" text not null default 'student' check (role in ('admin', 'student')),
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);

-- Create time_entries table
create table if not exists "public"."time_entries" (
  "id" uuid default gen_random_uuid() primary key not null,
  "user_id" uuid references public.users on delete cascade not null,
  "clock_in" timestamp with time zone default now() not null,
  "clock_out" timestamp with time zone,
  "notes" text,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);

-- Create RLS policies for users table
create policy "Users can view their own profile"
  on "public"."users"
  for select
  to authenticated
  using (auth.uid() = id);

create policy "Admins can view all users"
  on "public"."users"
  for select
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

create policy "Admins can insert users"
  on "public"."users"
  for insert
  to authenticated
  with check (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

create policy "Admins can update users"
  on "public"."users"
  for update
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

create policy "Admins can delete users"
  on "public"."users"
  for delete
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

-- Create RLS policies for time_entries table
create policy "Users can view their own time entries"
  on "public"."time_entries"
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own time entries"
  on "public"."time_entries"
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own time entries"
  on "public"."time_entries"
  for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Admins can view all time entries"
  on "public"."time_entries"
  for select
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

create policy "Admins can insert time entries"
  on "public"."time_entries"
  for insert
  to authenticated
  with check (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

create policy "Admins can update time entries"
  on "public"."time_entries"
  for update
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

create policy "Admins can delete time entries"
  on "public"."time_entries"
  for delete
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

-- Create function to handle updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_updated_at
before update on public.users
for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at
before update on public.time_entries
for each row execute procedure public.handle_updated_at();
