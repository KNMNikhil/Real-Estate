-- =====================================================================
-- Living Gods Real Estates: database schema, functions and demo data
--
-- HOW TO RUN: Supabase dashboard -> SQL Editor -> New query -> paste this
-- whole file -> Run. It is safe to run more than once.
--
-- Design (the website only holds the public "anon" key, so security is
-- done in the database):
--   * Tables have Row Level Security ON and no public read access, except
--     `properties` (the marketplace) and the `agents_public` view.
--   * Customers never log in. Booking, listing and contact messages go
--     through functions that validate the data and store it.
--   * Agents log in with agent_login() and get a session token. Only
--     functions that check that token can read appointments, so one agent
--     can never see another agent's customers.
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------

create table if not exists public.agents (
  id            text primary key,                 -- e.g. 'C001'
  name          text not null,
  pincode       text not null,
  area_name     text not null,
  contact       text not null unique,             -- agent login id (phone number)
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
  agent_id           text references public.agents(id),
  owner_customer_id  uuid references public.customers(id),
  created_at         timestamptz not null default now()
);

create table if not exists public.appointments (
  id                uuid primary key default gen_random_uuid(),
  agent_id          text not null references public.agents(id),
  customer_id       uuid not null references public.customers(id),
  kind              text not null check (kind in ('buy', 'sell')),
  property_id       text,
  property_name     text,
  appointment_date  date not null,
  appointment_time  text not null,                -- 'HH:MM'
  status            text not null default 'upcoming'
                      check (status in ('upcoming', 'completed', 'cancelled')),
  created_at        timestamptz not null default now(),
  -- an agent can only be booked once for a given date and time
  unique (agent_id, appointment_date, appointment_time)
);

create index if not exists appointments_agent_date_idx
  on public.appointments (agent_id, appointment_date);

