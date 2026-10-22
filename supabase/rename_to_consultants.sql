-- =====================================================================
-- Rename "agent" to "consultant" in the database (one-time migration).
-- Run once in Supabase -> SQL Editor. Your data is kept.
--   * tables:  agents -> consultants, agent_sessions -> consultant_sessions
--   * columns: agent_id -> consultant_id
--   * functions: agent_* -> consultant_*
--   * also resets the four consultant passwords to the starting ones
--     (Agent@<pincode>), so every login works again.
-- =====================================================================

alter table public.agents rename to consultants;
alter table public.agent_sessions rename to consultant_sessions;
alter table public.properties rename column agent_id to consultant_id;
alter table public.appointments rename column agent_id to consultant_id;
alter table public.consultant_sessions rename column agent_id to consultant_id;
alter index if exists public.appointments_agent_date_idx rename to appointments_consultant_date_idx;

-- Old functions (they still point at the old names)
drop function if exists public.agent_login(text, text);
drop function if exists public.agent_logout(uuid);
drop function if exists public.agent_id_from_token(uuid);
drop function if exists public.agent_appointments(uuid);
drop function if exists public.booked_times(text, date);
drop function if exists public.book_appointment(text, text, date, text, text, text, text, text, text, jsonb);

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

-- Reset the starting passwords
update public.consultants
   set password_hash = extensions.crypt('Agent@' || pincode, extensions.gen_salt('bf'));
