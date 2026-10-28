-- =====================================================================
-- Adds the Manjampadi (Vellore, PIN 631051) consultant and his login.
-- Run in: Supabase dashboard -> SQL Editor (after schema.sql). Safe to re-run.
--
--   Contact number shown to customers: 9842393898
--   Second number (also his agent login): 8754913898 -- both numbers are shown to customers
--   Password (DUMMY, change before real use): Agent@631051
--
-- To change them later, edit the UPDATE at the bottom and run it.
-- =====================================================================

-- A consultant can now sign in with a login number that differs from the public contact number.
alter table public.consultants add column if not exists login_phone text unique;

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
  select * into a from public.consultants
   where contact = trim(p_contact) or login_phone = trim(p_contact)
   order by (login_phone = trim(p_contact)) desc nulls last
   limit 1;
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

-- Customers see both numbers (contact + second number).
drop function if exists public.public_consultants();
create function public.public_consultants()
returns table (id text, name text, pincode text, area_name text, contact text, address text, photo text, alt_contact text)
language sql
stable
security definer
set search_path = public
as $$
  select id, name, pincode, area_name, contact, address, photo, login_phone
  from public.consultants
  order by id;
$$;
grant execute on function public.public_consultants() to anon, authenticated;

insert into public.consultants (id, name, pincode, area_name, contact, login_phone, email, address, photo, password_hash)
values (
  'C005',
  'PAFP Neethi',
  '631051',
  'Manjampadi',
  '9842393898',
  '8754913898',
  null,
  '1/128, Pillaiyar Kovil Street, Manjampadi, Attupakkam, Vellore, Tamil Nadu - 631051',
  '/consultants/neethi.webp',
  extensions.crypt('Agent@631051', extensions.gen_salt('bf'))   -- DUMMY password
)
on conflict (id) do update
  set contact = excluded.contact, login_phone = excluded.login_phone;

-- To change the numbers / password later:
-- update public.consultants
--    set contact = '98XXXXXXXX', login_phone = '98XXXXXXXX',
--        password_hash = extensions.crypt('a-new-strong-password', extensions.gen_salt('bf'))
--  where id = 'C005';
