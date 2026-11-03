# Demo / test logins and dummy data

For testing only. None of these demo shortcuts exist in the production build (checked: the built
files contain no demo login text). Replace the dummy values before going live.

## Website (local: http://localhost:5174)

### Consultant portal (/consultant/login)
| Consultant | Login number | Password |
|---|---|---|
| PAFP Neethi (Manjam Padi, PIN 631051) | 8754913898 | Agent@631051 (dummy) |

- Customers see two numbers on his card: 9842393898 and 8754913898.
- On the LOCAL dev server only, this login also works with sample appointments and sample TBC enquiries
  even when the database has no such account (nothing is sent to the database).
- On the live site the account must exist in Supabase (`supabase/add_consultant_neethi.sql`).

### Admin portal (/admin/login)
Email + password login against the database (`supabase/admin_password_login.sql`). There is no demo admin any more.
Use the real admin email and password set in Supabase.

## Database scripts to run once in the Supabase SQL editor (in this order)
1. `supabase/schema.sql`
2. `supabase/admin.sql` and `supabase/admin_password_login.sql`
3. `supabase/add_consultant_neethi.sql`
4. `supabase/single_consultant.sql` (removes the four old sample consultants)
5. `supabase/tbc.sql` (TBC enquiries shown on the consultant's TBC page)

## Other dummy values in the code
| Where | Value |
|---|---|
| `src/data/dummyData.js` `demoUser` | demo customer "Ravi Kumar" |
| Buy/Sell enquiries | the time slot is a placeholder `TBA-xxxxxx` (no real time) |
| `src/pages/TbcProjects.jsx` | Baba Pasumai Nagar project content (from the client's note) |
| Neethi photo | `public/consultants/neethi.webp` |
