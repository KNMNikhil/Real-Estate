# Database setup (Supabase)

1. Open your Supabase project, go to **SQL Editor**, then **New query**.
2. Paste the whole of `schema.sql` and press **Run**. It is safe to run again.
3. Agents sign in at `/agent/login` with their contact number and password.
   The starting passwords are in the "Demo data" part of `schema.sql`
   (pattern `Agent@<pincode>`). Change them before going live.

What is stored: agents, customers (name, email, phone), appointments (which
agent, which customer, date, time, buy or sell), customer listings,
contact-form messages and agent sessions.

The website only uses the public anon key. Customers cannot read other
people's data; agents can read only their own appointments, through
functions that check their session token.

## Cleaning up

`cleanup.sql` is a one-time script: it removes the sample customers and test
bookings, drops the unused `agents_public` view, and adds the 13 sample
properties to the `properties` table. Agents are kept.
