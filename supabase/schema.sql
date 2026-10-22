-- =====================================================================
-- Living Gods Real Estates: database schema, functions and demo data
--
-- HOW TO RUN: Supabase dashboard -> SQL Editor -> New query -> paste this
-- whole file -> Run. It is safe to run more than once.
--
-- Design (the website only holds the public "anon" key, so security is
-- done in the database):
--   * Tables have Row Level Security ON and no public read access, except
--     `properties` (the marketplace).
--   * Customers never log in. Booking, listing and contact messages go
--     through functions that validate the data and store it.
--   * Consultants log in with consultant_login() and get a session token. Only
--     functions that check that token can read appointments, so one consultant
--     can never see another consultant's customers.
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------

create table if not exists public.consultants (
  id            text primary key,                 -- e.g. 'C001'
  name          text not null,
  pincode       text not null,
  area_name     text not null,
  contact       text not null unique,             -- consultant login id (phone number)
  email         text,
  address       text,
  photo         text,
  password_hash text not null,
  created_at    timestamptz not null default now()
);

create table if not exists public.customers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text not null unique,               -- one row per phone number
  created_at  timestamptz not null default now()
);

create table if not exists public.properties (
  id                 text primary key,
  name               text not null,
  type               text not null,
  pincode            text not null,
  area               text not null,
  sqft               integer not null,
  bedrooms           integer,
  bathrooms          integer,
  floor              text,
  facing             text,
  price              bigint not null,
  address            text,
  description        text,
  images             text[] not null default array[]::text[],
  consultant_id           text references public.consultants(id),
  owner_customer_id  uuid references public.customers(id),
  created_at         timestamptz not null default now()
);

create table if not exists public.appointments (
  id                uuid primary key default gen_random_uuid(),
  consultant_id          text not null references public.consultants(id),
  customer_id       uuid not null references public.customers(id),
  kind              text not null check (kind in ('buy', 'sell')),
  property_id       text,
  property_name     text,
  appointment_date  date not null,
  appointment_time  text not null,                -- 'HH:MM'
  status            text not null default 'upcoming'
                      check (status in ('upcoming', 'completed', 'cancelled')),
  created_at        timestamptz not null default now(),
  -- a consultant can only be booked once for a given date and time
  unique (consultant_id, appointment_date, appointment_time)
);

create index if not exists appointments_consultant_date_idx
  on public.appointments (consultant_id, appointment_date);

create table if not exists public.consultant_sessions (
  token       uuid primary key default gen_random_uuid(),
  consultant_id    text not null references public.consultants(id) on delete cascade,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default now() + interval '7 days'
);

create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text not null,
  message     text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------

alter table public.consultants            enable row level security;
alter table public.customers         enable row level security;
alter table public.properties        enable row level security;
alter table public.appointments      enable row level security;
alter table public.consultant_sessions    enable row level security;
alter table public.contact_messages  enable row level security;

-- Marketplace listings are public to read. Writes only happen via functions.
drop policy if exists "properties are public" on public.properties;
create policy "properties are public" on public.properties
  for select using (true);

-- Anyone may send a contact message, but nobody can read them with the anon key.
drop policy if exists "anyone can send a message" on public.contact_messages;
create policy "anyone can send a message" on public.contact_messages
  for insert with check (
    length(trim(name)) between 2 and 100
    and length(trim(email)) between 5 and 200
    and length(coalesce(message, '')) <= 150
  );

-- (The old agents_public view was removed: the website does not need it and
-- Supabase marks views as "unrestricted". Consultant details are returned by
-- consultant_login() instead.)
drop view if exists public.agents_public;

-- ---------------------------------------------------------------------
-- Functions
-- ---------------------------------------------------------------------

-- Consultant sign in: returns a token and the consultant details, or null when the details are wrong.
create or replace function public.consultant_login(p_contact text, p_password text)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  a public.consultants;
  t uuid;
begin
  select * into a from public.consultants where contact = trim(p_contact);
  if not found then
    return null;
  end if;
  if a.password_hash <> crypt(p_password, a.password_hash) then
    return null;
  end if;

  delete from public.consultant_sessions where expires_at < now();
  insert into public.consultant_sessions (consultant_id) values (a.id) returning token into t;

  return json_build_object(
    'token', t,
    'consultant', json_build_object(
      'id', a.id, 'name', a.name, 'pincode', a.pincode, 'areaName', a.area_name,
      'contact', a.contact, 'email', a.email, 'address', a.address, 'photo', a.photo
    )
  );
