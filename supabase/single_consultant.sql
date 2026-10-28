-- =====================================================================
-- One consultant only: PAFP Neethi (Manjam Padi, PIN 631051).
-- Run once in Supabase -> SQL Editor. Safe to run more than once.
--   * removes the four sample consultants (Arun, Meena, Suresh, Priya)
--     together with their sample appointments and sample properties
--   * renames the remaining consultant and adds the tagline
-- The password is NOT touched.
-- =====================================================================

alter table public.consultants add column if not exists tagline text;

delete from public.appointments where consultant_id in ('C001', 'C002', 'C003', 'C004');
delete from public.properties   where consultant_id in ('C001', 'C002', 'C003', 'C004');
delete from public.consultants  where id in ('C001', 'C002', 'C003', 'C004');   -- their sessions go too

update public.consultants
   set name      = 'PAFP Neethi',
       area_name = 'Manjam Padi',
       pincode   = '631051',
       tagline   = 'Chief Consultant - Tamil Nadu Region'
 where id = 'C005';

-- Customers see the tagline too.
drop function if exists public.public_consultants();
create function public.public_consultants()
returns table (id text, name text, pincode text, area_name text, contact text, address text,
               photo text, alt_contact text, tagline text)
language sql
stable
security definer
set search_path = public
as $$
  select id, name, pincode, area_name, contact, address, photo, login_phone, tagline
  from public.consultants
  order by id;
$$;
grant execute on function public.public_consultants() to anon, authenticated;
