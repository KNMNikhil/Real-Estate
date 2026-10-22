-- =====================================================================
-- One-time cleanup. Run this once in Supabase -> SQL Editor.
--   1. Removes the agents_public view (the red "Unrestricted" tag).
--   2. Deletes ALL sample customers, their sample appointments and the
--      test bookings made while building the site. Agents are kept.
--   3. Adds the 13 sample properties to the properties table.
-- =====================================================================

-- 1. Remove the view
drop view if exists public.agents_public;

-- 2. Remove sample / test data (appointments first, because they point to customers)
delete from public.appointments
 where customer_id in (
   select id from public.customers
   where email like '%@example.com' or name like '%DELETE ME%'
 );
delete from public.properties
 where owner_customer_id in (
   select id from public.customers
   where email like '%@example.com' or name like '%DELETE ME%'
 ) or name = 'DB Sell Test Home';
delete from public.customers
 where email like '%@example.com' or name like '%DELETE ME%';
delete from public.contact_messages
 where name like '%DELETE ME%' or email like '%@example.com';

-- 3. Sample properties
insert into public.properties (
  id, name, type, pincode, area, sqft, bedrooms, bathrooms, floor, facing,
  price, address, description, images, agent_id, created_at
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
