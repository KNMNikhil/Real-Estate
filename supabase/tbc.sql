-- =====================================================================
-- TBC (Team Buying Concept) enquiries -> the consultant's "TBC" page.
-- Run in: Supabase dashboard -> SQL Editor (after schema.sql). Safe to re-run.
--
-- A customer fills the "Get started" form on /tbc/get-started. The enquiry is
-- saved against the consultant (PAFP Neethi) and appears on his dashboard
-- under "TBC", where he calls them and ticks them as done.
-- =====================================================================

create table if not exists public.tbc_enquiries (
  id            uuid primary key default gen_random_uuid(),
  consultant_id text not null references public.consultants(id) on delete cascade,
  name          text not null,
  email         text not null,
  phone         text not null,
  team_code     text not null check (team_code in ('RI', 'FI', 'ABR')),
  members       int,
  project       text,
  note          text,
  called        boolean not null default false,
  called_at     timestamptz,
  created_at    timestamptz not null default now()
);
alter table public.tbc_enquiries enable row level security;   -- no policies: only the functions below touch it

-- Public: a customer submits an enquiry for a consultant.
create or replace function public.submit_tbc_enquiry(
  p_consultant text, p_name text, p_email text, p_phone text,
  p_team text, p_members int, p_project text, p_note text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.consultants where id = p_consultant) then
    raise exception 'unknown consultant';
  end if;
  if length(trim(coalesce(p_name, ''))) < 2 then raise exception 'invalid name'; end if;
  if length(trim(coalesce(p_email, ''))) < 5 then raise exception 'invalid email'; end if;
  if p_phone !~ '^[6-9][0-9]{9}$' then raise exception 'invalid phone'; end if;
  if p_team not in ('RI', 'FI', 'ABR') then raise exception 'invalid team'; end if;

  insert into public.tbc_enquiries (consultant_id, name, email, phone, team_code, members, project, note)
  values (
    p_consultant, trim(p_name), trim(p_email), p_phone, p_team,
    case when p_members between 1 and 999 then p_members end,
    nullif(left(trim(coalesce(p_project, '')), 100), ''),
    nullif(left(trim(coalesce(p_note, '')), 500), '')
  );
end;
$$;

-- Consultant: the TBC enquiries addressed to the signed-in consultant.
create or replace function public.consultant_tbc_enquiries(p_token uuid)
returns table (
  id uuid, name text, email text, phone text, team_code text, members int,
  project text, note text, called boolean, created_at timestamptz
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
    select t.id, t.name, t.email, t.phone, t.team_code, t.members, t.project, t.note, t.called, t.created_at
    from public.tbc_enquiries t
    where t.consultant_id = v_consultant
    order by t.created_at desc;
end;
$$;

-- Consultant: tick / untick "called".
create or replace function public.consultant_set_tbc_called(p_token uuid, p_id uuid, p_called boolean)
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
  update public.tbc_enquiries
     set called = p_called, called_at = case when p_called then now() else null end
   where id = p_id and consultant_id = v_consultant;
  if not found then
    raise exception 'enquiry not found';
  end if;
end;
$$;

grant execute on function public.submit_tbc_enquiry(text, text, text, text, text, int, text, text) to anon, authenticated;
grant execute on function public.consultant_tbc_enquiries(uuid)                                    to anon, authenticated;
grant execute on function public.consultant_set_tbc_called(uuid, uuid, boolean)                    to anon, authenticated;