create table if not exists public.agent_sessions (
  token       uuid primary key default gen_random_uuid(),
  agent_id    text not null references public.agents(id) on delete cascade,
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

alter table public.agents            enable row level security;
alter table public.customers         enable row level security;
alter table public.properties        enable row level security;
alter table public.appointments      enable row level security;
alter table public.agent_sessions    enable row level security;
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

-- Public, non-secret agent details (no password hash).
create or replace view public.agents_public as
  select id, name, pincode, area_name, contact, email, address, photo
  from public.agents;

grant select on public.agents_public to anon, authenticated;

-- ---------------------------------------------------------------------
-- Functions
-- ---------------------------------------------------------------------

-- Agent sign in: returns a token and the agent details, or null when the details are wrong.
create or replace function public.agent_login(p_contact text, p_password text)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  a public.agents;
  t uuid;
begin
  select * into a from public.agents where contact = trim(p_contact);
  if not found then
    return null;
  end if;
  if a.password_hash <> crypt(p_password, a.password_hash) then
    return null;
  end if;

  delete from public.agent_sessions where expires_at < now();
  insert into public.agent_sessions (agent_id) values (a.id) returning token into t;

  return json_build_object(
    'token', t,
    'agent', json_build_object(
      'id', a.id, 'name', a.name, 'pincode', a.pincode, 'areaName', a.area_name,
      'contact', a.contact, 'email', a.email, 'address', a.address, 'photo', a.photo
    )
  );
end;
$$;

create or replace function public.agent_logout(p_token uuid)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.agent_sessions where token = p_token;
$$;

-- Internal helper: which agent does this session token belong to?
create or replace function public.agent_id_from_token(p_token uuid)
returns text
language sql
security definer
stable
set search_path = public
as $$
  select agent_id from public.agent_sessions
  where token = p_token and expires_at > now();
$$;

revoke all on function public.agent_id_from_token(uuid) from public, anon, authenticated;

-- All appointments for the signed-in agent, with the customer's details.
create or replace function public.agent_appointments(p_token uuid)
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
  v_agent text;
begin
  v_agent := public.agent_id_from_token(p_token);
  if v_agent is null then
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
    where ap.agent_id = v_agent
    order by ap.appointment_date, ap.appointment_time;
end;
$$;

-- Times already taken for an agent on a date (no customer data is exposed).
create or replace function public.booked_times(p_agent text, p_date date)
returns text[]
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(array_agg(appointment_time order by appointment_time), array[]::text[])
  from public.appointments
  where agent_id = p_agent
    and appointment_date = p_date
    and status <> 'cancelled';
$$;

-- Book an appointment. Saves the customer (by phone number), the listing
-- when selling (p_property), and the appointment, all in one step.
-- Raises 'slot_taken' if the agent is already booked at that time.
create or replace function public.book_appointment(
  p_agent          text,
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
  if not exists (select 1 from public.agents where id = p_agent) then
    raise exception 'unknown agent';
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
      price, address, description, images, agent_id, owner_customer_id
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
      p_agent,
      v_customer
    );
  end if;

  begin
    insert into public.appointments (
      agent_id, customer_id, kind, property_id, property_name,
      appointment_date, appointment_time
    ) values (
      p_agent, v_customer, p_kind,
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

grant execute on function public.agent_login(text, text)            to anon, authenticated;
grant execute on function public.agent_logout(uuid)                 to anon, authenticated;
grant execute on function public.agent_appointments(uuid)           to anon, authenticated;
grant execute on function public.booked_times(text, date)           to anon, authenticated;
grant execute on function public.book_appointment(
  text, text, date, text, text, text, text, text, text, jsonb)      to anon, authenticated;

-- ---------------------------------------------------------------------
-- Demo data: 4 agents. Agent login = the contact number below.
-- Starting passwords follow the pattern  Agent@<pincode>  (e.g. the
-- Nandambakkam agent uses the pincode 600089). CHANGE THEM before going
-- live with:
--   update public.agents
--      set password_hash = extensions.crypt('a-new-strong-password', extensions.gen_salt('bf'))
--    where id = 'C001';
-- ---------------------------------------------------------------------

insert into public.agents (id, name, pincode, area_name, contact, email, address, photo, password_hash)
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

-- Sample customers and about four months of sample appointments so the
-- agent dashboards and calendars are not empty. Skipped if you already
-- have appointments. Delete these rows once real bookings come in.
do $$
declare
  first_names text[] := array['Ravi','Anita','Karthik','Divya','Farhan','Lakshmi',
                              'Vignesh','Sneha','Arjun','Pooja','Suresh','Harini'];
  last_names  text[] := array['Kumar','Sharma','Iyer'];
  times       text[] := array['09:00','09:30','10:00','10:30','11:00','11:30',
                              '12:00','12:30','13:00','13:30','14:00','14:30',
                              '15:00','15:30','16:00','16:30','17:00','17:30'];
  a           record;
  props       jsonb := jsonb_build_object(
    'C001', jsonb_build_array(
              jsonb_build_object('id','P001','name','Green Valley Apartments'),
              jsonb_build_object('id','P002','name','Sunrise Villa'),
              jsonb_build_object('id','P006','name','Orchid Heights'),
              jsonb_build_object('id','P007','name','Silver Oak Plots')),
    'C002', jsonb_build_array(
              jsonb_build_object('id','P003','name','Heritage Court'),
              jsonb_build_object('id','P008','name','Marina Residency'),
              jsonb_build_object('id','P009','name','Old Town Villa')),
    'C003', jsonb_build_array(
              jsonb_build_object('id','P004','name','Lakeview Plots'),
              jsonb_build_object('id','P010','name','Riverside Towers'),
              jsonb_build_object('id','P011','name','Banyan House')),
    'C004', jsonb_build_array(
              jsonb_build_object('id','P005','name','Palm Grove Independent House'),
              jsonb_build_object('id','P012','name','Coastal Breeze Apartments'),
              jsonb_build_object('id','P013','name','Green Acres Plots')));
  plist       jsonb;
  n_cust      int;
  i           int;
  d           int;
  k           int;
  cnt         int;
  h           bigint;
  v_date      date;
  v_cust      uuid;
  v_prop      jsonb;
begin
  if exists (select 1 from public.appointments) then
    return;
  end if;

  i := 0;
  for fn in 1..array_length(first_names, 1) loop
    for ln in 1..array_length(last_names, 1) loop
      i := i + 1;
      insert into public.customers (name, email, phone)
      values (
        first_names[fn] || ' ' || last_names[ln],
        lower(first_names[fn] || '.' || last_names[ln]) || '@example.com',
        '98' || lpad((40000000 + i * 1234567)::text, 8, '0')
      )
      on conflict (phone) do nothing;
    end loop;
  end loop;
  select count(*) into n_cust from public.customers;

  for a in select id from public.agents order by id loop
    plist := props -> a.id;
    for d in -120..14 loop
      v_date := current_date + d;
      h := abs(hashtext(a.id || ':' || d::text)::bigint);
      if extract(dow from v_date) in (0, 6) then
        cnt := case when h % 4 = 0 then 1 else 0 end;      -- quieter weekends
      else
        cnt := 1 + (h % 2);                                 -- 1 or 2 on weekdays
      end if;

      for k in 0..cnt - 1 loop
        h := abs(hashtext(a.id || ':' || d::text || ':' || k::text)::bigint);
        select id into v_cust from public.customers
          order by phone offset (h % n_cust) limit 1;
        v_prop := plist -> ((h % jsonb_array_length(plist))::int);

        insert into public.appointments (
          agent_id, customer_id, kind, property_id, property_name,
          appointment_date, appointment_time
        ) values (
          a.id, v_cust,
          case when (h / 5) % 3 = 0 then 'sell' else 'buy' end,
          v_prop->>'id', v_prop->>'name', v_date,
          times[((((abs(hashtext(a.id || ':' || d::text)::bigint) + k * 5) % 18) + 1))::int]
        )
        on conflict (agent_id, appointment_date, appointment_time) do nothing;
      end loop;
    end loop;
  end loop;
end;
$$;