end;
$$;

create or replace function public.consultant_logout(p_token uuid)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.consultant_sessions where token = p_token;
$$;

-- Internal helper: which consultant does this session token belong to?
create or replace function public.consultant_id_from_token(p_token uuid)
returns text
language sql
security definer
stable
set search_path = public
as $$
  select consultant_id from public.consultant_sessions
  where token = p_token and expires_at > now();
$$;

revoke all on function public.consultant_id_from_token(uuid) from public, anon, authenticated;

-- All appointments for the signed-in consultant, with the customer's details.
create or replace function public.consultant_appointments(p_token uuid)
returns table (
  id uuid,
  kind text,
  property_id text,
  property_name text,
  appointment_date date,
  appointment_time text,
  status text,
  customer_name text,
  customer_email text,
  customer_phone text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_consultant text;
begin
  v_consultant := public.consultant_id_from_token(p_token);
  if v_consultant is null then
    raise exception 'invalid or expired session' using errcode = '28000';
  end if;

  return query
    select ap.id, ap.kind, ap.property_id, ap.property_name,
           ap.appointment_date, ap.appointment_time,
           case when ap.status = 'upcoming' and ap.appointment_date < current_date
                then 'completed' else ap.status end,
           c.name, c.email, c.phone, ap.created_at
    from public.appointments ap
    join public.customers c on c.id = ap.customer_id
    where ap.consultant_id = v_consultant
    order by ap.appointment_date, ap.appointment_time;
end;
$$;

-- Times already taken for an consultant on a date (no customer data is exposed).
create or replace function public.booked_times(p_consultant text, p_date date)
returns text[]
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(array_agg(appointment_time order by appointment_time), array[]::text[])
  from public.appointments
  where consultant_id = p_consultant
    and appointment_date = p_date
    and status <> 'cancelled';
$$;

-- Book an appointment. Saves the customer (by phone number), the listing
-- when selling (p_property), and the appointment, all in one step.
-- Raises 'slot_taken' if the consultant is already booked at that time.
create or replace function public.book_appointment(
  p_consultant          text,
  p_kind           text,
  p_date           date,
  p_time           text,
  p_name           text,
  p_email          text,
  p_phone          text,
  p_property_id    text  default null,
  p_property_name  text  default null,
  p_property       jsonb default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer uuid;
  v_appt     uuid;
begin
  if not exists (select 1 from public.consultants where id = p_consultant) then
    raise exception 'unknown consultant';
  end if;
  if p_kind not in ('buy', 'sell') then
    raise exception 'kind must be buy or sell';
  end if;
  if p_date <= current_date then
    raise exception 'appointments open from tomorrow';
  end if;
  if length(trim(coalesce(p_name, ''))) < 2
     or p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s][^@\s]+$'
     or p_phone !~ '^[6-9][0-9]+$'
     or length(p_phone) <> 10 then
    raise exception 'invalid customer details';
  end if;

  insert into public.customers (name, email, phone)
  values (trim(p_name), trim(p_email), trim(p_phone))
  on conflict (phone) do update
    set name = excluded.name, email = excluded.email
  returning id into v_customer;

  if p_property is not null then
    insert into public.properties (
      id, name, type, pincode, area, sqft, bedrooms, bathrooms, floor, facing,
      price, address, description, images, consultant_id, owner_customer_id
    ) values (
      p_property->>'id',
      p_property->>'name',
      p_property->>'type',
      p_property->>'pincode',
      p_property->>'area',
      (p_property->>'sqft')::integer,
      nullif(p_property->>'bedrooms', '')::integer,
      nullif(p_property->>'bathrooms', '')::integer,
      p_property->>'floor',
      p_property->>'facing',
      (p_property->>'price')::bigint,
      p_property->>'address',
      p_property->>'description',
      coalesce(array(select jsonb_array_elements_text(p_property->'images')), array[]::text[]),
      p_consultant,
      v_customer
    );
  end if;

  begin
    insert into public.appointments (
      consultant_id, customer_id, kind, property_id, property_name,
      appointment_date, appointment_time
    ) values (
      p_consultant, v_customer, p_kind,
      coalesce(p_property_id, p_property->>'id'),
      coalesce(p_property_name, p_property->>'name'),
      p_date, p_time
    ) returning id into v_appt;
  exception when unique_violation then
    -- raising here also rolls back the customer and listing saved above
    raise exception 'slot_taken';
  end;

  return json_build_object('appointment_id', v_appt, 'customer_id', v_customer);
end;
$$;

grant execute on function public.consultant_login(text, text)            to anon, authenticated;
grant execute on function public.consultant_logout(uuid)                 to anon, authenticated;
grant execute on function public.consultant_appointments(uuid)           to anon, authenticated;
grant execute on function public.booked_times(text, date)           to anon, authenticated;
grant execute on function public.book_appointment(
  text, text, date, text, text, text, text, text, text, jsonb)      to anon, authenticated;

-- ---------------------------------------------------------------------
-- Demo data: 4 consultants. Consultant login = the contact number below.
-- Starting passwords follow the pattern  Agent@<pincode>  (e.g. the
-- Nandambakkam consultant uses the pincode 600089). CHANGE THEM before going
-- live with:
--   update public.consultants
--      set password_hash = extensions.crypt('a-new-strong-password', extensions.gen_salt('bf'))
--    where id = 'C001';
-- ---------------------------------------------------------------------

insert into public.consultants (id, name, pincode, area_name, contact, email, address, photo, password_hash)
values
  ('C001', 'Arun Prakash',    '600089', 'Nandambakkam',        '9840012345', 'arun.prakash@livinggods.in',
   'No. 12, 3rd Cross Street, Nandambakkam, Chennai - 600089', 'https://i.pravatar.cc/300?img=12',
   extensions.crypt('Agent@600089', extensions.gen_salt('bf'))),
  ('C002', 'Meena Lakshmi',   '600001', 'Chennai GPO / Parrys', '9841023456', 'meena.lakshmi@livinggods.in',
   '21, Armenian Street, Parrys, Chennai - 600001', 'https://i.pravatar.cc/300?img=32',
   extensions.crypt('Agent@600001', extensions.gen_salt('bf'))),
  ('C003', 'Suresh Babu',     '600020', 'Adyar',               '9842034567', 'suresh.babu@livinggods.in',
   '7, Lattice Bridge Road, Adyar, Chennai - 600020', 'https://i.pravatar.cc/300?img=15',
   extensions.crypt('Agent@600020', extensions.gen_salt('bf'))),
  ('C004', 'Priya Narayanan', '600041', 'Thiruvanmiyur',      '9843045678', 'priya.narayanan@livinggods.in',
   '45, East Coast Road, Thiruvanmiyur, Chennai - 600041', 'https://i.pravatar.cc/300?img=47',
   extensions.crypt('Agent@600041', extensions.gen_salt('bf')))
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Sample properties for the marketplace (they are also in the website code,
-- so nothing breaks if you delete them). Delete any you do not want.
-- ---------------------------------------------------------------------

insert into public.properties (
  id, name, type, pincode, area, sqft, bedrooms, bathrooms, floor, facing,
  price, address, description, images, consultant_id, created_at
) values
  ('P001', 'Green Valley Apartments', 'Apartment', '600089', 'Nandambakkam', 1450, 3, 2, '4th of 7', 'East', 8500000, 'Plot 45, Ring Road, Nandambakkam, Chennai - 600089', 'Spacious 3BHK with cross ventilation, covered parking and a children''s play area.', array['/properties/5.jpg', '/properties/6.jpg']::text[], 'C001', '2026-10-15T10:30:00'),
  ('P002', 'Sunrise Villa', 'Villa', '600089', 'Nandambakkam', 2200, 4, 3, 'Ground + 1', 'North', 14500000, '12, Temple Street, Nandambakkam, Chennai - 600089', 'Independent villa with private garden and terrace.', array['/properties/10.jpg', '/properties/1.jpg']::text[], 'C001', '2026-09-20T09:00:00'),
  ('P003', 'Heritage Court', 'Apartment', '600001', 'Chennai GPO / Parrys', 980, 2, 2, '2nd of 5', 'West', 6200000, '10, Mint Street, Parrys, Chennai - 600001', 'Well-maintained 2BHK near the metro station.', array['/properties/7.jpg']::text[], 'C002', '2026-10-18T14:20:00'),
  ('P004', 'Lakeview Plots', 'Plot', '600020', 'Adyar', 2400, null, null, 'N/A', 'South', 22000000, 'Survey No. 88, Adyar, Chennai - 600020', 'DTCP approved residential plot near the river.', array['/properties/8.jpg']::text[], 'C003', '2026-10-10T11:00:00'),
  ('P005', 'Palm Grove Independent House', 'Independent House', '600041', 'Thiruvanmiyur', 1800, 3, 3, 'G+1', 'East', 16800000, '5, Palm Grove Road, Thiruvanmiyur, Chennai - 600041', 'Newly renovated independent house with terrace garden.', array['/properties/9.jpg', '/properties/10.jpg', '/properties/1.jpg']::text[], 'C004', '2026-10-17T16:45:00'),
  ('P006', 'Orchid Heights', 'Apartment', '600089', 'Nandambakkam', 1120, 2, 2, '6th of 9', 'North', 6900000, '21, Ring Road, Nandambakkam, Chennai - 600089', 'Modern 2BHK with club house and gym access.', array['/properties/10.jpg', '/properties/1.jpg']::text[], 'C001', '2026-10-12T10:00:00'),
  ('P007', 'Silver Oak Plots', 'Plot', '600089', 'Nandambakkam', 1800, null, null, 'N/A', 'East', 9800000, 'Survey No. 14, Nandambakkam, Chennai - 600089', 'CMDA approved plots in a gated layout.', array['/properties/1.jpg']::text[], 'C001', '2026-10-08T09:30:00'),
  ('P008', 'Marina Residency', 'Apartment', '600001', 'Chennai GPO / Parrys', 1350, 3, 2, '8th of 12', 'East', 11200000, '4, Beach Road, Parrys, Chennai - 600001', 'Sea-facing 3BHK close to the business district.', array['/properties/2.jpg', '/properties/3.jpg']::text[], 'C002', '2026-10-14T12:00:00'),
  ('P009', 'Old Town Villa', 'Villa', '600001', 'Chennai GPO / Parrys', 2600, 4, 4, 'G+2', 'South', 24500000, '18, Armenian Street, Parrys, Chennai - 600001', 'Heritage-style villa with courtyard and parking for three cars.', array['/properties/3.jpg']::text[], 'C002', '2026-09-28T15:10:00'),
  ('P010', 'Riverside Towers', 'Apartment', '600020', 'Adyar', 1650, 3, 3, '10th of 14', 'North', 18900000, '9, Lattice Bridge Road, Adyar, Chennai - 600020', 'Premium riverside apartment with 24x7 security.', array['/properties/5.jpg', '/properties/6.jpg']::text[], 'C003', '2026-10-16T09:20:00'),
  ('P011', 'Banyan House', 'Independent House', '600020', 'Adyar', 2100, 4, 3, 'G+1', 'West', 21500000, '3, Gandhi Nagar, Adyar, Chennai - 600020', 'Corner house with a mature garden and car porch.', array['/properties/6.jpg']::text[], 'C003', '2026-10-03T11:40:00'),
  ('P012', 'Coastal Breeze Apartments', 'Apartment', '600041', 'Thiruvanmiyur', 1020, 2, 2, '3rd of 6', 'East', 7600000, '27, East Coast Road, Thiruvanmiyur, Chennai - 600041', 'Walkable to the beach and metro with covered parking.', array['/properties/7.jpg', '/properties/8.jpg']::text[], 'C004', '2026-10-13T13:30:00'),
  ('P013', 'Green Acres Plots', 'Plot', '600041', 'Thiruvanmiyur', 3000, null, null, 'N/A', 'North', 15500000, 'Survey No. 52, Thiruvanmiyur, Chennai - 600041', 'Residential plots with tarred roads and drainage.', array['/properties/8.jpg']::text[], 'C004', '2026-09-25T10:15:00')
on conflict (id) do nothing;
