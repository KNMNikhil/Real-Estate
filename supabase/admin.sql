-- =====================================================================
-- Living Gods Real Estates: ADMIN portal (run AFTER schema.sql)
--
-- HOW TO RUN: Supabase dashboard -> SQL Editor -> New query -> paste this
-- whole file -> Run. Safe to run more than once.
--
-- BEFORE YOU RUN IT:
--   1. Replace admin@example.com below with the real admin email address(es).
-- AFTER YOU RUN IT:
--   2. Authentication -> Users -> "Add user" -> create a user with that same
--      admin email (the login page only sends codes to existing users).
--   3. Authentication -> Email Templates -> "Magic Link": make sure the email
--      body contains {{ .Token }} so the admin receives the one-time code.
--
-- Security: the website only holds the public "anon" key. Every admin_*
-- function below checks that the caller is signed in (email OTP) AND that the
-- signed-in email is listed in public.admins. Nobody else can call them.
-- =====================================================================

create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;   -- no policies: not readable by the website

insert into public.admins (email) values ('admin@example.com')   -- <-- REPLACE
on conflict do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ---------------------------------------------------------------------
-- "Call attended" tracking: the consultant ticks a customer once they have
-- spoken to them. The admin sees these ticks.
-- ---------------------------------------------------------------------
alter table public.appointments add column if not exists called boolean not null default false;
alter table public.appointments add column if not exists called_at timestamptz;

drop function if exists public.consultant_appointments(uuid);
create function public.consultant_appointments(p_token uuid)
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
  created_at timestamptz,
  called boolean
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
           c.name, c.email, c.phone, ap.created_at, ap.called
    from public.appointments ap
    join public.customers c on c.id = ap.customer_id
    where ap.consultant_id = v_consultant
    order by ap.appointment_date, ap.appointment_time;
end;
$$;

create or replace function public.consultant_set_called(p_token uuid, p_appointment uuid, p_called boolean)
returns void
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

  update public.appointments
     set called = p_called,
         called_at = case when p_called then now() else null end
   where id = p_appointment and consultant_id = v_consultant;

  if not found then
    raise exception 'appointment not found';
  end if;
end;
$$;

-- ---------------------------------------------------------------------
-- Public list of consultants for the website (no emails, no passwords).
-- Lets consultants added by the admin show up in the buy / sell flows.
-- ---------------------------------------------------------------------
create or replace function public.public_consultants()
returns table (id text, name text, pincode text, area_name text, contact text, address text, photo text)
language sql
stable
security definer
set search_path = public
as $$
  select id, name, pincode, area_name, contact, address, photo
  from public.consultants
  order by id;
$$;

-- ---------------------------------------------------------------------
-- Admin functions
-- ---------------------------------------------------------------------
create or replace function public.admin_consultants()
returns table (id text, name text, pincode text, area_name text, contact text,
               email text, address text, photo text, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorised' using errcode = '42501';
  end if;
  return query
    select c.id, c.name, c.pincode, c.area_name, c.contact, c.email, c.address, c.photo, c.created_at
    from public.consultants c
    order by c.id;
end;
$$;

create or replace function public.admin_add_consultant(
  p_name     text,
  p_pincode  text,
  p_area     text,
  p_contact  text,
  p_email    text,
  p_address  text,
  p_photo    text,
  p_password text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id text;
begin
  if not public.is_admin() then
    raise exception 'not authorised' using errcode = '42501';
  end if;
  if length(trim(coalesce(p_name, ''))) < 2 then raise exception 'invalid name'; end if;
  if p_pincode !~ '^[1-9][0-9]{5}$' then raise exception 'invalid pincode'; end if;
  if length(trim(coalesce(p_area, ''))) < 2 then raise exception 'invalid area'; end if;
  if p_contact !~ '^[6-9][0-9]{9}$' then raise exception 'invalid contact'; end if;
  if length(coalesce(p_password, '')) < 8 then raise exception 'password too short'; end if;
  if exists (select 1 from public.consultants where pincode = p_pincode) then
    raise exception 'pincode_taken';
  end if;

  select 'C' || lpad((coalesce(max(nullif(regexp_replace(id, '\D', '', 'g'), '')::int), 0) + 1)::text, 3, '0')
    into v_id
    from public.consultants;

  begin
    insert into public.consultants (id, name, pincode, area_name, contact, email, address, photo, password_hash)
    values (
      v_id, trim(p_name), p_pincode, trim(p_area), p_contact,
      nullif(trim(coalesce(p_email, '')), ''),
      nullif(trim(coalesce(p_address, '')), ''),
      nullif(trim(coalesce(p_photo, '')), ''),
      extensions.crypt(p_password, extensions.gen_salt('bf'))
    );
  exception when unique_violation then
    raise exception 'contact_taken';
  end;

  return json_build_object('id', v_id);
end;
$$;

-- Deletes the consultant AND their appointment history (customers are kept).
create or replace function public.admin_delete_consultant(p_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorised' using errcode = '42501';
  end if;
  delete from public.appointments where consultant_id = p_id;
  update public.properties set consultant_id = null where consultant_id = p_id;
  delete from public.consultants where id = p_id;   -- sessions cascade
  if not found then
    raise exception 'consultant not found';
  end if;
end;
$$;

create or replace function public.admin_set_password(p_id text, p_password text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorised' using errcode = '42501';
  end if;
  if length(coalesce(p_password, '')) < 8 then raise exception 'password too short'; end if;
  update public.consultants
     set password_hash = extensions.crypt(p_password, extensions.gen_salt('bf'))
   where id = p_id;
  if not found then
    raise exception 'consultant not found';
  end if;
  delete from public.consultant_sessions where consultant_id = p_id;   -- sign them out
end;
$$;

create or replace function public.admin_appointments()
returns table (
  id uuid, consultant_id text, consultant_name text, kind text, property_name text,
  appointment_date date, appointment_time text, status text, called boolean, called_at timestamptz,
  customer_name text, customer_email text, customer_phone text, created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorised' using errcode = '42501';
  end if;
  return query
    select ap.id, ap.consultant_id, co.name, ap.kind, ap.property_name,
           ap.appointment_date, ap.appointment_time, ap.status, ap.called, ap.called_at,
           cu.name, cu.email, cu.phone, ap.created_at
    from public.appointments ap
    join public.consultants co on co.id = ap.consultant_id
    join public.customers cu on cu.id = ap.customer_id
    order by ap.appointment_date desc, ap.created_at desc;
end;
$$;

grant execute on function public.is_admin()                                   to anon, authenticated;
grant execute on function public.public_consultants()                         to anon, authenticated;
grant execute on function public.consultant_appointments(uuid)                to anon, authenticated;
grant execute on function public.consultant_set_called(uuid, uuid, boolean)   to anon, authenticated;
grant execute on function public.admin_consultants()                          to authenticated;
grant execute on function public.admin_add_consultant(text, text, text, text, text, text, text, text) to authenticated;
grant execute on function public.admin_delete_consultant(text)                to authenticated;
grant execute on function public.admin_set_password(text, text)               to authenticated;
grant execute on function public.admin_appointments()                         to authenticated;
