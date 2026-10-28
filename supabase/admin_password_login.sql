-- =====================================================================
-- Admin sign in with EMAIL + PASSWORD (replaces the email one-time code).
-- There is exactly ONE admin: livinggodsrealestate@gmail.com
--
-- HOW TO RUN: Supabase dashboard -> SQL Editor -> New query -> paste this
-- whole file -> Run. Safe to run more than once.
--
-- The password is stored only as a scrambled hash. To change it later:
--   update public.admins
--      set password_hash = extensions.crypt('a-new-strong-password', extensions.gen_salt('bf'))
--    where email = 'livinggodsrealestate@gmail.com';
-- =====================================================================

alter table public.admins add column if not exists password_hash text;

-- Keep only the one admin.
delete from public.admins where lower(email) <> 'livinggodsrealestate@gmail.com';
insert into public.admins (email) values ('livinggodsrealestate@gmail.com')
on conflict (email) do nothing;   -- an existing password is never overwritten

-- Until a password is set, nobody can sign in. Set it with the query at the top of this file
-- (or the one below), choosing your own long password:
--   update public.admins
--      set password_hash = extensions.crypt('YOUR-OWN-LONG-PASSWORD', extensions.gen_salt('bf'))
--    where email = 'livinggodsrealestate@gmail.com';

-- Admin sessions (a token that proves the admin signed in). No public access.
create table if not exists public.admin_sessions (
  token       uuid primary key default gen_random_uuid(),
  email       text not null,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default now() + interval '12 hours'
);
alter table public.admin_sessions enable row level security;   -- no policies: not readable by the website

-- Sign in: returns the session token, or null when the email or password is wrong.
create or replace function public.admin_login(p_email text, p_password text)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  a public.admins;
  t uuid;
begin
  select * into a from public.admins where lower(email) = lower(trim(p_email));
  if not found or a.password_hash is null or a.password_hash <> crypt(p_password, a.password_hash) then
    perform pg_sleep(1);   -- makes password guessing slow
    return null;
  end if;

  delete from public.admin_sessions where expires_at < now();
  insert into public.admin_sessions (email) values (a.email) returning token into t;

  return json_build_object('token', t, 'email', a.email, 'expiresIn', 43200);
end;
$$;

create or replace function public.admin_logout(p_token uuid)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.admin_sessions where token = p_token;
$$;

-- Internal check used by every admin function below.
create or replace function public.admin_check(p_token uuid)
returns void
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.admin_sessions s
    join public.admins a on lower(a.email) = lower(s.email)
    where s.token = p_token and s.expires_at > now()
  ) then
    raise exception 'invalid or expired session' using errcode = '28000';
  end if;
end;
$$;

revoke all on function public.admin_check(uuid) from public, anon, authenticated;

-- The old email-code based functions are replaced.
drop function if exists public.admin_consultants();
drop function if exists public.admin_add_consultant(text, text, text, text, text, text, text, text);
drop function if exists public.admin_delete_consultant(text);
drop function if exists public.admin_set_password(text, text);
drop function if exists public.admin_appointments();
drop function if exists public.is_admin();

create or replace function public.admin_consultants(p_token uuid)
returns table (id text, name text, pincode text, area_name text, contact text, alt_contact text,
               email text, address text, photo text, tagline text, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.admin_check(p_token);
  return query
    select c.id, c.name, c.pincode, c.area_name, c.contact, c.login_phone,
           c.email, c.address, c.photo, c.tagline, c.created_at
    from public.consultants c
    order by c.id;
end;
$$;

create or replace function public.admin_add_consultant(
  p_token    uuid,
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
  perform public.admin_check(p_token);
  if length(trim(coalesce(p_name, ''))) < 2 then raise exception 'invalid name'; end if;
  if p_pincode !~ '^[1-9][0-9]+$' or length(p_pincode) <> 6 then raise exception 'invalid pincode'; end if;
  if length(trim(coalesce(p_area, ''))) < 2 then raise exception 'invalid area'; end if;
  if p_contact !~ '^[6-9][0-9]+$' or length(p_contact) <> 10 then raise exception 'invalid contact'; end if;
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
create or replace function public.admin_delete_consultant(p_token uuid, p_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.admin_check(p_token);
  delete from public.appointments where consultant_id = p_id;
  update public.properties set consultant_id = null where consultant_id = p_id;
  delete from public.consultants where id = p_id;   -- sessions cascade
  if not found then
    raise exception 'consultant not found';
  end if;
end;
$$;

create or replace function public.admin_set_password(p_token uuid, p_id text, p_password text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.admin_check(p_token);
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

create or replace function public.admin_appointments(p_token uuid)
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
  perform public.admin_check(p_token);
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

grant execute on function public.admin_login(text, text)                                  to anon, authenticated;
grant execute on function public.admin_logout(uuid)                                       to anon, authenticated;
grant execute on function public.admin_consultants(uuid)                                  to anon, authenticated;
grant execute on function public.admin_add_consultant(uuid, text, text, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.admin_delete_consultant(uuid, text)                      to anon, authenticated;
grant execute on function public.admin_set_password(uuid, text, text)                     to anon, authenticated;
grant execute on function public.admin_appointments(uuid)                                 to anon, authenticated;
